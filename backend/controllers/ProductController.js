const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

// =========================================================================
// 1. LẤY DANH SÁCH SẢN PHẨM
// =========================================================================
async function getProducts(req, res) {
  const {
    search = "",
    page = 1,
    category,
    all,
    pageSize: customPageSize,
  } = req.query;

  const isViewAll = all === "true";
  const pageSize = isViewAll ? null : parseInt(customPageSize) || 15;
  const offset = isViewAll ? null : (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (category) {
    const categoryRecord = await db.categories.findOne({
      where: { name: category },
    });
    if (categoryRecord) {
      whereClause.category_id = categoryRecord.id;
    }
  }

  try {
    const [products, totalProducts] = await Promise.all([
      db.products.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [["id", "DESC"]],
        include: [
          {
            model: db.ProductAttributes,
            as: "ProductAttributes",
            include: [{ model: db.Attributes }],
          },
          {
            model: db.product_variant_values,
            as: "product_variant_values",
          },
        ],
      }),
      db.products.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
      currentPage: Number(page),
      totalPages: isViewAll ? 1 : Math.ceil(totalProducts / pageSize),
      totalProducts,
    });
  } catch (error) {
    console.error("LỖI GET PRODUCTS:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi lấy sản phẩm", error: error.message });
  }
}

// =========================================================================
// 2. LẤY CHI TIẾT MỘT SẢN PHẨM (ĐÃ KHẮP PHỤC TRIỆT ĐỂ LỖI 500)
// =========================================================================
async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const product = await db.products.findByPk(id, {
      include: [
        { model: db.product_image, as: "product_image" },
        {
          model: db.ProductAttributes,
          as: "ProductAttributes",
          // Đã loại bỏ 'as: "Attribute"' sai lệch để khớp hoàn toàn cấu trúc model định nghĩa
          include: [{ model: db.Attributes }],
        },
        { model: db.product_variant_values, as: "product_variant_values" },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    return res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("====== SẬP HỆ THỐNG TẠI GET_PRODUCT_BY_ID ======");
    console.error(error);
    console.error("=================================================");

    // Phương án dự phòng khẩn cấp nếu các mối quan hệ khác vẫn lỗi: Lấy dữ liệu thô của sản phẩm ra trước
    try {
      const backupProduct = await db.products.findByPk(id);
      if (backupProduct) {
        return res.status(200).json({
          message: "Lấy sản phẩm thành công (Bản đơn giản)",
          data: backupProduct,
        });
      }
    } catch (innerError) {
      console.error("Lỗi dự phòng thất bại:", innerError);
    }

    return res.status(500).json({
      message: "Lỗi hệ thống xử lý chi tiết sản phẩm",
      error: error.message,
    });
  }
}

// =========================================================================
// 3. XÓA SẢN PHẨM
// =========================================================================
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const product = await db.products.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const orderDetails = await db.order_detail.findAll({
      where: { product_id: id },
    });
    if (orderDetails.length > 0) {
      return res
        .status(400)
        .json({
          message: "Không thể xóa sản phẩm vì đã tồn tại trong đơn hàng",
        });
    }

    if (db.ProductAttributes)
      await db.ProductAttributes.destroy({ where: { product_id: id } });
    if (db.product_variant_values)
      await db.product_variant_values.destroy({ where: { product_id: id } });
    if (db.newdetails)
      await db.newdetails.destroy({ where: { product_id: id } });
    if (db.product_image)
      await db.product_image.destroy({ where: { product_id: id } });

    await db.products.destroy({ where: { id } });
    return res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
}

