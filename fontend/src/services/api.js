import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 Tự động gắn token vào mỗi request (Kiểm tra cả 'token' lẫn 'accessToken')
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Tự động xử lý lỗi Token hết hạn (Bắt cả mã 401 và quét chữ "expired")
api.interceptors.response.use(
  (response) => {
    // Trường hợp Backend trả về HTTP 200 kèm object lỗi ngầm
    const data = response.data;
    if (
      data &&
      (data.message?.includes("expired") || data.error?.includes("expired"))
    ) {
      handleForceLogout();
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message || error.response?.data?.error || "";

    // Bắt lỗi khi mã trạng thái là 401 HOẶC backend trả về lỗi chứa chữ "expired"
    if (
      status === 401 ||
      errorMessage.toLowerCase().includes("expired") ||
      error.message?.includes("expired")
    ) {
      handleForceLogout();
    }
    return Promise.reject(error);
  },
);

// 🟢 Hàm dùng chung để xóa bộ nhớ và đẩy về trang đăng nhập
const handleForceLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken"); // Xóa thêm key này
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  if (window.location.pathname !== "/login") {
    alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
    window.location.href = "/login";
  }
};

export default api;
