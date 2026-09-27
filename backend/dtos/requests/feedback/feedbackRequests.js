const Joi = require("joi");

/**
 * Lớp xử lý validation đầu vào cho hành động gửi đánh giá mới (Insert Feedback)
 * Đảm bảo tính nhất quán với Sequelize Model (product_id, user_id, star, content)
 */
class InsertFeedbackRequest {
  constructor(data) {
    this.product_id = data.product_id;
    this.user_id = data.user_id;
    this.star = data.star;
    this.content = data.content;
  }

  /**
   * Phương thức tĩnh thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào
   * @param {Object} data - Dữ liệu thô từ req.body gửi lên
   * @returns {Object} Kết quả kiểm tra của Joi (gồm error và value)
   */
  static validate(data) {
    const schema = Joi.object({
      // product_id bắt buộc phải là số nguyên dương và có tồn tại
      product_id: Joi.number().integer().positive().required().messages({
        "number.base": "Mã sản phẩm phải là định dạng số!",
        "number.integer": "Mã sản phẩm phải là số nguyên!",
        "number.positive": "Mã sản phẩm không hợp lệ!",
        "any.required": "Vui lòng cung cấp mã sản phẩm cần đánh giá!",
      }),

      // user_id có thể là số nguyên dương hoặc null (nếu là khách vãng lai)
      user_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
          "number.base": "Mã tài khoản phải là định dạng số!",
          "number.integer": "Mã tài khoản phải là số nguyên!",
          "number.positive": "Mã tài khoản không hợp lệ!",
        }),

      // star bắt buộc phải là số nguyên nằm trong khoảng từ 1 tới 5 sao
      star: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": "Số sao đánh giá phải là định dạng số!",
        "number.integer": "Số sao đánh giá phải là số nguyên!",
        "number.min": "Đánh giá tối thiểu phải là 1 sao!",
        "number.max": "Đánh giá tối đa chỉ được 5 sao!",
        "any.required": "Vui lòng chọn số sao đánh giá sản phẩm!",
      }),

      // content bắt buộc phải là chuỗi không trống sau khi đã loại bỏ khoảng trắng thừa
      content: Joi.string().trim().min(1).required().messages({
        "string.base": "Nội dung bình luận phải là dạng văn bản!",
        "string.empty": "Vui lòng nhập nội dung đánh giá trải nghiệm thực tế!",
        "any.required": "Nội dung bình luận không được phép bỏ trống!",
      }),
      image: Joi.string().trim().allow("", null).optional().messages({
        "string.base": "Đường dẫn hình ảnh phải ở định dạng chuỗi!",
      }),
    });

    return schema.validate(data);
  }
}

module.exports = {
  InsertFeedbackRequest
};
