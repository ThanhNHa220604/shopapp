const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

/**
 * 💡 Hàm bổ trợ: Tìm kiếm Model trong đối tượng `db` một cách linh hoạt,
 * không phân biệt chữ hoa/thường, số ít/nhiều để tránh lỗi undefined.
 */
function findModel(targetName) {
  const keys = Object.keys(db);
  const normalizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const matchedKey = keys.find((key) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      normalizedKey === normalizedTarget ||
      normalizedKey === normalizedTarget + "s" ||
      normalizedTarget === normalizedKey + "s"
    );
  });

  return matchedKey ? db[matchedKey] : null;
}

/**
 * 💡 Hàm bổ trợ: Parse trường image từ Database (chuỗi JSON hoặc text) thành mảng "images" để gửi về Frontend
 */
function parseFeedbackImages(feedbackItem) {
  if (!feedbackItem) return feedbackItem;

  // Ép kiểu sequelize instance sang plain object để tùy ý chỉnh sửa dữ liệu trả về
  const plainFeedback = feedbackItem.toJSON
    ? feedbackItem.toJSON()
    : feedbackItem;

  // Đọc từ cột "image" của DB
  if (plainFeedback.image) {
    try {
      // Nếu lưu dạng mảng JSON trong DB: '["anh1.jpg", "anh2.jpg"]'
      plainFeedback.images = JSON.parse(plainFeedback.image);
    } catch (e) {
      // Nếu lưu dạng chuỗi phân tách bởi dấu phẩy: 'anh1.jpg,anh2.jpg'
      plainFeedback.images = plainFeedback.image
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
    }
  } else {
    plainFeedback.images = [];
  }

  // Xóa thuộc tính image cũ (không bắt buộc) để dữ liệu trả về FE sạch đẹp chỉ có mảng images
  delete plainFeedback.image;

  return plainFeedback;
}

/**
 * 📌 1. LẤY DANH SÁCH FEEDBACKS
 * GET /api/feedbacks
 */
async function getFeedbacks(req, res) {
  const { productId, star, search = "", page = 1 } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (productId) {
    whereClause.product_id = Number(productId);
  }

  if (star) {
    whereClause.star = Number(star);
  }

  if (search.trim() !== "") {
    whereClause.content = {
      [Op.like]: `%${search}%`,
    };
  }

  try {
    const UserModel = findModel("users") || findModel("user");

    const [feedbacks, totalFeedbacks] = await Promise.all([
      db.feedback.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
        include: UserModel
          ? [
              {
                model: UserModel,
                attributes: ["id", "name", "avatar"],
              },
            ]
          : [],
      }),

      db.feedback.count({
        where: whereClause,
      }),
    ]);

    // Chuyển đổi dữ liệu trường image từ chuỗi trong db thành Array "images" trước khi gửi về Client
    const formattedFeedbacks = feedbacks.map(parseFeedbackImages);

    return res.status(200).json({
      message: "Lấy danh sách đánh giá thành công",
      data: formattedFeedbacks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalFeedbacks / pageSize),
      totalFeedbacks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách đánh giá",
      error: error.message,
    });
  }
}

/**
 * 📌 2. LẤY CHI TIẾT MỘT PHẢN HỒI THEO ID
 */
async function getFeedbackById(req, res) {
  const { id } = req.params;

  try {
    const UserModel = findModel("users") || findModel("user");

    const feedback = await db.feedback.findByPk(id, {
      include: UserModel
        ? [{ model: UserModel, attributes: ["id", "name"] }]
        : [],
    });

    if (!feedback) {
      return res.status(404).json({
        message: "Không tìm thấy đánh giá này",
      });
    }

    // Định dạng trường images
    const formattedFeedback = parseFeedbackImages(feedback);

    return res.status(200).json({
      message: "Lấy chi tiết đánh giá thành công",
      data: formattedFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy chi tiết đánh giá",
      error: error.message,
    });
  }
}

/**
 * 📌 3. THÊM MỚI MỘT ĐÁNH GIÁ (CÓ CHECK QUYỀN MUA HÀNG)
 * POST /api/feedbacks
 */
