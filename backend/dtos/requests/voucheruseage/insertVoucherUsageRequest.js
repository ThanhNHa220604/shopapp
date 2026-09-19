"use strict";
const Joi = require("joi");

class InsertVoucherUsageRequest {
  constructor(data) {
    this.voucher_id = data.voucher_id;
    this.user_id = data.user_id;
    this.order_id = data.order_id;
  }

  static validate(data) {
    const schema = Joi.object({
      voucher_id: Joi.number().integer().positive().required().messages({
        "number.base": "ID của Voucher phải là số nguyên",
        "any.required": "ID của Voucher là bắt buộc",
      }),

      user_id: Joi.number().integer().positive().required().messages({
        "number.base": "ID người dùng phải là số nguyên",
        "any.required": "ID người dùng là bắt buộc",
      }),

      order_id: Joi.number().integer().positive().required().messages({
        "number.base": "ID đơn hàng phải là số nguyên",
        "any.required": "ID đơn hàng là bắt buộc",
      }),
    });

    return schema.validate(data);
  }
}

module.exports = InsertVoucherUsageRequest;