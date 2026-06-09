const Joi = require("joi")
class InsertProductRequest {
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
    this.attributes = data.attributes
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().required(),

      price: Joi.number().required(),

      oldprice: Joi.number().required(),

      image: Joi.string().allow("").optional(),

      description: Joi.string().required(),

      specification: Joi.string().allow("").optional(),

      buyturn: Joi.number().integer().required(),

      quanity: Joi.number().integer().required(),

      brand_id: Joi.number().integer().required(),

      category_id: Joi.number().integer().required(),
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

    return schema.validate(data); //(error, value)
  }
}
module.exports = InsertProductRequest;