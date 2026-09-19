const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

export async function getBrands(req, res) {
  try {
    const { search = "", page = 1, pageSize: queryPageSize, limit } = req.query;

    // Ưu tiên lấy limit hoặc pageSize từ Frontend truyền lên. 
    // Nếu Frontend không truyền, mặc định sẽ lấy hẳn 100 item/trang thay vì 5 như trước.
    const pageSize = parseInt(limit || queryPageSize || 100, 10);
    const currentPage = parseInt(page, 10) || 1;
    const offset = (currentPage - 1) * pageSize;

    let whereClause = {};

    if (search && search.trim() !== "") {
      whereClause = {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      };
    }

    const queryOptions = {
      where: whereClause,
    };

    // Nếu kích thước trang hợp lệ thì mới áp dụng phân trang, tránh lỗi database
    if (pageSize > 0) {
      queryOptions.limit = pageSize;
      queryOptions.offset = offset;
    }

    const [brands, totalBrands] = await Promise.all([
      db.brands.findAll(queryOptions),
      db.brands.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách thương hiệu thành công",
      data: brands,
      currentPage: currentPage,
      totalPages: pageSize > 0 ? Math.ceil(totalBrands / pageSize) : 1,
      totalBrands,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã có lỗi xảy ra",
      error: error.message,
    });
  }
}
export async function getBrandById(req, res) {
  const { id } = req.params;

  const brand = await db.brands.findByPk(id);

  if (!brand) {
    return res.status(404).json({
      message: "Không tìm thấy brand",
    });
  }

  return res.status(200).json({
    message: "Lấy brand thành công",
    data: brand,
  });
}

export async function insertBrand(req, res) {
  try {
    console.log(req.body);

    // findOrCreate sẽ tìm theo tên, nếu không thấy mới tiến hành INSERT
    const [brand, created] = await db.brands.findOrCreate({
      where: { name: req.body.name },
      defaults: req.body, // Các trường dữ liệu bổ sung nếu tạo mới (nếu có)
    });

    if (created) {
      console.log("Thêm brand mới thành công:", brand.toJSON());
    } else {
      console.log("Brand đã tồn tại, lấy bản ghi có sẵn:", brand.toJSON());
    }

    return res.status(200).json({
      message: created
        ? "Thêm mới brand thành công"
        : "Thương hiệu đã tồn tại trong hệ thống",
      data: brand,
    });
  } catch (error) {
    console.error("Lỗi xử lý insertBrand:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi ở server",
      error: error.message,
    });
  }
}

export async function updateBrand(req, res) {
  const { id } = req.params;
  const { name, status } = req.body;

  // 🔒 check trùng name (nếu có gửi lên)
  if (name) {
    const existingBrand = await db.brands.findOne({
      where: {
        name,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existingBrand) {
      return res.status(400).json({
        message: "Tên brand đã tồn tại",
      });
    }
  }
  const updateData = {};
  if (name) updateData.name = name;
  if (status !== undefined) updateData.status = status;

  const updated = await db.brands.update(updateData, {
    where: { id },
  });

  if (updated[0]) {
    return res.status(200).json({
      message: "Update brand thành công",
    });
  }

  return res.status(404).json({
    message: "Brand không tồn tại",
  });
}

export async function deleteBrand(req, res) {
  res.status(200).json({
    message: "Xóa brand thành công",
  });
}
