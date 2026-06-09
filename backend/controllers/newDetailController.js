const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

export const getNewsDetails = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [newsDetails, totalNewsDetails] = await Promise.all([
    db.newdetail.findAll({
      limit: pageSize,
      offset: offset,
      include: [{ model: db.news }, { model: db.products }],
    }),
    db.newdetail.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách chi tiết tin tức thành công",
    data: newsDetails,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalNewsDetails / pageSize),
    totalNewsDetails,
  });
};

export async function getNewsDetailById(req, res) {
  const { id } = req.params;
  const newsDetail = await db.newdetail.findByPk(id, {
    include: [{ model: db.news }, { model: db.products }],
  });

  if (!newsDetail) {
    return res.status(404).json({
      message: "Không tìm thấy newsdetail",
    });
  }

  return res.status(200).json({
    message: "Lấy newsdetail thành công",
    data: newsDetail,
  });
}

export async function insertNewsDetail(req, res) {
  const { product_id, new_id } = req.body;

  // Check trùng lặp
  const existing = await db.newdetail.findOne({
    where: { product_id, new_id },
  });
  if (existing) {
    return res.status(409).json({
      message: "Newsdetail với product_id và new_id này đã tồn tại",
    });
  }

  // Check product_id tồn tại
  const product = await db.products.findByPk(product_id);
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  // Check new_id tồn tại
  const news = await db.news.findByPk(new_id);
  if (!news) {
    return res.status(404).json({
      message: "Tin tức không tồn tại",
    });
  }

  const newsDetail = await db.newdetail.create({ product_id, new_id });
  console.log("Thêm newsdetail thành công:", newsDetail.toJSON());

  return res.status(200).json({
    message: "Thêm mới newsdetail thành công",
    data: newsDetail,
  });
}

export async function updateNewsDetail(req, res) {
  const { id } = req.params;
  const { product_id, new_id } = req.body;

  // Check trùng lặp (loại trừ chính bản ghi đang update)
  const existing = await db.newdetail.findOne({
    where: {
      product_id,
      new_id,
      id: { [db.Sequelize.Op.ne]: id }, // khác id hiện tại trừ chính nó ra
    },
  });
  if (existing) {
    return res.status(409).json({
      message: "Newsdetail với product_id và new_id này đã tồn tại",
    });
  }
  const updated = await db.newdetail.update(
    { product_id, new_id },
    {
      where: { id },
    },
  );
  if (updated[0]) {
    return res.status(200).json({
      message: "Cập nhật newsdetail thành công",
    });
  } else {
    return res.status(404).json({
      message: "Newsdetail không tồn tại",
    });
  }
}

export async function deleteNewsDetail(req, res) {
  const { id } = req.params;

  const deleted = await db.newdetail.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa newsdetail thành công",
    });
  } else {
    return res.status(404).json({
      message: "Newsdetail không tồn tại",
    });
  }
}
