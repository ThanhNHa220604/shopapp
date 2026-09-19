"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class product_variant_values extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const ProductModel = models.products || models.Product || models.product;
      const CartItemModel =
        models.cart_items || models.CartItems || models.Cart_items;

      if (ProductModel) {
        product_variant_values.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "products",
        });
      }

      if (CartItemModel) {
        product_variant_values.hasMany(CartItemModel, {
          foreignKey: "product_variant_value_id",
          as: "cart_items",
        });
      }
    }
  }

  product_variant_values.init(
    {
      product_id: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
      old_price: DataTypes.DECIMAL,
      stock: DataTypes.INTEGER,
      sku: DataTypes.STRING,
      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "product_variant_values",
      tableName: "product_variant_values",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return product_variant_values;
};
