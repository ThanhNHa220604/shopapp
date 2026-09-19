import React, { useState, useRef, useEffect } from "react";
import { User, Shield, Mail, Phone, X } from "lucide-react";

const Header = ({
  userProfile,
  pendingCount,
  totalOrdersCount,
  setActiveTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tự động đóng Popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy đường dẫn ảnh Avatar
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    return `http://localhost:5000/uploads/${avatarPath}`;
  };

  const avatarUrl = getAvatarUrl(userProfile?.avatar);

  // 🔴 Hàm chuyển đổi Role
  const getRoleText = (profile) => {
    const rawRole = profile?.role ?? profile?.role_id;
    if (rawRole === undefined || rawRole === null) return "Chưa có Role";

    const roleNum = parseInt(rawRole, 10);
    if (roleNum === 3) return "Admin";
    if (roleNum === 2) return "Manager";
    if (roleNum === 1) return "User";

    return "Chưa có Role";
  };

  const currentRole = getRoleText(userProfile);

  return (
    <header className="px-8 pt-6 pb-2 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
      {/* Lời chào & Thống kê */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Welcome, {userProfile?.name || "Admin"} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Bạn có{" "}
          <span className="text-amber-400 font-bold">
            {pendingCount} đơn hàng chờ xử lý
          </span>{" "}
          trên tổng số{" "}
          <span className="text-emerald-400 font-bold">
            {totalOrdersCount} đơn hàng sản phẩm của bạn
          </span>
          .
        </p>
      </div>

      {/* Profile Wrapper - Giữ cố định kích thước vị trí */}
      <div className="relative min-w-[220px]" ref={dropdownRef}>
        {/* TRẠNG THÁI 1: Nút Profile bình thường (Ẩn khi isOpen = true) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            type="button"
            className="w-full flex items-center justify-between gap-3 bg-[#171a26]/90 border border-white/10 p-2 pr-4 rounded-2xl shadow-lg hover:bg-[#1e2232] transition-all cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userProfile?.name || "Avatar"}
                    className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
                    <User className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#171a26] rounded-full"></span>
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white leading-tight group-hover:text-amber-400 transition-colors">
                  {userProfile?.name || "N/A"}
                </span>
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider mt-0.5">
                  {userProfile?.email || "Chưa có Email"}
                </span>
              </div>
            </div>
          </button>
        )}

        {/* TRẠNG THÁI 2: Modal Chi tiết (Thế chỗ hoàn toàn nút trên khi click) */}
        {isOpen && (
          <div className="absolute right-0 top-0 w-80 bg-[#141622] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* User Info Header + Nút Đóng */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md font-black">
                    <User className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-sm font-black text-white truncate">
                    {userProfile?.name || "Chưa cập nhật tên"}
                  </h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md uppercase tracking-wider">
                    {currentRole}
                  </span>
                </div>
              </div>

              {/* Nút X để đóng Modal */}
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin Chi tiết */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300 bg-[#1b1e2e] p-2.5 rounded-xl border border-white/5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Email
                  </span>
                  <span className="font-semibold truncate text-white">
                    {userProfile?.email || "Chưa có"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300 bg-[#1b1e2e] p-2.5 rounded-xl border border-white/5">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Vai trò (Role)
                  </span>
                  <span className="font-semibold text-white">
                    {currentRole}
                  </span>
                </div>
              </div>

              {userProfile?.phone && (
                <div className="flex items-center gap-2.5 text-slate-300 bg-[#1b1e2e] p-2.5 rounded-xl border border-white/5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Số điện thoại
                    </span>
                    <span className="font-semibold text-white">
                      {userProfile.phone}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
