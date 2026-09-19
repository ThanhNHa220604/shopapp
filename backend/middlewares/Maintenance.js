const db = require("../models");

/**
 * Middleware kiểm tra "Chế độ bảo trì". Áp dụng cho các route công
 * khai (khách hàng xem sản phẩm, đặt hàng...) — KHÔNG áp dụng cho các
 * route Admin/Manager để họ vẫn đăng nhập tắt bảo trì được.
 *
 * Cách dùng trong app.js hoặc router chính:
 *   const { checkMaintenanceMode } = require("./middlewares/maintenance");
 *   app.use("/api/products", checkMaintenanceMode, productRoutes);
 *   app.use("/api/orders", checkMaintenanceMode, orderRoutes);
 */
exports.checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await db.settings.findOne({ where: { id: 1 } });

    if (settings?.maintenance_mode) {
      return res.status(503).json({
        success: false,
        message: "Hệ thống đang bảo trì, vui lòng quay lại sau.",
      });
    }

    next();
  } catch (error) {
    // Nếu lỗi khi kiểm tra bảo trì, không nên chặn cả hệ thống —
    // cho request đi tiếp bình thường thay vì báo lỗi 500 oan.
    console.error("Lỗi kiểm tra chế độ bảo trì:", error);
    next();
  }
};
