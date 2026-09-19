"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class cart_items extends Model {
    static associate(models) {
      const CartModel = models.carts || models.Cart || models.cart;
      const ProductModel = models.products || models.Product || models.product;

      // 🌟 KHÔI PHỤC: Lấy model biến thể của bạn (thay đúng tên model biến thể trong dự án của bạn)
      const VariantModel =
        models.product_variant_values || models.ProductVariantValue;

      if (CartModel) {
        cart_items.belongsTo(CartModel, { foreignKey: "cart_id", as: "carts" });
      }

      if (ProductModel) {
        cart_items.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "products",
        });
      }

      // 🌟 KHÔI PHỤC: Ràng buộc ngược về bảng biến thể
      if (VariantModel) {
        cart_items.belongsTo(VariantModel, {
          foreignKey: "product_variant_value_id", // Khóa ngoại trỏ sang bảng biến thể
          as: "product_variant_values",
        });
      }
    }
  }

  cart_items.init(
    {
      cart_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,

      // 🌟 KHÔI PHỤC: Định nghĩa cột biến thể trong Model
      product_variant_value_id: DataTypes.INTEGER,

      quanity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "cart_items",
      tableName: "cart_items",
      underscored: true,
    },
  );

  return cart_items;
};
