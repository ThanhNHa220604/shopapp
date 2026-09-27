"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      // -----------------------------------------------------------------
      // các liên kết cũ của bạn (flash_sale, brands, categories, ...)
      // -----------------------------------------------------------------
      const FlashSaleProductsModel =
        models.FlashSaleProducts || models.flashsaleproducts;
      if (FlashSaleProductsModel) {
        products.hasMany(FlashSaleProductsModel, {
          foreignKey: "product_id",
          as: "flash_sale_products",
        });
      }

      products.belongsTo(models.brands, { foreignKey: "brand_id" });
      products.belongsTo(models.categories, { foreignKey: "category_id" });

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

      const ProductVariantValuesModel =
        models.product_variant_values ||
        models.ProductVariantValues ||
        models.productVariantValues ||
        models.Product_variant_values;

      if (ProductVariantValuesModel) {
        products.hasMany(ProductVariantValuesModel, {
          foreignKey: "product_id",
          as: "product_variant_values",
        });
      }

      if (models.product_image || models.product_images) {
        const ImageModel = models.product_image || models.product_images;
        products.hasMany(ImageModel, {
          foreignKey: "product_id",
          as: "product_image",
        });
        products.hasMany(ImageModel, {
          foreignKey: "product_id",
          as: "product_images",
        });
      }

      // =================================================================
      // 🟢 BỔ SUNG LIÊN KẾT VOUCHER TẠI ĐÂY
      // =================================================================
      const VoucherProductModel =
        models.voucherproducts ||
        models.VoucherProduct ||
        models.VoucherProducts;
      const VoucherModel = models.vouchers || models.Voucher;

      // 1. Quan hệ qua Bảng Trung Gian (Nhiều VoucherProducts)
      if (VoucherProductModel) {
        products.hasMany(VoucherProductModel, {
          foreignKey: "product_id",
          as: "voucherProducts",
        });
      }

      // 2. Quan hệ Nhiều - Nhiều trực tiếp đến Voucher (Lấy thẳng danh sách Vouchers)
      if (VoucherModel && VoucherProductModel) {
        products.belongsToMany(VoucherModel, {
          through: VoucherProductModel,
          foreignKey: "product_id",
          otherKey: "voucher_id",
          as: "vouchers",
        });
      }
    }
  }

  products.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.INTEGER,
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      oldprice: DataTypes.INTEGER,
      specification: DataTypes.STRING,
      buyturn: DataTypes.INTEGER,
      quanity: DataTypes.INTEGER,
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image_vector: {
  type: DataTypes.TEXT('long'), // hoặc DataTypes.LONGTEXT
  allowNull: true
},
      is_deleted: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "products",
      tableName: "products",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at", // ⚠️ LƯU Ý: Chuyển 'updated_at' thành ключ camelCase 'updatedAt' cho chuẩn Sequelize
    },
  );

  return products;
};
