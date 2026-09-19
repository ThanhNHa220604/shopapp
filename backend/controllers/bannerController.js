const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;
const path = require("path");
const fs = require("fs");
const { BannerStatus } = require("../constants");

// 🟢 1. LẤY DANH SÁCH BANNERS (KÈM SẢN PHẨM)
export async function getBanners(req, res) {
  const { search = "", page = 1, isAdmin = "false" } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (isAdmin === "true") {
    if (req.query.status !== undefined) {
      whereClause.status = Number(req.query.status);
    }
  } else {
    // 🟢 SỬA TẠI ĐÂY: Lọc thời gian chính xác cho CLIENT (Trang chủ)
    const now = new Date();

    whereClause[Op.or] = [
      // Trường hợp 1: Trạng thái Hoạt động (1) -> Lấy bình thường
      { status: BannerStatus.ACTIVE },

      // Trường hợp 2: Trạng thái Lên lịch (2) -> Chỉ lấy nếu thời gian hiện tại nằm giữa start_time và end_time
      {
        status: BannerStatus.SCHEDULED || 2,
        start_time: { [Op.lte]: now }, // start_time <= bây giờ
        end_time: { [Op.gte]: now }, // end_time >= bây giờ
      },
    ];
  }

  if (search.trim() !== "") {
    whereClause.name = {
      [Op.like]: `%${search}%`,
    };
  }

  try {
    const [banners, totalBanners] = await Promise.all([
      db.banners.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: db.bannerdetail,
            include: [
              {
                model: db.products || db.Product || db.product,
              },
            ],
          },
        ],
      }),

      db.banners.count({
        where: whereClause,
      }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách banner thành công",
      data: banners,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBanners / pageSize),
      totalBanners,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách banner",
      error: error.message,
    });
  }
}



// 🟢 2. LẤY CHI TIẾT BANNER THEO ID (KÈM SẢN PHẨM)
export async function getBannerById(req, res) {
  const { id } = req.params;

  try {
    const banner = await db.banners.findByPk(id, {
      include: [
        {
          model: db.bannerdetail,
          include: [
            {
              model: db.products || db.Product || db.product,
            },
          ],
        },
      ],
    });

    if (!banner) {
      return res.status(404).json({
        message: "Không tìm thấy banner",
      });
    }

    return res.status(200).json({
      message: "Lấy banner thành công",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy chi tiết banner",
      error: error.message,
    });
  }
}

// 🟢 3. THÊM MỚI BANNER (VÀ LẤY VỀ RESPONSE ĐẦY ĐỦ)
export async function insertBanner(req, res) {
  // 🟢 Bổ sung start_time và end_time vào req.body
  const { name, image, status, product_ids, start_time, end_time } = req.body;

  if (!name || !image || status === undefined) {
    return res.status(400).json({
      message: "Vui lòng điền đầy đủ thông tin Tên, Hình ảnh và Trạng thái!",
    });
  }

  const existingBanner = await db.banners.findOne({
    where: { name: name.trim() },
  });
  if (existingBanner) {
    return res.status(400).json({
      message: "Banner với tên này đã tồn tại",
    });
  }

  const imageName = image;
  if (!imageName.startsWith("http://") && !imageName.startsWith("https://")) {
    const imagePath = path.join(__dirname, "../uploads", imageName);
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({
        message: "image file does not exist",
      });
    }
  }

  const bannerData = {
    name: name.trim(),
    image: image,
    status: status !== undefined ? Number(status) : BannerStatus.ACTIVE,
    // 🟢 Lưu thời gian hẹn giờ
    start_time: start_time ? new Date(start_time) : null,
    end_time: end_time ? new Date(end_time) : null,
  };

  const banner = await db.banners.create(bannerData);

  if (Array.isArray(product_ids) && product_ids.length > 0) {
    const bannerDetailsData = product_ids.map((prodId) => ({
      banner_id: banner.id,
      product_id: prodId,
    }));

    if (db.bannerdetail) {
      await db.bannerdetail.bulkCreate(bannerDetailsData);
    }
  }

  const createdBanner = await db.banners.findByPk(banner.id, {
    include: [
      {
        model: db.bannerdetail,
        include: [{ model: db.products || db.Product || db.product }],
      },
    ],
  });

  return res.status(201).json({
    message: "Thêm mới banner thành công",
    data: createdBanner,
  });
}

// 🟢 4. CẬP NHẬT BANNER (CÓ CẬP NHẬT LẠI DANH SÁCH SẢN PHẨM)
export async function updateBanner(req, res) {
  const { id } = req.params;
  // 🟢 Bổ sung start_time và end_time vào req.body
  const { name, image, status, product_ids, start_time, end_time } = req.body;

  if (!name || !image || status === undefined) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ name, image, status",
    });
  }

  const existingBanner = await db.banners.findOne({
    where: {
      name: name.trim(),
      id: { [Op.ne]: id },
    },
  });

  if (existingBanner) {
    return res.status(400).json({
      message: "Tên banner đã tồn tại",
    });
  }

  const updated = await db.banners.update(
    {
      name: name.trim(),
      image,
      status: Number(status),
      // 🟢 Cập nhật start_time và end_time
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
    },
    { where: { id } },
  );

  if (updated[0]) {
    if (Array.isArray(product_ids) && db.bannerdetail) {
      await db.bannerdetail.destroy({ where: { banner_id: id } });

      if (product_ids.length > 0) {
        const bannerDetailsData = product_ids.map((prodId) => ({
          banner_id: Number(id),
          product_id: prodId,
        }));
        await db.bannerdetail.bulkCreate(bannerDetailsData);
      }
    }

    return res.status(200).json({
      message: "Cập nhật banner thành công",
    });
  }

  return res.status(404).json({
    message: "Banner không tồn tại",
  });
}

// 🟢 5. XÓA BANNER (XÓA LUÔN CHI TIẾT SẢN PHẨM TRONG BẢNG TRUNG GIAN)
export async function deleteBanner(req, res) {
  const { id } = req.params;

  // Xóa bản ghi ở bảng trung gian trước
  if (db.bannerdetail) {
    await db.bannerdetail.destroy({ where: { banner_id: id } });
  }

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
