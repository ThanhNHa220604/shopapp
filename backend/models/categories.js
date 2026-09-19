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
      // 1. Liên kết 1 - Nhiều tới Sản phẩm (Một danh mục có nhiều sản phẩm)
      categories.hasMany(models.products, {
        foreignKey: "category_id",
        as: "products",
      });

      // =================================================================
      // 🟢 BỔ SUNG LIÊN KẾT VOUCHER TẠI ĐÂY
      // =================================================================
      const VoucherCategoryModel =
        models.vouchercategories ||
        models.VoucherCategory ||
        models.VoucherCategories;
      const VoucherModel = models.vouchers || models.Voucher;

      // 2. Quan hệ 1 - Nhiều tới Bảng Trung Gian (VoucherCategory)
      if (VoucherCategoryModel) {
        categories.hasMany(VoucherCategoryModel, {
          foreignKey: "category_id",
          as: "voucherCategories",
        });
      }

      // 3. Quan hệ Nhiều - Nhiều trực tiếp tới Voucher (Lấy danh sách Vouchers áp dụng cho danh mục)
      if (VoucherModel && VoucherCategoryModel) {
        categories.belongsToMany(VoucherModel, {
          through: VoucherCategoryModel,
          foreignKey: "category_id",
          otherKey: "voucher_id",
          as: "vouchers",
        });
      }
    }
  }

  categories.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "categories",
      tableName: "categories",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return categories;
};
