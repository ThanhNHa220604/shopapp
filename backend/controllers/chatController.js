const db = require("../models");
const { UserRole } = require("../constants");

/**
 * Lấy role dạng chuỗi viết hoa từ user (đồng bộ cách làm với ProductController)
 */
function resolveRoleStr(user) {
  const raw =
    user.role ??
    user.role_id ??
    user.roleId ??
    user.Role?.name ??
    user.Role?.id ??
    user.role_name;
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

function isSellerRole(roleStr) {
  return (
    roleStr === String(UserRole.MANAGER) ||
    roleStr === "MANAGER" ||
    roleStr === String(UserRole.ADMIN) ||
    roleStr === "ADMIN"
  );
}

/** Kiểm tra user hiện tại có thuộc về hội thoại này không (là buyer hoặc seller) */
function isParticipant(conversation, user) {
  return (
    conversation.buyer_id === user.id || conversation.seller_id === user.id
  );
}

const CONVERSATION_INCLUDES = [
  { model: db.User, as: "buyer", attributes: ["id", "name", "avatar"] },
  { model: db.User, as: "seller", attributes: ["id", "name", "avatar"] },
  {
    model: db.products,
    as: "product",
    attributes: ["id", "name", "image"],
  },
];

/**
 * 📌 1. KHÁCH HÀNG BẮT ĐẦU (HOẶC MỞ LẠI) HỘI THOẠI PHÀN NÀN VỀ SẢN PHẨM
 * POST /api/chat/conversations
 * body: { order_id, product_id, content }
 *
 * Quy tắc: chỉ cần đơn hàng đã đặt thành công (tồn tại + thuộc về buyer) là
 * được hỏi shop — không giới hạn theo trạng thái đơn (Pending, Processing,
 * Shipped, Delivered...). seller_id KHÔNG lấy từ client mà tự suy ra từ
 * product.user_id, tránh trường hợp khách hàng giả mạo gửi sai người bán.
 */
async function startConversation(req, res) {
  try {
    const buyer = req.user;
    const { order_id, product_id, content } = req.body;

    if (!order_id) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đơn hàng cần hỏi/phàn nàn" });
    }
    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập nội dung tin nhắn" });
    }

    // 1. Đơn hàng phải tồn tại và thuộc về chính người gọi API
    const order = await db.orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.user_id !== buyer.id) {
      return res
        .status(403)
        .json({ message: "Đơn hàng này không thuộc về bạn" });
    }

    // 2. Sản phẩm phải thực sự nằm trong đơn hàng đó
    const OrderDetailModel = db["order-detail"] || db.order_detail;
    const detail = await OrderDetailModel.findOne({
      where: { order_id, product_id },
    });
    if (!detail) {
      return res
        .status(400)
        .json({ message: "Sản phẩm này không nằm trong đơn hàng đã chọn" });
    }

    const product = await db.products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const sellerId = product.user_id;
    if (!sellerId) {
      return res.status(400).json({
        message: "Sản phẩm này chưa được gán người bán, không thể nhắn tin",
      });
    }

    if (sellerId === buyer.id) {
      return res
        .status(400)
        .json({ message: "Bạn không thể tự nhắn tin với chính mình" });
    }

    // 3. TÌM HOẶC TẠO DUY NHẤT 1 HOẠI THOẠI GIỮA BUYER VÀ SELLER
    const [conversation, created] = await db.conversations.findOrCreate({
      where: { buyer_id: buyer.id, seller_id: sellerId }, // Chỉ lọc theo Buyer và Seller
      defaults: {
        buyer_id: buyer.id,
        seller_id: sellerId,
        product_id,
        order_id,
      },
    });

    // 4. Tạo tin nhắn mới
    const message = await db.messages.create({
      conversation_id: conversation.id,
      sender_id: buyer.id,
      content,
      status: "sent",
    });

    // 5. Cập nhật tin nhắn cuối và liên kết đơn hàng/sản phẩm mới nhất
    await conversation.update({
      last_message: content,
      last_message_at: new Date(),
      product_id, // Cập nhật vết sản phẩm hỏi gần nhất
      order_id, // Cập nhật vết đơn hàng hỏi gần nhất
    });

    // 6. Phát Realtime qua Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${conversation.id}`)
        .to(`user_${conversation.buyer_id}`)
        .to(`user_${conversation.seller_id}`)
        .emit("new_message", message);
    }

    return res.status(201).json({
      message: "Đã gửi phản hồi tới người bán",
      data: { conversation, firstMessage: message },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo hội thoại",
      error: error.message,
    });
  }
}

/**
 * 📌 2. DANH SÁCH HỘI THOẠI CỦA USER HIỆN TẠI
 * GET /api/chat/conversations
 * - Khách hàng (USER)        -> danh sách hội thoại họ là buyer
 * - Người bán (MANAGER/ADMIN) -> danh sách hội thoại họ là seller
 */
