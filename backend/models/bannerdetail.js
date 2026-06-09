"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class bannerdetail extends Model {
    static associate(models) {
      // 👉 ĐÃ SỬA: Đổi từ models.products sang models.Product (hoặc models.product tùy theo file model của bạn)
      // Nếu model sản phẩm của bạn viết thường, hãy đổi thành models.product
      const ProductModel = models.Product || models.product || models.products;
      const BannerModel = models.Banner || models.banner || models.banners;

      if (ProductModel) {
        bannerdetail.belongsTo(ProductModel, {
          foreignKey: "product_id",
        });
      }

      if (BannerModel) {
        bannerdetail.belongsTo(BannerModel, {
          foreignKey: "banner_id",
        });
      }
    }
  }

  bannerdetail.init(
    {
      product_id: DataTypes.INTEGER,
      banner_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "bannerdetail",
      tableName: "bannerdetails", // Đảm bảo mapping đúng tên bảng số nhiều dưới DB
      underscored: true,
    },
  );

  return bannerdetail;
};
