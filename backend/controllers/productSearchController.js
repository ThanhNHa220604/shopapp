import { getImageVector, cosineSimilarity } from "../helpers/vectorHelper.js";
import db from "../models/index.js";

export const searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ảnh sản phẩm!",
      });
    }

    // 1. Chuyển file ảnh user upload thành Vector
    const queryVector = await getImageVector(req.file.buffer);

    // 2. Lấy đúng Model products từ db (khắc phục lỗi db.Product undefined)
    const ProductModel = db.products || db.Product;

    if (!ProductModel) {
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy Model sản phẩm trong Database!",
      });
    }

    // Lấy các sản phẩm đã có image_vector
    const products = await ProductModel.findAll({
      where: db.Sequelize
        ? db.Sequelize.literal("image_vector IS NOT NULL")
        : {},
    });

    // 3. Tính độ tương đồng Cosine
    const scoredProducts = products
      .map((product) => {
        const prodData = product.toJSON ? product.toJSON() : product;

        if (!prodData.image_vector) return null;

        // Ép kiểu an toàn cho Vector
        let productVector;
        try {
          productVector =
            typeof prodData.image_vector === "string"
              ? JSON.parse(prodData.image_vector)
              : prodData.image_vector;
        } catch (e) {
          return null;
        }

        if (!Array.isArray(productVector)) return null;

        const similarity = cosineSimilarity(queryVector, productVector);

        return {
          ...prodData,
          similarity: parseFloat((similarity * 100).toFixed(2)), // Đổi ra %
        };
      })
      .filter(Boolean); // Lọc bỏ các sản phẩm bị null/lỗi vector

    // 4. Sắp xếp % giảm dần & lấy Top 5
    scoredProducts.sort((a, b) => b.similarity - a.similarity);
    const topMatches = scoredProducts.slice(0, 5);

    return res.status(200).json({
      success: true,
      count: topMatches.length,
      data: topMatches,
    });
  } catch (error) {
    console.error("Lỗi chi tiết khi tìm kiếm bằng hình ảnh:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra phía Server",
      error: error.message,
    });
  }
};
