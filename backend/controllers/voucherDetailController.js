const Sequelize = require("sequelize");
const db = require("../models");

// =============================================================================
// 1. LẤY CHI TIẾT 1 VOUCHER (KÈM DANH SÁCH PRODUCT / CATEGORY LIÊN KẾT)
// =============================================================================
async function getVoucherById(req, res) {
  const { id } = req.params;

  try {
    const VoucherModel = db.vouchers || db.Voucher;
    const ProductModel = db.products || db.Product;
    const CategoryModel = db.categories || db.Category;
    const UserModel = db.users || db.User;

    const voucher = await VoucherModel.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          attributes: ["id", "name", "price", "image"],
          through: { attributes: [] }, // Bỏ thuộc tính bảng trung gian
          required: false,
        },
        {
          model: CategoryModel,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: UserModel,
          as: "creator",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin Voucher" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết Voucher thành công",
      data: voucher,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy chi tiết Voucher",
      error: error.message,
    });
  }
}

// =============================================================================
// 2. LẤY LỊCH SỬ SỬ DỤNG CỦA 1 VOUCHER (Cho Admin / Manager xem báo cáo)
// =============================================================================
async function getVoucherUsages(req, res) {
  const { id } = req.params; // voucher_id
  const { page = 1, pageSize = 10 } = req.query;

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const limit = parseInt(pageSize) || 10;
  const offset = (parsedPage - 1) * limit;

  try {
    const VoucherUsageModel = db.voucherusages || db.VoucherUsages;
    const UserModel = db.users || db.User;
    const OrderModel = db.orders || db.Order;

    if (!VoucherUsageModel) {
      return res
        .status(500)
        .json({ message: "Chưa cấu hình Model VoucherUsage" });
    }

    const { rows: usages, count: total } =
      await VoucherUsageModel.findAndCountAll({
        where: { voucher_id: id },
        limit,
        offset,
        order: [["id", "DESC"]],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["id", "name", "email", "phone"],
            required: false,
          },
          {
            model: OrderModel,
            as: "order",
            attributes: ["id", "total", "status", "created_at"],
            required: false,
          },
        ],
      });

    return res.status(200).json({
      message: "Lấy lịch sử sử dụng Voucher thành công",
      data: usages,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy lịch sử sử dụng Voucher",
      error: error.message,
    });
  }
}

module.exports = {
  getVoucherById,
  getVoucherUsages,
};
