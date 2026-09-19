// File: src/services/cart.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/cart-items";

// Hàm lấy config đã được tối ưu bảo mật và chống nuốt chuỗi rác
const getAuthConfig = () => {
  let token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  // Khử các chuỗi rác hệ thống hay tự động ép kiểu string bậy bạ
  if (!token || token === "undefined" || token === "null") {
    token = null;
  }

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Chỉ thêm khi token thực sự tồn tại
    },
  };
};

const cartService = {
  // 1. THÊM VÀO GIỎ HÀNG (POST /api/cart-items) - ĐÃ ĐỒNG BỘ THEO CỘT 'QUANITY' CỦA DB
  addToCart: async (data) => {
    try {
      const cartId = localStorage.getItem("cart_id");

      const pId = data?.productId || data?.product_id;
      const qty = data?.quantity || data?.quanity || data?.qty || 1;
      const vId =
        data?.productVariantValueId || data?.product_variant_value_id || null;

      // 🔥 Chỉ gửi đúng trường 'quanity' theo cấu hình Database của bạn
      const bodyData = {
        product_id: Number(pId),
        quanity: Number(qty),
      };

      // Xử lý gửi cart_id bắt buộc để vượt qua Middleware Validate
      if (cartId && cartId !== "undefined" && cartId !== "null") {
        bodyData.cart_id = Number(cartId);
      } else {
        bodyData.cart_id = 0; // Gửi số 0 tạm thời nếu chưa có giỏ hàng vãng lai
      }

      // Đính kèm ID biến thể nếu có
      if (vId !== null && vId !== undefined && vId !== "") {
        bodyData.product_variant_value_id = Number(vId);
      }

      console.log(
        "🚀 [Frontend] Gửi payload đồng bộ DB lên Backend:",
        bodyData,
      );

      const response = await axios.post(
        `${API_URL}`,
        bodyData,
        getAuthConfig(),
      );

      // Cập nhật lại cart_id chuẩn do Backend phản hồi
      if (response.data && response.data.cart_id) {
        localStorage.setItem("cart_id", response.data.cart_id);
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi tại cartService.addToCart:", error);
      throw error;
    }
  },

  // 2. LẤY GIỎ HÀNG
  getCartItems: async (cart_id) => {
    try {
      let token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (token === "undefined" || token === "null") token = null;

      // Bảo vệ: Nếu ko token cũng ko có cả cart_id vãng lai thì trả mảng rỗng luôn, đỡ tốn request lỗi 404/400
      if (
        !token &&
        (!cart_id || cart_id === "undefined" || cart_id === "null")
      ) {
        return [];
      }

      let url = token ? `${API_URL}` : `${API_URL}/carts/${cart_id}`;
      const response = await axios.get(url, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error("Lỗi tại cartService.getCartItems:", error);
      throw error;
    }
  },

  // 3. CẬP NHẬT SỐ LƯỢNG
  updateCartItem: async (id, payload) => {
    try {
      let qty = 1;
      if (payload && typeof payload === "object") {
        qty =
          payload.quantity !== undefined
            ? payload.quantity
            : payload.quanity !== undefined
              ? payload.quanity
              : 1;
      } else if (payload !== undefined && payload !== null) {
        qty = payload;
      }

      const bodyData = {
        quanity: Number(qty),
        quantity: Number(qty),
      };

      const response = await axios.put(
        `${API_URL}/${id}`,
        bodyData,
        getAuthConfig(),
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi tại cartService.updateCartItem:", error);
      throw error;
    }
  },

  // 4. XÓA MẶT HÀNG KHỎI GIỎ
  deleteCartItem: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      return response.data;
    } catch (error) {
      console.error("Lỗi tại cartService.deleteCartItem:", error);
      throw error;
    }
  },
};

export default cartService;
