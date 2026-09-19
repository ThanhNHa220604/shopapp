const db = require("../models");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Không có token được cung cấp");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Token không hợp lệ");
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  const user = await db.User.findByPk(decoded.id);

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // kiểm tra đổi mật khẩu
  if (
    user.password_changed_at &&
    decoded.iat < new Date(user.password_changed_at).getTime() / 1000
  ) {
    throw new Error("Token không hợp lệ do mật khẩu đã thay đổi");
  }

  return user;
}

/**
 * Lấy và xác thực user từ Socket Connection
 */
async function getUserFromSocketToken(socket) {
  // Lấy token từ auth object, headers hoặc query
  const rawToken =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization ||
    socket.handshake.query?.token;

  if (!rawToken) {
    throw new Error("Không có token được cung cấp");
  }

  // Xử lý tiền tố "Bearer " nếu client truyền vào
  const token = rawToken.startsWith("Bearer ")
    ? rawToken.split(" ")[1]
    : rawToken;

  if (!token) {
    throw new Error("Token không hợp lệ");
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  const user = await db.User.findByPk(decoded.id);

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // Kiểm tra đổi mật khẩu
  if (
    user.password_changed_at &&
    decoded.iat < new Date(user.password_changed_at).getTime() / 1000
  ) {
    throw new Error("Token không hợp lệ do mật khẩu đã thay đổi");
  }

  return user;
}

module.exports = {
  getUserFromToken,
  getUserFromSocketToken,
};
