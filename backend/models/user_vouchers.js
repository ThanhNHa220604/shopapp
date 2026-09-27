"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user_vouchers extends Model {
    static associate(models) {
      // 🟢 Lấy Model an toàn (Tránh bị undefined do chữ hoa / chữ thường)
      const UserModel = models.users || models.User;
      const VoucherModel = models.vouchers || models.Voucher;

      // 🟢 Chỉ gọi belongsTo khi Model tồn tại
      if (UserModel) {
        user_vouchers.belongsTo(UserModel, {
          foreignKey: "user_id",
          as: "user",
        });
      }

      if (VoucherModel) {
        user_vouchers.belongsTo(VoucherModel, {
          foreignKey: "voucher_id",
          as: "voucher",
        });
      }
    }
  }

  user_vouchers.init(
    {
      user_id: DataTypes.INTEGER,
      voucher_id: DataTypes.INTEGER,
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "user_vouchers",
      tableName: "user_vouchers",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return user_vouchers;
};
