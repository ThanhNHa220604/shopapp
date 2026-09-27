const Sequelize = require("sequelize");
const db = require("../models");
const { createMomoPayment } = require("../helpers/momoHelper");
const { buildAddressString } = require("./OrderController");

const OrderStatus = require("../constants");
const Op = Sequelize.Op;

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
    total,
    note,
    phone,
    address,
    user_id,
    session_id,
    payment_method,
    voucher_id,
    voucher_code,
  } = req.body;

  console.log("👉 [CHECKOUT PAYLOAD]:", req.body);

  const transaction = await db.sequelize.transaction();

  try {
    let orderDetails = [];
    let calculatedTotal = 0;

    const targetProductId = product_id ? Number(product_id) : null;
    const inputQuantity = parseInt(quantity || quanity) || 1;
    const chosenVariantId = product_variant_value_id || variant_id || null;
    const isBuyNow = !!targetProductId;
    const isDirectItems = Array.isArray(items) && items.length > 0;
    const now = new Date();

    const VariantModel =
      db.product_variant_values ||
      db.ProductVariantValues ||
      db.productVariantValues;
    const FlashSaleProductModel =
      db.flash_sale_products || db.FlashSaleProducts;

    const getActiveFlashSale = async (pId) => {
      if (!FlashSaleProductModel) return null;
      return await FlashSaleProductModel.findOne({
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

    // -------------------------------------------------------------------------
    // LUỒNG 1: MUA NGAY TRỰC TIẾP (1 SẢN PHẨM)
    // -------------------------------------------------------------------------
    if (isBuyNow) {
      let itemPrice = 0;
      const flashSaleItem = await getActiveFlashSale(targetProductId);

      const product = await db.products.findOne({
        where: { id: targetProductId },
        attributes: ["id", "name", "price", "quanity"],
        transaction,
      });

      if (!product) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: `Sản phẩm ID ${targetProductId} không tồn tại` });
      }

      if (product.quanity < inputQuantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm ${product.name} không đủ tổng số lượng trong kho`,
        });
      }

      if (chosenVariantId && VariantModel) {
        const variant = await VariantModel.findOne({
          where: { id: chosenVariantId, product_id: targetProductId },
          transaction,
        });

        if (!variant) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: "Biến thể sản phẩm không tồn tại" });
        }

        if (variant.stock < inputQuantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Kho biến thể không đủ số lượng (Còn lại: ${variant.stock})`,
          });
        }

        itemPrice = flashSaleItem
          ? parseFloat(flashSaleItem.flash_sale_price)
          : parseFloat(variant.price);

        orderDetails.push({
          product_id: targetProductId,
          product_variant_value_id: variant.id,
          quantity: inputQuantity,
          price: itemPrice,
        });

        await VariantModel.update(
          { stock: variant.stock - inputQuantity },
          { where: { id: variant.id }, transaction },
        );

        await db.products.update(
          { quanity: product.quanity - inputQuantity },
          { where: { id: product.id }, transaction },
        );
      } else {
        itemPrice = flashSaleItem
          ? parseFloat(flashSaleItem.flash_sale_price)
          : parseFloat(product.price);

        orderDetails.push({
          product_id: product.id,
          product_variant_value_id: null,
          quantity: inputQuantity,
          price: itemPrice,
        });

        await db.products.update(
          { quanity: product.quanity - inputQuantity },
          { where: { id: product.id }, transaction },
        );
      }

      if (flashSaleItem) {
        await FlashSaleProductModel.update(
          {
            flash_sale_stock: Math.max(
              0,
              flashSaleItem.flash_sale_stock - inputQuantity,
            ),
            flash_sale_sold:
              (flashSaleItem.flash_sale_sold || 0) + inputQuantity,
          },
          { where: { id: flashSaleItem.id }, transaction },
        );
      }

      calculatedTotal = inputQuantity * itemPrice;
    }
    // -------------------------------------------------------------------------
    // LUỒNG 2: MUA QUA MẢNG ITEMS TRỰC TIẾP
    // -------------------------------------------------------------------------
    else if (isDirectItems) {
      for (const item of items) {
        const pId = Number(item.product_id || item.products?.id || item.id);
        const itemQty = parseInt(item.quantity || item.quanity) || 1;
        const vId =
          item.product_variant_value_id || item.variant_id
            ? Number(item.product_variant_value_id || item.variant_id)
            : null;

        if (!pId) continue;

        let itemPrice = parseFloat(item.price || 0);

        const product = await db.products.findOne({
          where: { id: pId },
          attributes: ["id", "name", "price", "quanity"],
          transaction,
        });

        if (!product) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: `Sản phẩm ID ${pId} không tồn tại` });
        }

        if (product.quanity < itemQty) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Sản phẩm ${product.name} không đủ số lượng trong kho`,
          });
        }

        if (vId && VariantModel) {
          const variant = await VariantModel.findOne({
            where: { id: vId, product_id: pId },
            transaction,
          });
          if (variant) {
            if (variant.stock < itemQty) {
              await transaction.rollback();
              return res.status(400).json({
                message: `Kho biến thể không đủ số lượng cho sản phẩm ID ${pId}`,
              });
            }
            if (!itemPrice) itemPrice = parseFloat(variant.price);

            await VariantModel.update(
              { stock: variant.stock - itemQty },
              { where: { id: variant.id }, transaction },
            );

            await db.products.update(
              { quanity: product.quanity - itemQty },
              { where: { id: product.id }, transaction },
            );
          }
        } else {
          if (!itemPrice) itemPrice = parseFloat(product.price);

          await db.products.update(
            { quanity: product.quanity - itemQty },
            { where: { id: product.id }, transaction },
          );
        }

        calculatedTotal += itemQty * itemPrice;

        orderDetails.push({
          product_id: pId,
          product_variant_value_id: vId,
          quantity: itemQty,
          price: itemPrice,
        });
      }
    }
    // -------------------------------------------------------------------------
    // LUỒNG 3: THANH TOÁN QUA GIỎ HÀNG
    // -------------------------------------------------------------------------
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
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Thiếu thông tin cart_id hoặc user_id hợp lệ" });
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
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Giỏ hàng không hợp lệ hoặc đang trống" });
      }

      for (const item of cart.cart_items) {
        const product = item.products;
        const variant = item.product_variant_values;
        const buyQty = Number(item.quanity || item.quantity || 1);

        if (!product) {
          await transaction.rollback();
          return res.status(404).json({
            message: `Sản phẩm ID ${item.product_id} trong giỏ không tồn tại`,
          });
        }

        if (product.quanity < buyQty) {
          await transaction.rollback();
          return res
            .status(400)
            .json({ message: `Sản phẩm ${product.name} không đủ kho tổng` });
        }

        if (variant && variant.stock < buyQty) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Biến thể sản phẩm ${product.name} không đủ kho`,
          });
        }

        const flashSaleItem = await getActiveFlashSale(item.product_id);
        let itemPrice = 0;

        if (flashSaleItem) {
          itemPrice = parseFloat(flashSaleItem.flash_sale_price);
        } else if (variant) {
          itemPrice = parseFloat(variant.price);
        } else {
          itemPrice = parseFloat(product.price || 0);
        }

        calculatedTotal += buyQty * itemPrice;

        orderDetails.push({
          product_id: item.product_id,
          product_variant_value_id:
            item.product_variant_value_id || (variant ? variant.id : null),
          quantity: buyQty,
          price: itemPrice,
        });

        await db.products.update(
          { quanity: product.quanity - buyQty },
          { where: { id: item.product_id }, transaction },
        );

        if (variant && VariantModel) {
          await VariantModel.update(
            { stock: variant.stock - buyQty },
            { where: { id: variant.id }, transaction },
          );
        }

        if (flashSaleItem) {
          await FlashSaleProductModel.update(
            {
              flash_sale_stock: Math.max(
                0,
                flashSaleItem.flash_sale_stock - buyQty,
              ),
              flash_sale_sold: (flashSaleItem.flash_sale_sold || 0) + buyQty,
            },
            { where: { id: flashSaleItem.id }, transaction },
          );
        }
      }

      await db.cart_items.destroy({ where: { cart_id: cartId }, transaction });
    }

    // =========================================================================
    // BƯỚC 1: TÍNH TIỀN VOUCHER GIẢM GIÁ (CHƯA LƯU VÀO DATABASE VÌ CHƯA CÓ ORDER_ID)
    // =========================================================================
    let discountAmount = 0;
    let appliedVoucher = null;
    const targetVoucherId = voucher_id || null;
    const targetVoucherCode = voucher_code
      ? voucher_code.trim().toUpperCase()
      : null;

    if (targetVoucherId || targetVoucherCode) {
      const VoucherModel = db.vouchers || db.Voucher;
      const VoucherUsageModel =
        db.voucher_usages || db.voucherusages || db.VoucherUsages;

      const whereCond = targetVoucherId
        ? { id: targetVoucherId }
        : { code: targetVoucherCode };

      const voucher = await VoucherModel.findOne({
        where: { ...whereCond, is_active: true },
        transaction,
      });

      if (voucher) {
        const checkoutUserId = user_id ? Number(user_id) : null;

        // 🟢 1. Kiểm tra còn trong thời hạn hiệu lực không
        const isWithinDateRange =
          (!voucher.start_date || new Date(voucher.start_date) <= now) &&
          (!voucher.end_date || new Date(voucher.end_date) >= now);

        // 🟢 2. Kiểm tra còn lượt dùng chung (usage_limit = null nghĩa là không giới hạn)
        const passUsageLimit =
          voucher.usage_limit === null ||
          voucher.usage_limit === undefined ||
          Number(voucher.used_count || 0) < Number(voucher.usage_limit);

        // 🟢 3. Kiểm tra số lần user này đã dùng voucher (limit_per_user)
        let userUsageCount = 0;
        if (checkoutUserId && VoucherUsageModel) {
          userUsageCount = await VoucherUsageModel.count({
            where: { voucher_id: voucher.id, user_id: checkoutUserId },
            transaction,
          });
        }
        const limitPerUser = Number(voucher.limit_per_user || 1);
        // Khách chưa đăng nhập (checkoutUserId null) thì không chặn được theo user
        // -> vẫn cho qua để không làm hỏng luồng khách vãng lai hiện có.
        const passLimitPerUser =
          !checkoutUserId || userUsageCount < limitPerUser;

        if (
          isWithinDateRange &&
          passUsageLimit &&
          passLimitPerUser &&
          calculatedTotal >= parseFloat(voucher.min_order_value || 0)
        ) {
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

          if (discountAmount > calculatedTotal) {
            discountAmount = calculatedTotal;
          }

          appliedVoucher = voucher;
        } else if (!passLimitPerUser) {
          await transaction.rollback();
          return res.status(400).json({
            message: "Bạn đã sử dụng hết số lần cho phép với mã giảm giá này",
          });
        } else if (!passUsageLimit) {
          await transaction.rollback();
          return res.status(400).json({
            message: "Mã giảm giá đã hết lượt sử dụng",
          });
        } else if (!isWithinDateRange) {
          await transaction.rollback();
          return res.status(400).json({
            message: "Mã giảm giá đã hết hạn hoặc chưa đến ngày áp dụng",
          });
        }
      }
    }

    const finalTotal =
      total !== undefined && total !== null
        ? Number(total)
        : Math.max(0, calculatedTotal - discountAmount);

    // =========================================================================
    // BƯỚC 2: TẠO ĐƠN HÀNG TRƯỚC ĐỂ LẤY NEWORDER.ID
    // =========================================================================
    const orderUserId = user_id ? Number(user_id) : null;
    const orderSessionId = session_id || "session_direct";
    const initialOrderStatus = payment_method === "momo" ? 0 : 1;

    // Chuẩn hóa địa chỉ thành JSON string 4 cấp (street/ward/district/city)
    // trước khi lưu — dùng chung logic với OrderController.createOrder để
    // không bao giờ đẩy thẳng array/object vào cột `address` (kiểu TEXT/STRING).
    const addressJsonString = buildAddressString(req.body);

    const newOrder = await db.orders.create(
      {
        session_id: orderSessionId,
        user_id: orderUserId,
        status: initialOrderStatus,
        total: Number(finalTotal),
        note: note || null,
        phone: phone || null,
        address: addressJsonString,
      },
      { transaction },
    );

    // =========================================================================
    // BƯỚC 3: GHI LƯỢT DÙNG VOUCHER (ĐÃ CÓ ORDER_ID TỪ NEWORDER)
    // =========================================================================
    if (appliedVoucher) {
      const VoucherModel = db.vouchers || db.Voucher;
      const VoucherUsageModel =
        db.voucher_usages || db.voucherusages || db.VoucherUsages;

      // Cập nhật lượt đã dùng của Voucher (+1)
      await VoucherModel.update(
        { used_count: (appliedVoucher.used_count || 0) + 1 },
        { where: { id: appliedVoucher.id }, transaction },
      );

      // Lưu nhật ký sử dụng voucher gắn với newOrder.id
      if (VoucherUsageModel) {
        await VoucherUsageModel.create(
          {
            voucher_id: appliedVoucher.id,
            user_id: orderUserId,
            order_id: newOrder.id, // ✅ ĐÃ CÓ ORDER_ID - KHÔNG CÒN LỖI NULL VIOLATION
            used_at: new Date(),
          },
          { transaction },
        );
      }
    }

    // =========================================================================
    // BƯỚC 4: TẠO CHI TIẾT ĐƠN HÀNG
    // =========================================================================
    const finalOrderDetails = orderDetails.map((detail) => ({
      order_id: newOrder.id,
      product_id: detail.product_id,
      product_variant_value_id:
        detail.product_variant_value_id || detail.variant_id || null,
      price: detail.price,
      quantity: detail.quantity || 1,
    }));

    const OrderDetailModel = db.order_detail || db.order_details;
    if (OrderDetailModel && typeof OrderDetailModel.bulkCreate === "function") {
      await OrderDetailModel.bulkCreate(finalOrderDetails, { transaction });
    } else {
      await transaction.rollback();
      return res.status(500).json({
        message:
          "Không tìm thấy cấu hình bảng lưu trữ chi tiết đơn hàng (order_detail)",
      });
    }

    if (orderUserId) {
      const UserModel = db.users || db.User;
      if (UserModel) {
        await UserModel.update(
          { role: 1 },
          { where: { id: orderUserId }, transaction },
        );
      }
    }

    // =========================================================================
    // BƯỚC 5: XỬ LÝ CỔNG THANH TOÁN
    // =========================================================================
    let momoPayUrl = null;

    if (payment_method === "momo") {
      try {
        const momoAmount = Math.round(Number(newOrder.total));
        const momoRes = await createMomoPayment(
          newOrder.id,
          momoAmount,
          `Thanh toan don hang DH${newOrder.id}`,
        );
        momoPayUrl = momoRes?.payUrl || null;
      } catch (momoErr) {
        await transaction.rollback();
        console.error("Lỗi gọi API MoMo:", momoErr);
        return res.status(400).json({
          message: "Khởi tạo cổng thanh toán MoMo thất bại. Vui lòng thử lại!",
          error: momoErr.message || momoErr,
        });
      }
    }

    await transaction.commit();

    // RESPONSE CHO CLIENT
    if (payment_method === "momo") {
      return res.status(200).json({
        message: "Khởi tạo thanh toán MoMo thành công!",
        data: {
          order_id: newOrder.id,
          payment_method: "momo",
          paymentUrl: momoPayUrl,
        },
      });
    }

    if (payment_method === "bank" || payment_method === "vnpay") {
      const bankId = process.env.BANK_ID || "MB";
      const accountNo = process.env.BANK_ACCOUNT_NO || "0987654321";
      const accountName = encodeURIComponent(
        process.env.BANK_ACCOUNT_NAME || "SHOP TECH",
      );
      const memo = encodeURIComponent(`THANH TOAN DH${newOrder.id}`);

      const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${newOrder.total}&addInfo=${memo}&accountName=${accountName}`;

      return res.status(200).json({
        message: "Tạo mã QR thanh toán thành công!",
        data: {
          order_id: newOrder.id,
          payment_method: "bank",
          qrImageUrl,
        },
      });
    }

    return res.status(200).json({
      message:
        isBuyNow || isDirectItems
          ? "Mua trực tiếp thành công!"
          : "Thanh toán thành công!",
      data: { order_id: newOrder.id, role: 1, payment_method: "cod" },
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
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

module.exports = {
  getCarts,
  getCartById,
  insertCart,
  deleteCart,
  checkoutCart,
};
