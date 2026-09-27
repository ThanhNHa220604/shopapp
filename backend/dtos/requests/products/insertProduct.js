"use strict";
const Joi = require("joi");

class InsertProductRequest {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.oldprice = data.oldprice;
    this.image = data.image;
    this.description = data.description;
    this.specification = data.specification;
    this.buyturn = data.buyturn;
    this.quanity = data.quanity; // Giữ nguyên chữ quanity theo DB của bạn

    // 🌟 BỔ SUNG: Nhận diện và gán trường user_id truyền từ Frontend
    this.user_id = data.user_id;

    // Gán thêm các trường này để tránh mất dữ liệu khi đi qua constructor
    this.brand_id = data.brand_id;
    this.brand_name = data.brand_name;
    this.category_id = data.category_id;
    this.category_name = data.category_name;
    this.attributes = data.attributes;
    this.variants = data.variants;
    this.variant_values = data.variant_values;

    // 🌟 BỔ SUNG: Nhận diện trường product_variants và product_variant_values gửi từ Frontend
    this.product_variants = data.product_variants;
    this.product_variant_values = data.product_variant_values;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required(),
      oldprice: Joi.number().required(),
      image: Joi.string().allow("").optional(),
      description: Joi.string().required(),
      specification: Joi.string().allow("").optional(),
      buyturn: Joi.number().integer().required(),
      quanity: Joi.number().integer().required(),

      // 🌟 BỔ SUNG: Cho phép truyền trường user_id (dạng số, có thể null hoặc không truyền)
      user_id: Joi.number().integer().allow(null).optional(),

      // Cho phép truyền brand_id HOẶC brand_name
      brand_id: Joi.number().integer().optional(),
      brand_name: Joi.string().trim().optional(),

      // Cho phép truyền category_id HOẶC category_name
      category_id: Joi.number().integer().optional(),
      category_name: Joi.string().trim().optional(),

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
            image_url: Joi.string().allow(null, "").optional(), // 🌟 THÊM DÒNG NÀY Ở ĐÂY ĐỂ FIX LỖI "variant_values[0].image_url" is not allowed
          }),
        )
        .optional(),

      // 🌟 BỔ SUNG KHAI BÁO: Chấp nhận cả 2 kiểu đặt tên trường từ Frontend gửi lên để không bị Joi chặn đứng
      product_variants: Joi.array().items(Joi.any()).optional(),
      product_variant_values: Joi.array().items(Joi.any()).optional(),
    })
      // Điều kiện: Ép buộc phải có ít nhất 1 trong 2 trường cho mỗi nhóm
      .or("brand_id", "brand_name")
      .or("category_id", "category_name");

    return schema.validate(data);
  }
}

module.exports = InsertProductRequest;
