import React from "react";
import { RefreshCw } from "lucide-react";

// 🌐 BẢNG DỊCH (dùng chung key "language" với Settings.jsx)
const translations = {
  vi: {
    defaultName: "Quản lý",
    welcome: "Chào mừng trở lại",
    description:
      "Hệ thống ghi nhận trạng thái hoạt động bình thường. Dưới đây là số liệu thống kê của bạn.",
    sync: "Đồng bộ dữ liệu",
  },
  en: {
    defaultName: "Manager",
    welcome: "Welcome back",
    description:
      "The system is running normally. Here are your latest statistics.",
    sync: "Sync data",
  },
};

const getSavedLanguage = () => {
  const lang = localStorage.getItem("language");
  return translations[lang] ? lang : "vi";
};

const WelcomeBanner = ({ userProfile, loading, onRefresh, language }) => {
  // Ưu tiên prop language từ Dashboard, nếu không có thì đọc từ localStorage
  const t = translations[language] || translations[getSavedLanguage()];

  // Lấy tên từ userProfile (Thử name -> full_name -> fullName -> fallback theo ngôn ngữ)
  const displayName =
    userProfile?.name ||
    userProfile?.full_name ||
    userProfile?.fullName ||
    t.defaultName;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-7 rounded-3xl shadow-lg shadow-indigo-950/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <h1 className="text-2xl font-black tracking-tight">
          {t.welcome}, {displayName}!
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">
          {t.description}
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/10 px-4 py-2.5 text-xs font-bold text-white rounded-xl backdrop-blur-md shadow-sm transition-all relative z-10 shrink-0 self-start sm:self-auto"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        {t.sync}
      </button>
    </div>
  );
};

export default WelcomeBanner;