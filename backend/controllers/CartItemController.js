const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const db = require("../models");

/**
 * HÀM BỔ TRỢ: Tự động dịch mã SKU số thành TEXT & TÍNH GIÁ APPLIED_PRICE DỰA TRÊN FLASH SALE
 */
async function formatAndApplyFlashSale(cartItems) {
  const now = new Date();

  return await Promise.all(
    cartItems.map(async (item) => {
      const plainItem = item.get({ plain: true });
      const product = plainItem.products;
      const variant = plainItem.product_variant_values;

      // 1. TÍNH TOÁN GIÁ THỰC TẾ (FLASH SALE)
      let appliedPrice = null;

      // Kiểm tra danh sách Flash Sale đi kèm sản phẩm
      if (product && Array.isArray(product.flash_sale_products)) {
        const activeSale = product.flash_sale_products.find((fsp) => {
          const sale = fsp.flash_sale || fsp.FlashSale;
          if (!sale) return true; // Nếu không có object flash_sale, chấp nhận mốc giá này
          return (
            Number(sale.status) === 1 &&
            new Date(sale.start_time) <= now &&
            new Date(sale.end_time) >= now
          );
        });

        if (activeSale && activeSale.flash_sale_price) {
          appliedPrice = Number(activeSale.flash_sale_price);
        }
      }

      // Gán trực tiếp giá thực tế đã tính Flash Sale vào item
      plainItem.applied_price = appliedPrice;

      // 2. DỊCH MÃ SKU DẠNG SỐ SANG CHUỖI TEXT
      if (variant && variant.sku && typeof variant.sku === "string") {
        const skuParts = variant.sku.split("-");
        const isNumericSku = skuParts.every((part) => !isNaN(part.trim()));

        if (isNumericSku && db.attribute_values) {
          try {
            const textValues = await db.attribute_values.findAll({
              where: { id: skuParts.map((id) => parseInt(id.trim())) },
              attributes: ["value"],
            });
            if (textValues && textValues.length > 0) {
              plainItem.product_variant_values.variant_text_label = textValues
                .map((v) => v.value)
                .join(" - ");
            }
          } catch (err) {
            console.error("Lỗi formatVariantLabels:", err);
          }
        }
      }

      return plainItem;
    }),
  );
}

// Cấu hình Include chuẩn cho Product (bao gồm Flash Sale)
const getProductIncludeConfig = () => {
  const FlashSaleProductModel = db.flash_sale_products || db.FlashSaleProducts;
  const FlashSaleModel = db.flash_sales || db.FlashSales;

  const productInclude = [
    { model: db.product_variant_values, as: "product_variant_values" },
  ];

  if (FlashSaleProductModel) {
    const flashSaleInclude = {
      model: FlashSaleProductModel,
      as: "flash_sale_products",
    };

    if (FlashSaleModel) {
      flashSaleInclude.include = [
        {
          model: FlashSaleModel,
          as: "flash_sale",
        },
      ];
    }
    productInclude.push(flashSaleInclude);
  }

  return productInclude;
};

// 1. LẤY MỤC GIỎ HÀNG
async function getCartItems(req, res) {
  try {
    const userId = req.userId || req.user?.id;
    const includeConfig = [
      {
        model: db.products,
        as: "products",
        include: getProductIncludeConfig(),
      },
      { model: db.product_variant_values, as: "product_variant_values" },
    ];

    // TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
    if (userId) {
      const userCart = await db.carts.findOne({
        where: { user_id: userId },
      });

      if (!userCart) {
        return res.status(200).json([]);
      }

      const cartItems = await db.cart_items.findAll({
        where: { cart_id: userCart.id },
        include: includeConfig,
      });

      const formattedCartItems = await formatAndApplyFlashSale(cartItems);
      return res.status(200).json(formattedCartItems);
    }

    // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI
    const { cart_id } = req.params;
    if (!cart_id || cart_id === "undefined" || cart_id === "null") {
      return res.status(200).json([]);
    }

    const guestCart = await db.carts.findOne({
      where: { id: Number(cart_id), user_id: null },
    });

    if (!guestCart) {
      return res.status(200).json([]);
    }

    const cartItems = await db.cart_items.findAll({
      where: { cart_id: guestCart.id },
      include: includeConfig,
    });

    const formattedCartItems = await formatAndApplyFlashSale(cartItems);
    return res.status(200).json(formattedCartItems);
  } catch (error) {
    console.error("Lỗi lấy mục giỏ hàng tại CartItemController:", error);
    return res.status(200).json([]);
  }
}

