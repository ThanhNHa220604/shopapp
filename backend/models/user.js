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
      // define association here
      User.hasMany(models.orders, {
        foreignKey: "user_id",
      });
      User.hasMany(models.feedback, {
        foreignKey: "user_id",
      });
    }
  }

  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      role: DataTypes.INTEGER,
      avatar: DataTypes.STRING,
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
