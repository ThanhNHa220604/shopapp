const Joi = require("joi");

class InsertNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.image = data.image;
    this.content = data.content;
    this.product_ids = data.product_ids;
  }

  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().required(),

      image: Joi.string().allow("").optional(),

      content: Joi.string().required(),

      product_ids: Joi.array().items(Joi.number().integer()).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertNewsRequest;
