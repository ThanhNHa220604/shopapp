const db = require("../models");
const { getUserFromSocketToken } = require("../helpers/TokenHelper");
const { isParticipant } = require("../controllers/chatController");

/**
 * Gắn toàn bộ logic realtime chat vào io. Gọi 1 lần trong index.js:
 *   const { initChatSocket } = require("./sockets/chatSocket");
 *   initChatSocket(io);
 */
function initChatSocket(io) {
  // Middleware xác thực: mọi kết nối tới io đều phải có JWT hợp lệ,
  // giống hệt cách requireRoles xác thực REST API.
  io.use(async (socket, next) => {
    try {
      const user = await getUserFromSocketToken(socket);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error(error.message || "Xác thực thất bại"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(
      `🔌 Socket connected: user=${user.id} (${user.name}) socket=${socket.id}`,
    );

    /**
     * Tham gia phòng của 1 hội thoại. Chỉ buyer hoặc seller của hội thoại
     * đó mới được join, tránh nghe lén hội thoại người khác.
     */
    socket.on("join_conversation", async (conversationId, callback) => {
      try {
        const conversation = await db.conversations.findByPk(conversationId);
        if (!conversation) {
          return callback?.({ error: "Không tìm thấy hội thoại" });
        }
        if (!isParticipant(conversation, user)) {
          return callback?.({
            error: "Bạn không có quyền tham gia hội thoại này",
          });
        }
        socket.join(`conversation_${conversationId}`);
        callback?.({ success: true });
      } catch (error) {
        callback?.({ error: "Lỗi server" });
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    /**
     * Gửi tin nhắn realtime.
     * payload: { conversationId, content }
     */
    socket.on("send_message", async (payload, callback) => {
      try {
        const { conversationId, content } = payload || {};

        if (!content || !content.trim()) {
          return callback?.({ error: "Tin nhắn không được để trống" });
        }

        const conversation = await db.conversations.findByPk(conversationId);
        if (!conversation) {
          return callback?.({ error: "Không tìm thấy hội thoại" });
        }
        if (!isParticipant(conversation, user)) {
          return callback?.({
            error: "Bạn không có quyền gửi tin trong hội thoại này",
          });
        }

        const message = await db.messages.create({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          status: "sent",
        });

        await conversation.update({
          last_message: content.trim(),
          last_message_at: new Date(),
        });

        // Gửi tới mọi client đang trong phòng (cả người gửi lẫn người nhận
        // để đồng bộ nhiều tab/thiết bị)
        io.to(`conversation_${conversationId}`).emit("new_message", message);

        callback?.({ success: true, message });
      } catch (error) {
        console.error("send_message error:", error);
        callback?.({ error: "Lỗi server khi gửi tin nhắn" });
      }
    });

    // Trạng thái "đang nhập..."
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("typing", {
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("stop_typing", {
        userId: user.id,
      });
    });

    socket.on("disconnect", () => {
      console.log(
        `❌ Socket disconnected: user=${user.id} socket=${socket.id}`,
      );
    });
  });
}

module.exports = { initChatSocket };
