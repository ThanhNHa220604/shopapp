"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class product_image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 Giải pháp phòng thủ: Tự động quét tìm model sản phẩm dù viết hoa hay viết thường
      const ProductModel = models.products || models.Product || models.product;

      // Chỉ liên kết nếu model cha thực sự tồn tại
      if (ProductModel) {
        product_image.belongsTo(ProductModel, {
          foreignKey: "product_id",
        });
      }
    }
  }

  product_image.init(
    {
      product_id: DataTypes.INTEGER,
      imageurl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "product_image",
      tableName: "product_image", // Thường tên bảng dưới DB sẽ là số nhiều, bạn check lại xem có chữ 's' không nhé
      underscored: true, // Tự động map chuẩn gạch dưới cho created_at/updated_at
    },
  );

  return product_image;
};
