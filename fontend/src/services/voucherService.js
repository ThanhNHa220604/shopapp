import api from "./api";

const voucherService = {
  // =========================================================================
  // 1. DÀNH CHO CLIENT (NGƯỜI MUA)
  // =========================================================================

  // Áp dụng thử mã voucher tại Cart/Checkout
  applyVoucher: async (dataBody) => {
    const { data } = await api.post("/vouchers/apply", dataBody);
    return data;
  },

  // Lấy danh sách Voucher khả dụng cho 1 sản phẩm
  getVouchersForProduct: async (productId) => {
    const { data } = await api.get(
      `/vouchers/applicable-products/${productId}`,
    );
    // Bóc tách an toàn (tránh undefined nếu API trả về mảng trực tiếp)
    return data?.data || data || [];
  },

  // 🟢 Lưu mã giảm giá vào tài khoản User
  saveVoucher: async (voucherId) => {
    // Gửi cả voucherId và voucher_id để đáp ứng mọi kiểu đọc của Backend
    const { data } = await api.post("/vouchers/save", {
      voucherId: voucherId,
      voucher_id: voucherId,
    });
    return data;
  },

  // 🟢 Lấy danh sách các voucher mà User đã lưu (Bóc tách an toàn)
  getUserSavedVouchers: async () => {
    const { data } = await api.get("/vouchers/user-saved");
    // Nếu data.data tồn tại thì lấy, không thì lấy data (tránh trả về undefined)
    return data?.data || data || [];
  },

  // 🟢 Alias (bí danh) cho getUserSavedVouchers
  getUserVouchers: async () => {
    const { data } = await api.get("/vouchers/user-saved");
    return data?.data || data || [];
  },

  // =========================================================================
  // 2. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN & MANAGER)
  // =========================================================================

  getVouchers: async (params) => {
    const { data } = await api.get("/vouchers", { params });
    return data;
  },

  getVoucherById: async (id) => {
    const { data } = await api.get(`/vouchers/${id}`);
    return data?.data || data;
  },

  getVoucherUsages: async (id, params) => {
    const { data } = await api.get(`/vouchers/${id}/usages`, { params });
    return data;
  },

  createVoucher: async (dataBody) => {
    const { data } = await api.post("/vouchers", dataBody);
    return data;
  },

  deleteVoucher: async (id) => {
    const { data } = await api.delete(`/vouchers/${id}`);
    return data;
  },
};

export default voucherService;
