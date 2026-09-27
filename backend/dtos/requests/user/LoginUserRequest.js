const Joi = require("joi");

class LoginUserRequest {
  constructor(data) {
    this.email = data.email;
    this.password = data.password
    this.phone = data.phone;
  }

  encryptPassword(password) {
    // Encrypt the password before storing it
    return "faked hashed password";
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).required(),
      //password: Joi.string().min(6).required(),
      phone: Joi.string().allow("").optional(),
    });

    return schema.validate(data);
  }
}

module.exports = LoginUserRequest;
