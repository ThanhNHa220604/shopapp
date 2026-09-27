"use strict";
const Joi = require("joi");

class UpdateVoucherRequest {
  constructor(data) {
    this.code = data.code;
    this.title = data.title;
    this.discount_type = data.discount_type;
    this.discount_value = data.discount_value;
    this.max_discount_amount = data.max_discount_amount;
    this.min_order_value = data.min_order_value;
    this.usage_limit = data.usage_limit;
    this.used_count = data.used_count;
    this.limit_per_user = data.limit_per_user;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.created_by_type = data.created_by_type;
    this.creator_id = data.creator_id;
    this.apply_scope = data.apply_scope;
    this.is_active = data.is_active;

    // Các danh sách ID liên quan (nếu cập nhật lại sản phẩm/danh mục áp dụng)
    this.product_ids = data.product_ids;
    this.category_ids = data.category_ids;
  }

  static validate(data) {
    const schema = Joi.object({
      code: Joi.string().trim().uppercase().min(3).max(50).optional(),
      title: Joi.string().trim().max(255).optional(),

      discount_type: Joi.string().valid("percent", "fixed").optional(),

      discount_value: Joi.number()
        .positive()
        .when("discount_type", {
          is: "percent",
          then: Joi.number().max(100).messages({
            "number.max": "Phần trăm giảm giá không được vượt quá 100%",
          }),
        })
        .optional(),

      max_discount_amount: Joi.number().min(0).allow(null).optional(),
      min_order_value: Joi.number().min(0).optional(),
      usage_limit: Joi.number().integer().min(1).optional(),
      used_count: Joi.number().integer().min(0).optional(),
      limit_per_user: Joi.number().integer().min(1).optional(),

      start_date: Joi.date().iso().optional(),
      end_date: Joi.date()
        .iso()
        .when("start_date", {
          is: Joi.exist(),
          then: Joi.date().greater(Joi.ref("start_date")).messages({
            "date.greater": "Ngày kết thúc phải diễn ra sau ngày bắt đầu",
          }),
        })
        .optional(),

      created_by_type: Joi.string().valid("admin", "manager").optional(),
      creator_id: Joi.number().integer().allow(null).optional(),

      apply_scope: Joi.string()
        .valid("all", "specific_products", "specific_categories")
        .optional(),

      is_active: Joi.boolean().optional(),

      // Cho phép truyền lại danh sách ID sản phẩm / danh mục áp dụng
      product_ids: Joi.array().items(Joi.number().integer()).optional(),
      category_ids: Joi.array().items(Joi.number().integer()).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = UpdateVoucherRequest;
