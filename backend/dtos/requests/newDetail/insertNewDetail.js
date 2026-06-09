const Joi = require("joi");

class InsertNewDetailRequest {
  constructor(data) {
    this.product_id = data.product_id;
    this.new_id = data.new_id;
  }

  static validate(data) {
    const schema = Joi.object({
      product_id: Joi.number().integer().required(),
      new_id: Joi.number().integer().required(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertNewDetailRequest;
