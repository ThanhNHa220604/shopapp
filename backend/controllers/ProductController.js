"use strict";
const Sequelize = require("sequelize");
const path = require("path");
const db = require("../models");
const { getImageVector } = require("../helpers/vectorHelper.js");
const Op = Sequelize.Op;
const ExcelJS = require('exceljs');

// Chuyển web path kiểu "/uploads/xxx.jfif" (client dùng để hiển thị ảnh)
// thành đường dẫn thật trên ổ đĩa (khớp với chỗ express.static mount
// "/uploads" -> thư mục "uploads" ở root backend, xem server.js).
function resolveUploadPath(webPath) {
  if (!webPath || typeof webPath !== "string") return null;
  const relative = webPath.replace(/^\/?uploads\//, "");
  return path.join(__dirname, "..", "uploads", relative);
}

// Sinh image_vector từ 1 đường dẫn ảnh, KHÔNG throw ra ngoài — nếu model AI
// lỗi (timeout, ảnh hỏng...) thì trả về null, để không chặn việc tạo/sửa
// sản phẩm chỉ vì bước AI phụ trợ này gặp sự cố.
async function safeGenerateImageVector(webPath) {
  const absolutePath = resolveUploadPath(webPath);
  if (!absolutePath) return null;

  try {
    const vector = await getImageVector(absolutePath);
    return JSON.stringify(vector);
  } catch (err) {
    console.error(`Lỗi sinh image_vector cho ảnh "${webPath}":`, err.message);
    return null;
  }
}

// =========================================================================
// 1. LẤY DANH SÁCH SẢN PHẨM (Tích hợp kiểm tra Flash Sale)
// =========================================================================
async function getProducts(req, res) {
  const {
    search = "",
    page = 1,
    category,
    all,
    pageSize: customPageSize,
    user_id,
  } = req.query;

  const isViewAll = all === "true";
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const pageSize = isViewAll ? null : parseInt(customPageSize) || 15;
  const offset = isViewAll ? null : (parsedPage - 1) * pageSize;

  let whereClause = { is_deleted: 0 };

  const parsedUserId = user_id ? parseInt(user_id) : null;
  if (parsedUserId) {
    whereClause.user_id = parsedUserId;
  }

  if (search.trim() !== "") {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (category && category.trim() !== "") {
    const cleanCategory = category.trim().toLowerCase().replace(/s$/, "");
    const categoryRecord = await db.categories.findOne({
      where: { name: { [Op.like]: `%${cleanCategory}%` } },
    });
    if (categoryRecord) {
      whereClause.category_id = categoryRecord.id;
    } else {
      return res.status(200).json({
        data: [],
        total: 0,
        page: parsedPage,
        pageSize: pageSize || 0,
      });
    }
  }

  try {
    const now = new Date(); // Thời gian hiện tại để so sánh Flash Sale

    // 🔑 QUAN TRỌNG: Thêm `distinct: true` để Sequelize tính đúng số lượng sản phẩm khi JOIN các bảng Flash Sale
    const { rows: products, count: total } = await db.products.findAndCountAll({
      where: whereClause,
      distinct: true, // 🌟 Khắc phục lỗi đếm sai tổng số bản ghi do INNER/LEFT JOIN
      limit: pageSize || undefined,
      offset: offset || undefined,
      order: [["id", "DESC"]],
      include: [
        { model: db.categories, as: "category", attributes: ["name"] },
        { model: db.brands, as: "brand", attributes: ["name"] },
        {
          model: db.flash_sale_products || db.FlashSaleProducts,
          as: "flash_sale_products",
          required: false,
          include: [
            {
              model: db.flash_sales || db.FlashSales,
              as: "flash_sale",
              where: {
                status: 1,
                start_time: { [Op.lte]: now },
                end_time: { [Op.gte]: now },
              },
              required: false,
            },
          ],
        },
      ],
    });

    // Format lại dữ liệu sản phẩm
    const formattedProducts = products.map((p) => {
      const prodJSON = p.toJSON ? p.toJSON() : p;

      const activeSaleProduct = prodJSON.flash_sale_products?.find(
        (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
      );

      if (activeSaleProduct) {
        prodJSON.is_flash_sale = true;
        prodJSON.flash_sale_price = parseFloat(
          activeSaleProduct.flash_sale_price,
        );
        prodJSON.flash_sale_stock = activeSaleProduct.flash_sale_stock;
      } else {
        prodJSON.is_flash_sale = false;
        prodJSON.flash_sale_price = null;
      }

      return prodJSON;
    });

    return res.status(200).json({
      data: formattedProducts,
      total: total,
      page: parsedPage,
      pageSize: pageSize || total,
      totalPages: Math.ceil(total / (pageSize || total)) || 1,
    });
  } catch (error) {
    if (error.message.includes("Unknown column") && user_id) {
      try {
        const { rows: allProducts } = await db.products.findAndCountAll({
          where: { is_deleted: 0 },
          order: [["id", "DESC"]],
          include: [
            { model: db.categories, as: "category", attributes: ["name"] },
            { model: db.brands, as: "brand", attributes: ["name"] },
          ],
        });

        const filteredProducts = allProducts.filter(
          (p) => p.user_id == user_id || !p.user_id,
        );

        return res.status(200).json({
          data: filteredProducts,
          total: filteredProducts.length,
          page: 1,
          pageSize: filteredProducts.length,
          totalPages: 1,
        });
      } catch (innerErr) {
        return res.status(500).json({ error: innerErr.message });
      }
    }
    return res.status(500).json({ error: error.message });
  }
}

// =========================================================================
// Export products to Excel (NEW)
// =========================================================================
async function exportProducts(req, res) {
  try {
    const products = await db.products.findAll({
      where: { is_deleted: 0 },
      attributes: ["id", "name", "price", "quanity", "buyturn"],
      order: [["id", "DESC"]],
      raw: true,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Sold', key: 'sold', width: 12 },
      { header: 'Remaining', key: 'remaining', width: 14 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 18 },
      { header: 'Total Value (Sold+Remaining)', key: 'totalValue', width: 22 },
      { header: 'Remaining Value', key: 'remainingValue', width: 18 },
    ];

    for (const p of products) {
      const price = Number(p.price || 0);
      const sold = Number(p.buyturn || 0);
      const remaining = Number(p.quanity || 0);
      const totalRevenue = sold * price;
      const totalValue = (sold + remaining) * price;
      const remainingValue = remaining * price;

      sheet.addRow({
        id: p.id,
        name: p.name,
        price,
        sold,
        remaining,
        totalRevenue,
        totalValue,
        remainingValue,
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    return res.status(500).json({ message: 'Lỗi xuất Excel', error: error.message });
  }
}

// =========================================================================
// 1.5. LẤY SẢN PHẨM CỦA MANAGER ĐANG ĐĂNG NHẬP (dùng cho chọn SP áp voucher, v.v.)
//      - ADMIN: lấy tất cả sản phẩm
//      - MANAGER: chỉ lấy sản phẩm do chính họ đăng (user_id = req.user.id)
//      req.user được gắn bởi middleware requireRoles (đọc từ JWT), KHÔNG tin
//      vào bất kỳ user_id nào client tự gửi lên qua query/body.
// =========================================================================
function resolveRoleStr(user) {
  const raw =
    user.role ??
    user.role_id ??
    user.roleId ??
    user.Role?.name ??
    user.Role?.id ??
    user.role_name;
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

async function getMyProducts(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Không thể xác thực người dùng" });
    }

    const roleStr = resolveRoleStr(currentUser);
    // Theo hệ thống thực tế: ADMIN = 3, MANAGER = 2, USER = 1
    const isAdmin = roleStr === "3" || roleStr === "ADMIN";

    const { search = "" } = req.query;
    let whereClause = { is_deleted: 0 };

    if (!isAdmin) {
      whereClause.user_id = currentUser.id;
    }

    if (search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const products = await db.products.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      include: [
        { model: db.categories, as: "category", attributes: ["name"] },
        { model: db.brands, as: "brand", attributes: ["name"] },
      ],
    });

    return res.status(200).json({
      data: products,
      total: products.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ... rest of file unchanged (kept original implementations) ...
