"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. Tìm kiếm linh hoạt Model đơn hàng (thử cả orders, Order, Orders)
      const OrderModel = models.orders || models.Order || models.Orders;
      if (OrderModel) {
        User.hasMany(OrderModel, {
          foreignKey: "user_id",
        });
      } else {
        console.warn(
          "⚠️ Cảnh báo: User không tìm thấy Model tương ứng cho bảng orders.",
        );
      }

      // 2. Tìm kiếm linh hoạt Model đánh giá (thử cả feedback, feedbacks, Feedbacks)
      const FeedbackModel =
        models.feedback || models.feedbacks || models.Feedback;
      if (FeedbackModel) {
        User.hasMany(FeedbackModel, {
          foreignKey: "user_id",
        });
      } else {
        console.warn(
          "⚠️ Cảnh báo: User không tìm thấy Model tương ứng cho bảng feedback.",
        );
      }
    }
  }

  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      role: DataTypes.INTEGER,
      avatar: DataTypes.TEXT,
      phone: DataTypes.STRING,
      is_locked: DataTypes.INTEGER,
      password_changed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users", // 👈 Nếu trong MySQL bảng của bạn tên là 'users' (chữ u thường, có s), hãy sửa lại y hệt thế này!
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return User;
};
