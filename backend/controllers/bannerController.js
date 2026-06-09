const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;
const path = require("path");
const fs = require("fs");
const { BannerStatus} = require('../constants')

export async function getBanners(req, res) {
  const { search = "", page = 1 } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      name: {
        [Op.like]: `%${search}%`,
      },
    };
  }

  const [banners, totalBanners] = await Promise.all([
    db.banners.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),

    db.banners.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách banner thành công",
    data: banners,
    currentPage: page,
    totalPages: Math.ceil(totalBanners / pageSize),
    totalBanners,
  });
}

export async function getBannerById(req, res) {
  const { id } = req.params;

  const banner = await db.banners.findByPk(id);

  if (!banner) {
    return res.status(404).json({
      message: "Không tìm thấy banner",
    });
  }

  return res.status(200).json({
    message: "Lấy banner thành công",
    data: banner,
  });
}

export async function insertBanner(req, res) {
  const { name, image, status } = req.body;

  // Check for duplicate banner name
  const existingBanner = await db.banners.findOne({
    where: { name: name.trim() },
  });
  if (existingBanner) {
    return res.status(400).json({
      message: "Banner với tên này đã tồn tại",
    });
  }
  const imageName = req.body.image;
  if (!imageName.startsWith("http://") && !imageName.startsWith("https://")) {
    const imagePath = path.join(__dirname, "../uploads", imageName);
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({
        message: "image file does not exist",
      });
    }
  }
  const bannerData = {
    ...req.body,
    status: BannerStatus.ACTIVE
  }
  const banner = await db.banners.create(bannerData)
  return res.status(201).json({
    message: "Thêm mới banner thành công",
    data: banner
  });
}

export async function updateBanner(req, res) {
  const { id } = req.params;
  const { name, image, status } = req.body;

  if (!name || !image || status === undefined) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ name, image, status",
    });
  }

  const existingBanner = await db.banners.findOne({
    where: {
      name,
      id: { [Op.ne]: id },
    },
  });

  if (existingBanner) {
    return res.status(400).json({
      message: "Tên banner đã tồn tại",
    });
  }

  const updated = await db.banners.update(
    { name, image, status },
    { where: { id } },
  );

  if (updated[0]) {
    return res.status(200).json({
      message: "Cập nhật banner thành công",
    });
  }

  return res.status(404).json({
    message: "Banner không tồn tại",
  });
}
export async function deleteBanner(req, res) {
  const { id } = req.params;

  const deleted = await db.banners.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa banner thành công",
    });
  }

  return res.status(404).json({
    message: "Banner không tồn tại",
  });
}
