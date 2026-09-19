import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  ClipboardList,
  Store,
  Users,
  LogOut,
  Image,
  Newspaper,
  Zap,
  Plus,
  Ticket,
  Trash2,
  MessageSquare,
  Settings as SettingsIcon,
} from "lucide-react";

const Sidebar = ({ activeTab, onLogout }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mở trang cửa hàng ở TAB MỚI
  const handleViewStore = () => {
    window.open("/", "_blank");
  };

  // Kiểu CSS dùng chung cho các nút Menu
  const getNavClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-black transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/30 scale-[1.01]"
        : "bg-[#181a26]/80 text-slate-300 hover:bg-[#202333] hover:text-white"
    }`;
  };

  return (
    <aside className="w-64 bg-[#0d0f17] border-r border-white/5 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 font-sans">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/25 shrink-0">
            <Store className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            {/* Tên thương hiệu: giữ nguyên, không dịch */}
            <h1 className="font-black text-lg text-white tracking-tight leading-tight">
              ThanHNha
            </h1>
            <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest mt-0.5">
              {t("sidebar.adminPanel")}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2.5">
          {/* 1. Tổng quan */}
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className={getNavClass("dashboard")}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.overview")}</span>
          </button>

          {/* 2. Sản phẩm */}
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className={getNavClass("products")}
          >
            <Package className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.products")}</span>
          </button>

          {/* 3. Sản phẩm của tôi */}
          <button
            type="button"
            onClick={() => navigate("/admin/my-products")}
            className={getNavClass("my-products")}
          >
            <PackageCheck className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.myProducts")}</span>
          </button>

          {/* 3.5. Sản phẩm đã xóa */}
          <button
            type="button"
            onClick={() => navigate("/admin/deleted-products")}
            className={getNavClass("deleted-products")}
          >
            <Trash2 className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.deletedProducts")}</span>
          </button>

          {/* 4. Đơn hàng */}
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className={getNavClass("orders")}
          >
            <ClipboardList className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.orders")}</span>
          </button>

          {/* 5. Voucher */}
          <button
            type="button"
            onClick={() => navigate("/admin/vouchers")}
            className={getNavClass("vouchers")}
          >
            <Ticket className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.vouchers")}</span>
          </button>

          {/* 6. Xem cửa hàng */}
          <button
            type="button"
            onClick={handleViewStore}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-black bg-[#181a26]/80 text-slate-300 hover:bg-[#202333] hover:text-white transition-all duration-200"
          >
            <Store className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.viewStore")}</span>
          </button>

          {/* 7. Thêm sản phẩm */}
          <button
            type="button"
            onClick={() => navigate("/admin/add-product")}
            className={getNavClass("add-product")}
          >
            <Plus className="w-5 h-5 shrink-0 stroke-[3]" />
            <span className="text-sm">{t("sidebar.addProduct")}</span>
          </button>

          {/* 8. Tin nhắn khách hàng */}
          <button
            type="button"
            onClick={() => navigate("/admin/chats")}
            className={getNavClass("chats")}
          >
            <MessageSquare className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.customerMessages")}</span>
          </button>

          {/* 9. Khách hàng */}
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className={getNavClass("users")}
          >
            <Users className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.customers")}</span>
          </button>

          {/* 10. Banner động */}
          <button
            type="button"
            onClick={() => navigate("/admin/banners")}
            className={getNavClass("banners")}
          >
            <Image className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.banners")}</span>
          </button>

          {/* 11. Tin tức */}
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className={getNavClass("news")}
          >
            <Newspaper className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.news")}</span>
          </button>

          {/* 12. Flash Sale */}
          <button
            type="button"
            onClick={() => navigate("/admin/flashsale")}
            className={getNavClass("flashsale")}
          >
            <Zap className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.flashSale")}</span>
          </button>

          {/* 13. Cài đặt */}
          <button
            type="button"
            onClick={() => navigate("/admin/settings")}
            className={getNavClass("settings")}
          >
            <SettingsIcon className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span className="text-sm">{t("sidebar.settings")}</span>
          </button>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-black bg-rose-950/20 text-rose-400 border border-rose-900/40 hover:bg-rose-900/40 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <span>{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
