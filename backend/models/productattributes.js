"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductAttributes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 Giải pháp phòng thủ: Tự động tìm kiếm thông minh model Sản phẩm và Thuộc tính
      const ProductModel = models.products || models.Product || models.product;
      const AttributeModel =
        models.attributes ||
        models.Attributes ||
        models.attribute ||
        models.Attribute;

      // Chỉ liên kết khi các model cha thực sự tồn tại
      if (ProductModel) {
        ProductAttributes.belongsTo(ProductModel, {
          foreignKey: "product_id",
        });
      }

      if (AttributeModel) {
        ProductAttributes.belongsTo(AttributeModel, {
          foreignKey: "attribute_id",
        });
      }
    }
  }

  ProductAttributes.init(
    {
      product_id: DataTypes.INTEGER,
      attribute_id: DataTypes.INTEGER,
      value: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ProductAttributes",
      tableName: "productattributes",
      underscored: true, // Bật để tự động đồng bộ kiểu gạch dưới (created_at/updated_at)
    },
  );

  return ProductAttributes;
};
