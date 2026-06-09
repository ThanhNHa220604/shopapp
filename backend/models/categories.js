"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 ĐÃ SỬA: Gọi đúng models.products (số nhiều viết thường) để ăn khớp với file products.js hiện tại của bạn
      categories.hasMany(models.products, {
        foreignKey: "category_id",
        as: "products",
      });
    }
  }

  categories.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "categories", // 👉 ĐÃ SỬA: Đổi về 'categories' viết thường số nhiều khớp với nhật ký lệnh CLI gốc của bạn (--name categories)
      tableName: "categories", // Khớp chuẩn xác 100% với cơ sở dữ liệu của bạn
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return categories;
};
