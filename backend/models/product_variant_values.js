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
      // 👉 Giải pháp phòng thủ: Tự động quét tìm model sản phẩm dù viết hoa, viết thường hay số nhiều
      const ProductModel = models.products || models.Product || models.product;

      // Chỉ liên kết nếu model cha thực sự tồn tại
      if (ProductModel) {
        product_variant_values.belongsTo(ProductModel, {
          foreignKey: "product_id",
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
    },
    {
      sequelize,
      modelName: "product_variant_values",
      tableName: "product_variant_values", // Ghi đè tên bảng rõ ràng cho chuẩn cấu trúc
      underscored: true, // Tự động map chuẩn gạch dưới (created_at / updated_at)
    },
  );

  return product_variant_values;
};
