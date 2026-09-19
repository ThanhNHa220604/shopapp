import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageCircle,
  Send,
  User as UserIcon,
  Inbox,
  Image as ImageIcon,
  X,
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
      className={`rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shrink-0 overflow-hidden ${className}`}
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

const ManagerChat = () => {
  const currentUser = authService.getUser();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    try {
      const list = await chatService.getConversations();
      setConversations(list);
    } catch (err) {
      console.error("[ManagerChat] Lỗi tải danh sách hội thoại:", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const openConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    activeConversationIdRef.current = conversation.id;
    setLoadingThread(true);
    try {
      const history = await chatService.getMessages(conversation.id);
      setMessages(history);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unread_count: 0 } : c,
        ),
      );
      socketRef.current?.emit("join_conversation", conversation.id, (res) => {
        if (res?.error) console.error("[ManagerChat] Join lỗi:", res.error);
      });
    } catch (err) {
      console.error("[ManagerChat] Lỗi tải tin nhắn:", err);
    } finally {
      setLoadingThread(false);
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
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
  }, [loadConversations]);

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
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: activeConversation.id,
        sender_id: currentUser?.id,
        content: currentPreview || currentContent,
        type: currentImg ? "image" : "text",
        created_at: new Date().toISOString(),
      },
    ]);
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
      console.error("[ManagerChat] Gửi tin thất bại:", err);
      alert(err.response?.data?.message || "Gửi tin nhắn thất bại!");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-[#0f1117] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* CỘT TRÁI */}
      <div className="w-[420px] shrink-0 border-r border-white/10 bg-[#161822] flex flex-col">
        <div className="px-5 py-4 border-b border-white/10 bg-[#1b1e2d]">
          <h2 className="text-white font-black text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-500" />
            Tin nhắn khách hàng
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">
            Chỉ hiện hội thoại về sản phẩm bạn đã đăng
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="text-center text-slate-400 text-xs mt-10">
              Đang tải...
            </p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 px-6 text-center">
              <Inbox className="w-10 h-10 opacity-30" />
              <p className="text-xs">Chưa có khách hàng nào nhắn tin</p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConversation?.id === c.id;
              const hasUnread = (c.unread_count || 0) > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-white/5 transition-all ${
                    isActive
                      ? "bg-amber-500/15 border-l-4 border-l-amber-500"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Avatar
                    src={resolveAvatarUrl(c.buyer?.avatar)}
                    alt={c.buyer?.name || "Khách hàng"}
                    className="w-11 h-11"
                    fallbackIcon={<UserIcon size={18} />}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${hasUnread ? "font-black text-white" : "font-bold text-slate-100"}`}
                    >
                      {c.buyer?.name || "Khách hàng"}
                    </p>
                    <p className="text-xs truncate mt-0.5 leading-relaxed text-slate-300">
                      {c.last_message || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="flex-1 flex flex-col bg-[#0f1117]">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p className="text-sm">Chọn 1 hội thoại để bắt đầu trả lời khách</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-white/10 bg-[#161822] flex items-center gap-3">
              <Avatar
                src={resolveAvatarUrl(activeConversation.buyer?.avatar)}
                alt={activeConversation.buyer?.name || "Khách hàng"}
                className="w-10 h-10 ring-2 ring-white/10"
                fallbackIcon={<UserIcon size={18} />}
              />
              <div>
                <p className="text-white font-black text-sm">
                  {activeConversation.buyer?.name || "Khách hàng"}
                </p>
                {activeConversation.product?.name && (
                  <p className="text-amber-400/90 text-xs font-medium">
                    Về sản phẩm: {activeConversation.product.name}
                  </p>
                )}
              </div>
            </div>

            {/* Danh sách Tin Nhắn */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#0d0e14]">
              {loadingThread ? (
                <p className="text-center text-slate-400 text-xs mt-6">
                  Đang tải...
                </p>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === currentUser?.id;
                  const partner = activeConversation?.buyer;
                  const isImage =
                    m.type === "image" ||
                    /\.(png|jpe?g|webp|gif|jfif)$/i.test(m.content);

                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2.5 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar
                        src={resolveAvatarUrl(
                          isMine ? currentUser?.avatar : partner?.avatar,
                        )}
                        alt={isMine ? "Tôi" : partner?.name || "Khách"}
                        className="w-7 h-7 text-xs border border-white/10"
                        fallbackIcon={<UserIcon size={14} />}
                      />
                      <div
                        className={`max-w-[65%] ${
                          isImage
                            ? "p-0 bg-transparent"
                            : `px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? "bg-amber-500 text-slate-950 font-semibold rounded-br-none"
                                  : "bg-[#222634] text-white font-medium border border-white/10 rounded-bl-none"
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
                            className="max-w-full max-h-60 rounded-xl object-cover border border-white/10 shadow-lg"
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

            {/* Khung Preview Ảnh */}
            {imagePreview && (
              <div className="px-5 pt-3 bg-[#161822] flex items-center gap-2 border-t border-white/10">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-black text-white p-0.5 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Input Controls */}
            <div className="flex items-center gap-3 p-4 border-t border-white/10 bg-[#161822]">
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
                className="p-3 text-slate-400 hover:text-amber-500 hover:bg-white/5 rounded-xl transition-colors"
              >
                <ImageIcon size={20} />
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập nội dung trả lời..."
                className="flex-1 text-sm px-4 py-3 rounded-xl bg-[#0d0e14] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerChat;
