"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class bannerdetail extends Model {
    static associate(models) {
      const ProductModel = models.Product || models.product || models.products;
      const BannerModel = models.Banner || models.banner || models.banners;

      if (ProductModel) {
        bannerdetail.belongsTo(ProductModel, { foreignKey: "product_id" });
      }
      if (BannerModel) {
        bannerdetail.belongsTo(BannerModel, { foreignKey: "banner_id" });
      }
    }
  }

  bannerdetail.init(
    {
      product_id: DataTypes.INTEGER,
      banner_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "bannerdetail",
      tableName: "bannerdetails",
      timestamps: true, // 🟢 Bật timestamps
      underscored: true, // 🟢 Giúp Sequelize tự động dùng created_at và updated_at
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return bannerdetail;
};
