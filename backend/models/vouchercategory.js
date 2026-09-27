"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VoucherCategory extends Model {
    static associate(models) {
      const VoucherModel = models.vouchers || models.Voucher;
      const CategoryModel = models.categories || models.Category;

      if (VoucherModel) {
        this.belongsTo(VoucherModel, {
          foreignKey: "voucher_id",
          as: "voucher",
        });
      }

      if (CategoryModel) {
        this.belongsTo(CategoryModel, {
          foreignKey: "category_id",
          as: "category",
        });
      }
    }
  }

  VoucherCategory.init(
    {
      voucher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "vouchers", key: "id" },
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "categories", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "vouchercategories",
      tableName: "vouchercategories",
      timestamps: true,
      createdAt: "created_at", // 🟢 Đồng bộ tên cột trong DB
      updatedAt: "updated_at", // 🟢 Đồng bộ tên cột trong DB
    },
  );

  return VoucherCategory;
};
