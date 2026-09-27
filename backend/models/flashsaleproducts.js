"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FlashSaleProducts extends Model {
    static associate(models) {
      // 1. Thuộc về model FlashSales
      const FlashSaleModel = models.FlashSales || models.flashsales;
      if (FlashSaleModel) {
        FlashSaleProducts.belongsTo(FlashSaleModel, {
          foreignKey: "flash_sale_id",
          as: "flash_sale",
        });
      }

      // 2. Thuộc về model products gốc của bạn
      if (models.products) {
        FlashSaleProducts.belongsTo(models.products, {
          foreignKey: "product_id",
          as: "product",
        });
      }
    }
  }
  FlashSaleProducts.init(
    {
      flash_sale_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      flash_sale_price: DataTypes.DECIMAL,
      flash_sale_stock: DataTypes.INTEGER,
      flash_sale_sold: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "FlashSaleProducts",
      tableName: "flashsaleproducts", // Đảm bảo khớp đúng tên bảng trong MySQL của bạn
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return FlashSaleProducts;
};
