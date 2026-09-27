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
  // CHUẨN HÓA: THANH TOÁN (CHECKOUT CART & MUA NGAY)
  // =========================================================================
  // Nhận nguyên vẹn object `data` từ Component (không gán giá trị mặc định):
  //
  // 1. Nếu Mua từ Giỏ hàng:
  // { cart_id, total, payment_method, phone, address, note }
  //
  // 2. Nếu Mua ngay (Trực tiếp sản phẩm):
  // { product_id, variant_id, quantity, total, payment_method, phone, address, note }
  // =========================================================================
  checkoutCart: async (data) => {
    const response = await api.post("/carts/checkout", data);
    return response.data;
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
