import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  Send,
  ChevronLeft,
  Store,
  User as UserIcon,
  Image as ImageIcon,
} from "lucide-react";
import authService from "../../services/auth";
import chatService from "../../services/chat";
import { getChatSocket } from "../../services/socket";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function resolveAvatarUrl(avatar) {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  let cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
  if (cleanPath.startsWith("api/")) cleanPath = cleanPath.replace(/^api\//, "");
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${baseUrl}/api/images/${cleanPath}`;
}

const Avatar = ({ src, alt, fallbackIcon, className = "" }) => {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 overflow-hidden ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        fallbackIcon
      )}
    </div>
  );
};

const ChatWidget = () => {
  const [isLoggedIn] = useState(authService.isAuthenticated());
  const role = authService.getRole();
  const isSeller = role === "manager" || role === "admin";
  const currentUser = authService.getUser();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadConvIds, setUnreadConvIds] = useState(new Set());

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const list = await chatService.getConversations();
      setConversations(list);
    } catch (err) {
      console.error("Lỗi tải danh sách hội thoại:", err);
    }
  }, [isLoggedIn]);

  const openConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    setView("thread");
    setLoading(true);
    try {
      const history = await chatService.getMessages(conversation.id);
      setMessages(history);
      setUnreadConvIds((prev) => {
        const next = new Set(prev);
        next.delete(conversation.id);
        return next;
      });
      socketRef.current?.emit("join_conversation", conversation.id, (res) => {
        if (res?.error) console.error("[Chat] Join phòng thất bại:", res.error);
      });
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  // Lắng nghe Socket khi có tin nhắn mới
  useEffect(() => {
    if (!isLoggedIn) return;
    const socket = getChatSocket();
    if (!socket) return;
    socketRef.current = socket;

    const handleNewMessage = (message) => {
      setActiveConversation((current) => {
        if (current && message.conversation_id === current.id) {
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message],
          );
          setTimeout(scrollToBottom, 50);
        } else {
          setUnreadConvIds((prev) =>
            new Set(prev).add(message.conversation_id),
          );
        }
        return current;
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversation_id
            ? {
                ...c,
                last_message:
                  message.type === "image" ? "[Hình ảnh]" : message.content,
                last_message_at: message.created_at,
              }
            : c,
        ),
      );
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [isLoggedIn]);

  // Lắng nghe sự kiện 'open-chat' từ nút "Nhắn tin hỏi shop" ở OrderHistory
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleOpenChat = async (e) => {
      const { order_id, product_id, productName } = e.detail || {};
      if (!order_id || !product_id) return;

      setOpen(true);
      setLoading(true);

      try {
        const defaultContent = productName
          ? `Chào shop, tôi muốn hỏi về sản phẩm: ${productName}`
          : "Chào shop, tôi muốn hỏi về đơn hàng này.";

        const data = await chatService.startConversation({
          order_id,
          product_id,
          content: defaultContent,
        });

        const conversation = data.conversation || data;

        setActiveConversation(conversation);
        setView("thread");

        const history = await chatService.getMessages(conversation.id);
        setMessages(history);

        socketRef.current?.emit("join_conversation", conversation.id);
      } catch (err) {
        console.error("Lỗi khi mở cuộc trò chuyện với shop:", err);
        alert("Không thể kết nối cuộc trò chuyện với shop!");
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, [isLoggedIn]);

  useEffect(() => {
    if (open) loadConversations();
  }, [open, loadConversations]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && !selectedImage) || !activeConversation) return;

    const currentContent = content;
    const currentImg = selectedImage;
    const currentPreview = imagePreview;

    setInput("");
    removeSelectedImage();

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: currentUser?.id,
      content: currentPreview || currentContent,
      type: currentImg ? "image" : "text",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      let payload;
      if (currentImg) {
        payload = new FormData();
        payload.append("image", currentImg);
        if (currentContent) payload.append("content", currentContent);
      } else {
        payload = currentContent;
      }

      const realMessage = await chatService.sendMessageRest(
        activeConversation.id,
        payload,
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMessage : m)),
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                last_message:
                  realMessage.type === "image"
                    ? "[Hình ảnh]"
                    : realMessage.content,
                last_message_at: realMessage.created_at,
              }
            : c,
        ),
      );
    } catch (err) {
      console.error("[Chat] Gửi tin thất bại:", err);
      alert(err.response?.data?.message || "Gửi tin nhắn thất bại!");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (!isLoggedIn) return null;
  const totalUnread = unreadConvIds.size;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2.5 text-slate-800 hover:text-indigo-700 bg-white/90 border border-indigo-300 hover:bg-indigo-50 rounded-xl relative transition-all shadow-sm"
      >
        <MessageCircle size={18} className="stroke-[2.2]" />
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {totalUnread}
          </span>
        )}
      </button>

      {createPortal(
        <>
          {open && (
            <div
              className="fixed inset-0 bg-black/10 z-[80] sm:bg-transparent"
              onClick={() => setOpen(false)}
            />
          )}

          <div
            className={`fixed bottom-5 right-5 w-[92vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] flex flex-col transition-all duration-300 transform ${
              open
                ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
                : "scale-95 opacity-0 translate-y-10 pointer-events-none"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-2xl shrink-0">
              {view === "thread" && (
                <button
                  onClick={() => setView("list")}
                  className="p-1 hover:bg-slate-200 rounded-lg"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {view === "thread" && (
                <Avatar
                  src={resolveAvatarUrl(
                    isSeller
                      ? activeConversation?.buyer?.avatar
                      : activeConversation?.seller?.avatar,
                  )}
                  alt={
                    isSeller
                      ? activeConversation?.buyer?.name
                      : activeConversation?.seller?.name
                  }
                  className="w-8 h-8"
                  fallbackIcon={
                    isSeller ? <UserIcon size={14} /> : <Store size={14} />
                  }
                />
              )}
              <h3 className="font-black text-sm text-slate-800 flex-1 truncate">
                {view === "list"
                  ? "Tin nhắn"
                  : isSeller
                    ? activeConversation?.buyer?.name || "Khách hàng"
                    : activeConversation?.seller?.name || "Shop"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* View List */}
            {view === "list" ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs mt-10">
                    Chưa có cuộc trò chuyện nào
                  </p>
                ) : (
                  conversations.map((c) => {
                    const other = isSeller ? c.buyer : c.seller;
                    const hasUnread = unreadConvIds.has(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => openConversation(c)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 text-left transition-colors"
                      >
                        <Avatar
                          src={resolveAvatarUrl(other?.avatar)}
                          alt={other?.name || "Người dùng"}
                          className="w-10 h-10"
                          fallbackIcon={
                            isSeller ? (
                              <UserIcon size={16} />
                            ) : (
                              <Store size={16} />
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {other?.name || "Người dùng"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.last_message || "Chưa có tin nhắn"}
                          </p>
                        </div>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
                  {loading ? (
                    <p className="text-center text-slate-400 text-xs mt-6">
                      Đang tải...
                    </p>
                  ) : (
                    messages.map((m) => {
                      const isMine = m.sender_id === currentUser?.id;
                      const partner = isSeller
                        ? activeConversation?.buyer
                        : activeConversation?.seller;
                      const isImage =
                        m.type === "image" ||
                        /\.(png|jpe?g|webp|gif|jfif)$/i.test(m.content);

                      return (
                        <div
                          key={m.id}
                          className={`flex items-end gap-2 ${
                            isMine ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <Avatar
                            src={resolveAvatarUrl(
                              isMine ? currentUser?.avatar : partner?.avatar,
                            )}
                            alt={isMine ? "Tôi" : partner?.name || "User"}
                            className="w-6 h-6 text-[10px]"
                            fallbackIcon={<UserIcon size={12} />}
                          />
                          <div
                            className={`max-w-[75%] ${
                              isImage
                                ? "p-0 bg-transparent"
                                : `px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                                    isMine
                                      ? "bg-indigo-600 text-white rounded-br-sm"
                                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
                                  }`
                            }`}
                          >
                            {isImage ? (
                              <img
                                src={
                                  m.content.startsWith("blob:")
                                    ? m.content
                                    : resolveAvatarUrl(m.content)
                                }
                                alt="Hình ảnh"
                                className="max-w-full max-h-48 rounded-xl object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              m.content
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview Area */}
                {imagePreview && (
                  <div className="px-3 pt-2 bg-white flex items-center gap-2 border-t border-slate-100">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-indigo-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeSelectedImage}
                        className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black text-white p-0.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Controls */}
                <div className="flex items-center gap-2 p-3 border-t border-slate-100 bg-white rounded-b-2xl">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <ImageIcon size={18} />
                  </button>

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={handleSend}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

export default ChatWidget;
