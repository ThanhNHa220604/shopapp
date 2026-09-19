"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FlashSales extends Model {
    static associate(models) {
      // 1 FlashSale có NHIỀU sản phẩm tham gia (FlashSaleProducts)
      // Tìm kiếm linh hoạt theo tên model viết hoa/thường
      const FlashSaleProductsModel =
        models.FlashSaleProducts || models.flashsaleproducts;
      if (FlashSaleProductsModel) {
        FlashSales.hasMany(FlashSaleProductsModel, {
          foreignKey: "flash_sale_id",
          as: "flash_sale_products", // Alias phục vụ include khi query
        });
      }
    }
  }
  FlashSales.init(
    {
      name: DataTypes.STRING,
      start_time: DataTypes.DATE,
      end_time: DataTypes.DATE,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "FlashSales",
      tableName: "flashsales", // Đảm bảo khớp đúng tên bảng trong MySQL của bạn
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return FlashSales;
};
