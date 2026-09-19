const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;
const { getAvatarURL} = require("../helpers/imageHelper")

export async function getCategories(req, res) {
  const { search = "", page = 1 } = req.query;

  const pageSize = 20;

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

  const [categories, totalCategories] = await Promise.all([
    db.categories.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),

    db.categories.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "lấy danh mục thành công",
    data: categories.map((category) => ({
      ...category.get({ plain: true }),
      image: getAvatarURL(category.image),
    })),
    currentPage: page,
    totalPages: Math.ceil(totalCategories / pageSize),
    total: totalCategories,
  });
}

export async function getCategoryById(req, res) {
  const { id } = req.params;

  const category = await db.categories.findByPk(id);

  if (!category) {
    return res.status(404).json({
      message: "Không tìm thấy category",
    });
  }

  return res.status(200).json({
    message: "Lấy category thành công",
    data: category,
  });
}

export async function insertCategory(req, res) {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Tên danh mục không được để trống",
    });
  }

  // 🌟 SỬA LỖI: dùng findOrCreate thay vì create() thẳng — nếu danh
  // mục đã tồn tại (trùng tên), trả về bản ghi đã có sẵn thay vì báo
  // lỗi "Duplicate entry". Điều này xử lý đúng cả trường hợp frontend
  // gửi lại tên 1 danh mục vừa tạo ở nơi khác trong cùng phiên làm
  // việc, mà danh sách categories trên trình duyệt chưa kịp cập nhật.
  const [category, created] = await db.categories.findOrCreate({
    where: { name: name.trim() },
    defaults: { ...req.body, name: name.trim() },
  });

  console.log(
    created
      ? "Thêm category mới thành công:"
      : "Category đã tồn tại, dùng lại bản ghi cũ:",
    category.toJSON(),
  );

  return res.status(200).json({
    message: created
      ? "Thêm mới category thành công"
      : "Danh mục đã tồn tại, đã sử dụng lại danh mục có sẵn",
    data: category,
  });
}

export async function updateCategory(req, res) {
  const id = parseInt(req.params.id);
  const { name, image } = req.body;

  const category = await db.categories.findByPk(id);

  if (!category) {
    return res.status(404).json({
      message: "Danh mục không tồn tại",
    });
  }

  if (name !== undefined) {
    const existingCategory = await db.categories.findOne({
      where: {
        name: name,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại",
      });
    }
  }

  await category.update({
    name: name ?? category.name,
    image: image ?? category.image,
  });

  return res.status(200).json({
    message: "Cập nhật danh mục thành công",
    data: category,
  });
}


export async function deleteCategory(req, res) {
  const { id } = req.params;

  const deleted = await db.Category.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa danh mục thành công",
    });
  }

  return res.status(404).json({
    message: "Danh mục không tồn tại",
  });
}