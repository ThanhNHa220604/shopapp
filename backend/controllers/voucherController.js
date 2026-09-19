const Sequelize = require("sequelize");
const db = require("../models");

const Op = Sequelize.Op;
const {
  getEligibleItems,
  validateVoucherRules,
  calculateDiscountAmount,
} = require("../helpers/voucherHelper");

// =============================================================================
// 1. ÁP DỤNG MÃ VOUCHER TẠI CART / CHECKOUT
// =============================================================================
async function applyVoucher(req, res) {
  const { code, cartItems = [] } = req.body;
  const userId = req.userId || req.user?.id || req.body.user_id;

  if (!code) {
    return res.status(400).json({ message: "Vui lòng nhập mã giảm giá" });
  }

  try {
    const VoucherModel = db.vouchers || db.Voucher;
    const VoucherProductModel = db.voucherproducts || db.VoucherProducts;
    const VoucherCategoryModel = db.vouchercategories || db.VoucherCategories;
    const VoucherUsageModel =
      db.voucher_usages || db.voucherusages || db.VoucherUsages;

    // 1. Tìm Voucher theo Mã Code
    const voucher = await VoucherModel.findOne({
      where: { code: code.trim().toUpperCase(), is_active: true },
      include: [
        { model: VoucherProductModel, as: "voucherProducts", required: false },
        {
          model: VoucherCategoryModel,
          as: "voucherCategories",
          required: false,
        },
      ],
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ message: "Mã giảm giá không tồn tại hoặc đã bị khóa" });
    }

    const voucherJSON = voucher.toJSON();
    const scope = (voucherJSON.apply_scope || "all").toLowerCase();

    const allowedProductIds =
      voucherJSON.voucherProducts?.map((vp) => Number(vp.product_id)) || [];
    const allowedCategoryIds =
      voucherJSON.voucherCategories?.map((vc) => Number(vc.category_id)) || [];

    // 2. Lọc ra danh sách sản phẩm hợp lệ trong giỏ
    let eligibleItems = [];

    if (scope === "all") {
      // Quyền tất cả sản phẩm: nhận toàn bộ giỏ hàng
      eligibleItems = cartItems;
    } else if (scope === "specific_products") {
      eligibleItems = cartItems.filter((item) => {
        const pId = Number(item.product_id || item.products?.id || item.id);
        return allowedProductIds.includes(pId);
      });
    } else if (scope === "specific_categories") {
      eligibleItems = cartItems.filter((item) => {
        const cId = Number(
          item.category_id ||
            item.products?.category_id ||
            item.product?.category_id,
        );
        return allowedCategoryIds.includes(cId);
      });
    }

    if (!eligibleItems || eligibleItems.length === 0) {
      return res.status(400).json({
        message:
          "Mã giảm giá không áp dụng cho sản phẩm nào trong giỏ hàng của bạn",
      });
    }

    // 3. Tính tổng tiền các sản phẩm đủ điều kiện
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => {
      const price = parseFloat(item.applied_price || item.price || 0);
      const qty = parseInt(item.quanity || item.quantity || 1);
      return sum + price * qty;
    }, 0);

    // 4. Kiểm tra lượt dùng của User
    let userUsageCount = 0;
    if (userId && VoucherUsageModel) {
      userUsageCount = await VoucherUsageModel.count({
        where: { voucher_id: voucher.id, user_id: userId },
      });
    }

    // 5. Kiểm tra các quy tắc Validation qua Helper
    validateVoucherRules(voucherJSON, eligibleSubtotal, userUsageCount);

    // 6. Tính số tiền giảm
    const discountAmount = calculateDiscountAmount(
      voucherJSON,
      eligibleSubtotal,
    );

    return res.status(200).json({
      message: "Áp dụng mã giảm giá thành công",
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        discount_amount: discountAmount,
        eligible_subtotal: eligibleSubtotal,
        final_total: Math.max(0, eligibleSubtotal - discountAmount),
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Không thể áp dụng mã giảm giá",
    });
  }
}
// =============================================================================
// 2. LẤY DANH SÁCH VOUCHER ÁP DỤNG ĐƯỢC CHO 1 SẢN PHẨM
// GET /api/vouchers/applicable-products/:productId
// =============================================================================
async function getVouchersForProduct(req, res) {
  const { productId } = req.params;

  try {
    const VoucherModel = db.vouchers || db.Voucher;
    const ProductModel = db.products || db.Product;
    const VoucherProductModel = db.voucherproducts || db.VoucherProducts;
    const VoucherCategoryModel = db.vouchercategories || db.VoucherCategories;

    // 1. Tìm thông tin sản phẩm để lấy category_id
    const Product = ProductModel;
    const product = await Product.findByPk(productId, {
      attributes: ["id", "category_id"],
    });

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const now = new Date();

    // 2. Tìm tất cả Voucher đang active và còn hạn sử dụng
    const vouchers = await VoucherModel.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
        [Op.or]: [
          { apply_scope: "all" },
          {
            apply_scope: "specific_products",
            "$voucherProducts.product_id$": Number(productId),
          },
          {
            apply_scope: "specific_categories",
            "$voucherCategories.category_id$": product.category_id,
          },
        ],
      },
      include: [
        {
          model: VoucherProductModel,
          as: "voucherProducts",
          required: false,
          attributes: [],
        },
        {
          model: VoucherCategoryModel,
          as: "voucherCategories",
          required: false,
          attributes: [],
        },
      ],
      having: Sequelize.literal(
        "usage_limit IS NULL OR used_count < usage_limit",
      ),
      subQuery: false,
      distinct: true,
    });

    return res.status(200).json({
      message: "Lấy danh sách Voucher khả dụng cho sản phẩm thành công",
      data: vouchers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách Voucher cho sản phẩm",
      error: error.message,
    });
  }
}

