const Sequelize = require("sequelize");
const db = require("../models");

const InsertProduct = require("../dtos/requests/order/InsertOrder");
const UpdateOrder = require("../dtos/requests/order/UpdateOrder");
const Op = Sequelize.Op;
const { OrderStatus } = require("../constants");

// Hàm hỗ trợ tìm kiếm Model linh hoạt trong database
function findModel(targetName) {
  if (!db) return null;
  const keys = Object.keys(db);
  const normalizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const matchedKey = keys.find((key) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      normalizedKey === normalizedTarget ||
      normalizedKey === normalizedTarget + "s" ||
      normalizedTarget === normalizedKey + "s"
    );
  });

  return matchedKey ? db[matchedKey] : null;
}

// 🎯 HÀM HỖ TRỢ CHUẨN HÓA ĐỊA CHỈ THÀNH CẤU TRÚC JSON 4 CẤP ĐỂ LƯU CỘT `address` (DUY NHẤT)
const buildAddressString = (reqBody) => {
  if (!reqBody) {
    return JSON.stringify({
      street: "Chưa chọn",
      ward: "Chưa chọn",
      district: "Chưa chọn",
      city: "Chưa chọn",
      fullAddress: "Chưa cung cấp địa chỉ",
    });
  }

  let rawAddr = reqBody.address !== undefined ? reqBody.address : reqBody;
  let streetVal = "";
  let wardVal = "";
  let districtVal = "";
  let cityVal = "";

  // Giải mã nếu chuỗi là dạng JSON String
  if (typeof rawAddr === "string") {
    try {
      const parsed = JSON.parse(rawAddr);
      if (parsed && typeof parsed === "object") {
        rawAddr = parsed;
      }
    } catch (e) {
      // Giữ nguyên dạng chuỗi thô
    }
  }

  // 1. Trường hợp là Object
  if (typeof rawAddr === "object" && rawAddr !== null) {
    streetVal =
      rawAddr.street ||
      rawAddr.address ||
      rawAddr.specific_address ||
      rawAddr.address_detail ||
      rawAddr.detail ||
      reqBody.street ||
      reqBody.specific_address ||
      reqBody.address_detail ||
      "";
    wardVal =
      rawAddr.ward ||
      rawAddr.ward_name ||
      rawAddr.phuong ||
      rawAddr.xa ||
      reqBody.ward ||
      "";
    districtVal =
      rawAddr.district ||
      rawAddr.district_name ||
      rawAddr.quan ||
      rawAddr.huyen ||
      reqBody.district ||
      "";
    cityVal =
      rawAddr.city ||
      rawAddr.city_name ||
      rawAddr.province ||
      rawAddr.province_name ||
      rawAddr.tinh ||
      reqBody.city ||
      reqBody.province ||
      "";
  } else {
    // 2. Lấy trực tiếp từ reqBody
    streetVal =
      reqBody.street ||
      reqBody.specific_address ||
      reqBody.address_detail ||
      "";
    wardVal = reqBody.ward || "";
    districtVal = reqBody.district || "";
    cityVal = reqBody.city || reqBody.province || "";
  }

  // 3. Trường hợp truyền vào 1 chuỗi văn bản thuần (có hoặc không có dấu phẩy)
  if (
    typeof rawAddr === "string" &&
    rawAddr.trim() !== "" &&
    !streetVal &&
    !wardVal &&
    !districtVal &&
    !cityVal
  ) {
    if (rawAddr.includes(",")) {
      const parts = rawAddr
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const unassigned = [];

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const lower = p.toLowerCase();

        if (
          !cityVal &&
          (lower.includes("tỉnh") ||
            lower.includes("thành phố") ||
            lower.includes("tp.") ||
            lower.startsWith("tp "))
        ) {
          cityVal = p;
        } else if (
          !districtVal &&
          (lower.includes("quận") ||
            lower.includes("huyện") ||
            lower.includes("thị xã") ||
            lower.startsWith("tx.") ||
            lower.startsWith("tx "))
        ) {
          districtVal = p;
        } else if (
          !wardVal &&
          (lower.includes("phường") ||
            lower.includes("xã") ||
            lower.includes("thị trấn") ||
            lower.startsWith("tt.") ||
            lower.startsWith("tt "))
        ) {
          wardVal = p;
        } else {
          unassigned.unshift(p);
        }
      }

      if (unassigned.length > 0) {
        streetVal = unassigned.join(", ");
      }
    } else {
      streetVal = rawAddr.trim();
    }
  }

  // 4. Tổng hợp địa chỉ đầy đủ
  const addressParts = [streetVal, wardVal, districtVal, cityVal].filter(
    Boolean,
  );
  const uniqueParts = addressParts.filter(
    (item, index) => addressParts.indexOf(item) === index,
  );
  const fullAddressVal = uniqueParts.join(", ") || "Chưa cung cấp địa chỉ";

  return JSON.stringify({
    street: streetVal || "Chưa chọn",
    ward: wardVal || "Chưa chọn",
    district: districtVal || "Chưa chọn",
    city: cityVal || "Chưa chọn",
    fullAddress: fullAddressVal,
  });
};

