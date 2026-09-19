"use strict";
const Joi = require("joi");

class UpdateVoucherUsageRequest {
  constructor(data) {
    this.voucher_id = data.voucher_id;
    this.user_id = data.user_id;
    this.order_id = data.order_id;
  }

  static validate(data) {
    const schema = Joi.object({
      voucher_id: Joi.number().integer().positive().optional(),
      user_id: Joi.number().integer().positive().optional(),
      order_id: Joi.number().integer().positive().optional(),
    });

    return schema.validate(data);
  }
}

module.exports = UpdateVoucherUsageRequest;
