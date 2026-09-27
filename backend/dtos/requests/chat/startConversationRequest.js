const Joi = require("joi");

/**
 * Validate dữ liệu khi khách hàng bấm "Liên hệ Shop / Phàn nàn sản phẩm".
 * Không cần truyền seller_id/shopId — server tự suy ra người bán (user_id
 * của sản phẩm) để tránh khách hàng giả mạo gửi sai người nhận.
 */
class StartConversationRequest {
  constructor(data) {
    this.product_id = data.product_id;
    this.content = data.content;
  }

  static validate(data) {
    const schema = Joi.object({
      product_id: Joi.number().integer().positive().required().messages({
        "number.base": "Mã sản phẩm phải là định dạng số!",
        "number.integer": "Mã sản phẩm phải là số nguyên!",
        "number.positive": "Mã sản phẩm không hợp lệ!",
        "any.required": "Vui lòng cung cấp sản phẩm cần phàn nàn!",
      }),
      content: Joi.string().trim().min(1).max(2000).required().messages({
        "string.base": "Nội dung phải là dạng văn bản!",
        "string.empty": "Vui lòng nhập nội dung phàn nàn!",
        "string.max": "Nội dung không được vượt quá 2000 ký tự!",
        "any.required": "Vui lòng nhập nội dung tin nhắn đầu tiên!",
      }),
    });

    return schema.validate(data);
  }
}

module.exports = { StartConversationRequest };
