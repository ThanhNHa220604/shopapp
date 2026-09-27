const Joi = require("joi");

/**
 * Validate dữ liệu khi gửi tin nhắn (dùng chung cho cả REST và Socket.io)
 */
class SendMessageRequest {
  constructor(data) {
    this.content = data.content;
  }

  static validate(data) {
    const schema = Joi.object({
      content: Joi.string().trim().min(1).max(2000).required().messages({
        "string.base": "Nội dung phải là dạng văn bản!",
        "string.empty": "Tin nhắn không được để trống!",
        "string.max": "Nội dung không được vượt quá 2000 ký tự!",
        "any.required": "Vui lòng nhập nội dung tin nhắn!",
      }),
    });

    return schema.validate(data);
  }
}

module.exports = { SendMessageRequest };
