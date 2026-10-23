import api from "./api";

const orderService = {
  // Lấy tất cả danh sách carts từ hệ thống
  getCarts: async () => {
    const response = await api.get("/carts");
    return response.data;
  },

  // Lấy thông tin chi tiết một cart theo id cụ thể
  getCartById: async (id) => {
    const response = await api.get(`/carts/${id}`);
    return response.data;
  },

  // Tạo mới một giỏ hàng (Cart)
  createCart: async (data) => {
    const response = await api.post("/carts", data);
    return response.data;
  },

  // Thêm một mặt hàng mới (Item) vào trong giỏ hàng
  addCartItem: async (data) => {
    const response = await api.post("/cart-items", data);
    return response.data;
  },

  // Cập nhật số lượng hoặc thuộc tính của mặt hàng trong giỏ
  updateCartItem: async (id, data) => {
    const response = await api.put(`/cart-items/${id}`, data);
    return response.data;
  },

  // Xóa bỏ hoàn toàn một mặt hàng ra khỏi giỏ hàng
  deleteCartItem: async (id) => {
    const response = await api.delete(`/cart-items/${id}`);
    return response.data;
  },

  // =========================================================================
  // THANH TOÁN (CHECKOUT CART & MUA NGAY)
  // Tổng tiền do SERVER tự tính, không gửi `total` lên.
  //
  // 1. Mua từ giỏ hàng:
  //    { cart_id, payment_method, phone, address, note, user_id, voucher_code }
  //
  // 2. Mua ngay (trực tiếp sản phẩm):
  //    { product_id, variant_id, quantity, payment_method, phone, address, note,
  //      user_id, voucher_code }
  //
  // payment_method: "cod" | "momo" | "bank"
  //
  // Backend trả về dạng { message, data: {...} }, trong đó:
  //  - MoMo: data.paymentUrl        -> chuyển hướng sang trang MoMo
  //  - Bank: data.qrImageUrl, ...   -> hiện QR chuyển khoản
  //  - COD : data.order_id          -> báo đặt hàng thành công
  // =========================================================================
  checkoutCart: async (data) => {
    const response = await api.post("/carts/checkout", data);
    return response.data;
  },

  // Hỏi server xem giao dịch MoMo đã thanh toán chưa (server sẽ query MoMo)
  // momoOrderId dạng "DH17_1730000000000" lấy từ query string MoMo redirect về
  verifyMomo: async (momoOrderId) => {
    const response = await api.get("/momo/verify", {
      params: { orderId: momoOrderId },
    });
    return response.data; // { status, is_paid }
  },

  // Lấy tất cả danh sách Đơn hàng (Orders)
  getOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  // Lấy thông tin chi tiết một Đơn hàng cụ thể bao gồm cả các sản phẩm đã mua
  getOrderDetail: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
