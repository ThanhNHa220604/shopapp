const Sequelize = require("sequelize");
const db = require("../models");
const Op = Sequelize.Op;

// =========================================================================
// 1. LẤY DANH SÁCH SẢN PHẨM (Tích hợp kiểm tra Flash Sale)
// =========================================================================
async function getProducts(req, res) {
  const {
    search = "",
    page = 1,
    category,
    all,
    pageSize: customPageSize,
    user_id,
  } = req.query;

  const isViewAll = all === "true";
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const pageSize = isViewAll ? null : parseInt(customPageSize) || 15;
  const offset = isViewAll ? null : (parsedPage - 1) * pageSize;

  let whereClause = { is_deleted: 0 };

  const parsedUserId = user_id ? parseInt(user_id) : null;
  if (parsedUserId) {
    whereClause.user_id = parsedUserId;
  }

  if (search.trim() !== "") {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (category && category.trim() !== "") {
    const cleanCategory = category.trim().toLowerCase().replace(/s$/, "");
    const categoryRecord = await db.categories.findOne({
      where: { name: { [Op.like]: `%${cleanCategory}%` } },
    });
    if (categoryRecord) {
      whereClause.category_id = categoryRecord.id;
    } else {
      return res.status(200).json({
        data: [],
        total: 0,
        page: parsedPage,
        pageSize: pageSize || 0,
      });
    }
  }

  try {
    const now = new Date(); // Thời gian hiện tại để so sánh Flash Sale

    // 🔑 QUAN TRỌNG: Thêm `distinct: true` để Sequelize tính đúng số lượng sản phẩm khi JOIN các bảng Flash Sale
    const { rows: products, count: total } = await db.products.findAndCountAll({
      where: whereClause,
      distinct: true, // 🌟 Khắc phục lỗi đếm sai tổng số bản ghi do INNER/LEFT JOIN
      limit: pageSize || undefined,
      offset: offset || undefined,
      order: [["id", "DESC"]],
      include: [
        { model: db.categories, as: "category", attributes: ["name"] },
        { model: db.brands, as: "brand", attributes: ["name"] },
        {
          model: db.flash_sale_products || db.FlashSaleProducts,
          as: "flash_sale_products",
          required: false,
          include: [
            {
              model: db.flash_sales || db.FlashSales,
              as: "flash_sale",
              where: {
                status: 1,
                start_time: { [Op.lte]: now },
                end_time: { [Op.gte]: now },
              },
              required: false,
            },
          ],
        },
      ],
    });

    // Format lại dữ liệu sản phẩm
    const formattedProducts = products.map((p) => {
      const prodJSON = p.toJSON ? p.toJSON() : p;

      const activeSaleProduct = prodJSON.flash_sale_products?.find(
        (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
      );

      if (activeSaleProduct) {
        prodJSON.is_flash_sale = true;
        prodJSON.flash_sale_price = parseFloat(
          activeSaleProduct.flash_sale_price,
        );
        prodJSON.flash_sale_stock = activeSaleProduct.flash_sale_stock;
      } else {
        prodJSON.is_flash_sale = false;
        prodJSON.flash_sale_price = null;
      }

      return prodJSON;
    });

    return res.status(200).json({
      data: formattedProducts,
      total: total,
      page: parsedPage,
      pageSize: pageSize || total,
      totalPages: Math.ceil(total / (pageSize || total)) || 1,
    });
  } catch (error) {
    if (error.message.includes("Unknown column") && user_id) {
      try {
        const { rows: allProducts } = await db.products.findAndCountAll({
          where: { is_deleted: 0 },
          order: [["id", "DESC"]],
          include: [
            { model: db.categories, as: "category", attributes: ["name"] },
            { model: db.brands, as: "brand", attributes: ["name"] },
          ],
        });

        const filteredProducts = allProducts.filter(
          (p) => p.user_id == user_id || !p.user_id,
        );

        return res.status(200).json({
          data: filteredProducts,
          total: filteredProducts.length,
          page: 1,
          pageSize: filteredProducts.length,
          totalPages: 1,
        });
      } catch (innerErr) {
        return res.status(500).json({ error: innerErr.message });
      }
    }
    return res.status(500).json({ error: error.message });
  }
}

// =========================================================================
// 1.5. LẤY SẢN PHẨM CỦA MANAGER ĐANG ĐĂNG NHẬP (dùng cho chọn SP áp voucher, v.v.)
//      - ADMIN: lấy tất cả sản phẩm
//      - MANAGER: chỉ lấy sản phẩm do chính họ đăng (user_id = req.user.id)
//      req.user được gắn bởi middleware requireRoles (đọc từ JWT), KHÔNG tin
//      vào bất kỳ user_id nào client tự gửi lên qua query/body.
// =========================================================================
function resolveRoleStr(user) {
  const raw =
    user.role ??
    user.role_id ??
    user.roleId ??
    user.Role?.name ??
    user.Role?.id ??
    user.role_name;
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

async function getMyProducts(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Không thể xác thực người dùng" });
    }

    const roleStr = resolveRoleStr(currentUser);
    // Theo hệ thống thực tế: ADMIN = 3, MANAGER = 2, USER = 1
    const isAdmin = roleStr === "3" || roleStr === "ADMIN";

    const { search = "" } = req.query;
    let whereClause = { is_deleted: 0 };

    if (!isAdmin) {
      whereClause.user_id = currentUser.id;
    }

    if (search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const products = await db.products.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      include: [
        { model: db.categories, as: "category", attributes: ["name"] },
        { model: db.brands, as: "brand", attributes: ["name"] },
      ],
    });

    return res.status(200).json({
      data: products,
      total: products.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// =========================================================================
// 2. LẤY CHI TIẾT MỘT SẢN PHẨM (Đã cập nhật kiểm tra Flash Sale)
// =========================================================================
async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const now = new Date(); // Lấy thời gian hiện tại

    const product = await db.products.findByPk(id, {
      include: [
        {
          model: db.product_image,
          as: "product_image",
          attributes: [
            "id",
            "product_id",
            "imageurl",
            ["created_at", "created_at"],
            ["updated_at", "updated_at"],
          ],
        },
        {
          model: db.ProductAttributes,
          as: "ProductAttributes",
          attributes: [
            "id",
            "product_id",
            "attribute_id",
            "value",
            ["created_at", "created_at"],
            ["updated_at", "updated_at"],
          ],
          include: [
            {
              model: db.Attributes || db.attributes,
              attributes: ["id", "name", "created_at", "updated_at"],
            },
          ],
        },
        {
          model:
            db.product_variant_values ||
            db.ProductVariantValues ||
            db.productVariantValues,
          as: "product_variant_values",
          attributes: [
            "id",
            "product_id",
            "price",
            "old_price",
            "stock",
            "sku",
            "image_url",
            ["created_at", "created_at"],
            ["updated_at", "updated_at"],
          ],
        },
        // 🌟 NÂNG CẤP QUAN TRỌNG: Include thông tin Flash Sale vào Chi Tiết Sản Phẩm
        {
          model: db.flash_sale_products || db.FlashSaleProducts,
          as: "flash_sale_products",
          required: false,
          include: [
            {
              model: db.flash_sales || db.FlashSales,
              as: "flash_sale",
              where: {
                status: 1, // Chiến dịch kích hoạt
                start_time: { [Op.lte]: now }, // Đã đến giờ chạy
                end_time: { [Op.gte]: now }, // Chưa hết giờ
              },
              required: false,
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Chuyển instance Sequelize về dạng JSON thuần
    const productData = product.toJSON();

    // Tìm kiếm chiến dịch Flash Sale hợp lệ nhất
    const activeSaleProduct = productData.flash_sale_products?.find(
      (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
    );

    if (activeSaleProduct) {
      productData.is_flash_sale = true;
      productData.flash_sale_price = parseFloat(
        activeSaleProduct.flash_sale_price,
      );
      productData.flash_sale_stock = activeSaleProduct.flash_sale_stock;
      productData.flash_sale_sold = activeSaleProduct.flash_sale_sold;
    } else {
      productData.is_flash_sale = false;
      productData.flash_sale_price = null;
    }

    return res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: productData,
    });
  } catch (error) {
    console.error("====== LỖI LẤY CHI TIẾT SẢN PHẨM ======");
    console.error(error);
    console.error("=========================================");

    return res.status(500).json({
      message: "Lỗi liên kết dữ liệu cấu trúc include",
      error: error.message,
    });
  }
}

// =========================================================================
// 3. XÓA (ẨN) SẢN PHẨM — SOFT DELETE
//    Không xóa cứng khỏi DB nữa. Chỉ đánh dấu is_deleted = 1 để sản phẩm
//    biến mất khỏi trang bán hàng / danh sách quản lý, trong khi đơn hàng
//    cũ vẫn tham chiếu được đầy đủ thông tin sản phẩm (product_id không
//    còn bị lỗi do bản ghi gốc vẫn tồn tại, cùng ProductAttributes,
//    product_variant_values, product_image, ...).
// =========================================================================
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const product = await db.products.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (product.is_deleted) {
      return res
        .status(400)
        .json({ message: "Sản phẩm đã ở trạng thái ẩn/ngừng bán" });
    }

    await product.update({ is_deleted: 1 });

    return res
      .status(200)
      .json({ message: "Đã ẩn/ngừng bán sản phẩm thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi ẩn sản phẩm", error: error.message });
  }
}

// =========================================================================
// 3.5. KHÔI PHỤC SẢN PHẨM ĐÃ ẨN
//      Dùng cho trang "Thùng rác" / danh sách sản phẩm đã ngừng bán, để
//      manager/admin đưa sản phẩm quay lại trang bán hàng.
// =========================================================================
async function restoreProduct(req, res) {
  const { id } = req.params;
  try {
    const product = await db.products.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (!product.is_deleted) {
      return res
        .status(400)
        .json({ message: "Sản phẩm hiện không ở trạng thái đã ẩn" });
    }

    await product.update({ is_deleted: 0 });

    return res
      .status(200)
      .json({ message: "Đã khôi phục sản phẩm thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi khôi phục sản phẩm", error: error.message });
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
    brand_name, // Nhận brand_name từ frontend gửi lên
    category_name, // Nhận category_name từ frontend gửi lên
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
      // 1. XỬ LÝ TỰ ĐỘNG TẠO BRAND NẾU NGƯỜI DÙNG NHẬP NAME MỚI
      if (brand_name && brand_name.trim() !== "") {
        // findOrCreate: Tìm xem tên brand này có chưa, chưa có thì tự tạo mới trong database
        const [newBrand] = await db.brands.findOrCreate({
          where: { name: brand_name.trim() },
          transaction,
        });
        // Sau khi tìm hoặc tạo thành công, gán ID của brand đó vào data để chuẩn bị update sản phẩm
        productData.brand_id = newBrand.id;
      } else if (req.body.brand_id) {
        // Nếu không gửi name mà gửi brand_id có sẵn, giữ nguyên brand_id
        productData.brand_id = req.body.brand_id;
      }

      // 2. XỬ LÝ TỰ ĐỘNG TẠO CATEGORY NẾU NGƯỜI DÙNG NHẬP NAME MỚI
      if (category_name && category_name.trim() !== "") {
        const [newCategory] = await db.categories.findOrCreate({
          where: { name: category_name.trim() },
          transaction,
        });
        productData.category_id = newCategory.id;
      } else if (req.body.category_id) {
        productData.category_id = req.body.category_id;
      }

      // 3. TIẾN HÀNH CẬP NHẬT SẢN PHẨM (Lúc này brand_id chắc chắn đã là một con số, không lo bị null)
      await product.update({ name, ...productData }, { transaction });

      // --- Giữ nguyên logic xử lý attributes cũ của bạn ---
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

      // --- Giữ nguyên logic xử lý variant_values cũ của bạn ---
      if (variant_values.length > 0) {
        await db.product_variant_values.destroy({
          where: { product_id: id },
          transaction,
        });

        let totalStock = 0; // 🌟 Tổng kho sẽ được tính lại từ chính các biến thể

        for (const variantData of variant_values) {
          // 🌟 SỬA LỖI GỐC: KHÔNG tra cứu ID qua bảng "variant_values" cũ
          // nữa (findOne theo từng giá trị) — bảng đó chỉ có vài dòng
          // seed cũ ("128GB","Đen"...), nên bất kỳ Size/Color mới nào
          // (vd "Standard","Đỏ") đều không tìm thấy, bị bỏ qua âm thầm,
          // khiến SKU cuối cùng chỉ còn sót lại ID số của những giá trị
          // trùng ngẫu nhiên với dữ liệu cũ (đây chính là nguyên nhân
          // gây ra SKU sai như "2", "13" thay vì "Standard-Đen").
          // Giờ lưu thẳng chuỗi Size-Color làm SKU, không qua ID nào cả.
          const combinationParts = Array.isArray(
            variantData.variant_combination,
          )
            ? variantData.variant_combination
                .map((v) => String(v).trim())
                .filter(Boolean)
            : [];
          const sku =
            combinationParts.length > 0
              ? combinationParts.join("-")
              : `variant-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          const stock = Number(variantData.stock) || 0;
          totalStock += stock;

          await db.product_variant_values.create(
            {
              product_id: id,
              price: variantData.price,
              old_price: variantData.old_price || null,
              stock,
              sku,
              // 🌟 THÊM: trước đây field này bị bỏ sót hoàn toàn khi tạo
              // record, khiến ảnh riêng của biến thể không bao giờ được
              // lưu vào DB dù frontend đã gửi đúng.
              image_url: variantData.image_url || null,
            },
            { transaction },
          );
        }

        // 🌟 Ghi đè tổng kho của sản phẩm bằng tổng thật vừa tính từ
        // các biến thể — không dùng giá trị "quanity" client gửi lên,
        // để tránh lệch số khi tăng/giảm số lượng từng biến thể.
        await product.update({ quanity: totalStock }, { transaction });
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
async function insertProduct(req, res) {
  console.log("====== DATA FRONTEND CỦA MANAGER GỬI LÊN ======");
  console.log(req.body);
  console.log("====================================");

  const {
    attributes = [],
    variants = [],
    variant_values = [],
    name,
    price,
    oldprice,
    image,
    description,
    specification,
    buyturn,
    quanity,
    category_id,
    brand_id,
    brand_name,
    category_name,
    user_id, // Đã thêm: Nhận user_id từ body Frontend gửi lên
  } = req.body;

  try {
    // 1. CHUẨN HÓA CATEGORY
    let finalCategoryId = category_id;
    if (!finalCategoryId && category_name) {
      const [category] = await db.categories.findOrCreate({
        where: { name: category_name.trim() },
        defaults: { image: "" },
      });
      finalCategoryId = category.id;
    } else {
      const categoryExists = await db.categories.findByPk(finalCategoryId);
      if (!categoryExists)
        return res
          .status(400)
          .json({ message: `Category ID ${finalCategoryId} không tồn tại` });
    }

    // 2. CHUẨN HÓA BRAND
    let finalBrandId = brand_id;
    if (!finalBrandId && brand_name) {
      const [brand] = await db.brands.findOrCreate({
        where: { name: brand_name.trim() },
      });
      finalBrandId = brand.id;
    } else {
      const brandExists = await db.brands.findByPk(finalBrandId);
      if (!brandExists)
        return res
          .status(400)
          .json({ message: `Brand ID ${finalBrandId} không tồn tại` });
    }

    // 3. KIỂM TRA TRÙNG TÊN SẢN PHẨM
    const productExists = await db.products.findOne({ where: { name } });
    if (productExists)
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });

    // 4. KHỞI TẠO TRANSACTION
    const transaction = await db.sequelize.transaction();
    try {
      const product = await db.products.create(
        {
          name,
          price,
          oldprice,
          image,
          description,
          specification,
          buyturn,
          quanity,
          category_id: finalCategoryId,
          brand_id: finalBrandId,
          user_id, // Đã thêm: Ghi nhận ID người tạo sản phẩm vào Database
        },
        { transaction },
      );

      const createdAttributes = [];

      // 5. XỬ LÝ THÔNG SỐ KỸ THUẬT (SQL THUẦN)
      for (const attributeData of attributes) {
        const attrName = attributeData.name.trim();

        const [existingAttribute] = await db.sequelize.query(
          "SELECT id FROM attributes WHERE name = :name LIMIT 1",
          {
            replacements: { name: attrName },
            type: db.sequelize.QueryTypes.SELECT,
            transaction,
          },
        );

        let attributeId;
        if (existingAttribute) {
          attributeId = existingAttribute.id;
        } else {
          const [insertedAttributeId] = await db.sequelize.query(
            "INSERT INTO attributes (name, created_at, updated_at) VALUES (:name, NOW(), NOW())",
            {
              replacements: { name: attrName },
              type: db.sequelize.QueryTypes.INSERT,
              transaction,
            },
          );
          attributeId = insertedAttributeId;
        }

        await db.sequelize.query(
          "INSERT INTO productattributes (product_id, attribute_id, value, created_at, updated_at) VALUES (:product_id, :attribute_id, :value, NOW(), NOW())",
          {
            replacements: {
              product_id: product.id,
              attribute_id: attributeId,
              value: attributeData.value,
            },
            type: db.sequelize.QueryTypes.INSERT,
            transaction,
          },
        );

        createdAttributes.push({
          name: attrName,
          value: attributeData.value,
        });
      }

      // 6. XỬ LÝ CẤU HÌNH BIẾN THỂ (SQL THUẦN)
      const valueToIdMap = new Map();
      for (const variant of variants) {
        const variantName = variant.name.trim();

        const [existingVariant] = await db.sequelize.query(
          "SELECT id FROM variants WHERE name = :name LIMIT 1",
          {
            replacements: { name: variantName },
            type: db.sequelize.QueryTypes.SELECT,
            transaction,
          },
        );

        let variantId;
        if (existingVariant) {
          variantId = existingVariant.id;
        } else {
          const [insertedVariantId] = await db.sequelize.query(
            "INSERT INTO variants (name, created_at, updated_at) VALUES (:name, NOW(), NOW())",
            {
              replacements: { name: variantName },
              type: db.sequelize.QueryTypes.INSERT,
              transaction,
            },
          );
          variantId = insertedVariantId;
        }

        for (const value of variant.values) {
          const valTrim = value.trim();

          const [existingValue] = await db.sequelize.query(
            "SELECT id FROM variant_values WHERE value = :value AND variant_id = :variant_id LIMIT 1",
            {
              replacements: { value: valTrim, variant_id: variantId },
              type: db.sequelize.QueryTypes.SELECT,
              transaction,
            },
          );

          let variantValueId;
          if (existingValue) {
            variantValueId = existingValue.id;
          } else {
            const [insertedValueId] = await db.variant_values
              .create(
                { value: valTrim, variant_id: variantId },
                { transaction },
              )
              .then((res) => [res.id]);
            variantValueId = insertedValueId;
          }

          valueToIdMap.set(`${variantName}:${valTrim}`, variantValueId);
        }
      }

      // 7. XỬ LÝ SẢN PHẨM BIẾN THỂ VÀ HÌNH ẢNH RIÊNG (Lưu chữ thay vì ID số)
      const createdVariantValues = [];
      for (const variantData of variant_values) {
        const sku = variantData.variant_combination
          .map((str) => str.trim().replace(/\s+/g, ""))
          .join("-");

        const createdVariant = await db.product_variant_values.create(
          {
            product_id: product.id,
            price: variantData.price,
            old_price: variantData.old_price || null,
            stock: variantData.stock || 0,
            sku,
            image_url: variantData.image_url || null,
          },
          { transaction },
        );

        createdVariantValues.push({
          id: createdVariant.id,
          sku,
          price: createdVariant.price,
          old_price: createdVariant.old_price,
          stock: createdVariant.stock,
          image_url: createdVariant.image_url,
        });
      }

      await transaction.commit();

      return res.status(201).json({
        message: "Manager đã thêm mới sản phẩm thành công",
        data: {
          ...product.get({ plain: true }),
          attributes: createdAttributes,
          product_variant_values: createdVariantValues,
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi thêm hàng", error: error.message });
  }
}


async function getDeletedProducts(req, res) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Không thể xác thực người dùng" });
    }

    const { search = "" } = req.query;
    // 🌟 Luôn lọc theo user_id của người đăng, kể cả admin — mỗi người
    // chỉ thấy sản phẩm đã ẩn do chính mình đăng, không xem chéo được.
    let whereClause = { is_deleted: 1, user_id: currentUser.id };

    if (search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const products = await db.products.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      include: [
        { model: db.categories, as: "category", attributes: ["name"] },
        { model: db.brands, as: "brand", attributes: ["name"] },
      ],
    });

    return res.status(200).json({
      data: products,
      total: products.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProducts,
  getMyProducts,
  getProductById,
  insertProduct,
  deleteProduct,
  restoreProduct,
  updateProduct,
  getDeletedProducts,
};