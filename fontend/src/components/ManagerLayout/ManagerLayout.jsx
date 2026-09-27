import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import authService from "../../services/auth";
import { getChatSocket } from "../../services/socket";
import { useAppSettings } from "../../hooks/useAppSettings";

const ManagerLayout = () => {
  const { t } = useTranslation();
  const { theme } = useAppSettings();

  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getUser();

  const [unreadConvIds, setUnreadConvIds] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    if (location.pathname.startsWith("/manager/chats")) {
      setUnreadConvIds(new Set());
    }
  }, [location.pathname]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("chat-unread-updated", {
        detail: {
          count: unreadConvIds.size,
        },
      }),
    );
  }, [unreadConvIds]);

  const dismissToast = useCallback((id) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id),
    );
  }, []);

  useEffect(() => {
    const socket = getChatSocket();

    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      if (message.sender_id === currentUser?.id) {
        return;
      }

      setUnreadConvIds((previous) => {
        const next = new Set(previous);
        next.add(message.conversation_id);
        return next;
      });

      if (location.pathname.startsWith("/manager/chats")) {
        return;
      }

      const id = ++toastIdRef.current;

      setToasts((previous) => [
        ...previous.slice(-2),
        {
          id,
          senderName:
            message.sender?.name || t("common.customer"),
          content: message.content,
          conversationId: message.conversation_id,
        },
      ]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 6000);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [
    location.pathname,
    currentUser?.id,
    dismissToast,
    t,
  ]);

  const handleToastClick = (toast) => {
    dismissToast(toast.id);

    navigate("/manager/chats", {
      state: {
        openConversationId: toast.conversationId,
      },
    });
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`flex w-full min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#0b0c10] text-slate-100"
          : "bg-slate-100 text-slate-800"
      }`}
    >
      <Sidebar />

      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        <Outlet />
      </main>

      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => handleToastClick(toast)}
            className={`p-4 rounded-2xl border shadow-2xl cursor-pointer transition-colors ${
              isDark
                ? "bg-[#14161f] border-amber-500/30 hover:border-amber-500/60 shadow-black/50"
                : "bg-white border-amber-500/40 hover:border-amber-500 shadow-slate-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shrink-0">
                <MessageCircle size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm truncate ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {toast.senderName}
                </p>

                <p
                  className={`text-xs mt-0.5 line-clamp-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {toast.content}
                </p>
              </div>

              <button
                type="button"
                aria-label={t("common.close")}
                onClick={(event) => {
                  event.stopPropagation();
                  dismissToast(toast.id);
                }}
                className={`${
                  isDark
                    ? "text-slate-500 hover:text-white"
                    : "text-slate-400 hover:text-slate-700"
                } shrink-0`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerLayout;