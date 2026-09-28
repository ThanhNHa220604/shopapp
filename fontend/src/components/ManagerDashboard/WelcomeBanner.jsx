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
    week: "Tuần",
    month: "Tháng",
    year: "Năm",
    monthOption: "Tháng",
    yearOption: "Năm",
    last5Years: "5 năm gần nhất",
  },
  en: {
    defaultName: "Manager",
    welcome: "Welcome back",
    description:
      "The system is running normally. Here are your latest statistics.",
    sync: "Sync data",
    week: "Week",
    month: "Month",
    year: "Year",
    monthOption: "Month",
    yearOption: "Year",
    last5Years: "Last 5 years",
  },
};

const PERIODS = ["week", "month", "year"];

const getSavedLanguage = () => {
  const lang = localStorage.getItem("language");
  return translations[lang] ? lang : "vi";
};

const WelcomeBanner = ({
  userProfile,
  loading,
  onRefresh,
  language,
  period = "week",
  onPeriodChange,
  month = new Date().getMonth(),
  onMonthChange,
  year = new Date().getFullYear(),
  onYearChange,
}) => {
  // Ưu tiên prop language từ Dashboard, nếu không có thì đọc từ localStorage
  const t = translations[language] || translations[getSavedLanguage()];

  // Lấy tên từ userProfile (Thử name -> full_name -> fullName -> fallback theo ngôn ngữ)
  const displayName =
    userProfile?.name ||
    userProfile?.full_name ||
    userProfile?.fullName ||
    t.defaultName;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-7 rounded-3xl shadow-lg shadow-indigo-950/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10">
        <h1 className="text-2xl font-black tracking-tight">
          {t.welcome}, {displayName}!
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">
          {t.description}
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-auto">
        {/* Bộ lọc Tuần / Tháng / Năm */}
        <div
          role="group"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md"
        >
          {PERIODS.map((key) => {
            const active = period === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onPeriodChange?.(key)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  active
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {t[key]}
              </button>
            );
          })}
        </div>

        {/* Chọn tháng 1 -> 12 (chỉ hiện khi đang lọc theo Tháng) */}
        {period === "month" && (
          <select
            aria-label={t.month}
            value={month}
            onChange={(e) => onMonthChange?.(Number(e.target.value))}
            className="bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2.5 backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/60"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i} className="bg-slate-900 text-white">
                {t.monthOption} {i + 1}
              </option>
            ))}
          </select>
        )}

        {/* Chọn năm (chỉ hiện khi đang lọc theo Năm): 5 năm gần nhất hoặc 1 năm cụ thể */}
        {period === "year" && (
          <select
            aria-label={t.year}
            value={year}
            onChange={(e) =>
              onYearChange?.(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2.5 backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/60"
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-white">
                {t.yearOption} {y}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/10 px-4 py-2.5 text-xs font-bold text-white rounded-xl backdrop-blur-md shadow-sm transition-all"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          {t.sync}
        </button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