async function insertFeedback(req, res) {
  const { product_id, user_id, star, content } = req.body || {}; // Thêm phòng chống crash app nếu req.body bị undefined

  if (!product_id || star === undefined || !content) {
    return res.status(400).json({
      message:
        "Vui lòng điền đầy đủ thông tin: Mã sản phẩm, Số sao và Nội dung bình luận!",
    });
  }

  if (Number(star) < 1 || Number(star) > 5) {
    return res.status(400).json({
      message: "Số sao đánh giá không hợp lệ, vui lòng chọn từ 1 đến 5 sao!",
    });
  }

  if (!user_id) {
    return res.status(403).json({
      message: "Bạn cần đăng nhập để thực hiện đánh giá sản phẩm này!",
    });
  }

  try {
    const OrderDetailModel =
      findModel("order-detail") ||
      findModel("order_detail") ||
      findModel("orderDetail");

    const OrdersModel = findModel("orders") || findModel("order");

    if (!OrderDetailModel) {
      return res.status(500).json({
        message:
          "Lỗi hệ thống: Không tìm thấy Model cấu hình cho bảng chi tiết đơn hàng.",
      });
    }

    if (!OrdersModel) {
      return res.status(500).json({
        message:
          "Lỗi hệ thống: Không tìm thấy Model tương ứng với bảng orders.",
      });
    }

    const purchasedOrder = await OrdersModel.findOne({
      where: {
        user_id: Number(user_id),
        status: 4,
      },
      include: [
        {
          model: OrderDetailModel,
          as: "order_detail",
          where: { product_id: Number(product_id) },
          required: true,
        },
      ],
    });

    if (!purchasedOrder) {
      return res.status(403).json({
        message:
          "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao thành công. Không thể đánh giá!",
      });
    }

    // 📸 XỬ LÝ HÌNH ẢNH ĐƯỢC GỬI LÊN TỪ CLIENT:
    let uploadedImages = "";

    // Nếu bạn dùng multer để upload nhiều file (images)
    if (req.files && req.files.length > 0) {
      const fileNames = req.files.map((file) => file.filename);
      uploadedImages = JSON.stringify(fileNames); // lưu dưới dạng string JSON '["file1.jpg", "file2.jpg"]'
    } else if (req.file) {
      // Nếu chỉ upload 1 file đơn lẻ
      uploadedImages = JSON.stringify([req.file.filename]);
    }

    const feedbackData = {
      product_id: Number(product_id),
      user_id: Number(user_id),
      star: Number(star),
      content: content.trim(),
      image: uploadedImages || null, // Đồng bộ lưu vào cột "image" trong Database của bạn
    };

    const feedback = await db.feedback.create(feedbackData);

    // Định dạng lại trường images trong feedback vừa tạo trước khi trả lại cho Frontend
    const formattedFeedback = parseFeedbackImages(feedback);

    return res.status(201).json({
      message: "Gửi đánh giá sản phẩm thành công",
      data: formattedFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi bảo mật khi xác thực quyền đánh giá",
      error: error.message,
    });
  }
}

/**
 * 📌 4. XÓA ĐÁNH GIÁ
 */
async function deleteFeedback(req, res) {
  const { id } = req.params;

  try {
    const deleted = await db.feedback.destroy({
      where: { id },
    });

    if (deleted) {
      return res.status(200).json({
        message: "Xóa đánh giá thành công",
      });
    }

    return res.status(404).json({
      message: "Đánh giá không tồn tại hoặc đã bị xóa trước đó",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa đánh giá",
      error: error.message,
    });
  }
}

/**
 * 📌 5. API CHECK NHANH TRẠNG THÁI MUA HÀNG
 */
async function checkUserPurchase(req, res) {
  const { productId, userId } = req.query;
  if (!productId || !userId) {
    return res.status(200).json({ hasPurchased: false });
  }

  try {
    const OrderDetailModel =
      findModel("order-detail") ||
      findModel("order_detail") ||
      findModel("orderDetail");

    const OrdersModel = findModel("orders") || findModel("order");

    if (!OrderDetailModel || !OrdersModel) {
      return res.status(200).json({ hasPurchased: false });
    }

    const hasOrder = await OrdersModel.findOne({
      where: { user_id: Number(userId), status: 4 },
      include: [
        {
          model: OrderDetailModel,
          as: "order_detail",
          where: { product_id: Number(productId) },
          required: true,
        },
      ],
    });

    return res.status(200).json({ hasPurchased: !!hasOrder });
  } catch (error) {
    return res.status(200).json({ hasPurchased: false });
  }
}
module.exports = {
  getFeedbacks,
  getFeedbackById,
  insertFeedback,
  deleteFeedback,
  checkUserPurchase,
};