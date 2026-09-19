const db = require("../models");

// 🌟 Vì chỉ cần 1 dòng cấu hình duy nhất cho toàn hệ thống, luôn cố định
// id = 1 (singleton pattern) — tránh trường hợp lỡ tạo nhiều dòng khác
// nhau rồi không biết dòng nào là "cấu hình thật".
async function getOrCreateSettings() {
  const [settings] = await db.settings.findOrCreate({
    where: { id: 1 },
    defaults: {},
  });
  return settings;
}

// GET /api/settings — ai cũng gọi được (để hiển thị phí ship, trạng
// thái bảo trì... cho khách hàng)
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings — chỉ Admin/Manager được gọi (chặn ở route bằng
// middleware, xem settingRoutes.js)
exports.updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    await settings.update(req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật cài đặt thành công!",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};