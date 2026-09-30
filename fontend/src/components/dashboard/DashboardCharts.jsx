import React, { useMemo } from "react";
import { Sparkles, PieChart as PieIcon, BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  parseRevenueDate,
  isDeliveredOrder,
  getOrderAmount,
} from "../../utils/orderUtils";

const DashboardCharts = ({
  orders = [],
  period = "week", // "week" | "month" | "year" — do AdminDashboard truyền xuống
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
  formatRevenue,
}) => {
  // 1. Tính dữ liệu cho Biểu đồ Doanh số & Biểu đồ Cột số lượng đơn.
  //    `orders` ở đây đã được AdminDashboard lọc sẵn theo kỳ (Tuần/Tháng/Năm),
  //    nên chỉ cần chia nhỏ (bucket) đúng theo từng kỳ:
  //      Tuần  -> 7 ngày gần nhất
  //      Tháng -> từng ngày của tháng đang chọn
  //      Năm   -> 12 tháng của năm đang chọn
  const chartData = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    let buckets = [];

    if (period === "week") {
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const endD = new Date(d);
        endD.setHours(23, 59, 59, 999);
        buckets.push({
          label: dayNames[d.getDay()],
          startDate: d,
          endDate: endD,
          revenue: 0,
          orderCount: 0,
        });
      }
    } else if (period === "month") {
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(selectedYear, selectedMonth, day, 0, 0, 0, 0);
        const endD = new Date(
          selectedYear,
          selectedMonth,
          day,
          23,
          59,
          59,
          999,
        );
        buckets.push({
          label: String(day),
          startDate: d,
          endDate: endD,
          revenue: 0,
          orderCount: 0,
        });
      }
    } else {
      for (let m = 0; m < 12; m++) {
        const d = new Date(selectedYear, m, 1, 0, 0, 0, 0);
        const endD = new Date(selectedYear, m + 1, 0, 23, 59, 59, 999);
        buckets.push({
          label: `Th${m + 1}`,
          startDate: d,
          endDate: endD,
          revenue: 0,
          orderCount: 0,
        });
      }
    }

    orders.forEach((order) => {
      const rawDate = parseRevenueDate(order);
      if (!rawDate) return;

      const revenueDate = new Date(rawDate);
      if (isNaN(revenueDate.getTime())) return;

      const bucket = buckets.find(
        (item) => revenueDate >= item.startDate && revenueDate <= item.endDate,
      );

      if (bucket) {
        // Cộng doanh thu cho đơn hoàn thành
        if (isDeliveredOrder(order)) {
          bucket.revenue += Number(getOrderAmount(order)) || 0;
        }
        // Đếm số đơn phát sinh
        bucket.orderCount += 1;
      }
    });

    return buckets.map((item) => ({
      day: item.label,
      revenue: item.revenue,
      orderCount: item.orderCount,
    }));
  }, [orders, period, selectedMonth, selectedYear]);

  // Mô tả ngắn cho từng kỳ, hiện dưới tiêu đề 2 biểu đồ đầu
  const rangeLabel =
    period === "week"
      ? "7 ngày gần nhất"
      : period === "month"
        ? `Tháng ${selectedMonth + 1}`
        : `Năm ${selectedYear}`;

  // 2. Tính dữ liệu cho Biểu đồ Tròn (Chuẩn theo Hình 2)
  const { pieChartData, totalOrders, counts } = useMemo(() => {
    let pending = 0; // Chờ duyệt (1)
    let approved = 0; // Đã duyệt (2)
    let cancelled = 0; // Đã hủy (5)
    let delivered = 0; // Đã giao (4)
    let shipping = 0; // Đang giao (3)

    orders.forEach((order) => {
      const status = String(
        order.status ?? order.order_status ?? order.shipping_status ?? "",
      )
        .toLowerCase()
        .trim();

      if (
        status === "1" ||
        status.includes("pending") ||
        status.includes("chờ")
      ) {
        pending++;
      } else if (
        status === "2" ||
        status.includes("approved") ||
        status.includes("duyệt")
      ) {
        approved++;
      } else if (
        status === "5" ||
        status.includes("cancel") ||
        status.includes("hủy")
      ) {
        cancelled++;
      } else if (
        status === "4" ||
        status.includes("delivered") ||
        status.includes("giao")
      ) {
        delivered++;
      } else if (
        status === "3" ||
        status.includes("shipped") ||
        status.includes("shipping")
      ) {
        shipping++;
      }
    });

    const total = orders.length;

    const data = [
      { name: "Chờ duyệt", value: pending, color: "#f97316" }, // Cam
      { name: "Đã duyệt", value: approved, color: "#a855f7" }, // Tím
      { name: "Đã hủy", value: cancelled, color: "#f43f5e" }, // Đỏ hồng
      { name: "Đã giao", value: delivered, color: "#10b981" }, // Xanh lá
      { name: "Đang giao", value: shipping, color: "#ec4899" }, // Hồng tươi
    ].filter((item) => item.value > 0);

    return {
      pieChartData:
        data.length > 0
          ? data
          : [{ name: "Trống", value: 1, color: "#334155" }],
      totalOrders: total,
      counts: { pending, approved, cancelled, delivered, shipping },
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 📈 1. BIỂU ĐỒ DOANH SỐ — hàng riêng, chiếm cả chiều rộng */}
      <div className="bg-[#121520] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tốc độ doanh
              số
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Đơn hoàn thành · {rangeLabel}
            </p>
          </div>
          <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
            Trực tiếp
          </span>
        </div>

        <div className="w-full h-44 relative mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                interval={period === "month" ? 4 : 0}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v
                }
              />
              <Tooltip
                formatter={(val) => [
                  formatRevenue
                    ? formatRevenue(val)
                    : val.toLocaleString("vi-VN"),
                  "Doanh số",
                ]}
                contentStyle={{
                  backgroundColor: "#1c2030",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#amberGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📊 2. BIỂU ĐỒ CỘT SỐ LƯỢNG ĐƠN HÀNG & 🍩 3. BIỂU ĐỒ TRÒN — cùng 1 hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121520] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Số lượng đơn
                hàng
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Phát sinh · {rangeLabel}
              </p>
            </div>
            <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
              Số lượng
            </span>
          </div>

          <div className="w-full h-44 relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  interval={period === "month" ? 4 : 0}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val) => [`${val} đơn`, "Số đơn hàng"]}
                  contentStyle={{
                    backgroundColor: "#1c2030",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Bar
                  dataKey="orderCount"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 3. BIỂU ĐỒ TRÒN TRẠNG THÁI (Hình 2) */}
        <div className="bg-[#121520] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white mb-0.5">
              Trạng thái đơn hàng
            </h3>
            <p className="text-[10px] text-slate-400">
              Phân bổ theo quy trình xử lý
            </p>
          </div>

          <div className="my-1 flex items-center justify-center relative h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-white leading-none">
                {totalOrders}
              </span>
              <span className="text-[8px] font-bold text-slate-400 tracking-wider mt-0.5 uppercase">
                Đơn hàng
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Chờ
                duyệt
              </span>
              <span className="font-bold text-white">{counts.pending}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã
                giao
              </span>
              <span className="font-bold text-white">{counts.delivered}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Đã
                duyệt
              </span>
              <span className="font-bold text-white">{counts.approved}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> Đang
                giao
              </span>
              <span className="font-bold text-white">{counts.shipping}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Đã
                hủy
              </span>
              <span className="font-bold text-white">{counts.cancelled}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
