const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

// Lấy danh sách cart item
async function getCartItems(req, res) {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    db.cart_items.findAll({
      limit: pageSize,
      offset,
      include: [
        {
          model: db.products,
          as: "products",
        },
      ],
    }),
    db.cart_items.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách cart item thành công",
    data: items,
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

async function getCartItembyCartId(req, res) {
  const { cart_id } = req.params;
  const cartItems = await db.cart_items.findAll({
    where: { cart_id },
    include: [{ model: db.products, as: "products" }], // ← sửa chỗ này
  });

  res.status(200).json({
    message: "Lấy danh sách mục trong giỏ hàng thành công",
    data: cartItems,
  });
}

// Thêm sản phẩm vào cart
/*async function insertCartItem(req, res) {
  const { cart_id, product_id, quanity } = req.body;

  // kiểm tra đã tồn tại chưa
  const existingProduct = await db.products.findOne({
    where: { id: product_id },
  });

  if (!existingProduct) {
    return res.status(200).json({
      message: "sản phẩm không tồn tại"
    });
  }//check if existingProduct.quanity < quanity  => send error
  if (existingProduct.quanity < quanity) {
    return res.status(400).json({
      message: "Số lượng sản phẩm trong kho không đủ",
    });
  }
  const existingCart = await db.carts.findOne({
    where: { id: cart_id },
  });
  if (!existingCart) {
    return res.status(200).json({
      message: "giỏ hàng không tồn tại"
    });
  }
  const existing = await db.cart_items.findOne({
    where: {
      product_id, cart_id
    }
  })
  if (quanity === 0) {
    if (existing) {
      await existing.destroy();
      return res.status(200).json({
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
      });
    }else{
      existing.quanity = quanity
      await existing.save()
      return ({
        message: 'cập nhập số lượng trong giỏ hàng thành công',
        data: existing
      })
    }
  }else{
    // nếu số lượng > 0 thì tạo mới
    if(quanity > 0){res.status(200).json
      const newCartItem = await db.cart_items.create(req.body);
       return res.status(201).json({
          message: "thêm mục mới trong giỏ hàng thành công",
          data: newCartItem
        })
    }
  }
  /*
  const item = await db.cart_items.create({
    cart_id,
    product_id,
    quanity,
  });

  return res.status(200).json({
    message: "Thêm vào giỏ hàng thành công",
    data: item,
  });*/

async function insertCartItem(req, res) {
  const { cart_id, product_id, quanity } = req.body;

  const existingProduct = await db.products.findOne({
    where: { id: product_id },
  });
  if (!existingProduct)
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  if (existingProduct.quanity < quanity)
    return res.status(400).json({ message: "Số lượng trong kho không đủ" });

  const existingCart = await db.carts.findOne({ where: { id: cart_id } });
  if (!existingCart)
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

  // Nếu sản phẩm đã có trong giỏ → cộng thêm số lượng, không tạo mới
  const existing = await db.cart_items.findOne({
    where: { product_id, cart_id },
  });
  if (existing) {
    existing.quanity = existing.quanity + quanity;
    await existing.save();
    return res
      .status(200)
      .json({ message: "Cập nhật số lượng thành công", data: existing });
  }

  // Chưa có → tạo mới
  const newCartItem = await db.cart_items.create({
    cart_id,
    product_id,
    quanity,
  });
  return res
    .status(201)
    .json({ message: "Thêm vào giỏ hàng thành công", data: newCartItem });
}


// Xóa item khỏi cart
async function deleteCartItem(req, res) {
  const { id } = req.params;

  const deleted = await db.cart_items.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa sản phẩm khỏi giỏ thành công",
    });
  }

  return res.status(404).json({
    message: "Không tìm thấy cart item",
  });
}

// Update số lượng
async function updateCartItem(req, res) {
  const { id } = req.params;
  const { quanity } = req.body;

  const updated = await db.cart_items.update({ quanity }, { where: { id } });

  if (updated[0]) {
    return res.status(200).json({
      message: "Cập nhật số lượng thành công",
    });
  }

  return res.status(404).json({
    message: "Cart item không tồn tại",
  });
}

module.exports = {
  getCartItems,
  insertCartItem,
  deleteCartItem,
  updateCartItem,
  getCartItembyCartId,
};
