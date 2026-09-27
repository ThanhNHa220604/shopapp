"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      const UserModel = models.users || models.User;
      const CategoryModel = models.categories || models.Category;
      const ProductModel = models.products || models.Product;
      const VoucherCategoryModel =
        models.vouchercategories || models.VoucherCategory;
      const VoucherProductModel =
        models.voucherproducts || models.VoucherProduct;
      const VoucherUsageModel = models.voucherusages || models.VoucherUsage;
      const UserVoucherModel = models.user_vouchers || models.UserVoucher;

      // 🟢 1. Quan hệ 1-N: Đổi alias thành 'user_vouchers_list' để KHÔNG bị trùng ngầm định với belongsToMany
      if (UserVoucherModel) {
        this.hasMany(UserVoucherModel, {
          foreignKey: "voucher_id",
          as: "user_vouchers_list",
        });
      }

      // 🟢 2. Quan hệ N-N: Lấy danh sách Users đã lưu Voucher
      if (UserModel && UserVoucherModel) {
        this.belongsToMany(UserModel, {
          through: UserVoucherModel,
          foreignKey: "voucher_id",
          otherKey: "user_id",
          as: "users",
        });
      }

      if (UserModel) {
        this.belongsTo(UserModel, { foreignKey: "creator_id", as: "creator" });
      }

      if (VoucherCategoryModel) {
        this.hasMany(VoucherCategoryModel, {
          foreignKey: "voucher_id",
          as: "voucherCategories",
        });
      }

      if (CategoryModel && VoucherCategoryModel) {
        this.belongsToMany(CategoryModel, {
          through: VoucherCategoryModel,
          foreignKey: "voucher_id",
          otherKey: "category_id",
          as: "categories",
        });
      }

      if (VoucherProductModel) {
        this.hasMany(VoucherProductModel, {
          foreignKey: "voucher_id",
          as: "voucherProducts",
        });
      }

      if (ProductModel && VoucherProductModel) {
        this.belongsToMany(ProductModel, {
          through: VoucherProductModel,
          foreignKey: "voucher_id",
          otherKey: "product_id",
          as: "products",
        });
      }

      if (VoucherUsageModel) {
        this.hasMany(VoucherUsageModel, {
          foreignKey: "voucher_id",
          as: "usages",
        });
      }
    }
  }

  Voucher.init(
    {
      code: DataTypes.STRING,
      title: DataTypes.STRING,
      discount_type: DataTypes.STRING,
      discount_value: DataTypes.DECIMAL,
      max_discount_amount: DataTypes.DECIMAL,
      min_order_value: DataTypes.DECIMAL,
      usage_limit: DataTypes.INTEGER,
      used_count: DataTypes.INTEGER,
      limit_per_user: DataTypes.INTEGER,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      created_by_type: DataTypes.STRING,
      creator_id: DataTypes.INTEGER,
      apply_scope: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "vouchers",
      tableName: "vouchers",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return Voucher;
};
