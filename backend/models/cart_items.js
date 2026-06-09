"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class cart_items extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 ĐÃ SỬA: Cơ chế tìm kiếm thông minh tự động map cả chữ hoa/thường/số nhiều
      const CartModel = models.carts || models.Cart || models.cart;
      const ProductModel = models.products || models.Product || models.product;

      // 👉 ĐÃ SỬA: Tách riêng biệt 2 câu lệnh rõ ràng, không bọc ngoặc tròn lung tung
      if (CartModel) {
        cart_items.belongsTo(CartModel, {
          foreignKey: "cart_id",
          as: "carts",
        });
      }

      if (ProductModel) {
        cart_items.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "products",
        });
      }
    }
  }

  cart_items.init(
    {
      cart_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quanity: DataTypes.INTEGER, // Giữ nguyên chữ 'quanity' theo đúng cột hiện tại dưới DB của bạn
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
