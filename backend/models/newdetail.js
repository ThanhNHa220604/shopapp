"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class newdetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 Giải pháp phòng thủ: Tìm kiếm thông minh tự động quét map mọi kiểu đặt tên
      const ProductModel = models.products || models.Product || models.product;
      const NewsModel = models.news || models.News || models.new || models.New;

      // Chỉ liên kết nếu các model cha đã được load lên thành công
      if (ProductModel) {
        newdetail.belongsTo(ProductModel, {
          foreignKey: "product_id",
        });
      }

      if (NewsModel) {
        newdetail.belongsTo(NewsModel, {
          foreignKey: "new_id",
        });
      }
    }
  }

  newdetail.init(
    {
      product_id: DataTypes.INTEGER,
      new_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "newdetail",
      tableName: "newdetails", // Đồng bộ hóa mapping tên bảng số nhiều dưới DB
      underscored: true,
    },
  );

  return newdetail;
};
