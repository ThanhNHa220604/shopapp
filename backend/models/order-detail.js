"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class order_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 👉 ĐÃ SỬA: Gọi trực tiếp tên model gốc theo đúng nhật ký CLI của bạn (không cần if phòng thủ)
      order_detail.belongsTo(models.orders, {
        foreignKey: "order_id",
        as: "orders",
      });

      order_detail.belongsTo(models.products, {
        foreignKey: "product_id",
        as: "products",
      });
    }
  }

 order_detail.init(
   {
     order_id: DataTypes.INTEGER,
     product_id: DataTypes.INTEGER,
     quantity: DataTypes.INTEGER,
     price: DataTypes.INTEGER,
   },
   {
     sequelize,
     modelName: "order_detail", // 🌟 ĐỔI THÀNH DẤU GẠCH DƯỚI ĐỂ KHÔNG BỊ LỖI PHÉP TRỪ
     tableName: "order_detail",
     timestamps: true,
     underscored: true,
     createdAt: "created_at",
     updatedAt: "updated_at",
   },
 );

  return order_detail;
};
