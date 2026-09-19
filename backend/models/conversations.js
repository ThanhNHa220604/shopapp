"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class conversations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Giải pháp phòng thủ: Tìm kiếm thông minh các model liên quan
      const MessageModel = models.messages || models.Message || models.message;
      const UserModel = models.users || models.User || models.user;
      const ProductModel = models.products || models.Product || models.product;

      // Liên kết với bảng Messages (Một cuộc trò chuyện có nhiều tin nhắn)
      if (MessageModel) {
        conversations.hasMany(MessageModel, {
          foreignKey: "conversation_id",
          as: "messages",
          onDelete: "CASCADE",
        });
      }

      // Liên kết với bảng Users (Khách hàng & Người bán)
      if (UserModel) {
        conversations.belongsTo(UserModel, {
          foreignKey: "buyer_id",
          as: "buyer",
        });
        conversations.belongsTo(UserModel, {
          foreignKey: "seller_id",
          as: "seller",
        });
      }

      // Liên kết với bảng Products (Sản phẩm đang trao đổi)
      if (ProductModel) {
        conversations.belongsTo(ProductModel, {
          foreignKey: "product_id",
          as: "product",
        });
      }

      // Liên kết với Đơn hàng đã kích hoạt hội thoại (dùng để check PENDING)
      const OrderModel = models.orders || models.Order || models.order;
      if (OrderModel) {
        conversations.belongsTo(OrderModel, {
          foreignKey: "order_id",
          as: "order",
        });
      }
    }
  }

  conversations.init(
    {
      buyer_id: DataTypes.INTEGER,
      seller_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      order_id: DataTypes.INTEGER,
      last_message: DataTypes.TEXT,
      last_message_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "conversations",
      tableName: "conversations", // Mapping chuẩn xác tên bảng dưới DB
      underscored: true, // Tự động chuyển đổi createdAt/updatedAt thành created_at/updated_at
      timestamps: true, // Bật tính năng tự động điền thời gian
    },
  );

  return conversations;
};
