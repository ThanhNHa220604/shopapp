"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VoucherUsage extends Model {
    static associate(models) {
      const VoucherModel = models.vouchers || models.Voucher;
      const UserModel = models.users || models.User;
      const OrderModel = models.orders || models.Order;

      if (VoucherModel) {
        this.belongsTo(VoucherModel, {
          foreignKey: "voucher_id",
          as: "voucher",
        });
      }

      if (UserModel) {
        this.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
      }

      if (OrderModel) {
        this.belongsTo(OrderModel, { foreignKey: "order_id", as: "order" });
      }
    }
  }

  VoucherUsage.init(
    {
      voucher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "vouchers", key: "id" },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "voucherusages",
      tableName: "voucherusages",
      timestamps: true,
      createdAt: "created_at", // 🟢 Đồng bộ tên cột trong DB (thay thế cho used_at)
      updatedAt: "updated_at", // 🟢 Đồng bộ tên cột trong DB
    },
  );

  return VoucherUsage;
};
//Dành cho Client (Người mua):

//POST /api/vouchers/apply: Kiểm tra mã hợp lệ và tính thử số tiền giảm (dùng ở Cart/Checkout).

//GET /api/vouchers/applicable-products/:productId: Lấy danh sách Voucher áp dụng được cho sản phẩm này.

//Dành cho Manager & Admin:

//POST /api/vouchers: Tạo mã voucher mới.

//GET /api/vouchers: Lấy danh sách voucher đã tạo.

//DELETE /api/vouchers/:id: Hủy/Xóa voucher.