"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class order_detail extends Model {
    static associate(models) {
      // 1. Liên kết tới bảng orders
      const OrderModel = models.orders || models.Order;
      if (OrderModel) {
        order_detail.belongsTo(OrderModel, {
          foreignKey: "order_id",
          as: "orders",
        });
      }

      // 2. Liên kết tới bảng products
      const ProductModel = models.products || models.product || models.Product;
      if (ProductModel) {
        order_detail.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "products",
        });
      }

      // 3. 🚀 THÊM MỚI: Liên kết tới bảng product_variant_values
      const ProductVariantValueModel =
        models.product_variant_values ||
        models.product_variant_value ||
        models.ProductVariantValue;

      if (ProductVariantValueModel) {
        order_detail.belongsTo(ProductVariantValueModel, {
          // Lưu ý: Đổi "product_variant_value_id" thành đúng tên cột khóa ngoại trong DB của bạn (nếu khác)
          foreignKey: "product_variant_value_id",
          as: "product_variant_values",
        });
      }
    }
  }

  order_detail.init(
    {
      order_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      product_variant_value_id: DataTypes.INTEGER, // Khai báo thêm cột này nếu DB có lưu
      quantity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "order_detail",
      tableName: "order_detail",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return order_detail;
};
