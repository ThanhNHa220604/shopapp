import api from "./api";

const settingService = {
  /**
   * Lấy cấu hình hệ thống hiện tại — công khai, không cần đăng nhập
   * (dùng để hiển thị phí ship, kiểm tra trạng thái bảo trì...).
   */
  getSettings: async () => {
    const res = await api.get("/setting");
    return res.data.data; // trả thẳng object cấu hình, bỏ lớp { success, data }
  },

  /**
   * Cập nhật cấu hình — chỉ Admin/Manager (đã đăng nhập, token tự
   * đính kèm qua interceptor của `api`, xem file api.js).
   * @param {object} payload - các field muốn đổi, ví dụ:
   *   { theme: "dark", shipping_fee: 20000, maintenance_mode: true }
   */
  updateSettings: async (payload) => {
    const res = await api.put("/setting", payload);
    return res.data;
  },
};

export default settingService;