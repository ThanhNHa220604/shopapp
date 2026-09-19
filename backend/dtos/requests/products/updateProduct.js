"use strict";
const Joi = require("joi");

class UpdateProductRequest {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.oldprice = data.oldprice;
    this.image = data.image;
    this.description = data.description;
    this.specification = data.specification;
    this.buyturn = data.buyturn;
    this.quanity = data.quanity;
    this.user_id = data.user_id;
    this.brand_id = data.brand_id;
    this.category_id = data.category_id;
    this.attributes = data.attributes;

    // Thêm vào constructor để class nhận diện đầy đủ
    this.brand_name = data.brand_name;
    this.category_name = data.category_name;
    this.variants = data.variants;
    this.variant_values = data.variant_values;

    // 🌟 BỔ SUNG: Nhận diện trường product_variants và product_variant_values từ Frontend
    this.product_variants = data.product_variants;
    this.product_variant_values = data.product_variant_values;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().optional(),
      price: Joi.number().optional(),
      oldprice: Joi.number().optional(),
      image: Joi.string().allow("").optional(),
      description: Joi.string().optional(),
      specification: Joi.string().optional(),
      buyturn: Joi.number().integer().optional(),
      quanity: Joi.number().integer().optional(),
      user_id: Joi.number().integer().allow(null).optional(),
      // Cho phép nhận giá trị null gửi từ frontend lên
      brand_id: Joi.number().integer().allow(null).optional(),
      category_id: Joi.number().integer().allow(null).optional(),

      // Khai báo để Joi không chặn chữ "brand_name" và "category_name"
      brand_name: Joi.string().allow(null, "").optional(),
      category_name: Joi.string().allow(null, "").optional(),
      // ❌ KHÔNG đặt image_url ở đây (cấp ngoài cùng) — dữ liệu ảnh
      // biến thể không nằm ở đây, đặt ở đây không có tác dụng gì.

      attributes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required(),
          }),
        )
        .optional(),

      variants: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            values: Joi.array().items(Joi.string()).required(),
          }),
        )
        .optional(),

      variant_values: Joi.array()
        .items(
          Joi.object({
            variant_combination: Joi.array().items(Joi.string()).required(),
            price: Joi.number().required(),
            old_price: Joi.number().allow(null).optional(),
            stock: Joi.number().optional(),
            // ✅ ĐÚNG VỊ TRÍ: image_url phải khai báo BÊN TRONG object
            // của từng phần tử variant_values — vì dữ liệu ảnh thực sự
            // nằm ở đây (mỗi biến thể có 1 ảnh riêng), không phải ở
            // cấp ngoài cùng của cả sản phẩm.
            image_url: Joi.string().allow(null, "").optional(),
          }),
        )
        .optional(),

      // 🌟 BỔ SUNG KHAI BÁO: Chấp nhận cả 2 kiểu đặt tên trường từ Frontend gửi lên để không bị Joi chặn đứng
      product_variants: Joi.array().items(Joi.any()).optional(),
      product_variant_values: Joi.array().items(Joi.any()).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = UpdateProductRequest;
