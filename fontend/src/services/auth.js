import api from "./api";

const ROLE_MAP = {
  1: "user",
  2: "manager",
  3: "admin",
};

const authService = {
  // 1. Hàm đăng nhập hệ thống
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);
    const { user, token } = response.data.data;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.removeItem("cart_id"); // 🔥 XÓA ĐỂ TRÁNH LẪN LỘN GIỎ HÀNG GIỮA CÁC USER ĐĂNG NHẬP
    }

    if (user?.role !== undefined) {
      const roleStr = ROLE_MAP[user.role] || "user";
      localStorage.setItem("role", roleStr);
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  // 2. Hàm đăng ký tài khoản
  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  // 3. Hàm cập nhật thông tin người dùng
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // 4. Hàm đăng xuất hệ thống sạch sẽ
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("cart_id");
  },

  // 🌟 5. HÀM KIỂM TRA XEM ĐÃ ĐĂNG NHẬP CHƯA (SỬA LỖI CRASH Ở APP.JS)
  isAuthenticated: () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return !!token; // Trả về true nếu có token, ngược lại trả về false
  },

  // 🌟 6. HÀM LẤY ROLE (CHỮ) ĐÃ ĐƯỢC BỔ SUNG ĐỂ HEADER VÀ APP GỌI
  getRole: () => {
    return localStorage.getItem("role"); // Sẽ trả về "admin", "manager", hoặc "user"
  },

  // 🌟 7. HÀM LẤY THÔNG TIN USER DẠNG OBJECT
  getUser: () => {
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
};

export default authService;
