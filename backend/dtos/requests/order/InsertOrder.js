const Joi = require("joi");

class InsertOrderRequest {
  constructor(data) {
    this.user_id = data.user_id;
    this.status = data.status;
    this.note = data.note;
    this.total = data.total;
    this.phone =  data.phone;
    this.address = data.address
  }

  static validate(data) {
    const schema = Joi.object({
      user_id: Joi.number().integer().required(),

      status: Joi.number().integer().greater(0).required(),

      note: Joi.string().allow("").optional(),
      phone: Joi.string()
        .pattern(/^[0-9]+$/)
        .required(),
      address: Joi.alternatives()
        .try(
          Joi.string().allow(""),
          Joi.object({
            street: Joi.string().allow(""),
            ward: Joi.string().allow(""),
            district: Joi.string().allow(""),
            city: Joi.string().allow(""),
          }),
        )
        .optional(),

      total: Joi.number().min(0).required(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertOrderRequest;