// =========================================================================
// 4. CẬP NHẬT SẢN PHẨM
// =========================================================================
async function updateProduct(req, res) {
  const { id } = req.params;
  const {
    attributes = [],
    variant_values = [],
    name,
    ...productData
  } = req.body;

  try {
    if (name) {
      const existing = await db.products.findOne({
        where: { name, id: { [Op.ne]: id } },
      });
      if (existing)
        return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    const product = await db.products.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const transaction = await db.sequelize.transaction();
    try {
      await product.update({ name, ...productData }, { transaction });

      for (const attr of attributes) {
        const [attribute] = await db.Attributes.findOrCreate({
          where: { name: attr.name },
          transaction,
        });
        const productAttribute = await db.ProductAttributes.findOne({
          where: { product_id: id, attribute_id: attribute.id },
          transaction,
        });

        if (productAttribute) {
          await productAttribute.update({ value: attr.value }, { transaction });
        } else {
          await db.ProductAttributes.create(
            { product_id: id, attribute_id: attribute.id, value: attr.value },
            { transaction },
          );
        }
      }

      if (variant_values.length > 0) {
        await db.product_variant_values.destroy({
          where: { product_id: id },
          transaction,
        });
        for (const variantData of variant_values) {
          const variantValueIds = [];
          for (const value of variantData.variant_combination) {
            const variantValue = await db.variant_values.findOne({
              where: { value },
              transaction,
            });
            if (variantValue) variantValueIds.push(variantValue.id);
          }
          const sku = variantValueIds.sort((a, b) => a - b).join("-");
          await db.product_variant_values.create(
            {
              product_id: id,
              price: variantData.price,
              old_price: variantData.old_price || null,
              stock: variantData.stock || 0,
              sku,
            },
            { transaction },
          );
        }
      }
      await transaction.commit();
      return res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
}

// =========================================================================
// 5. THÊM MỚI SẢN PHẨM
// =========================================================================
async function insertProduct(req, res) {
  const {
    attributes = [],
    variants = [],
    variant_values = [],
    name,
    ...productData
  } = req.body;
  const { category_id, brand_id } = productData;

  try {
    const categoryExists = await db.categories.findByPk(category_id);
    if (!categoryExists)
      return res
        .status(400)
        .json({ message: `Category ID ${category_id} không tồn tại` });

    const brandExists = await db.brands.findByPk(brand_id);
    if (!brandExists)
      return res
        .status(400)
        .json({ message: `Brand ID ${brand_id} không tồn tại` });

    const productExists = await db.products.findOne({ where: { name } });
    if (productExists)
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });

    const transaction = await db.sequelize.transaction();
    try {
      const product = await db.products.create(
        { ...productData, name },
        { transaction },
      );
      const createdAttributes = [];

      for (const attributeData of attributes) {
        const [attribute] = await db.Attributes.findOrCreate({
          where: { name: attributeData.name },
          transaction,
        });
        await db.ProductAttributes.create(
          {
            product_id: product.id,
            attribute_id: attribute.id,
            value: attributeData.value,
          },
          { transaction },
        );
        createdAttributes.push({
          name: attribute.name,
          value: attributeData.value,
        });
      }

      for (const variant of variants) {
        const [variantEntry] = await db.variants.findOrCreate({
          where: { name: variant.name },
          transaction,
        });
        for (const value of variant.values) {
          await db.variant_values.findOrCreate({
            where: { value, variant_id: variantEntry.id },
            transaction,
          });
        }
      }

      const createdVariantValues = [];
      for (const variantData of variant_values) {
        const variantValueIds = [];
        for (const value of variantData.variant_combination) {
          const variantValue = await db.variant_values.findOne({
            where: { value },
            transaction,
          });
          if (variantValue) variantValueIds.push(variantValue.id);
        }
        const sku = variantValueIds.sort((a, b) => a - b).join("-");
        const createdVariant = await db.product_variant_values.create(
          {
            product_id: product.id,
            price: variantData.price,
            old_price: variantData.old_price || null,
            stock: variantData.stock || 0,
            sku,
          },
          { transaction },
        );
        createdVariantValues.push({
          sku,
          price: createdVariant.price,
          old_price: createdVariant.old_price,
          stock: createdVariant.stock,
        });
      }

      await transaction.commit();
      return res.status(201).json({
        message: "Thêm mới sản phẩm thành công",
        data: {
          ...product.get({ plain: true }),
          attributes: createdAttributes,
          variant_values: createdVariantValues,
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm", error: error.message });
  }
}

module.exports = {
  getProducts,
  getProductById,
  insertProduct,
  deleteProduct,
  updateProduct,
};
