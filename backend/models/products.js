"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      // Gọi đúng tên model gốc được sinh ra từ các lệnh CLI của bạn
      products.belongsTo(models.brands, { foreignKey: "brand_id" });
      products.belongsTo(models.categories, { foreignKey: "category_id" });

      // Chú ý: Lệnh CLI tạo model chi tiết đơn hàng của bạn là '--name order-detail'
      // nên Sequelize sẽ map thành tên đối tượng là models['order-detail'] hoặc models.order_detail
      const OrderDetailModel = models["order-detail"] || models.order_detail;
      if (OrderDetailModel) {
        products.hasMany(OrderDetailModel, { foreignKey: "product_id" });
      }

      if (models.bannerdetail)
        products.hasMany(models.bannerdetail, { foreignKey: "product_id" });
      if (models.newdetail)
        products.hasMany(models.newdetail, { foreignKey: "product_id" });
      if (models.feedback)
        products.hasMany(models.feedback, { foreignKey: "product_id" });
      if (models.cart_items)
        products.hasMany(models.cart_items, { foreignKey: "product_id" });
      if (models.ProductAttributes)
        products.hasMany(models.ProductAttributes, {
          foreignKey: "product_id",
          as: "ProductAttributes",
        });
      if (models.product_variant_values)
        products.hasMany(models.product_variant_values, {
          foreignKey: "product_id",
          as: "product_variant_values",
        });

      if (models.product_image) {
        products.hasMany(models.product_image, {
          foreignKey: "product_id",
          as: "product_image",
        });
      }
    }
  }

  products.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.INTEGER,
      description: DataTypes.STRING,
      oldprice: DataTypes.INTEGER,
      specification: DataTypes.STRING,
      buyturn: DataTypes.INTEGER,
      quanity: DataTypes.INTEGER,
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "products", // 👈 ĐÃ TRẢ VỀ: Đúng tên gốc khi bạn chạy lệnh model:generate
      tableName: "products", // Khớp đúng bảng trong DB của bạn
      timestamps: true,
      underscored: true, // Bắt buộc để nhận diện gạch dưới _
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return products;
};
