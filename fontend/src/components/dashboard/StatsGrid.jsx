import React, { useMemo } from "react";
import {
  Store,
  Package,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  isDeliveredOrder,
  getOrderAmount,
} from "../../utils/orderUtils";

const StatsGrid = ({
  stats = {},
  orders = [],
  // Nhãn mô tả khoảng thời gian đang lọc (ví dụ "tháng 9", "năm 2026",
  // "7 ngày gần nhất"). AdminDashboard truyền xuống theo bộ lọc Tuần/Tháng/Năm.
  periodLabel = "tháng này",
  loadingStats,
  formatRevenue,
}) => {
  // `orders` đã được AdminDashboard lọc sẵn theo kỳ (Tuần/Tháng/Năm),
  // ở đây chỉ cần cộng doanh thu của các đơn đã hoàn thành trong đó.
  const displayRevenue = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;

    return orders
      .filter((order) => isDeliveredOrder(order))
      .reduce((total, order) => {
        const amount = Number(getOrderAmount(order)) || 0;
        return total + amount;
      }, 0);
  }, [orders]);

  // Số đơn phát sinh trong kỳ đang lọc
  const periodOrdersCount = Array.isArray(orders) ? orders.length : 0;

  const renderGrowthBadge = (value, isPercentage = true) => {
    const numericValue = Number(value) || 0;
    if (numericValue > 0) {
      return (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-0.5">
          <TrendingUp className="w-3 h-3" /> +{numericValue}
          {isPercentage ? "%" : ""}
        </span>
      );
    } else if (numericValue < 0) {
      return (
        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-0.5">
          <TrendingDown className="w-3 h-3" /> {numericValue}
          {isPercentage ? "%" : ""}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-md border border-slate-500/20 flex items-center gap-0.5">
        <Minus className="w-3 h-3" /> 0{isPercentage ? "%" : ""}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Doanh thu */}
      <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Store className="w-4 h-4" />
          </div>
          {renderGrowthBadge(stats.revenueGrowth || 0, true)}
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-white">
            {loadingStats
              ? "..."
              : formatRevenue
                ? formatRevenue(displayRevenue)
                : displayRevenue.toLocaleString("vi-VN")}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Doanh thu {periodLabel}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Chỉ tính các đơn đã hoàn thành (DELIVERED)
          </p>
        </div>
      </div>

      {/* Đơn hàng */}
      <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Package className="w-4 h-4" />
          </div>
          {renderGrowthBadge(stats.orderGrowth || 0, true)}
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-white">
            {loadingStats
              ? "..."
              : periodOrdersCount.toLocaleString("vi-VN")}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Đơn hàng {periodLabel}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Tăng trưởng {stats.orderGrowth || 0}% so với tháng trước
          </p>
        </div>
      </div>

      {/* Người mua */}
      <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          {renderGrowthBadge(stats.userGrowth || 0, false)}
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-white">
            {loadingStats
              ? "..."
              : `+${(stats.newUsers || 0).toLocaleString("vi-VN")}`}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Người mua mới
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Tương tác với gian hàng của bạn
          </p>
        </div>
      </div>

      {/* Tỷ lệ hoàn tất */}
      <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-white">
            {loadingStats ? "..." : `${stats.completionRate || 0}%`}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Tỷ lệ hoàn tất đơn
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            trên tổng đơn hàng của bạn
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;