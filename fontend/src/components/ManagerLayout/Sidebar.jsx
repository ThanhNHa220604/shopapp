import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Ticket,
  Store,
  Plus,
  LogOut,
  MessageCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSettings } from "../../hooks/useAppSettings";

const Sidebar = () => {
  const { t } = useTranslation();
  const { theme } = useAppSettings();

  const location = useLocation();
  const navigate = useNavigate();

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      setUnreadChatCount(event.detail?.count || 0);
    };

    window.addEventListener("chat-unread-updated", handleUnreadUpdate);

    return () => {
      window.removeEventListener(
        "chat-unread-updated",
        handleUnreadUpdate,
      );
    };
  }, []);

  const handleViewStore = (event) => {
    event.preventDefault();
    window.open("/", "_blank");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isDark = theme === "dark";

  const activeStyle =
    "w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-start gap-3 shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-[0.98]";

  const inactiveStyle = isDark
    ? "w-full py-3.5 px-5 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 hover:text-white font-extrabold text-sm rounded-2xl flex items-center justify-start gap-3 transition-all duration-200 active:scale-[0.98]"
    : "w-full py-3.5 px-5 bg-slate-200/60 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-extrabold text-sm rounded-2xl flex items-center justify-start gap-3 transition-all duration-200 active:scale-[0.98]";

  const isAddProductActive = location.pathname === "/manager/products/add";
  const isVoucherActive = location.pathname.startsWith(
    "/manager/vouchers",
  );
  const isSettingActive = location.pathname.startsWith(
    "/manager/settings",
  );

  return (
    <aside
      className={`w-64 shrink-0 min-h-screen border-r p-5 z-30 font-sans sticky top-0 h-screen overflow-y-auto transition-colors duration-300 ${
        isDark
          ? "bg-[#101117] border-white/5 text-slate-200"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center gap-3 px-2 pt-1 mb-8">
        <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20 shrink-0">
          <Store className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div>
          <h1 className="font-black text-base leading-tight">ThanHNha</h1>

          <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">
            {t("header.managerPanel")}
          </p>
        </div>
      </div>

      <nav className="space-y-3">
        <Link
          to="/manager/dashboard"
          className={
            location.pathname === "/manager/dashboard"
              ? activeStyle
              : inactiveStyle
          }
        >
          <LayoutGrid className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.overview")}</span>
        </Link>

        <Link
          to="/manager/products"
          className={
            location.pathname.startsWith("/manager/products") &&
            !isAddProductActive
              ? activeStyle
              : inactiveStyle
          }
        >
          <Package className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.products")}</span>
        </Link>

        <Link
          to="/manager/deleted-products"
          className={
            location.pathname === "/manager/deleted-products"
              ? activeStyle
              : inactiveStyle
          }
        >
          <ClipboardList className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.deletedProducts")}</span>
        </Link>

        <Link
          to="/manager/orders"
          className={
            location.pathname === "/manager/orders"
              ? activeStyle
              : inactiveStyle
          }
        >
          <ClipboardList className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.orders")}</span>
        </Link>

        <Link
          to="/manager/chats"
          className={`${
            location.pathname.startsWith("/manager/chats")
              ? activeStyle
              : inactiveStyle
          } relative`}
        >
          <MessageCircle className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.customerMessages")}</span>

          {unreadChatCount > 0 && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-600 text-white font-black text-[10px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-[#1a1c26]">
              {unreadChatCount}
            </span>
          )}
        </Link>

        <Link
          to="/manager/vouchers"
          className={isVoucherActive ? activeStyle : inactiveStyle}
        >
          <Ticket className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.vouchers")}</span>
        </Link>

        <button
          type="button"
          onClick={handleViewStore}
          className={inactiveStyle}
        >
          <Store className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.viewStore")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/manager/products/add")}
          className={isAddProductActive ? activeStyle : inactiveStyle}
        >
          <Plus className="w-5 h-5 stroke-[3] shrink-0" />
          <span>{t("sidebar.addProduct")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/manager/settings")}
          className={isSettingActive ? activeStyle : inactiveStyle}
        >
          <SettingsIcon className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.settings")}</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 px-5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-black text-sm rounded-2xl flex items-center justify-start gap-3 transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5 stroke-[2.5] shrink-0" />
          <span>{t("sidebar.logout")}</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;