// =============================================================================
// 3. TẠO MỚI VOUCHER (Admin / Manager)
// =============================================================================
async function createVoucher(req, res) {
  const {
    code,
    title,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    limit_per_user,
    start_date,
    end_date,
    apply_scope,
    product_ids = [],
    category_ids = [],
  } = req.body;

  const creatorId = req.userId || req.user?.id || req.body.creator_id;
  const createdByType = req.user?.role === "admin" ? "admin" : "manager";

  if (!code || !discount_type || !discount_value || !start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ các thông tin bắt buộc" });
  }

  const VoucherModel = db.vouchers || db.Voucher;
  const VoucherProductModel = db.voucherproducts || db.VoucherProducts;
  const VoucherCategoryModel = db.vouchercategories || db.VoucherCategories;

  const transaction = await db.sequelize.transaction();

  try {
    const existingCode = await VoucherModel.findOne({
      where: { code: code.trim().toUpperCase() },
      transaction,
    });

    if (existingCode) {
      await transaction.rollback();
      return res.status(400).json({ message: "Mã Voucher này đã tồn tại" });
    }

    const newVoucher = await VoucherModel.create(
      {
        code: code.trim().toUpperCase(),
        title,
        discount_type,
        discount_value,
        max_discount_amount: max_discount_amount || null,
        min_order_value: min_order_value || 0,
        usage_limit: usage_limit || 100,
        used_count: 0,
        limit_per_user: limit_per_user || 1,
        start_date,
        end_date,
        created_by_type: createdByType,
        creator_id: creatorId,
        apply_scope: apply_scope || "all",
        is_active: true,
      },
      { transaction },
    );

    if (
      apply_scope === "specific_products" &&
      product_ids.length > 0 &&
      VoucherProductModel
    ) {
      const productRecords = product_ids.map((pId) => ({
        voucher_id: newVoucher.id,
        product_id: Number(pId),
      }));
      await VoucherProductModel.bulkCreate(productRecords, { transaction });
    }

    if (
      createdByType === "admin" &&
      apply_scope === "specific_categories" &&
      category_ids.length > 0 &&
      VoucherCategoryModel
    ) {
      const categoryRecords = category_ids.map((cId) => ({
        voucher_id: newVoucher.id,
        category_id: Number(cId),
      }));
      await VoucherCategoryModel.bulkCreate(categoryRecords, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Tạo Voucher mới thành công",
      data: newVoucher,
    });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi tạo Voucher", error: error.message });
  }
}

