import api from "./api";
import axios from "axios";

const axiosInstance = axios.create({
 baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Interceptor: Tự động gắn Token vào Header của mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

const chatService = {
  // Khách hàng bắt đầu hỏi/phàn nàn về 1 sản phẩm trong 1 đơn hàng đã đặt
  // thành công (không giới hạn theo trạng thái đơn)
  startConversation: async ({ order_id, product_id, content }) => {
    const { data } = await api.post("/chat/conversations", {
      order_id,
      product_id,
      content,
    });
    return data.data; // { conversation, firstMessage }
  },

  // Danh sách hội thoại của user hiện tại (khách hàng hoặc shop)
  getConversations: async () => {
    const { data } = await api.get("/chat/conversations");
    return data.data;
  },

  // Lịch sử tin nhắn của 1 hội thoại
  getMessages: async (conversationId, { beforeId, limit = 30 } = {}) => {
    const { data } = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      { params: { beforeId, limit } },
    );
    return data.data;
  },

  // Gửi tin nhắn qua REST (dùng khi socket chưa kết nối kịp, fallback)
  sendMessageRest: async (conversationId, payload) => {
  // Nếu payload là FormData (có đính kèm ảnh)
  if (payload instanceof FormData) {
    const response = await axiosInstance.post(
      `/chat/conversations/${conversationId}/messages`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  }

  // Nếu payload là chuỗi văn bản thông thường
  const response = await axiosInstance.post(
    `/chat/conversations/${conversationId}/messages`,
    { content: payload }
  );
  return response.data.data;
},
};

export default chatService;