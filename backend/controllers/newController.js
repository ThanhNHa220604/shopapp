const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

export async function getNews(req, res) {
  const { search = "", page = 1 } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        {
          title: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          content: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };
  }

  const [news, totalNews] = await Promise.all([
    db.news.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),

    db.news.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "lấy danh sách tin tức thành công",
    data: news,
    currentPage: page,
    totalPages: Math.ceil(totalNews / pageSize),
    totalNews,
  });
}

export async function getNewsById(req, res) {
  const { id } = req.params;

  const news = await db.news.findByPk(id);

  if (!news) {
    return res.status(404).json({
      message: "Không tìm thấy tin tức",
    });
  }

  return res.status(200).json({
    message: "Lấy tin tức thành công",
    data: news,
  });
}

export async function insertNewsArticle(req, res) {
  const transaction = await db.sequelize.transaction();

  try {
    const newsArticle = await db.news.create(req.body, { transaction });

    const productIds = req.body.product_ids;

    if (productIds && productIds.length) {
      const validProducts = await db.products.findAll({
        where: {
          id: productIds,
        },
        transaction,
      });

      // extract valid ids
      const validProductIds = validProducts.map((product) => product.id);

      // filter invalid ids
      const filteredProductIds = productIds.filter((id) =>
        validProductIds.includes(id),
      );

      const newsDetailPromises = filteredProductIds.map((product_id) =>
        db.newdetail.create(
          {
            product_id: product_id,
            new_id: newsArticle.id,
          },
          { transaction },
        ),
      );

      await Promise.all(newsDetailPromises);
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Thêm mới bài báo thành công",
      data: newsArticle,
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      message: "Không thể thêm bài báo mới",
      error: error.message,
    });
  }
}

export async function updateNews(req, res) {
  const { id } = req.params;
  const { title, content, image } = req.body;

  // 🔒 title không được để trống
  if (title !== undefined && title.trim() === "") {
    return res.status(400).json({
      message: "title không được để trống",
    });
  }

  // 🔥 check trùng title (trừ chính nó)
  if (title) {
    const existing = await db.news.findOne({
      where: {
        title,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tiêu đề đã tồn tại",
      });
    }
  }

  // ✅ update động
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (image !== undefined) updateData.image = image;

  const updated = await db.news.update(updateData, {
    where: { id },
  });

  if (updated[0]) {
    return res.status(200).json({
      message: "Cập nhật news thành công",
    });
  }

  return res.status(404).json({
    message: "News không tồn tại",
  });
}

export async function deleteNews(req, res) {
  const { id } = req.params;

  const transaction = await db.sequelize.transaction();

  try {
    // Xóa newdetail liên quan trước
    await db.newdetail.destroy({
      where: { new_id: id },
      transaction,
    });

    // Xóa news
    const deleted = await db.news.destroy({
      where: { id },
      transaction,
    });

    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Tin tức không tồn tại",
      });
    }
    await transaction.commit();
    return res.status(200).json({
      message: "Xóa tin tức thành công",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "lỗi khi xóa tin tức",
      error: error.message,
    });
  }
}
