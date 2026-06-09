const Joi = require("joi");

class InsertProductImageRequest {
  constructor(data) {
    this.product_id = data.product_id;
    this.imageurl = data.imageurl;
  }

  static validate(data) {
    const schema = Joi.object({
      product_id: Joi.number().integer().required(),

      imageurl: Joi.string().trim().required(), // có thể là URL hoặc tên file
    });

    return schema.validate(data);
  }
}

module.exports = InsertProductImageRequest;
