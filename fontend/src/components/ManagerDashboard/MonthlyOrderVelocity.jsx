import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";

const MonthlyOrderVelocity = ({ monthChartData, orders = [] }) => {
  // 1. XỬ LÝ DỮ LIỆU: Ưu tiên dùng monthChartData truyền từ Parent, nếu không có mới tự tính từ orders
  const chartData = useMemo(() => {
    // Nếu Dashboard đã tính sẵn monthChartData và truyền xuống -> dùng luôn!
    if (monthChartData && monthChartData.length > 0) {
      return monthChartData;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 -> 11

    const monthNames = [
      "Th1",
      "Th2",
      "Th3",
      "Th4",
      "Th5",
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
      "Th11",
      "Th12",
    ];

    // Khởi tạo khung 12 tháng
    const months = monthNames.map((label, index) => ({
      monthIndex: index,
      label,
      isCurrent: index === currentMonth,
      count: 0,
    }));

    // Gom đơn hàng thực tế vào từng tháng
    orders.forEach((order) => {
      const rawDate = order.created_at || order.createdAt || order.date;
      if (rawDate) {
        const d = new Date(rawDate);
        if (d.getFullYear() === currentYear) {
          const mIdx = d.getMonth();
          if (months[mIdx]) {
            months[mIdx].count += 1;
          }
        }
      }
    });

    // Tính tọa độ (X, Y) cho 12 điểm trên SVG (Khung 500x150)
    const maxVal = Math.max(...months.map((m) => m.count), 1);
    return months.map((m, index) => {
      const x = (index / 11) * 500; // Chia đều 12 điểm trên trục ngang 500px
      const y = 130 - (m.count / maxVal) * 90; // Quy đổi độ cao Y
      return { ...m, x, y };
    });
  }, [monthChartData, orders]);

  // 2. HÀM VẼ ĐƯỜNG CONG MƯỢT (BÉZIER CURVE)
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

  const strokePath = generateSmoothPath(chartData);
  const areaPath = strokePath ? `${strokePath} L 500 150 L 0 150 Z` : "";

  return (
    <div className="bg-[#14161f] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all">
      {/* HEADER BIỂU ĐỒ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Monthly Order
            Velocity
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Số lượng đơn hàng tạo ra trong 12 tháng năm{" "}
            {new Date().getFullYear()}
          </p>
        </div>
        <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
          Năm {new Date().getFullYear()}
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

          {/* Vùng màu mờ dưới đường cong */}
          {areaPath && <path d={areaPath} fill="url(#cyanGlow)" />}

          {/* Đường vẽ chính */}
          {strokePath && (
            <path
              d={strokePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Các mốc điểm nút (Dots) */}
          {chartData.map((pt, i) => (
            <g key={i} className="group/node cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-cyan-400 stroke-[#14161f] stroke-[3] transition-all group-hover/node:r-6"
              />
              <title>{`${pt.label}: ${pt.count} đơn hàng`}</title>
            </g>
          ))}
        </svg>
      </div>

      {/* TRỤC HOÀNH HÀNG 12 THÁNG (Th1 -> Th12) */}
      <div className="grid grid-cols-12 text-center text-[9px] font-bold text-slate-400 pt-3 border-t border-white/5">
        {chartData.map((d, index) => (
          <span
            key={index}
            className={d.isCurrent ? "text-cyan-400 font-extrabold" : ""}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MonthlyOrderVelocity;
