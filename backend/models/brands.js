"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class brands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 ĐÃ SỬA: Gọi đúng models.products (số nhiều viết thường) để ăn khớp với file products.js hiện tại của bạn
      brands.hasMany(models.products, {
        foreignKey: "brand_id",
        as: "products",
      });
    }
  }

  brands.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "brands", // 👉 ĐÃ SỬA: Đổi về 'brands' viết thường số nhiều khớp với nhật ký lệnh CLI gốc của bạn
      tableName: "brands", // Khớp chính xác 100% với ảnh cơ sở dữ liệu
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return brands;
};
