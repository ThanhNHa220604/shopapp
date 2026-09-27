import { getImageVector } from "./helpers/vectorHelper.js";
import db from "./models/index.js";

async function generateAllVectors() {
  try {
    const ProductModel = db.products || db.Product;

    if (!ProductModel) {
      console.error("❌ Không tìm thấy Model Sản phẩm!");
      process.exit(1);
    }

    console.log("Đang lấy danh sách sản phẩm chưa có vector...");

    const productsList = await ProductModel.findAll({
      where: db.Sequelize
        ? db.Sequelize.literal("image_vector IS NULL")
        : { image_vector: null },
    });

    console.log(`Tìm thấy ${productsList.length} sản phẩm cần xử lý...`);

    for (const prod of productsList) {
      console.log(`Đang xử lý SP ID: ${prod.id}...`);

      // SỬA TẠI ĐÂY: Thay prod.image_url thành prod.image
      const imageSource = prod.image;

      // Nếu là URL online (http://...) thì giữ nguyên, nếu là path local thì tạo URL chuẩn hoặc path
      const fullImagePath = imageSource.startsWith("http")
        ? imageSource
        : `http://localhost:3000/${imageSource}`; // Thay port/domain backend của bạn vào nếu cần

      const vector = await getImageVector(fullImagePath);
      

      // Cập nhật Vector vào MySQL
      await prod.update({
        image_vector: JSON.stringify(vector),
      });

      console.log(`=> ✅ Đã tạo xong Vector cho SP ID ${prod.id}`);
    }

    console.log("✨ Cập nhật thành công toàn bộ Vector!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi chạy script:", error);
    process.exit(1);
  }
}

generateAllVectors();
