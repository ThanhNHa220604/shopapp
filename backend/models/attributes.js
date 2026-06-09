"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attributes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 👉 ĐỂ Ý: Nếu file productattributes.js của bạn đặt tên modelName là 'ProductAttributes' thì giữ nguyên,
      // nếu đặt là 'product_attributes' viết thường thì bạn sửa lại chữ này nhé.
      Attributes.hasMany(models.ProductAttributes, {
        foreignKey: "attribute_id",
      });
    }
  }
  Attributes.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Attributes",
      tableName: "attributes",
      timestamps: true, // 👈 BẬT bộ đếm thời gian
      underscored: true, // 👈 ÉP Sequelize dịch sang snake_case (gạch dưới)
      createdAt: "created_at", // 👈 CHỈ ĐỊNH ĐÍCH DANH cột gạch dưới thực tế trong DB của bạn
      updatedAt: "updated_at", // 👈 CHỈ ĐỊNH ĐÍCH DANH cột gạch dưới thực tế trong DB của bạn
    },
  );
  return Attributes;
};
