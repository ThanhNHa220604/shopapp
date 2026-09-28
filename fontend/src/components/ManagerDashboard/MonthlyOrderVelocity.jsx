import React from "react";
import { TrendingUp } from "lucide-react";

// Nội dung tiêu đề theo bộ lọc (dữ liệu điểm do ManagerDashboard tính sẵn)
const COPY = {
  week: {
    title: "Weekly Order Velocity",
    desc: "Số lượng đơn hàng theo tuần trong 12 tuần gần nhất",
    badge: "7 ",
  },
  month: {
    title: "Monthly Order Velocity",
    desc: "Số lượng đơn hàng theo tháng, 12 tháng tính đến tháng đã chọn",
    badge: "12 tháng",
  },
  year: {
    title: "Monthly Order Velocity",
    desc: "Số lượng đơn hàng theo từng tháng của năm hiện tại",
    badge: `Năm ${new Date().getFullYear()}`,
  },
};

const generateSmoothPath = (pts) => {
  if (!pts || pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
};

const MonthlyOrderVelocity = ({
  monthChartData = [],
  period = "month",
  year = "all",
}) => {
  // Khi chọn 1 năm cụ thể, biểu đồ này hiện 5 năm để làm ngữ cảnh
  const copy =
    period === "year" && year !== "all"
      ? {
          title: "Yearly Order Velocity",
          desc: "Số lượng đơn hàng theo năm trong 5 năm gần nhất",
          badge: "5 năm",
        }
      : COPY[period] || COPY.month;
  const chartData = monthChartData;

  const strokePath = generateSmoothPath(chartData);
  const areaPath = strokePath ? `${strokePath} L 500 150 L 0 150 Z` : "";

  return (
    <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all">
      {/* HEADER BIỂU ĐỒ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />{" "}
            {copy.title}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {copy.desc}
          </p>
        </div>
        <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
          {copy.badge}
        </span>
      </div>

      {/* KHUNG VẼ SVG */}
      <div className="w-full h-36 relative flex items-end">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {areaPath && <path d={areaPath} fill="url(#cyanGlow)" />}

          {strokePath && (
            <path
              d={strokePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {chartData.map((pt, i) => (
            <g key={i} className="group/node cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-cyan-400 stroke-white dark:stroke-[#14161f] stroke-[3] transition-all"
              />
              <title>{`${pt.title || pt.label}: ${pt.count} đơn hàng`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* TRỤC HOÀNH: số cột thay đổi theo bộ lọc (12 hoặc 5 mốc) */}
      <div
        className="grid text-center text-[9px] font-bold text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5"
        style={{
          gridTemplateColumns: `repeat(${Math.max(chartData.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {chartData.map((d, index) => (
          <span
            key={index}
            className={
              d.isCurrent
                ? "text-cyan-600 dark:text-cyan-400 font-extrabold"
                : ""
            }
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOrderVelocity;