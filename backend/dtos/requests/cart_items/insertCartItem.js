const Joi = require("joi");

class InsertCartItemRequest {
  constructor(data) {
    this.cart_id = data.cart_id;
    this.product_id = data.product_id;
    this.quanity = data.quanity || data.quantity;
    this.product_variant_value_id = data.product_variant_value_id;
  }

  static validate(data) {
    const schema = Joi.object({
      cart_id: Joi.number().integer().required(),

      product_id: Joi.number().integer().required(),

      quanity: Joi.number().integer().min(0).optional(),
      quantity: Joi.number().integer().min(0).optional(),

      // 🌟 CHỖ ĐÃ SỬA: Thay .nullable() bằng .allow(null) chuẩn cú pháp của Joi
      product_variant_value_id: Joi.number().integer().allow(null).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertCartItemRequest;
