const Joi = require("joi");

class InsertBannerRequest {
  constructor(data) {
    this.name = data.name;
    this.image = data.image;
    this.status = data.status;
    this.product_ids = data.product_ids;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().required(),

      image: Joi.string().allow("").optional(),

      product_ids: Joi.array().items(Joi.number()).optional(),

      status: Joi.number().integer().min(0).required(),
    }).unknown(true);;

    return schema.validate(data);
  }
}

module.exports = InsertBannerRequest;