// =============================================================================
// 4. LẤY DANH SÁCH VOUCHER DÀNH CHO ADMIN & MANAGER (Phân trang, Tìm kiếm, Lọc)
// GET /api/vouchers
// =============================================================================
async function getVouchers(req, res) {
  const { page = 1, pageSize = 10, search, is_active, creator_id } = req.query;
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const limit = parseInt(pageSize) || 10;
  const offset = (parsedPage - 1) * limit;

  let whereClause = {};

  // Tim kiếm theo code hoặc title
  if (search) {
    whereClause[Op.or] = [
      { code: { [Op.like]: `%${search.trim()}%` } },
      { title: { [Op.like]: `%${search.trim()}%` } },
    ];
  }

  // Lọc theo trạng thái active
  if (is_active !== undefined) {
    whereClause.is_active = is_active === "true" || is_active === "1";
  }

  // Lọc theo người tạo (nếu Manager chỉ muốn xem voucher mình tạo)
  if (creator_id) {
    whereClause.creator_id = Number(creator_id);
  }

  try {
    const VoucherModel = db.vouchers || db.Voucher;
    const ProductModel = db.products || db.Product;

    const { rows: vouchers, count: total } = await VoucherModel.findAndCountAll(
      {
        where: whereClause,
        limit,
        offset,
        order: [["id", "DESC"]],
        // 🟢 Include sản phẩm áp dụng (qua bảng trung gian voucherproducts,
        // alias "products" đã khai báo sẵn trong models/voucher.js).
        // Không có include này thì FE không bao giờ nhận được danh sách
        // sản phẩm cụ thể của voucher, dù dữ liệu vẫn có trong DB.
        include: ProductModel
          ? [
              {
                model: ProductModel,
                as: "products",
                required: false,
                through: { attributes: [] }, // ẩn bớt cột thừa của bảng trung gian
              },
            ]
          : [],
        distinct: true, // đếm đúng total khi JOIN N-N, tránh nhân bản dòng
      },
    );

    return res.status(200).json({
      message: "Lấy danh sách Voucher thành công",
      data: vouchers,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách Voucher", error: error.message });
  }
}

async function saveVoucher(req, res) {
  const userId = req.userId || req.user?.id;
  const { voucherId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để lưu mã" });
  }

  if (!voucherId) {
    return res.status(400).json({ message: "Thiếu thông tin voucherId" });
  }

  try {
    const UserVoucherModel = db.user_vouchers || db.UserVoucher;
    const VoucherModel = db.vouchers || db.Voucher;

    // 1. Kiểm tra voucher có tồn tại không
    const voucher = await VoucherModel.findByPk(voucherId);
    if (!voucher) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
    }

    // 2. Kiểm tra xem user đã lưu mã này chưa
    const existing = await UserVoucherModel.findOne({
      where: { user_id: userId, voucher_id: voucherId },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã lưu mã giảm giá này rồi" });
    }

    // 3. Tiến hành lưu vào bảng user_vouchers
    await UserVoucherModel.create({
      user_id: userId,
      voucher_id: voucherId,
      usage_count: 0,
    });

    return res.status(200).json({
      message: "Lưu mã giảm giá thành công",
      data: { voucher_id: voucherId },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống khi lưu mã giảm giá",
      error: error.message,
    });
  }
}

// =============================================================================
// 7. LẤY DANH SÁCH VOUCHER MÀ USER ĐÃ LƯU
// GET /api/vouchers/user-saved
// =============================================================================
async function getUserSavedVouchers(req, res) {
  const userId = req.userId || req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Vui lòng đăng nhập" });
  }

  try {
    const UserVoucherModel = db.user_vouchers || db.UserVoucher;
    const VoucherModel = db.vouchers || db.Voucher;
    const VoucherUsageModel =
      db.voucher_usages || db.voucherusages || db.VoucherUsages;

    const savedVouchers = await UserVoucherModel.findAll({
      where: { user_id: userId },
      attributes: ["voucher_id"],
      include: [
        {
          model: VoucherModel,
          as: "voucher", // ⚠️ Đổi lại đúng alias đang khai báo trong models/index.js (associate)
          required: true, // chỉ lấy những bản ghi còn tồn tại voucher gốc
        },
      ],
    });

    // 🟢 Đếm số lượt CHÍNH user này đã dùng cho từng voucher (bảng voucher_usages),
    // cùng bảng/logic mà applyVoucher() đang dùng để validate, để đảm bảo đồng nhất.
    let usedCountByVoucherId = {};
    if (VoucherUsageModel && savedVouchers.length > 0) {
      const voucherIds = savedVouchers.map((sv) => sv.voucher_id);
      const usageRows = await VoucherUsageModel.findAll({
        where: { user_id: userId, voucher_id: { [Op.in]: voucherIds } },
        attributes: [
          "voucher_id",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "used_count"],
        ],
        group: ["voucher_id"],
        raw: true,
      });
      usedCountByVoucherId = usageRows.reduce((acc, row) => {
        acc[row.voucher_id] = Number(row.used_count) || 0;
        return acc;
      }, {});
    }

    // Gắn thêm user_used_count + is_exhausted vào từng voucher, để Frontend
    // lọc được voucher đã hết lượt ngay từ danh sách, không cần gọi thử
    // API /vouchers/apply để "dò" như trước nữa.
    const result = savedVouchers.map((sv) => {
      const svJSON = sv.toJSON();
      const voucherJSON = svJSON.voucher || {};
      const userUsedCount = usedCountByVoucherId[svJSON.voucher_id] || 0;

      const limitPerUser =
        voucherJSON.limit_per_user !== undefined &&
        voucherJSON.limit_per_user !== null
          ? Number(voucherJSON.limit_per_user)
          : null;

      const isExhausted =
        voucherJSON.is_active === false ||
        (limitPerUser !== null && userUsedCount >= limitPerUser) ||
        (voucherJSON.usage_limit !== undefined &&
          voucherJSON.usage_limit !== null &&
          voucherJSON.used_count !== undefined &&
          voucherJSON.used_count !== null &&
          Number(voucherJSON.used_count) >= Number(voucherJSON.usage_limit));

      return {
        ...svJSON,
        voucher: {
          ...voucherJSON,
          user_used_count: userUsedCount,
          is_exhausted: isExhausted,
        },
      };
    });

    return res.status(200).json({
      message: "Lấy danh sách mã đã lưu thành công",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách mã đã lưu",
      error: error.message,
    });
  }
}

