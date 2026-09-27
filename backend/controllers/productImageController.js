const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

// 🔹 GET ALL + search + pagination
export async function getProductImages(req, res) {
  const { search = "", page = 1 } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        {
          image: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };
  }

  const [images, total] = await Promise.all([
    db.product_image.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      include: [{model: db.products, as:'product'}] //include product information in the response
    }),
    db.product_image.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách ảnh sản phẩm thành công",
    data: images,
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

// 🔹 GET BY ID
export async function getProductImageById(req, res) {
  const { id } = req.params;

  const imageurl = await db.product_image.findByPk(id);

  if (!imageurl) {
    return res.status(404).json({
      message: "Không tìm thấy ảnh sản phẩm",
    });
  }

  return res.status(200).json({
    message: "Lấy ảnh sản phẩm thành công",
    data: imageurl,
  });
}

// 🔹 INSERT
export async function insertProductImage(req, res) {
  const { product_id, imageurl } = req.body;

  // ✅ check product tồn tại
  const product = await db.products.findByPk(product_id);
  if (!product) {
    return res.status(400).json({
      message: "Product không tồn tại",
    });
  }

  // ✅ check trùng product_id + imageurl
  const existingImage = await db.product_image.findOne({
    where: {
      product_id,
      imageurl,
    },
  });

  if (existingImage) {
    return res.status(400).json({
      message: "Ảnh này đã tồn tại cho sản phẩm này",
    });
  }

  // ✅ tạo mới
  const newImage = await db.product_image.create({
    product_id,
    imageurl,
  });

  return res.status(200).json({
    message: "Thêm ảnh sản phẩm thành công",
    data: newImage,
  });
}
/*
// 🔹 UPDATE
export async function updateProductImage(req, res) {
  const id = parseInt(req.params.id);
  const { product_id, image } = req.body;

  const productImage = await db.product_images.findByPk(id);

  if (!productImage) {
    return res.status(404).json({
      message: "Ảnh sản phẩm không tồn tại",
    });
  }

  // ✅ BONUS: chỉ check nếu có gửi product_id
  if (product_id !== undefined) {
    const product = await db.products.findByPk(product_id);
    if (!product) {
      return res.status(400).json({
        message: "Product không tồn tại",
      });
    }
  }

  await productImage.update({
    product_id: product_id ?? productImage.product_id,
    image: image ?? productImage.image,
  });

  return res.status(200).json({
    message: "Cập nhật ảnh sản phẩm thành công",
    data: productImage,
  });
}
*/
// 🔹 DELETE
export async function deleteProductImage(req, res) {
  const { id } = req.params;

  const deleted = await db.product_image.destroy({
    where: { id },
  });

  if (deleted) {
    return res.status(200).json({
      message: "Xóa ảnh sản phẩm thành công",
    });
  }

  return res.status(404).json({
    message: "Ảnh sản phẩm không tồn tại",
  });
}
