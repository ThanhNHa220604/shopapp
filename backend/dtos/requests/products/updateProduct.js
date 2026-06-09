const Joi = require("joi");

class UpdateProductRequest {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.oldprice = data.oldprice;
    this.image = data.image;
    this.description = data.description;
    this.specification = data.specification;
    this.buyturn = data.buyturn;
    this.quanity = data.quanity;
    this.brand_id = data.brand_id;
    this.category_id = data.category_id;
    this.attributes = data.attributes;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().optional(),

      price: Joi.number().optional(),

      oldprice: Joi.number().optional(),

      image: Joi.string().allow("").optional(),

      description: Joi.string().optional(),

      specification: Joi.string().optional(),

      buyturn: Joi.number().integer().optional(),

      quanity: Joi.number().integer().optional(),

      brand_id: Joi.number().integer().optional(),

      category_id: Joi.number().integer().optional(),
      attributes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required(),
          }),
        )
        .optional(),
      variants: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            values: Joi.array().items(Joi.string()).required(),
          }),
        )
        .optional(),

      variant_values: Joi.array()
        .items(
          Joi.object({
            variant_combination: Joi.array().items(Joi.string()).required(),
            price: Joi.number().required(),
            old_price: Joi.number().allow(null).optional(),
            stock: Joi.number().optional(),
          }),
        )
        .optional(),
    });

    return schema.validate(data);
  }
}

module.exports = UpdateProductRequest;