// =============================================================================
// CẬP NHẬT VOUCHER (PUT /api/vouchers/:id)
// =============================================================================
async function updateVoucher(req, res) {
  const { id } = req.params;
  const {
    code,
    title,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    limit_per_user,
    start_date,
    end_date,
    apply_scope,
    is_active,
    product_ids = [],
    category_ids = [],
  } = req.body;

  const VoucherModel = db.vouchers || db.Voucher;
  const VoucherProductModel = db.voucherproducts || db.VoucherProducts;
  const VoucherCategoryModel = db.vouchercategories || db.VoucherCategories;

  const transaction = await db.sequelize.transaction();

  try {
    // 1. Kiểm tra Voucher có tồn tại không
    const voucher = await VoucherModel.findByPk(id, { transaction });
    if (!voucher) {
      await transaction.rollback();
      return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
    }

    // 2. Kiểm tra nếu trùng mã Code với voucher khác
    if (code && code.trim().toUpperCase() !== voucher.code) {
      const existingCode = await VoucherModel.findOne({
        where: {
          code: code.trim().toUpperCase(),
          id: { [Op.ne]: id },
        },
        transaction,
      });

      if (existingCode) {
        await transaction.rollback();
        return res.status(400).json({ message: "Mã Voucher này đã tồn tại" });
      }
    }

    // 3. Cập nhật thông tin Voucher
    await voucher.update(
      {
        code: code ? code.trim().toUpperCase() : voucher.code,
        title: title !== undefined ? title : voucher.title,
        discount_type: discount_type || voucher.discount_type,
        discount_value:
          discount_value !== undefined
            ? discount_value
            : voucher.discount_value,
        max_discount_amount:
          max_discount_amount !== undefined
            ? max_discount_amount
            : voucher.max_discount_amount,
        min_order_value:
          min_order_value !== undefined
            ? min_order_value
            : voucher.min_order_value,
        usage_limit:
          usage_limit !== undefined ? usage_limit : voucher.usage_limit,
        limit_per_user:
          limit_per_user !== undefined
            ? limit_per_user
            : voucher.limit_per_user,
        start_date: start_date || voucher.start_date,
        end_date: end_date || voucher.end_date,
        apply_scope: apply_scope || voucher.apply_scope,
        is_active: is_active !== undefined ? is_active : voucher.is_active,
      },
      { transaction },
    );

    const currentScope = apply_scope || voucher.apply_scope;

    // 4. Cập nhật danh sách sản phẩm áp dụng (nếu áp dụng cho sản phẩm cụ thể)
    if (VoucherProductModel) {
      await VoucherProductModel.destroy({
        where: { voucher_id: id },
        transaction,
      });

      if (currentScope === "specific_products" && product_ids.length > 0) {
        const productRecords = product_ids.map((pId) => ({
          voucher_id: Number(id),
          product_id: Number(pId),
        }));
        await VoucherProductModel.bulkCreate(productRecords, { transaction });
      }
    }

    // 5. Cập nhật danh sách danh mục áp dụng (nếu áp dụng cho danh mục cụ thể)
    if (VoucherCategoryModel) {
      await VoucherCategoryModel.destroy({
        where: { voucher_id: id },
        transaction,
      });

      if (currentScope === "specific_categories" && category_ids.length > 0) {
        const categoryRecords = category_ids.map((cId) => ({
          voucher_id: Number(id),
          category_id: Number(cId),
        }));
        await VoucherCategoryModel.bulkCreate(categoryRecords, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Cập nhật Voucher thành công",
      data: voucher,
    });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return res.status(500).json({
      message: "Lỗi hệ thống khi cập nhật Voucher",
      error: error.message,
    });
  }
}

// =============================================================================
// XÓA VOUCHER (DELETE /api/vouchers/:id)
// =============================================================================
async function deleteVoucher(req, res) {
  const { id } = req.params;

  const VoucherModel = db.vouchers || db.Voucher;
  const VoucherProductModel = db.voucherproducts || db.VoucherProducts;
  const VoucherCategoryModel = db.vouchercategories || db.VoucherCategories;
  const UserVoucherModel = db.user_vouchers || db.UserVoucher;

  const transaction = await db.sequelize.transaction();

  try {
    const voucher = await VoucherModel.findByPk(id, { transaction });

    if (!voucher) {
      await transaction.rollback();
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    // Dọn dẹp dữ liệu ở các bảng liên quan trước khi xóa
    if (VoucherProductModel) {
      await VoucherProductModel.destroy({
        where: { voucher_id: id },
        transaction,
      });
    }
    if (VoucherCategoryModel) {
      await VoucherCategoryModel.destroy({
        where: { voucher_id: id },
        transaction,
      });
    }
    if (UserVoucherModel) {
      await UserVoucherModel.destroy({
        where: { voucher_id: id },
        transaction,
      });
    }

    // Xóa Voucher
    await VoucherModel.destroy({ where: { id }, transaction });

    await transaction.commit();

    return res.status(200).json({ message: "Xóa Voucher thành công" });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Lỗi xóa Voucher", error: error.message });
  }
}

module.exports = {
  applyVoucher,
  getVouchersForProduct,
  createVoucher,
  getVouchers,
  deleteVoucher,
  saveVoucher, // 👈 Mới bổ sung
  getUserSavedVouchers,
  updateVoucher,
};