"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Giải pháp phòng thủ: Tìm kiếm thông minh model sản phẩm và user
      const ProductModel = models.products || models.Product || models.product;
      const UserModel = models.users || models.User || models.user;

      // Chỉ liên kết nếu model thực sự tồn tại
      if (ProductModel) {
        feedback.belongsTo(ProductModel, {
          foreignKey: "product_id",
        });
      }

      if (UserModel) {
        feedback.belongsTo(UserModel, {
          foreignKey: "user_id",
        });
      }
    }
  }

  feedback.init(
    {
      product_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      star: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      image: {
        type: DataTypes.TEXT, // hoặc DataTypes.JSON tùy thuộc vào câu lệnh SQL bạn chọn ở trên
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "feedback",
      tableName: "feedbacks", // Mapping chuẩn xác tên bảng số nhiều dưới DB
      underscored: true, // Tự động chuyển đổi createdAt/updatedAt thành created_at/updated_at dưới DB
      timestamps: true, // Bật tính năng tự động điền thời gian
    },
  );

  return feedback;
};
