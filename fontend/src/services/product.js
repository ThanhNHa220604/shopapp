import api from "./api";

const productService = {
  // 🟢 Lấy tất cả sản phẩm (SỬA LẠI: Trả về toàn bộ object phân trang)
  getAllProducts: async (params) => {
    const response = await api.get("/products", { params });
    return response.data; // Trả về { data: [...], total: 33, totalPages: 3, ... }
  },

  // 🟢 Lấy sản phẩm của Manager đang đăng nhập (ADMIN thấy tất cả) - dùng token, không cần truyền user_id
  getMyProducts: async (params) => {
    const { data } = await api.get("/products/manage", { params });
    return data; // { data: [...], total }
  },

  // Lấy chi tiết sản phẩm
  getProductDetail: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  // Lấy danh mục
  getCategories: async () => {
    const { data } = await api.get("/categories");
    return data.data;
  },

  // Lấy thương hiệu
  getBrands: async () => {
    const { data } = await api.get("/brands");
    return data.data;
  },

  // Tạo sản phẩm
  createProduct: async (dataBody) => {
    const { data } = await api.post("/products", dataBody);
    return data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, dataBody) => {
    const { data } = await api.put(`/products/${id}`, dataBody);
    return data;
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};

export default productService;
