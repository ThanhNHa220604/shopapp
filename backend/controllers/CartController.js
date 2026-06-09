const Sequelize = require("sequelize");
const db = require("../models");
const OrderStatus = require("../constants");
const Op = Sequelize.Op;

async function getCarts(req, res) {
  const { page = 1 } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [carts, total] = await Promise.all([
    db.carts.findAll({
      limit: pageSize,
      offset,
      include: [
        {
          model: db.cart_items,
          as: "cart_items",
          include: [
            {
              model: db.products,
              as: "products",
            },
          ],
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
}

async function getCartById(req, res) {
  const { id } = req.params;

  const cart = await db.carts.findOne({
    where: { id },

    include: [
      {
        model: db.cart_items,
        as: "cart_items",

        include: [
          {
            model: db.products,
            as: "products",
          },
        ],
      },
    ],
  });
  if (!cart) {
    return res.status(404).json({
      message: "giỏ hàng không tồn tại",
    });
  }

  return res.status(200).json({
    message: "Lấy giỏ hàng thành công",
    data: cart,
  });
}

async function insertCart(req, res) {
  const { id, user_id, session_id } = req.body;

  let existingCart = null;

  if (id) {
    existingCart = await db.carts.findOne({
      where: { id },
    });
  }

  if (existingCart) {
    existingCart.user_id = user_id;
    existingCart.session_id = session_id;

    await existingCart.save();

    return res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      data: existingCart,
    });
  }

  const [newCart, created] = await db.carts.findOrCreate({
    where: { user_id },
    defaults: {
      user_id,
      session_id,
    },
  });

  return res.status(201).json({
    message: "Thêm giỏ hàng thành công",
    data: newCart,
  });
}

// =========================================================================
// CHECKOUT ĐA NĂNG: TỰ ĐỘNG PHÁT HIỆN TÊN MODEL (FIX TRIỆT ĐỂ LỖI UNDEFINED)
// =========================================================================
async function checkoutCart(req, res) {
  const { cart_id, product_id, quanity, quantity, total, note, phone, address, user_id, session_id } = req.body;
  
  const transaction = await db.sequelize.transaction();

  try {
    let orderDetails = [];
    let finalTotal = total || 0;
    const isBuyNow = !!product_id; 

    const inputQuantity = parseInt(quantity || quanity) || 1;

    if (isBuyNow) {
      // -----------------------------------------------------------------
      // LUỒNG 1: MUA NGAY TRỰC TIẾP
      // -----------------------------------------------------------------
      const product = await db.products.findOne({
        where: { id: product_id },
        attributes: ['id', 'name', 'price', 'quanity'], 
        raw: true,
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Sản phẩm ID ${product_id} không tồn tại` });
      }

      if (product.quanity < inputQuantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho` });
      }

      if (!total) {
        finalTotal = inputQuantity * (product.price || 0);
      }

      orderDetails.push({
        product_id: product.id,
        quantity: inputQuantity, 
        price: product.price,
      });

      await db.products.update(
        { quanity: product.quanity - inputQuantity },
        { where: { id: product.id }, transaction }
      );

    } else {
      // -----------------------------------------------------------------
      // LUỒNG 2: THANH TOÁN QUA GIỎ HÀNG
      // -----------------------------------------------------------------
      const cartId = parseInt(cart_id);
      if (!cartId) {
        await transaction.rollback();
        return res.status(400).json({ message: "Thiếu thông tin giỏ hàng hợp lệ" });
      }

      const cart = await db.carts.findByPk(cartId, {
        include: [
          {
            model: db.cart_items,
            as: "cart_items",
            include: [{ model: db.products, as: "products" }],
          },
        ],
        transaction,
      });

      if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: "Giỏ hàng không hợp lệ hoặc đang trống" });
      }

      for (const item of cart.cart_items) {
        if (!item.products) {
          await transaction.rollback();
          return res.status(404).json({ message: `Sản phẩm ID ${item.product_id} không tồn tại` });
        }
        if (item.products.quanity < item.quanity) {
          await transaction.rollback();
          return res.status(400).json({ message: `Sản phẩm ${item.products.name} không đủ số lượng` });
        }
      }

      if (!total) {
        finalTotal = cart.cart_items.reduce((sum, item) => sum + item.quanity * (item.products.price || 0), 0);
      }

      orderDetails = cart.cart_items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quanity, 
        price: item.products.price,
      }));

      for (const item of cart.cart_items) {
        await db.products.update(
          { quanity: item.products.quanity - item.quanity },
          { where: { id: item.product_id }, transaction }
        );
      }

      await db.cart_items.destroy({ where: { cart_id: cartId }, transaction });
    }

    // -----------------------------------------------------------------
    // TẠO ĐƠN HÀNG TRÊN DATABASE (BẢNG orders)
    // -----------------------------------------------------------------
    const orderUserId = user_id ? Number(user_id) : null;
    const orderSessionId = session_id || "session_direct";

    const newOrder = await db.orders.create(
      {
        session_id: orderSessionId,
        user_id: orderUserId,
        status: 1, 
        total: Number(finalTotal),
        note: note || null,
        phone: phone || null,
        address: address || null,
      },
      { transaction }
    );

    const finalOrderDetails = orderDetails.map(detail => ({
      order_id: newOrder.id,
      product_id: detail.product_id,
      price: detail.price,
      quantity: detail.quantity || 1
    }));

    // 🌟 BƯỚC THẦN THÁNH: Tự dò tìm key hợp lý nhất trong đối tượng db
    const matchedKey = Object.keys(db).find(key => {
      const normalized = key.toLowerCase().replace(/[-_]/g, '');
      return normalized === 'orderdetail' || normalized === 'orderdetails';
    });

    // Nếu tìm thấy key hợp lệ (ví dụ 'OrderDetail', 'order-detail', 'order_details'...)
    if (matchedKey && db[matchedKey] && typeof db[matchedKey].bulkCreate === 'function') {
      console.log(`[CHECKOUT] Đã tự động phát hiện model chuẩn: db["${matchedKey}"]`);
      await db[matchedKey].bulkCreate(finalOrderDetails, { transaction });
    } else {
      // In thẳng danh sách model hiện có ra Terminal của Nodejs để quan sát
      console.error("❌ KHÔNG TÌM THẤY MODEL! Danh sách các key hiện có trong db:", Object.keys(db));
      
      await transaction.rollback();
      return res.status(500).json({
        message: "Checkout thất bại do lỗi cấu hình tên Model Chi tiết đơn hàng",
        error: `Không tìm thấy model khớp với 'order-detail'. Các model hiện có: ${Object.keys(db).join(', ')}`
      });
    }

    await transaction.commit();
    return res.status(200).json({
      message: isBuyNow ? "Mua trực tiếp sản phẩm thành công!" : "Thanh toán giỏ hàng thành công!",
      data: { order_id: newOrder.id },
    });

  } catch (error) {
    await transaction.rollback();
    console.error("CRASH TẠI BACKEND CHECKOUT:", error);
    return res.status(500).json({ message: "Checkout thất bại do lỗi hệ thống", error: error.message });
  }
}

async function deleteCart(req, res) {
  const { id } = req.params;

  const deleted = await db.carts.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa giỏ hàng thành công",
    });
  }

  return res.status(404).json({
    message: "Giỏ hàng không tồn tại",
  });
}

module.exports = {
  getCarts,
  getCartById,
  insertCart,
  deleteCart,
  checkoutCart,
};
