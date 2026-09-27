const Joi = require("joi");

class InsertUserRequest {
  constructor(data) {
    this.email = data.email;
    this.password = data.password
    this.name = data.name;
    this.avatar = data.avatar;
    this.phone = data.phone;
  }

  encryptPassword(password) {
    // Encrypt the password before storing it
    return "faked hashed password";
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),

      password: Joi.string().min(6).optional(),

      name: Joi.string().required(),

      avatar: Joi.string().uri().allow("").optional(),

      phone: Joi.string().allow("").optional(),
    });

    return schema.validate(data);
  }
}

module.exports = InsertUserRequest;
