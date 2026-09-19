import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    "",
  );

let socket = null;

/**
 * Tạo (hoặc trả về) 1 kết nối Socket.io DUY NHẤT cho cả app, dùng chung
 * cho mọi hội thoại. Chỉ gọi khi user đã đăng nhập (có token).
 */
export function getChatSocket() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  } else {
    // token có thể đã đổi (login lại) -> cập nhật auth rồi reconnect
    socket.auth = { token: `Bearer ${token}` };
    socket.connect();
  }

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
