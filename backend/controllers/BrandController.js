const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

export async function getBrands(req, res) {
  const { search = "", page = 1 } = req.query;

  const pageSize = 5;

  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
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

  const [brands, totalBrands] = await Promise.all([
    db.brands.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),

    db.brands.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách thương hiệu thành công",
    data: brands,
    currentPage: page,
    totalPages: Math.ceil(totalBrands / pageSize),
    totalBrands,
  });
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
  console.log(req.body);
  const brand = await db.brands.create(req.body);

  console.log("Thêm brand thành công:", brand.toJSON());

  return res.status(200).json({
    message: "Thêm mới brand thành công",
    data: brand,
  });
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
