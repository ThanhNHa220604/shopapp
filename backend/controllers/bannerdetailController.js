const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

export const getBannerDetails = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [bannerDetails, totalBannerDetails] = await Promise.all([
    db.bannerdetail.findAll({
      limit: pageSize,
      offset: offset,
      include: [{ model: db.banners }, { model: db.products }],
    }),
    db.bannerdetail.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách bannerdetail thành công",
    data: bannerDetails,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBannerDetails / pageSize),
    totalBannerDetails,
  });
};

export async function getBannerDetailById(req, res) {
  const { id } = req.params;

  const bannerDetail = await db.bannerdetail.findByPk(id, {
    include: [{ model: db.banners }, { model: db.products }],
  });

  if (!bannerDetail) {
    return res.status(404).json({
      message: "Không tìm thấy bannerdetail",
    });
  }

  return res.status(200).json({
    message: "Lấy bannerdetail thành công",
    data: bannerDetail,
  });
}

export async function insertBannerDetail(req, res) {
  const { product_id, banner_id } = req.body;

  // Check product_id, banner_id tồn tại và trùng lặp cùng lúc
  const [product, banner, existing] = await Promise.all([
    db.products.findByPk(product_id),
    db.banners.findByPk(banner_id),
    db.bannerdetail.findOne({ where: { product_id, banner_id } }),
  ]);

  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  if (!banner) {
    return res.status(404).json({
      message: "Banner không tồn tại",
    });
  }

  if (existing) {
    return res.status(409).json({
      message: "Bannerdetail với product_id và banner_id này đã tồn tại",
    });
  }

  const bannerDetail = await db.bannerdetail.create({ product_id, banner_id });

  return res.status(201).json({
    message: "Thêm mới bannerdetail thành công",
    data: bannerDetail,
  });
}

export async function updateBannerDetail(req, res) {
  const { id } = req.params;
  const { product_id, banner_id } = req.body;

  // Check trùng lặp (loại trừ chính bản ghi đang update)
  const existing = await db.bannerdetail.findOne({
    where: {
      product_id,
      banner_id,
      id: { [db.Sequelize.Op.ne]: id },
    },
  });
  

  if (existing) {
    return res.status(409).json({
      message: "Bannerdetail với product_id và banner_id này đã tồn tại",
    });
  }

  const updated = await db.bannerdetail.update({ product_id, banner_id }, {
    where: { id },
  });

  if (updated[0]) {
    return res.status(200).json({
      message: "Cập nhật bannerdetail thành công",
    });
  }

  return res.status(404).json({
    message: "Bannerdetail không tồn tại",
  });
}

export async function deleteBannerDetail(req, res) {
  const { id } = req.params;

  const deleted = await db.bannerdetail.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa bannerdetail thành công",
    });
  }

  return res.status(404).json({
    message: "Bannerdetail không tồn tại",
  });
}