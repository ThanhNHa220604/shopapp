import React from "react";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Ticket, // 🟢 Bổ sung Icon Ticket cho Voucher
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";

const Sidebar = ({ profile, active, setActive, setIsEditing, setSaveMsg }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { key: "orders", label: "Lịch sử đơn hàng", icon: Package },
    { key: "vouchers", label: "Voucher của tôi", icon: Ticket }, // 🟢 Mục Voucher mới
    { key: "wishlist", label: "Sản phẩm đề xuất", icon: Heart },
    { key: "address", label: "Địa chỉ nhận hàng", icon: MapPin },
    { key: "account", label: "Thông tin tài khoản", icon: User },
    { key: "logout", label: "Đăng xuất", icon: LogOut, danger: true },
  ];

  return (
    <aside className="w-full space-y-3">
      {/* 🌟 Profile Card Header */}
      <div className="p-7 rounded-[28px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-100/90 via-blue-50/40 to-transparent mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 overflow-hidden border border-slate-100 shadow-sm">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            {profile?.name || "Người dùng"}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 truncate font-medium">
            {profile?.email}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const isLogout = item.key === "logout";

          return (
            <button
              key={item.key}
              onClick={() => {
                if (isLogout) {
                  handleLogout();
                  return;
                }
                setActive(item.key);
                if (setIsEditing) setIsEditing(false);
                if (setSaveMsg) setSaveMsg("");
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all duration-200 group relative ${
                isLogout
                  ? "text-rose-500 hover:bg-rose-50/80 active:scale-[0.98]"
                  : isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-3.5 z-10">
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isLogout
                      ? "text-rose-500"
                      : isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              <ChevronRight
                className={`w-4 h-4 transition-all duration-200 ${
                  isActive
                    ? "text-white opacity-100 translate-x-0.5"
                    : "opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5"
                }`}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