// 2. THÊM VÀO GIỎ HÀNG
async function addToCart(req, res) {
  try {
    const product_id = req.body.product_id || req.body.productId;
    const rawVariantId =
      req.body.product_variant_value_id ||
      req.body.productVariantValueId ||
      req.body.product_variant_id;
    const quanity = req.body.quanity || req.body.quantity;
    const userId = req.userId || req.user?.id;
    let cart_id = req.body.cart_id || req.body.cartId;

    let finalCartId = null;

    if (userId) {
      let userCart = await db.carts.findOne({ where: { user_id: userId } });
      if (!userCart) {
        userCart = await db.carts.create({ user_id: userId });
      }
      finalCartId = userCart.id || userCart.dataValues?.id;
      cart_id = finalCartId;
    } else if (cart_id && cart_id !== "undefined" && cart_id !== "null") {
      const guestCart = await db.carts.findOne({
        where: { id: Number(cart_id), user_id: null },
      });
      if (guestCart) {
        finalCartId = guestCart.id || guestCart.dataValues?.id;
      }
    }

    if (!finalCartId) {
      const backupCart = await db.carts.create({ user_id: null });
      finalCartId = backupCart.id || backupCart.dataValues?.id;
    }

    if (!finalCartId || isNaN(finalCartId)) {
      return res.status(400).json({
        message:
          "Không thể khởi tạo hoặc tìm thấy ID giỏ hàng hợp lệ trong database!",
      });
    }

    const productVariantValueId = rawVariantId ? Number(rawVariantId) : null;

    const [cartItem, itemCreated] = await db.cart_items.findOrCreate({
      where: {
        cart_id: Number(finalCartId),
        product_id: Number(product_id),
        product_variant_value_id: productVariantValueId,
      },
      defaults: {
        cart_id: Number(finalCartId),
        product_id: Number(product_id),
        product_variant_value_id: productVariantValueId,
        quanity: parseInt(quanity) || 1,
      },
    });

    if (!itemCreated) {
      cartItem.quanity += parseInt(quanity) || 1;
      await cartItem.save();
    }

    return res.status(200).json({
      message: "Thêm vào giỏ hàng thành công",
      data: cartItem,
      cart_id: finalCartId,
    });
  } catch (error) {
    console.error("❌ Lỗi nghiêm trọng tại hàm addToCart:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống máy chủ", error: error.message });
  }
}

// 3. CẬP NHẬT SỐ LƯỢNG
async function updateCartItem(req, res) {
  const { id } = req.params;
  const { quanity } = req.body;
  try {
    const item = await db.cart_items.findByPk(id);
    if (!item)
      return res
        .status(404)
        .json({ message: "Không tìm thấy mặt hàng trong giỏ" });

    item.quanity = parseInt(quanity) || 1;
    await item.save();

    return res
      .status(200)
      .json({ message: "Cập nhật số lượng thành công", data: item });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi cập nhật giỏ hàng", error: error.message });
  }
}

// 4. XÓA MẶT HÀNG KHỎI GIỎ
async function deleteCartItem(req, res) {
  const { id } = req.params;
  try {
    const deleted = await db.cart_items.destroy({ where: { id } });
    if (!deleted)
      return res
        .status(404)
        .json({ message: "Mặt hàng không tồn tại hoặc đã bị xóa" });

    return res
      .status(200)
      .json({ message: "Xóa mặt hàng khỏi giỏ thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa mặt hàng", error: error.message });
  }
}

module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
};