// 1. LẤY DANH SÁCH ĐƠN HÀNG
async function getOrders(req, res) {
  try {
    const {
      search = "",
      page = 1,
      limit = 5,
      status,
      user_id,
      manager_id,
    } = req.query;

    const pageSize = parseInt(limit) || 5;
    const currentPageNum = parseInt(page) || 1;
    const offset = (currentPageNum - 1) * pageSize;

    let whereClause = {};

    if (search.trim() !== "") {
      whereClause = {
        [Op.or]: [{ note: { [Op.like]: `%${search}%` } }],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (user_id) {
      whereClause.user_id = user_id;
    }

    const UserModel = findModel("user") || findModel("users");
    const OrderDetailModel =
      findModel("order_detail") || findModel("orderdetail");
    const ProductModel = findModel("products") || findModel("product");
    const ProductVariantValueModel =
      findModel("product_variant_values") || findModel("productvariantvalue");
    const OrdersModel = findModel("orders") || findModel("order");

    if (!OrdersModel) {
      return res.status(500).json({
        message: "Lỗi hệ thống: Không tìm thấy cấu hình Model cho bảng orders.",
      });
    }

    const includeArr = [
      UserModel && {
        model: UserModel,
        as: "User",
        attributes: ["id", "name", "email", "phone"],
        required: false,
      },
      OrderDetailModel && {
        model: OrderDetailModel,
        as: "order_detail",
        required: false,
        include: [
          ProductModel && {
            model: ProductModel,
            as: "products",
            attributes: ["id", "name", "image", "price", "user_id", "brand_id"],
            required: false,
          },
          ProductVariantValueModel && {
            model: ProductVariantValueModel,
            as: "product_variant_values",
            attributes: [
              "id",
              "product_id",
              "price",
              "old_price",
              "stock",
              "sku",
              "image_url",
            ],
            required: false,
          },
        ].filter(Boolean),
      },
    ].filter(Boolean);

    const hasChildFilter = Boolean(
      manager_id && manager_id !== "null" && manager_id !== "undefined",
    );

    if (hasChildFilter) {
      const parsedManagerId = parseInt(manager_id);
      if (!isNaN(parsedManagerId)) {
        whereClause["$order_detail.products.user_id$"] = parsedManagerId;
      }
    }

    const countOptions = {
      where: whereClause,
      distinct: true,
      col: "id",
    };

    if (hasChildFilter) {
      countOptions.include = includeArr;
    }

    const totalOrders = await OrdersModel.count(countOptions);

    const orders = await OrdersModel.findAll({
      where: whereClause,
      include: includeArr,
      limit: pageSize,
      offset: offset,
      subQuery: !hasChildFilter,
      order: [["id", "DESC"]],
    });

    const formattedOrders = orders.map((order) => {
      const plainOrder = order.get({ plain: true });

      if (Array.isArray(plainOrder.order_detail)) {
        plainOrder.order_detail = plainOrder.order_detail.map((detail) => {
          if (!detail.product_variant_values) {
            detail.product_variant_values = {
              id: detail.product_variant_value_id || null,
              sku: detail.products?.sku || `PROD-${detail.product_id}`,
              variant_name: "Mặc định",
              price: detail.price || detail.products?.price || 0,
              image_url: detail.products?.image || null,
            };
          }
          return detail;
        });
      }

      return plainOrder;
    });

    const totalPages = Math.ceil(totalOrders / pageSize) || 1;

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: formattedOrders,
      totalPages: totalPages,
      totalItems: totalOrders,
      pagination: {
        totalOrders,
        currentPage: currentPageNum,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error("Lỗi hệ thống tại getOrders: ", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi hệ thống khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
}

// 2. LẤY CHI TIẾT ĐƠN HÀNG BY ID
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const OrderDetailModel =
      findModel("order_detail") || findModel("orderdetail");
    const ProductModel = findModel("products") || findModel("product");
    const ProductVariantValueModel =
      findModel("product_variant_values") || findModel("productvariantvalue");
    const OrdersModel = findModel("orders") || findModel("order");

    if (!OrdersModel) {
      return res.status(500).json({
        message: "Lỗi hệ thống: Không tìm thấy cấu hình Model cho bảng orders.",
      });
    }

    const includeArr = [];
    if (OrderDetailModel) {
      includeArr.push({
        model: OrderDetailModel,
        as: "order_detail",
        include: [
          ProductModel && {
            model: ProductModel,
            as: "products",
            attributes: ["id", "name", "image", "price", "brand_id"],
          },
          ProductVariantValueModel && {
            model: ProductVariantValueModel,
            as: "product_variant_values",
          },
        ].filter(Boolean),
      });
    }

    const order = await OrdersModel.findByPk(id, {
      include: includeArr,
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.status(200).json({
      message: "Lấy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi hệ thống tại getOrderById: ", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi hệ thống khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
}

// 3. TẠO ĐƠN HÀNG MỚI
async function createOrder(req, res) {
  const transaction = await db.sequelize.transaction();
  try {
    const OrdersModel = findModel("orders") || findModel("order");
    const OrderDetailModel =
      findModel("order_detail") || findModel("orderdetail");
    const ProductModel = findModel("products") || findModel("product");

    const {
      user_id,
      total,
      total_price,
      brand_id,
      note,
      phone,
      product_id,
      productId,
      quantity,
      quanity,
      variant_id,
      product_variant_value_id,
      items,
      cart_id,
    } = req.body;

    const directProductId = product_id || productId;
    let rawItems = [];

    // 1. Gom danh sách sản phẩm mua
    if (items && Array.isArray(items) && items.length > 0) {
      rawItems = items;
    } else if (directProductId) {
      rawItems = [
        {
          product_id: Number(directProductId),
          quantity: Number(quantity || quanity || 1),
          price: Number(total_price || total || 0),
          product_variant_value_id:
            product_variant_value_id || variant_id
              ? Number(product_variant_value_id || variant_id)
              : null,
          brand_id: brand_id ? Number(brand_id) : null,
        },
      ];
    } else if (cart_id) {
      const CartItemModel =
        findModel("cart_item") ||
        findModel("cartitem") ||
        findModel("cart_items");
      if (CartItemModel) {
        const dbCartItems = await CartItemModel.findAll({
          where: { cart_id: Number(cart_id) },
          transaction,
          raw: true,
        });

        rawItems = dbCartItems.map((ci) => ({
          product_id: Number(ci.product_id || ci.productId),
          product_variant_value_id:
            ci.product_variant_value_id || ci.variant_id
              ? Number(ci.product_variant_value_id || ci.variant_id)
              : null,
          quantity: Number(ci.quantity || ci.quanity || 1),
          price: Number(ci.price || ci.applied_price || 0),
          brand_id:
            ci.brand_id || ci.brandId
              ? Number(ci.brand_id || ci.brandId)
              : null,
        }));
      }
    }

    // 2. Tính tổng tiền
    const calculatedTotal = Number(total_price || total || 0);

    // 3. THUẬT TOÁN BẮT BRAND_ID ĐA TẦNG
    let finalBrandId = brand_id ? Number(brand_id) : null;

    if (!finalBrandId && rawItems.length > 0) {
      const firstItem = rawItems[0];
      if (firstItem.brand_id || firstItem.brandId) {
        finalBrandId = Number(firstItem.brand_id || firstItem.brandId);
      }
    }

    if (!finalBrandId && rawItems.length > 0) {
      const sampleProductId = Number(
        rawItems[0].product_id || rawItems[0].productId || rawItems[0].id,
      );

      if (sampleProductId) {
        if (ProductModel) {
          const productObj = await ProductModel.findByPk(sampleProductId, {
            transaction,
            raw: true,
          });
          if (productObj) {
            finalBrandId =
              Number(productObj.brand_id || productObj.brandId || 0) || null;
          }
        }

        if (!finalBrandId) {
          const [results] = await db.sequelize.query(
            `SELECT brand_id FROM products WHERE id = :pId LIMIT 1`,
            {
              replacements: { pId: sampleProductId },
              transaction,
            },
          );
          if (results && results.length > 0 && results[0].brand_id) {
            finalBrandId = Number(results[0].brand_id);
          }
        }
      }
    }

    // 4. Chuẩn hóa địa chỉ lưu chuẩn 4 cấp dạng JSON string
    const addressJsonString = buildAddressString(req.body);

    // 5. Lưu đơn hàng vào bảng `orders`
    const newOrder = await OrdersModel.create(
      {
        user_id: Number(user_id),
        total: calculatedTotal,
        total_price: calculatedTotal,
        brand_id: finalBrandId,
        note,
        phone,
        address: addressJsonString,
        status:
          typeof OrderStatus !== "undefined" ? OrderStatus.PENDING || 1 : 1,
        session_id: "session_direct",
      },
      { transaction },
    );

    // 6. Tạo Order Detail & TRỪ TỒN KHO
    for (const item of rawItems) {
      const targetProductId = Number(
        item.product_id || item.productId || item.id,
      );
      const targetVariantId =
        item.product_variant_value_id || item.variant_id || item.variantId
          ? Number(
              item.product_variant_value_id ||
                item.variant_id ||
                item.variantId,
            )
          : null;

      const targetQty = Math.max(1, Number(item.quantity || item.quanity || 1));

      if (!targetProductId) continue;

      await OrderDetailModel.create(
        {
          order_id: newOrder.id,
          product_id: targetProductId,
          product_variant_value_id: targetVariantId,
          quantity: targetQty,
          price: item.price || 0,
        },
        { transaction },
      );

      await db.sequelize.query(
        `UPDATE products SET quanity = quanity - :qty WHERE id = :pId`,
        {
          replacements: { qty: targetQty, pId: targetProductId },
          transaction,
        },
      );

      if (targetVariantId) {
        await db.sequelize.query(
          `UPDATE product_variant_values SET stock = stock - :qty WHERE id = :vId`,
          {
            replacements: { qty: targetQty, vId: targetVariantId },
            transaction,
          },
        );
      }
    }

    // 7. Xóa giỏ hàng
    if (cart_id) {
      const CartItemModel =
        findModel("cart_item") ||
        findModel("cartitem") ||
        findModel("cart_items");
      if (CartItemModel) {
        await CartItemModel.destroy({
          where: { cart_id: Number(cart_id) },
          transaction,
        });
      }
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      data: newOrder,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return res.status(500).json({
      message: "Lỗi tạo đơn hàng",
      error: error.message,
    });
  }
}

// 4. HỦY ĐƠN HÀNG
async function deleteOrder(req, res) {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const OrdersModel = findModel("orders") || findModel("order");
    const OrderDetailModel =
      findModel("order_detail") || findModel("orderdetail");

    if (!OrdersModel) {
      await transaction.rollback();
      return res.status(500).json({
        message: "Lỗi hệ thống: Không tìm thấy cấu hình Model cho bảng orders.",
      });
    }

    const order = await OrdersModel.findByPk(id);

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    const cancelledStatus = OrderStatus.CANCELLED || 5;

    if (
      String(order.status) !== String(cancelledStatus) &&
      String(order.status) !== "0"
    ) {
      let details = [];
      if (OrderDetailModel) {
        details = await OrderDetailModel.findAll({
          where: { order_id: id },
          transaction,
        });
      }

      for (const detail of details) {
        const qty = Math.max(1, Number(detail.quantity || detail.quanity || 1));
        const pId = Number(detail.product_id);
        const vId = detail.product_variant_value_id
          ? Number(detail.product_variant_value_id)
          : null;

        if (pId) {
          await db.sequelize.query(
            `UPDATE products SET quanity = quanity + :qty WHERE id = :pId`,
            {
              replacements: { qty, pId },
              transaction,
            },
          );
        }

        if (vId) {
          await db.sequelize.query(
            `UPDATE product_variant_values SET stock = stock + :qty WHERE id = :vId`,
            {
              replacements: { qty, vId },
              transaction,
            },
          );
        }
      }
    }

    await OrdersModel.update(
      { status: cancelledStatus },
      { where: { id }, transaction },
    );

    await transaction.commit();
    return res.status(200).json({
      message: "Hủy đơn hàng và hoàn tồn kho thành công!",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi hệ thống tại deleteOrder: ", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi xử lý hủy đơn hàng",
      error: error.message,
    });
  }
}

// 5. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  updateOrder,
  buildAddressString,
};
async function updateOrder(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    const OrderDetailModel = db.order_detail || db.order_details;
    const VariantModel = db.product_variant_values;

    const order = await db.orders.findByPk(id, {
      include: [{ model: OrderDetailModel, as: "order_detail" }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const oldStatus = Number(order.status);
    const newStatus = Number(status);

    // 🌟 Trạng thái "Đã giao" (status 4): tồn kho ĐÃ bị trừ ngay từ lúc
    // tạo đơn (xem createOrder), nên ở đây KHÔNG trừ lại quanity/stock
    // nữa (tránh trừ kho 2 lần). Chỉ tăng `buyturn` để thống kê lượt mua
    // thành công của sản phẩm.
    const DEDUCT_STATUS = 4;
    // 🌟 Các trạng thái coi như "trả lại kho": Đã hủy (5) và Hoàn tiền (6).
    const RESTOCK_STATUSES = [5, 6]; // CANCELLED, REFUNDED

    const items = order.order_details || order.order_detail || [];

    if (newStatus === DEDUCT_STATUS && oldStatus !== DEDUCT_STATUS) {
      for (const item of items) {
        const buyQty = Number(item.quantity || item.quanity || 1);
        const productId = item.product_id;

        if (productId) {
          const product = await db.products.findByPk(productId, {
            transaction,
          });
          if (product) {
            const currentBuyturn = Number(product.buyturn || 0);

            await db.products.update(
              {
                buyturn: currentBuyturn + buyQty,
              },
              { where: { id: productId }, transaction },
            );
          }
        }
      }
    }

    // 🌟 Khi đơn hàng chuyển sang "Đã hủy" hoặc "Hoàn tiền": vì tồn kho
    // đã bị trừ ngay từ lúc TẠO ĐƠN (không phải chờ tới lúc giao hàng),
    // nên bất kể đơn đang ở trạng thái nào trước đó (chờ xử lý, đang
    // giao, đã giao...) đều phải cộng lại kho — KHÔNG còn điều kiện
    // "oldStatus >= DEDUCT_STATUS" như code cũ nữa (đó chính là nguyên
    // nhân khiến khách hủy đơn ở trạng thái chưa giao mà kho không được
    // cộng lại). Chỉ chặn cộng lại 2 lần nếu đơn đã ở sẵn 1 trong 2
    // trạng thái "trả kho" rồi lại chuyển sang trạng thái "trả kho" còn
    // lại (ví dụ CANCELLED -> REFUNDED).
    const wasAlreadyRestocked = RESTOCK_STATUSES.includes(oldStatus);
    if (RESTOCK_STATUSES.includes(newStatus) && !wasAlreadyRestocked) {
      for (const item of items) {
        const buyQty = Number(item.quantity || item.quanity || 1);
        const productId = item.product_id;
        const variantId = item.product_variant_value_id;

        if (productId) {
          const product = await db.products.findByPk(productId, {
            transaction,
          });
          if (product) {
            const currentQuanity = Number(product.quanity || 0);
            const currentBuyturn = Number(product.buyturn || 0);

            await db.products.update(
              {
                quanity: currentQuanity + buyQty,
                buyturn: Math.max(0, currentBuyturn - buyQty),
              },
              { where: { id: productId }, transaction },
            );
          }
        }

        if (variantId && VariantModel) {
          const variant = await VariantModel.findByPk(variantId, {
            transaction,
          });
          if (variant) {
            const currentStock = Number(variant.stock || 0);
            await VariantModel.update(
              { stock: currentStock + buyQty },
              { where: { id: variantId }, transaction },
            );
          }
        }
      }
    }

    order.status = newStatus;
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
    return res.status(500).json({
      message: "Cập nhật trạng thái thất bại",
      error: error.message,
    });
  }
}
