const Joi = require("joi");

class UpdateNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.image = data.image;
    this.content = data.content;  
  }
  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().optional(),
      image: Joi.string().allow("").optional(),
      content: Joi.string().optional(),   
    });
    return schema.validate(data);
  }
}

module.exports = UpdateNewsRequest;
