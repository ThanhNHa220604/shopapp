
const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

// =========================================================================
// 1. LẤY DANH SÁCH CÁC CHƯƠNG TRÌNH FLASH SALE (Có phân trang & bộ lọc status)
// =========================================================================
async function getFlashSales(req, res) {
  const { page = 1, pageSize = 10, status } = req.query;
  const limit = parseInt(pageSize);
  const offset = (parseInt(page) - 1) * limit;

  let whereClause = {};

  // Nếu truyền status từ frontend lên (Ví dụ: 1 = Active, 0 = Inactive)
  if (status !== undefined && status !== "") {
    whereClause.status = parseInt(status);
  }

  try {
    const { rows: flashSales, count: total } =
      await db.FlashSales.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["start_time", "DESC"]],
      });

    return res.status(200).json({
      message: "Lấy danh sách Flash Sale thành công",
      data: flashSales,
      total,
      page: parseInt(page),
      pageSize: limit,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách Flash Sale",
        error: error.message,
      });
  }
}

// =========================================================================
// 2. LẤY CHI TIẾT MỘT CHƯƠNG TRÌNH FLASH SALE KÈM SẢN PHẨM & BIẾN THỂ
// =========================================================================
async function getFlashSaleById(req, res) {
  const { id } = req.params;

  try {
    const flashSale = await db.FlashSales.findByPk(id, {
      include: [
        {
          model: db.FlashSaleProducts,
          as: "flash_sale_products",
          include: [
            {
              model: db.products,
              as: "product",
              attributes: ["id", "name", "price", "image", "quanity"],
              include: [
                {
                  // Include thêm biến thể của sản phẩm gốc để Frontend hiển thị nếu cần chọn option
                  model:
                    db.product_variant_values ||
                    db.ProductVariantValues ||
                    db.productVariantValues,
                  as: "product_variant_values",
                  attributes: ["id", "price", "stock", "sku", "image_url"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!flashSale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chương trình Flash Sale này" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết Flash Sale thành công",
      data: flashSale,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi cấu trúc liên kết dữ liệu Flash Sale",
      error: error.message,
    });
  }
}

// =========================================================================
// 3. TẠO MỚI CHIẾN DỊCH FLASH SALE (KÈM DANH SÁCH SẢN PHẨM SALE)
// =========================================================================
async function insertFlashSale(req, res) {
  const {
    name,
    start_time,
    end_time,
    status = 1,
    products = [], // Mảng chứa sản phẩm sale: [{ product_id, flash_sale_price, flash_sale_stock }]
  } = req.body;

  if (!name || !start_time || !end_time) {
    return res
      .status(400)
      .json({
        message: "Vui lòng nhập đầy đủ tên, thời gian bắt đầu và kết thúc!",
      });
  }

  const transaction = await db.sequelize.transaction();
  try {
    // 1. Tạo campaign Flash Sale tổng trước
    const newFlashSale = await db.FlashSales.create(
      { name, start_time, end_time, status },
      { transaction },
    );

    const createdProducts = [];

    // 2. Duyệt qua mảng sản phẩm đính kèm để thêm vào bảng trung gian bằng SQL thuần (Giống cách viết ở file gốc của bạn)
    for (const item of products) {
      // Kiểm tra sản phẩm gốc có tồn tại không
      const productExists = await db.products.findByPk(item.product_id, {
        transaction,
      });
      if (!productExists) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            message: `Sản phẩm với ID ${item.product_id} không tồn tại!`,
          });
      }

      // Insert sản phẩm vào bảng flashsaleproducts
      await db.sequelize.query(
        `INSERT INTO flashsaleproducts 
        (flash_sale_id, product_id, flash_sale_price, flash_sale_stock, flash_sale_sold, created_at, updated_at) 
        VALUES (:flash_sale_id, :product_id, :flash_sale_price, :flash_sale_stock, 0, NOW(), NOW())`,
        {
          replacements: {
            flash_sale_id: newFlashSale.id,
            product_id: item.product_id,
            flash_sale_price: item.flash_sale_price,
            flash_sale_stock: item.flash_sale_stock,
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction,
        },
      );

      createdProducts.push(item);
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Tạo chương trình Flash Sale thành công",
      data: {
        ...newFlashSale.get({ plain: true }),
        products: createdProducts,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({
        message: "Lỗi hệ thống khi tạo Flash Sale",
        error: error.message,
      });
  }
}

// =========================================================================
// 4. CẬP NHẬT CHIẾN DỊCH FLASH SALE VÀ SẢN PHẨM CHI TIẾT
// =========================================================================
async function updateFlashSale(req, res) {
  const { id } = req.params;
  const { name, start_time, end_time, status, products = [] } = req.body;

  try {
    const flashSale = await db.FlashSales.findByPk(id);
    if (!flashSale) {
      return res
        .status(404)
        .json({ message: "Chương trình Flash Sale không tồn tại" });
    }

    const transaction = await db.sequelize.transaction();
    try {
      // 1. Cập nhật thông tin cơ bản của chiến dịch
      await flashSale.update(
        { name, start_time, end_time, status },
        { transaction },
      );

      // 2. Nếu frontend gửi danh sách sản phẩm mới, xóa danh sách cũ đi và nạp lại
      if (products.length > 0) {
        await db.sequelize.query(
          "DELETE FROM flashsaleproducts WHERE flash_sale_id = :flash_sale_id",
          {
            replacements: { flash_sale_id: id },
            type: db.sequelize.QueryTypes.DELETE,
            transaction,
          },
        );

        for (const item of products) {
          await db.sequelize.query(
            `INSERT INTO flashsaleproducts 
            (flash_sale_id, product_id, flash_sale_price, flash_sale_stock, flash_sale_sold, created_at, updated_at) 
            VALUES (:flash_sale_id, :product_id, :flash_sale_price, :flash_sale_stock, :flash_sale_sold, NOW(), NOW())`,
            {
              replacements: {
                flash_sale_id: id,
                product_id: item.product_id,
                flash_sale_price: item.flash_sale_price,
                flash_sale_stock: item.flash_sale_stock,
                flash_sale_sold: item.flash_sale_sold || 0,
              },
              type: db.sequelize.QueryTypes.INSERT,
              transaction,
            },
          );
        }
      }

      await transaction.commit();
      return res
        .status(200)
        .json({ message: "Cập nhật chương trình Flash Sale thành công" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật Flash Sale", error: error.message });
  }
}

// =========================================================================
// 5. XÓA CHƯƠNG TRÌNH FLASH SALE (Xóa luôn các sản phẩm thuộc chương trình đó)
// =========================================================================
async function deleteFlashSale(req, res) {
  const { id } = req.params;

  try {
    const flashSale = await db.FlashSales.findByPk(id);
    if (!flashSale) {
      return res
        .status(404)
        .json({ message: "Chương trình Flash Sale không tồn tại" });
    }

    const transaction = await db.sequelize.transaction();
    try {
      // Xóa các sản phẩm liên kết trong bảng trung gian trước
      await db.sequelize.query(
        "DELETE FROM flashsaleproducts WHERE flash_sale_id = :flash_sale_id",
        {
          replacements: { flash_sale_id: id },
          type: db.sequelize.QueryTypes.DELETE,
          transaction,
        },
      );

      // Xóa chiến dịch chính
      await flashSale.destroy({ transaction });

      await transaction.commit();
      return res
        .status(200)
        .json({ message: "Xóa chương trình Flash Sale thành công" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa Flash Sale", error: error.message });
  }
}

module.exports = {
  getFlashSales,
  getFlashSaleById,
  insertFlashSale,
  updateFlashSale,
  deleteFlashSale,
};
