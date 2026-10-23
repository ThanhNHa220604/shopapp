const Sequelize = require("sequelize");

const crypto = require("crypto");
const db = require("../models");

const { buildAddressString } = require("./OrderController");

const { OrderStatus } = require("../constants");
const Op = Sequelize.Op;
const QR_EXPIRE_MINUTES = 15;

class CheckoutError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}



// Tạo chữ ký HMAC-SHA256 cho MoMo (dùng cho cả tạo giao dịch lẫn kiểm tra IPN)
const momoSign = (raw) =>
  crypto
    .createHmac("sha256", process.env.MOMO_SECRET_KEY)
    .update(raw)
    .digest("hex");

async function createMomoPayment(dbOrderId, amount, orderInfo) {
  const {
    MOMO_PARTNER_CODE: partnerCode,
    MOMO_ACCESS_KEY: accessKey,
    MOMO_ENDPOINT,
    MOMO_REDIRECT_URL: redirectUrl,
    MOMO_IPN_URL: ipnUrl,
  } = process.env;

  // orderId gửi MoMo không được trùng giữa các lần tạo -> thêm timestamp.
  // IPN sẽ tách lại: "DH17_1730000000000" -> 17
  const orderId = `DH${dbOrderId}_${Date.now()}`;
  const requestId = orderId;
  const requestType = "captureWallet";
  const extraData = "";

  // Các trường phải xếp theo thứ tự alphabet
  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=${requestType}`;

  const resp = await fetch(MOMO_ENDPOINT, {
    // fetch có sẵn từ Node 18; nếu bạn dùng axios thì đổi tương ứng
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature: momoSign(rawSignature),
      lang: "vi",
    }),
  });
  const data = await resp.json();

  if (data.resultCode !== 0) {
    console.error("MoMo create lỗi:", data);
    throw new Error(data.message || "MoMo từ chối giao dịch");
  }
  return data; // chứa payUrl
}

// =============================================================================
// 1. LẤY DANH SÁCH TẤT CẢ GIỎ HÀNG (Phân trang)
// =============================================================================
async function getCarts(req, res) {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  try {
    const [carts, total] = await Promise.all([
      db.carts.findAll({
        limit: pageSize,
        offset,
        include: [
          {
            model: db.cart_items,
            as: "cart_items",
            attributes: ["id", "cart_id", "product_id", "quanity"],
            include: [{ model: db.products, as: "products" }],
          },
        ],
      }),
      db.carts.count(),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách giỏ hàng thành công",
      data: carts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách giỏ hàng", error: error.message });
  }
}

// =============================================================================
// 2. LẤY CHI TIẾT MỘT GIỎ HÀNG (Có tính Flash Sale)
// =============================================================================
async function getCartById(req, res) {
  try {
    let cart = null;
    const userId = req.userId || req.user?.id || req.user?.userId;

    const includeConfig = [
      {
        model: db.cart_items,
        as: "cart_items",
        include: [
          {
            model: db.products,
            as: "products",
            include: [
              {
                model: db.flash_sale_products || db.FlashSaleProducts,
                as: "flash_sale_products",
                required: false,
                include: [
                  {
                    model: db.flash_sales || db.FlashSales,
                    as: "flash_sale",
                    where: {
                      status: 1,
                      start_time: { [Op.lte]: new Date() },
                      end_time: { [Op.gte]: new Date() },
                    },
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: db.product_variant_values,
            as: "product_variant_values",
          },
        ],
      },
    ];

    if (userId) {
      cart = await db.carts.findOne({
        where: { user_id: userId },
        include: includeConfig,
      });
    } else {
      const cartId = req.query.cart_id || req.body.cart_id;
      if (cartId && cartId !== "undefined" && cartId !== "null") {
        cart = await db.carts.findOne({
          where: { id: Number(cartId), user_id: null },
          include: includeConfig,
        });
      }
    }

    if (!cart || !cart.cart_items) {
      return res.status(200).json({
        message: "Giỏ hàng trống",
        data: [],
        cart_id: null,
      });
    }

    // Format danh sách giỏ hàng và ưu tiên áp dụng giá Flash Sale nếu có
    const formattedCartItems = cart.cart_items.map((item) => {
      const itemJSON = item.toJSON();
      const product = itemJSON.products;

      let price = itemJSON.product_variant_values?.price || product?.price || 0;

      // Check Flash Sale active
      const activeSale = product?.flash_sale_products?.find(
        (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
      );

      if (activeSale && activeSale.flash_sale_price) {
        price = parseFloat(activeSale.flash_sale_price);
      }

      return {
        ...itemJSON,
        applied_price: price,
      };
    });

    return res.status(200).json({
      message: "Lấy chi tiết giỏ hàng thành công",
      data: formattedCartItems,
      cart_id: cart.id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy chi tiết giỏ hàng", error: error.message });
  }
}

// =============================================================================
// 3. THÊM HOẶC CẬP NHẬT GIỎ HÀNG
// =============================================================================
async function insertCart(req, res) {
  const { product_id, quanity, quantity, cart_id } = req.body;
  const userId = req.userId;
  const inputQty = Number(quantity || quanity || 1);

  try {
    let cart = null;

    // 1. Tìm hoặc tạo giỏ hàng
    if (userId) {
      cart = await db.carts.findOne({ where: { user_id: userId } });
      if (!cart) {
        cart = await db.carts.create({ user_id: userId });
      }
    } else if (cart_id) {
      cart = await db.carts.findOne({ where: { id: cart_id } });
    }

    if (!cart) {
      cart = await db.carts.create({ user_id: userId || null });
    }

    // 2. Thêm hoặc cập nhật mặt hàng trong giỏ
    let cartItem = await db.cart_items.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (cartItem) {
      cartItem.quanity += inputQty;
      await cartItem.save();
    } else {
      cartItem = await db.cart_items.create({
        cart_id: cart.id,
        product_id,
        quanity: inputQty,
      });
    }

    // 3. Kiểm tra thông tin Flash Sale
    const now = new Date();
    const FlashSaleProductModel =
      db.flash_sale_products || db.FlashSaleProducts;
    let flashSalePrice = null;

    if (FlashSaleProductModel) {
      const activeSale = await FlashSaleProductModel.findOne({
        where: { product_id },
        include: [
          {
            model: db.flash_sales || db.FlashSales,
            as: "flash_sale",
            where: {
              status: 1,
              start_time: { [Op.lte]: now },
              end_time: { [Op.gte]: now },
            },
          },
        ],
      });
      if (activeSale) {
        flashSalePrice = parseFloat(activeSale.flash_sale_price);
      }
    }

    return res.status(200).json({
      message: "Thêm vào giỏ hàng thành công",
      data: {
        ...cartItem.toJSON(),
        applied_price: flashSalePrice,
      },
      cart_id: cart.id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi thêm vào giỏ hàng", error: error.message });
  }
}

// =============================================================================
// 4. CHECKOUT ĐƠN HÀNG (ĐÃ SỬA CHÍNH XÁC TRỪ CẢ STOCK BIẾN THỂ VÀ QUANITY TỔNG)
// =============================================================================
// =============================================================================
// 4. CHECKOUT ĐƠN HÀNG (ĐÃ SỬA LỖI TẠO VOUCHER USAGE THIẾU ORDER_ID)
// =============================================================================
async function checkoutCart(req, res) {
  const {
    cart_id,
    product_id,
    variant_id,
    product_variant_value_id,
    quanity,
    quantity,
    items,
    // total: KHÔNG dùng total từ client nữa, server tự tính
    note,
    phone,
    user_id,
    session_id,
    payment_method,
    voucher_id,
    voucher_code,
  } = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    const now = new Date();
    const orderDetails = [];
    let calculatedTotal = 0;

    const targetProductId = product_id ? Number(product_id) : null;
    const inputQuantity = parseInt(quantity || quanity) || 1;
    const chosenVariantId = product_variant_value_id || variant_id || null;
    const isBuyNow = !!targetProductId;
    const isDirectItems = Array.isArray(items) && items.length > 0;

    const VariantModel =
      db.product_variant_values ||
      db.ProductVariantValues ||
      db.productVariantValues;
    const FlashSaleProductModel =
      db.flash_sale_products || db.FlashSaleProducts;
    const VoucherModel = db.vouchers || db.Voucher;
    const VoucherUsageModel =
      db.voucher_usages || db.voucherusages || db.VoucherUsages;

    // Chuẩn hóa phương thức thanh toán
    const method =
      payment_method === "momo"
        ? "momo"
        : payment_method === "bank" || payment_method === "vnpay"
          ? "bank"
          : "cod";

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    const getActiveFlashSale = async (pId) => {
      if (!FlashSaleProductModel) return null;
      return FlashSaleProductModel.findOne({
        where: { product_id: pId },
        include: [
          {
            model: db.flash_sales || db.FlashSales,
            as: "flash_sale",
            where: {
              status: 1,
              start_time: { [Op.lte]: now },
              end_time: { [Op.gte]: now },
            },
          },
        ],
        transaction,
      });
    };

    // Trừ kho nguyên tử + trừ flash sale, trả về GIÁ DO SERVER quyết định
    // (flash sale > giá biến thể > giá sản phẩm)
    const reserveItem = async ({ product, variant, qty }) => {
      const flashSaleItem = await getActiveFlashSale(product.id);

      const [productOk] = await db.products.update(
        { quanity: db.sequelize.literal(`quanity - ${qty}`) },
        { where: { id: product.id, quanity: { [Op.gte]: qty } }, transaction },
      );
      if (productOk === 0) {
        throw new CheckoutError(
          400,
          `Sản phẩm ${product.name} không đủ số lượng trong kho`,
        );
      }

      if (variant && VariantModel) {
        const [variantOk] = await VariantModel.update(
          { stock: db.sequelize.literal(`stock - ${qty}`) },
          { where: { id: variant.id, stock: { [Op.gte]: qty } }, transaction },
        );
        if (variantOk === 0) {
          throw new CheckoutError(
            400,
            `Biến thể của ${product.name} không đủ số lượng (còn ${variant.stock})`,
          );
        }
      }

      if (flashSaleItem) {
        await FlashSaleProductModel.update(
          {
            flash_sale_stock: Math.max(
              0,
              (flashSaleItem.flash_sale_stock || 0) - qty,
            ),
            flash_sale_sold: (flashSaleItem.flash_sale_sold || 0) + qty,
          },
          { where: { id: flashSaleItem.id }, transaction },
        );
      }

      if (flashSaleItem) return parseFloat(flashSaleItem.flash_sale_price);
      if (variant) return parseFloat(variant.price);
      return parseFloat(product.price || 0);
    };

    const loadProduct = async (pId) => {
      const product = await db.products.findOne({
        where: { id: pId },
        attributes: ["id", "name", "price", "quanity"],
        transaction,
      });
      if (!product) {
        throw new CheckoutError(404, `Sản phẩm ID ${pId} không tồn tại`);
      }
      return product;
    };

    const loadVariant = async (vId, pId) => {
      if (!vId || !VariantModel) return null;
      const variant = await VariantModel.findOne({
        where: { id: vId, product_id: pId },
        transaction,
      });
      if (!variant) {
        throw new CheckoutError(404, "Biến thể sản phẩm không tồn tại");
      }
      return variant;
    };

    // ---------------------------------------------------------------------
    // LUỒNG 1: MUA NGAY (1 SẢN PHẨM)
    // ---------------------------------------------------------------------
    if (isBuyNow) {
      const product = await loadProduct(targetProductId);
      const variant = await loadVariant(chosenVariantId, targetProductId);
      const price = await reserveItem({ product, variant, qty: inputQuantity });

      orderDetails.push({
        product_id: product.id,
        product_variant_value_id: variant ? variant.id : null,
        quantity: inputQuantity,
        price,
      });
      calculatedTotal = inputQuantity * price;
    }
    // ---------------------------------------------------------------------
    // LUỒNG 2: MUA QUA MẢNG ITEMS (giá lấy từ DB, không tin item.price)
    // ---------------------------------------------------------------------
    else if (isDirectItems) {
      for (const item of items) {
        const pId = Number(item.product_id || item.products?.id || item.id);
        if (!pId) continue;

        const qty = parseInt(item.quantity || item.quanity) || 1;
        const vIdRaw = item.product_variant_value_id || item.variant_id;
        const vId = vIdRaw ? Number(vIdRaw) : null;

        const product = await loadProduct(pId);
        const variant = await loadVariant(vId, pId);
        const price = await reserveItem({ product, variant, qty });

        calculatedTotal += qty * price;
        orderDetails.push({
          product_id: pId,
          product_variant_value_id: variant ? variant.id : null,
          quantity: qty,
          price,
        });
      }

      if (orderDetails.length === 0) {
        throw new CheckoutError(400, "Không có sản phẩm hợp lệ để thanh toán");
      }
    }
    // ---------------------------------------------------------------------
    // LUỒNG 3: THANH TOÁN QUA GIỎ HÀNG
    // ---------------------------------------------------------------------
    else {
      let cartId = cart_id ? Number(cart_id) : null;
      const validUserId = user_id ? Number(user_id) : null;

      if (!cartId && validUserId) {
        const userCart = await db.carts.findOne({
          where: { user_id: validUserId },
          transaction,
        });
        if (userCart) cartId = userCart.id;
      }

      if (!cartId) {
        throw new CheckoutError(
          400,
          "Thiếu thông tin cart_id hoặc user_id hợp lệ",
        );
      }

      const cart = await db.carts.findByPk(cartId, {
        include: [
          {
            model: db.cart_items,
            as: "cart_items",
            include: [
              { model: db.products, as: "products" },
              {
                model: db.product_variant_values,
                as: "product_variant_values",
              },
            ],
          },
        ],
        transaction,
      });

      if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        throw new CheckoutError(400, "Giỏ hàng không hợp lệ hoặc đang trống");
      }

      for (const item of cart.cart_items) {
        const product = item.products;
        const variant = item.product_variant_values || null;
        const qty = Number(item.quanity || item.quantity || 1);

        if (!product) {
          throw new CheckoutError(
            404,
            `Sản phẩm ID ${item.product_id} trong giỏ không tồn tại`,
          );
        }

        const price = await reserveItem({ product, variant, qty });

        calculatedTotal += qty * price;
        orderDetails.push({
          product_id: item.product_id,
          product_variant_value_id:
            item.product_variant_value_id || (variant ? variant.id : null),
          quantity: qty,
          price,
        });
      }

      await db.cart_items.destroy({ where: { cart_id: cartId }, transaction });
    }

    // =====================================================================
    // BƯỚC 1: TÍNH VOUCHER
    // =====================================================================
    let discountAmount = 0;
    let appliedVoucher = null;
    const targetVoucherId = voucher_id || null;
    const targetVoucherCode = voucher_code
      ? voucher_code.trim().toUpperCase()
      : null;

    if (targetVoucherId || targetVoucherCode) {
      const whereCond = targetVoucherId
        ? { id: targetVoucherId }
        : { code: targetVoucherCode };

      const voucher = await VoucherModel.findOne({
        where: { ...whereCond, is_active: true },
        transaction,
      });

      if (voucher) {
        const checkoutUserId = user_id ? Number(user_id) : null;

        const isWithinDateRange =
          (!voucher.start_date || new Date(voucher.start_date) <= now) &&
          (!voucher.end_date || new Date(voucher.end_date) >= now);

        const passUsageLimit =
          voucher.usage_limit === null ||
          voucher.usage_limit === undefined ||
          Number(voucher.used_count || 0) < Number(voucher.usage_limit);

        let userUsageCount = 0;
        if (checkoutUserId && VoucherUsageModel) {
          userUsageCount = await VoucherUsageModel.count({
            where: { voucher_id: voucher.id, user_id: checkoutUserId },
            transaction,
          });
        }
        const limitPerUser = Number(voucher.limit_per_user || 1);
        const passLimitPerUser =
          !checkoutUserId || userUsageCount < limitPerUser;

        if (!passLimitPerUser) {
          throw new CheckoutError(
            400,
            "Bạn đã sử dụng hết số lần cho phép với mã giảm giá này",
          );
        }
        if (!passUsageLimit) {
          throw new CheckoutError(400, "Mã giảm giá đã hết lượt sử dụng");
        }
        if (!isWithinDateRange) {
          throw new CheckoutError(
            400,
            "Mã giảm giá đã hết hạn hoặc chưa đến ngày áp dụng",
          );
        }

        if (calculatedTotal >= parseFloat(voucher.min_order_value || 0)) {
          if (
            voucher.discount_type === "percentage" ||
            voucher.discount_type === "percent"
          ) {
            discountAmount =
              (calculatedTotal * parseFloat(voucher.discount_value)) / 100;
            if (
              voucher.max_discount_amount &&
              discountAmount > parseFloat(voucher.max_discount_amount)
            ) {
              discountAmount = parseFloat(voucher.max_discount_amount);
            }
          } else {
            discountAmount = parseFloat(voucher.discount_value || 0);
          }

          if (discountAmount > calculatedTotal)
            discountAmount = calculatedTotal;
          appliedVoucher = voucher;
        }
      }
    }

    // Tổng tiền DO SERVER tính (nếu có phí ship thì cộng thêm ở đây)
    const finalTotal = Math.round(
      Math.max(0, calculatedTotal - discountAmount),
    );

    // =====================================================================
    // BƯỚC 2: TẠO ĐƠN HÀNG
    // =====================================================================
    const orderUserId = user_id ? Number(user_id) : null;
    const orderSessionId = session_id || "session_direct";

    const initialOrderStatus =
      method === "momo"
        ? OrderStatus.AWAITING_MOMO
        : method === "bank"
          ? OrderStatus.AWAITING_BANK
          : OrderStatus.PENDING;

    const addressJsonString = buildAddressString(req.body);

    const newOrder = await db.orders.create(
      {
        session_id: orderSessionId,
        user_id: orderUserId,
        status: initialOrderStatus,
        payment_method: method,
        is_paid: false,
        total: finalTotal,
        note: note || null,
        phone: phone || null,
        address: addressJsonString,
      },
      { transaction },
    );

    // =====================================================================
    // BƯỚC 3: GHI LƯỢT DÙNG VOUCHER
    // =====================================================================
    if (appliedVoucher) {
      await VoucherModel.update(
        { used_count: (appliedVoucher.used_count || 0) + 1 },
        { where: { id: appliedVoucher.id }, transaction },
      );

      if (VoucherUsageModel) {
        await VoucherUsageModel.create(
          {
            voucher_id: appliedVoucher.id,
            user_id: orderUserId,
            order_id: newOrder.id,
            used_at: new Date(),
          },
          { transaction },
        );
      }
    }

    // =====================================================================
    // BƯỚC 4: CHI TIẾT ĐƠN HÀNG
    // =====================================================================
    const OrderDetailModel = db.order_detail || db.order_details;
    if (
      !OrderDetailModel ||
      typeof OrderDetailModel.bulkCreate !== "function"
    ) {
      throw new CheckoutError(
        500,
        "Không tìm thấy cấu hình bảng lưu trữ chi tiết đơn hàng (order_detail)",
      );
    }

    await OrderDetailModel.bulkCreate(
      orderDetails.map((d) => ({
        order_id: newOrder.id,
        product_id: d.product_id,
        product_variant_value_id: d.product_variant_value_id || null,
        price: d.price,
        quantity: d.quantity || 1,
      })),
      { transaction },
    );

    if (orderUserId) {
      const UserModel = db.users || db.User;
      if (UserModel) {
        await UserModel.update(
          { role: 1 },
          { where: { id: orderUserId }, transaction },
        );
      }
    }

    // =====================================================================
    // BƯỚC 5: CỔNG THANH TOÁN
    // =====================================================================
    const orderCode = `DH${newOrder.id}`;
    let momoPayUrl = null;

    if (method === "momo") {
      try {
        const momoRes = await createMomoPayment(
          newOrder.id,
          finalTotal,
          `Thanh toan don hang ${orderCode}`,
        );
        momoPayUrl = momoRes?.payUrl || null;
        if (!momoPayUrl) throw new Error("MoMo không trả về payUrl");
      } catch (momoErr) {
        console.error("Lỗi gọi API MoMo:", momoErr);
        throw new CheckoutError(
          400,
          "Khởi tạo cổng thanh toán MoMo thất bại. Vui lòng thử lại!",
        );
      }
    }

    await transaction.commit();

    // =====================================================================
    // RESPONSE
    // =====================================================================
    if (method === "momo") {
      return res.status(200).json({
        message: "Khởi tạo thanh toán MoMo thành công!",
        data: {
          order_id: newOrder.id,
          order_code: orderCode,
          payment_method: "momo",
          paymentUrl: momoPayUrl,
        },
      });
    }

    if (method === "bank") {
      const bankId = process.env.BANK_ID || "MB";
      const accountNo = process.env.BANK_ACCOUNT_NO || "0987654321";
      const accountNameRaw = process.env.BANK_ACCOUNT_NAME || "SHOP TECH";

      // Nội dung CK chỉ gồm mã đơn để webhook tách bằng regex /DH\d+/
      const qrImageUrl =
        `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png` +
        `?amount=${finalTotal}` +
        `&addInfo=${encodeURIComponent(orderCode)}` +
        `&accountName=${encodeURIComponent(accountNameRaw)}`;

      return res.status(200).json({
        message: "Tạo mã QR thanh toán thành công!",
        data: {
          order_id: newOrder.id,
          order_code: orderCode,
          payment_method: "bank",
          qrImageUrl,
          bank: bankId,
          account_no: accountNo,
          account_name: accountNameRaw,
          amount: finalTotal,
          transfer_content: orderCode,
          expires_at: Date.now() + QR_EXPIRE_MINUTES * 60 * 1000,
        },
      });
    }

    return res.status(200).json({
      message:
        isBuyNow || isDirectItems
          ? "Mua trực tiếp thành công!"
          : "Thanh toán thành công!",
      data: {
        order_id: newOrder.id,
        order_code: orderCode,
        role: 1,
        payment_method: "cod",
      },
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ message: error.message });
    }

    console.error("CRASH TẠI BACKEND CHECKOUT:", error);
    return res.status(500).json({
      message: "Checkout thất bại do lỗi hệ thống",
      error: error.message,
    });
  }
}

// =============================================================================
// 5. XÓA GIỎ HÀNG
// =============================================================================
async function deleteCart(req, res) {
  const { id } = req.params;
  try {
    const deleted = await db.carts.destroy({ where: { id } });
    if (deleted)
      return res.status(200).json({ message: "Xóa giỏ hàng thành công" });
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi xóa giỏ hàng", error: error.message });
  }
}


// Hỏi MoMo trạng thái giao dịch (dùng khi khách quay về từ MoMo, hoặc khi test local)
async function verifyMomoPayment(req, res) {
  const momoOrderId = String(req.query.orderId || "");
  const dbOrderId = parseInt(momoOrderId.split("_")[0].replace("DH", ""), 10);
  if (!dbOrderId) {
    return res.status(400).json({ message: "orderId không hợp lệ" });
  }

  const order = await db.orders.findByPk(dbOrderId);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

  // Đã xử lý rồi (ví dụ IPN đến trước) thì trả luôn
  if (order.status !== OrderStatus.AWAITING_MOMO) {
    return res.json({ status: order.status, is_paid: order.is_paid });
  }

  const {
    MOMO_PARTNER_CODE: partnerCode,
    MOMO_ACCESS_KEY: accessKey,
    MOMO_ENDPOINT,
  } = process.env;

  // .../gateway/api/create  ->  .../gateway/api/query
  const queryEndpoint = MOMO_ENDPOINT.replace("/create", "/query");
  const requestId = `${momoOrderId}-q${Date.now()}`;

  const rawSignature =
    `accessKey=${accessKey}&orderId=${momoOrderId}` +
    `&partnerCode=${partnerCode}&requestId=${requestId}`;

  const resp = await fetch(queryEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode,
      requestId,
      orderId: momoOrderId,
      lang: "vi",
      signature: momoSign(rawSignature),
    }),
  });
  const data = await resp.json();
  console.log("MoMo query:", data);

  // resultCode 0 = đã thanh toán thành công. Kiểm tra thêm số tiền khớp đơn.
  if (Number(data.resultCode) === 0 && Number(data.amount) === Number(order.total)) {
    await db.orders.update(
      {
        status: OrderStatus.PROCESSING,
        is_paid: true,
        paid_at: new Date(),
        transaction_id: String(data.transId),
      },
      { where: { id: dbOrderId, status: OrderStatus.AWAITING_MOMO } },
    );
  }

  const fresh = await db.orders.findByPk(dbOrderId, {
    attributes: ["id", "status", "is_paid"],
  });
  return res.json({ status: fresh.status, is_paid: fresh.is_paid });
}
module.exports = {
  momoSign,
  createMomoPayment,
  getCarts,
  getCartById,
  insertCart,
  deleteCart,
  checkoutCart,
  verifyMomoPayment,
};
