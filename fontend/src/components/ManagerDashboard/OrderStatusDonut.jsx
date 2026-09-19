import React from "react";

// 🌐 BẢNG DỊCH (dùng chung key "language" với Settings.jsx)
const translations = {
  vi: {
    title: "Trạng thái đơn hàng",
    subtitle: "Phân bổ theo quy trình xử lý",
    ordersLabel: "ĐƠN HÀNG",
    pending: "Chờ duyệt",
    completed: "Đã giao",
    approved: "Đã duyệt",
    shipping: "Đang giao",
    cancelled: "Đã hủy",
  },
  en: {
    title: "Order status",
    subtitle: "Breakdown by processing stage",
    ordersLabel: "ORDERS",
    pending: "Pending",
    completed: "Delivered",
    approved: "Approved",
    shipping: "Shipping",
    cancelled: "Cancelled",
  },
};

const getSavedLanguage = () => {
  const lang = localStorage.getItem("language");
  return translations[lang] ? lang : "vi";
};

const DONUT_PATH =
  "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

const OrderStatusDonut = ({ orders = [], language }) => {
  // Ưu tiên prop language từ Dashboard, nếu không có thì đọc từ localStorage
  const t = translations[language] || translations[getSavedLanguage()];

  // 1. Phân loại và đếm số lượng đơn theo trạng thái
  const pendingOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "1" || st === "pending" || st === "chờ duyệt" || st === "chờ xử lý"
    );
  }).length;

  const approvedOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "2" || st === "approved" || st === "confirmed" || st === "đã duyệt"
    );
  }).length;

  const shippingOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "3" ||
      st === "shipping" ||
      st === "delivering" ||
      st === "đang giao"
    );
  }).length;

  const completedOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "4" ||
      st === "completed" ||
      st === "delivered" ||
      st === "đã giao" ||
      st === "hoàn thành"
    );
  }).length;

  const cancelledOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "5" ||
      st === "0" ||
      st === "cancelled" ||
      st === "canceled" ||
      st === "đã hủy" ||
      st === "hủy đơn"
    );
  }).length;

  const totalOrdersCount = orders.length;

  // 2. Tính tỷ lệ %
  const pendingPct = totalOrdersCount
    ? (pendingOrders / totalOrdersCount) * 100
    : 0;
  const approvedPct = totalOrdersCount
    ? (approvedOrders / totalOrdersCount) * 100
    : 0;
  const shippingPct = totalOrdersCount
    ? (shippingOrders / totalOrdersCount) * 100
    : 0;
  const completedPct = totalOrdersCount
    ? (completedOrders / totalOrdersCount) * 100
    : 0;
  const cancelledPct = totalOrdersCount
    ? (cancelledOrders / totalOrdersCount) * 100
    : 0;

  // 3. Tính offset cho stroke SVG
  const pendingOffset = 0;
  const approvedOffset = -pendingPct;
  const shippingOffset = -(pendingPct + approvedPct);
  const completedOffset = -(pendingPct + approvedPct + shippingPct);
  const cancelledOffset = -(
    pendingPct +
    approvedPct +
    shippingPct +
    completedPct
  );

  return (
    <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-5 flex flex-col justify-between transition-colors duration-300">
      <div>
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
          {t.title}
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      {/* Biểu đồ Donut SVG */}
      <div className="my-2 flex items-center justify-center relative">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            d={DONUT_PATH}
          />
          {pendingPct > 0 && (
            <path
              className="text-orange-500 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${pendingPct}, 100`}
              strokeDashoffset={pendingOffset}
              stroke="currentColor"
              fill="none"
              d={DONUT_PATH}
            />
          )}
          {approvedPct > 0 && (
            <path
              className="text-purple-500 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${approvedPct}, 100`}
              strokeDashoffset={approvedOffset}
              stroke="currentColor"
              fill="none"
              d={DONUT_PATH}
            />
          )}
          {shippingPct > 0 && (
            <path
              className="text-pink-500 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${shippingPct}, 100`}
              strokeDashoffset={shippingOffset}
              stroke="currentColor"
              fill="none"
              d={DONUT_PATH}
            />
          )}
          {completedPct > 0 && (
            <path
              className="text-emerald-500 dark:text-emerald-400 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${completedPct}, 100`}
              strokeDashoffset={completedOffset}
              stroke="currentColor"
              fill="none"
              d={DONUT_PATH}
            />
          )}
          {cancelledPct > 0 && (
            <path
              className="text-rose-500 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={`${cancelledPct}, 100`}
              strokeDashoffset={cancelledOffset}
              stroke="currentColor"
              fill="none"
              d={DONUT_PATH}
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {totalOrdersCount}
          </span>
          <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase">
            {t.ordersLabel}
          </span>
        </div>
      </div>

      {/* Chú thích Legend */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{" "}
            {t.pending}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {pendingOrders}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>{" "}
            {t.completed}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {completedOrders}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>{" "}
            {t.approved}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {approvedOrders}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>{" "}
            {t.shipping}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {shippingOrders}
          </span>
        </div>
        <div className="flex items-center justify-between col-span-2 sm:col-span-1">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{" "}
            {t.cancelled}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {cancelledOrders}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDonut;