async function listConversations(req, res) {
  try {
    const currentUser = req.user;
    const roleStr = resolveRoleStr(currentUser);

    const whereClause = isSellerRole(roleStr)
      ? { seller_id: currentUser.id }
      : { buyer_id: currentUser.id };

    const conversations = await db.conversations.findAll({
      where: whereClause,
      include: CONVERSATION_INCLUDES,
      order: [["last_message_at", "DESC"]],
    });

    // Đếm số tin nhắn CHƯA ĐỌC của mỗi hội thoại (tin do phía đối diện gửi,
    // status vẫn còn "sent") bằng 1 query gộp nhóm duy nhất — tránh lặp
    // N+1 query cho từng hội thoại. Kết quả này để FE tô đậm + hiện badge
    // cho đúng hội thoại đang có tin chưa đọc, và vẫn đúng kể cả sau khi
    // người dùng tải lại trang (không phụ thuộc state tạm trên client).
    const conversationIds = conversations.map((c) => c.id);
    let unreadCountMap = {};
    if (conversationIds.length > 0) {
      const unreadRows = await db.messages.findAll({
        where: {
          conversation_id: { [db.Sequelize.Op.in]: conversationIds },
          sender_id: { [db.Sequelize.Op.ne]: currentUser.id },
          status: "sent",
        },
        attributes: [
          "conversation_id",
          [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "unread_count"],
        ],
        group: ["conversation_id"],
        raw: true,
      });
      unreadCountMap = unreadRows.reduce((map, row) => {
        map[row.conversation_id] = Number(row.unread_count);
        return map;
      }, {});
    }

    const conversationsWithUnread = conversations.map((c) => {
      const plain = c.toJSON();
      plain.unread_count = unreadCountMap[c.id] || 0;
      return plain;
    });

    return res.status(200).json({
      message: "Lấy danh sách hội thoại thành công",
      data: conversationsWithUnread,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách hội thoại",
      error: error.message,
    });
  }
}

/**
 * 📌 3. LỊCH SỬ TIN NHẮN CỦA 1 HỘI THOẠI
 * GET /api/chat/conversations/:id/messages?beforeId=&limit=
 */
async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { beforeId, limit = 30 } = req.query;

    const conversation = await db.conversations.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    if (!isParticipant(conversation, currentUser)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem hội thoại này" });
    }

    const whereClause = { conversation_id: id };
    if (beforeId) {
      whereClause.id = { [db.Sequelize.Op.lt]: Number(beforeId) };
    }

    const messages = await db.messages.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      limit: Number(limit),
      include: [
        { model: db.User, as: "sender", attributes: ["id", "name", "avatar"] },
      ],
    });
    messages.reverse(); // trả về theo thứ tự thời gian tăng dần

    // Đánh dấu đã đọc các tin của phía đối diện gửi
    const otherSenderId =
      currentUser.id === conversation.buyer_id
        ? conversation.seller_id
        : conversation.buyer_id;

    await db.messages.update(
      { status: "read" },
      {
        where: {
          conversation_id: id,
          sender_id: otherSenderId,
          status: "sent",
        },
      },
    );

    return res.status(200).json({
      message: "Lấy lịch sử tin nhắn thành công",
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy tin nhắn",
      error: error.message,
    });
  }
}

/**
 * 📌 4. GỬI TIN NHẮN QUA REST (fallback khi không dùng Socket.io)
 * POST /api/chat/conversations/:id/messages   body: { content }
 */
async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const currentUser = req.user;

    const conversation = await db.conversations.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    if (!isParticipant(conversation, currentUser)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền gửi tin trong hội thoại này" });
    }

    // 1. Kiểm tra xem người dùng gửi ảnh hay gửi chữ
    let messageContent = content || "";
    let messageType = "text";

    if (req.file) {
      // Vì middleware của bạn lưu tên file dạng `${Date.now()}-${file.originalname}`
      // nên req.file.filename sẽ trả về đúng tên file đó
      messageContent = req.file.filename; 
      messageType = "image";
    }

    if (!messageContent) {
      return res.status(400).json({ message: "Nội dung tin nhắn không được để trống" });
    }

    // 2. Lưu vào DB (Lưu ý: Bổ sung trường type vào bảng messages nếu chưa có)
    const message = await db.messages.create({
      conversation_id: id,
      sender_id: currentUser.id,
      content: messageContent,
      type: messageType,
      status: "sent",
    });

    const previewText = messageType === "image" ? "[Hình ảnh]" : messageContent;

    await conversation.update({
      last_message: previewText,
      last_message_at: new Date(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${id}`)
        .to(`user_${conversation.buyer_id}`)
        .to(`user_${conversation.seller_id}`)
        .emit("new_message", message);
    }

    return res.status(201).json({
      message: "Gửi tin nhắn thành công",
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi gửi tin nhắn",
      error: error.message,
    });
  }
}

module.exports = {
  startConversation,
  listConversations,
  getMessages,
  sendMessage,
  resolveRoleStr,
  isSellerRole,
  isParticipant,
};
