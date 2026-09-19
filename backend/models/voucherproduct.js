"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VoucherProduct extends Model {
    static associate(models) {
      const VoucherModel = models.vouchers || models.Voucher;
      const ProductModel = models.products || models.Product;

      if (VoucherModel) {
        this.belongsTo(VoucherModel, {
          foreignKey: "voucher_id",
          as: "voucher",
        });
      }

      if (ProductModel) {
        this.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "product",
        });
      }
    }
  }

  VoucherProduct.init(
    {
      voucher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "vouchers", key: "id" },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "voucherproducts",
      tableName: "voucherproducts",
      timestamps: true,
      createdAt: "created_at", // 🟢 Đồng bộ tên cột trong DB
      updatedAt: "updated_at", // 🟢 Đồng bộ tên cột trong DB
    },
  );

  return VoucherProduct;
};
