"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Giải pháp phòng thủ: Tìm kiếm thông minh các model liên quan
      const ConversationModel =
        models.conversations || models.Conversation || models.conversation;
      const UserModel = models.users || models.User || models.user;

      // Liên kết với cuộc trò chuyện (Message thuộc về 1 Conversation)
      if (ConversationModel) {
        messages.belongsTo(ConversationModel, {
          foreignKey: "conversation_id",
          as: "conversation",
        });
      }

      // Liên kết với người gửi (Message thuộc về 1 User)
      if (UserModel) {
        messages.belongsTo(UserModel, {
          foreignKey: "sender_id",
          as: "sender",
        });
      }
    }
  }

  messages.init(
    {
      conversation_id: DataTypes.INTEGER,
      sender_id: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "messages",
      tableName: "messages", // Mapping chuẩn xác tên bảng dưới DB
      underscored: true, // Tự động chuyển đổi createdAt/updatedAt thành created_at/updated_at
      timestamps: true, // Bật tính năng tự động điền thời gian
    },
  );

  return messages;
};
