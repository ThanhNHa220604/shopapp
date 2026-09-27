"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 Phòng thủ cho bảng User: Chấp nhận cả User viết hoa hoặc users viết thường
      const UserModel = models.User || models.users;
      if (UserModel) {
        orders.belongsTo(UserModel, {
          foreignKey: "user_id",
        });
      }

      // 👉 ĐÃ SỬA CHÍNH XÁC: Gọi đúng tên model có dấu gạch ngang theo cấu trúc CLI của bạn
      const OrderDetailModel = models["order-detail"] || models.order_detail;
      if (OrderDetailModel) {
        orders.hasMany(OrderDetailModel, {
          foreignKey: "order_id",
          as: "order_detail",
        });
      }
    }
  }

  orders.init(
    {
      user_id: DataTypes.INTEGER,
      session_id: DataTypes.STRING,
      status: DataTypes.INTEGER,
      note: DataTypes.TEXT,
      total: DataTypes.INTEGER,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "orders",
      tableName: "orders",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return orders;
};
