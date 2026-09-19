"use strict";
const Joi = require("joi");

class InsertVoucherRequest {
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

    this.product_ids = data.product_ids;
    this.category_ids = data.category_ids;
  }

  static validate(data) {
    const schema = Joi.object({
      code: Joi.string().trim().uppercase().min(3).max(50).required().messages({
        "string.empty": "Mã giảm giá không được để trống",
        "any.required": "Mã giảm giá là bắt buộc",
      }),

      title: Joi.string().trim().max(255).required().messages({
        "string.empty": "Tiêu đề voucher không được để trống",
      }),

      // 🟢 CẬP NHẬT: Thêm lowercase() và replace("percentage", "percent")
      discount_type: Joi.string()
        .trim()
        .lowercase()
        .replace("percentage", "percent")
        .valid("percent", "fixed")
        .required()
        .messages({
          "any.only": "Loại giảm giá chỉ chấp nhận 'percent' hoặc 'fixed'",
          "any.required": "Loại giảm giá là bắt buộc",
        }),

      discount_value: Joi.number()
        .positive()
        .required()
        .when("discount_type", {
          is: "percent",
          then: Joi.number().max(100).messages({
            "number.max": "Phần trăm giảm giá không được vượt quá 100%",
          }),
        }),

      max_discount_amount: Joi.number().min(0).allow(null).optional(),
      min_order_value: Joi.number().min(0).default(0).optional(),
      usage_limit: Joi.number().integer().min(1).default(100).optional(),
      used_count: Joi.number().integer().min(0).default(0).optional(),
      limit_per_user: Joi.number().integer().min(1).default(1).optional(),

      start_date: Joi.date().iso().required().messages({
        "date.format": "Ngày bắt đầu không đúng định dạng ISO Date",
      }),

      end_date: Joi.date()
        .iso()
        .greater(Joi.ref("start_date"))
        .required()
        .messages({
          "date.greater": "Ngày kết thúc phải diễn ra sau ngày bắt đầu",
        }),

      created_by_type: Joi.string()
        .trim()
        .lowercase()
        .valid("admin", "manager")
        .default("admin")
        .allow("", null)
        .optional(),

      creator_id: Joi.number().integer().allow(null).optional(),

      apply_scope: Joi.string()
        .valid("all", "specific_products", "specific_categories")
        .default("all")
        .optional(),

      is_active: Joi.boolean().default(true).optional(),

      product_ids: Joi.array().items(Joi.number().integer()).optional(),
      category_ids: Joi.array().items(Joi.number().integer()).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertVoucherRequest;
