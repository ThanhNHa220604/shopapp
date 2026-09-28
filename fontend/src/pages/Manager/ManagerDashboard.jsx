import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosOriginal from "axios";
import { Package, CheckCircle2, Activity, Coins } from "lucide-react";

import Header from "../../components/ManagerLayout/Header";
import WelcomeBanner from "../../components/ManagerDashboard/WelcomeBanner";
import MetricCard from "../../components/ManagerDashboard/MetricCard";
import MonthlyOrderVelocity from "../../components/ManagerDashboard/MonthlyOrderVelocity";
import OrderStatusDonut from "../../components/ManagerDashboard/OrderStatusDonut";

// Cho phép đổi base URL qua biến môi trường khi deploy (build production
// không thể trỏ về "localhost:5000" của máy dev). Thêm REACT_APP_API_URL
// vào file .env khi deploy thật.
// Các đường dẫn bên dưới đã có sẵn tiền tố "/api/..." nên base URL KHÔNG được
// kết thúc bằng "/api" (trước đây bị thành /api/api/products -> 404 -> báo lỗi
// và toàn bộ số liệu = 0). Đoạn .replace bên dưới tự bỏ "/api" ở cuối nếu
// .env của bạn lỡ khai báo dư.
const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "");

// Trả về "YYYY-MM-DD" theo GIỜ ĐỊA PHƯƠNG. Không dùng toISOString() vì nó đổi
// sang UTC: ở Việt Nam (UTC+7) đơn tạo từ 00:00-07:00 sẽ bị tính sang ngày hôm trước.
const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Lấy ngày tạo đơn (trả về null nếu thiếu hoặc không hợp lệ)
const getOrderDate = (order) => {
  const raw = order.created_at || order.createdAt || order.date;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

// Đơn đã hoàn thành / đã giao
const isCompletedOrder = (o) => {
  const st = String(o.status || o.order_status || "").toLowerCase();
  return (
    st === "4" ||
    st === "completed" ||
    st === "delivered" ||
    st === "đã giao" ||
    st === "hoàn thành"
  );
};

// Khoảng thời gian [start, end) theo giờ địa phương cho từng bộ lọc
const getPeriodRange = (period, selectedMonth, selectedYear) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  if (period === "week")
    return { start: new Date(y, m, d - 6), end: new Date(y, m, d + 1) };
  if (period === "month")
    return {
      start: new Date(y, selectedMonth, 1),
      end: new Date(y, selectedMonth + 1, 1),
    };
  // Năm: chọn 1 năm cụ thể, hoặc "all" = năm hiện tại + 4 năm trước (5 năm)
  if (selectedYear !== "all")
    return { start: new Date(selectedYear, 0, 1), end: new Date(selectedYear + 1, 0, 1) };
  return { start: new Date(y - 4, 0, 1), end: new Date(y + 1, 0, 1) };
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [period, setPeriod] = useState("week"); // "week" | "month" | "year"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 -> 11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // năm đang chọn
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);


  // Phân biệt rõ 3 trạng thái: đang tải / lỗi (không tải được) / không có
  // dữ liệu thật. Trước đây nếu fetchUserProfile lỗi, `loading` bị kẹt ở
  // true mãi mãi vì chỉ fetchData() mới set loading = false.
  const [loadError, setLoadError] = useState(null);

  const fetchData = async (currentManagerId) => {
    const targetId = currentManagerId || userProfile?.id;
    if (!targetId) return;

    setLoading(true);
    setLoadError(null);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const [productsRes, ordersRes] = await Promise.all([
        axiosOriginal.get(
          `${API_BASE_URL}/api/products?limit=10000&page=1&user_id=${targetId}`,
          config,
        ),
        axiosOriginal.get(
          `${API_BASE_URL}/api/orders?limit=10000&page=1&manager_id=${targetId}`,
          config,
        ),
      ]);

      const rawProducts =
        productsRes.data?.data ||
        productsRes.data?.products ||
        productsRes.data ||
        [];
      const productsList = Array.isArray(rawProducts) ? rawProducts : [];
      setTotalProductsCount(productsList.length);

      const rawOrders =
        ordersRes.data?.data || ordersRes.data?.orders || ordersRes.data || [];
      const finalOrders = Array.isArray(rawOrders) ? rawOrders : [];
      setOrders(finalOrders);

    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard:", error?.config?.url, error);

      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setLoading(false);
        navigate("/login");
        return;
      }

      // Trước đây lỗi chỉ log ra console, người dùng nhìn UI không biết gì
      // đang xảy ra (số liệu kẹt ở "..."). Giờ hiện rõ thông báo trên UI.
      setLoadError(t("dashboard.loadErrorNetwork", "Unable to load data. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu biểu đồ đường bên trái: đổi theo bộ lọc Tuần / Tháng / Năm
  const buildChartData = (ordersList, currentPeriod, selMonth, selYear) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let buckets = [];

    if (currentPeriod === "week") {
      const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(year, month, now.getDate() - i);
        buckets.push({
          key: toLocalDateStr(d),
          dateStr: toLocalDateStr(d),
          label: dayLabels[d.getDay()],
          isCurrent: i === 0,
          count: 0,
        });
      }
    } else if (currentPeriod === "month") {
      const daysInMonth = new Date(year, selMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, selMonth, day);
        buckets.push({
          key: toLocalDateStr(d),
          dateStr: toLocalDateStr(d),
          label: String(day),
          isCurrent: selMonth === month && day === now.getDate(),
          count: 0,
        });
      }
    } else {
      if (selYear === "all") {
        for (let i = 4; i >= 0; i--) {
          const yr = year - i;
          buckets.push({
            key: String(yr),
            dateStr: String(yr),
            label: String(yr),
            isCurrent: i === 0,
            count: 0,
          });
        }
      } else {
        for (let mo = 0; mo < 12; mo++) {
          const key = `${selYear}-${String(mo + 1).padStart(2, "0")}`;
          buckets.push({
            key,
            dateStr: key,
            label: `Th${mo + 1}`,
            isCurrent: selYear === year && mo === month,
            count: 0,
          });
        }
      }
    }

    const byKey = new Map(buckets.map((b) => [b.key, b]));
    ordersList.forEach((order) => {
      const d = getOrderDate(order);
      if (!d) return;
      const key =
        currentPeriod === "year"
          ? selYear === "all"
            ? String(d.getFullYear()) // "YYYY"
            : toLocalDateStr(d).slice(0, 7) // "YYYY-MM"
          : toLocalDateStr(d);
      const bucket = byKey.get(key);
      if (bucket) bucket.count += 1;
    });

    const maxVal = Math.max(...buckets.map((b) => b.count), 1);
    const last = Math.max(buckets.length - 1, 1);
    return buckets.map((b, index) => ({
      ...b,
      x: (index / last) * 500,
      y: 130 - (b.count / maxVal) * 90,
    }));
  };

  // Biểu đồ xu hướng ở giữa: "thu nhỏ" ra ngoài kỳ đang chọn để so sánh
  //   Tuần  -> 12 tuần gần nhất
  //   Tháng -> 12 tháng gần nhất
  //   Năm   -> 12 tháng của năm hiện tại (biểu đồ trái đã hiện 5 năm)
  const buildTrendData = (ordersList, currentPeriod, selMonth, selYear) => {
    const now = new Date();
    const y = now.getFullYear();
    const mondayOf = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    let buckets = [];
    let keyOf;

    if (currentPeriod === "week") {
      const thisMonday = mondayOf(now);
      for (let i = 11; i >= 0; i--) {
        const start = new Date(
          thisMonday.getFullYear(),
          thisMonday.getMonth(),
          thisMonday.getDate() - 7 * i,
        );
        const label = `${start.getDate()}/${start.getMonth() + 1}`;
        buckets.push({
          key: toLocalDateStr(start),
          label,
          title: `Tuần ${label}`,
          isCurrent: i === 0,
          count: 0,
        });
      }
      keyOf = (d) => toLocalDateStr(mondayOf(d));
    } else if (currentPeriod === "month") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(y, selMonth - i, 1);
        buckets.push({
          key: toLocalDateStr(d).slice(0, 7),
          label: `Th${d.getMonth() + 1}`,
          title: `Th${d.getMonth() + 1}/${d.getFullYear()}`,
          isCurrent: i === 0,
          count: 0,
        });
      }
      keyOf = (d) => toLocalDateStr(d).slice(0, 7);
    } else {
      if (selYear === "all") {
        // 12 tháng của năm hiện tại
        for (let mo = 0; mo < 12; mo++) {
          buckets.push({
            key: `${y}-${String(mo + 1).padStart(2, "0")}`,
            label: `Th${mo + 1}`,
            title: `Th${mo + 1}/${y}`,
            isCurrent: mo === now.getMonth(),
            count: 0,
          });
        }
        keyOf = (d) => toLocalDateStr(d).slice(0, 7);
      } else {
        // 5 năm gần nhất, tô nổi bật năm đang chọn
        for (let i = 4; i >= 0; i--) {
          const yr = y - i;
          buckets.push({
            key: String(yr),
            label: String(yr),
            title: `Năm ${yr}`,
            isCurrent: yr === selYear,
            count: 0,
          });
        }
        keyOf = (d) => String(d.getFullYear());
      }
    }

    const byKey = new Map(buckets.map((b) => [b.key, b]));
    ordersList.forEach((order) => {
      const d = getOrderDate(order);
      const bucket = d && byKey.get(keyOf(d));
      if (bucket) bucket.count += 1;
    });

    const maxVal = Math.max(...buckets.map((b) => b.count), 1);
    const last = Math.max(buckets.length - 1, 1);
    return buckets.map((b, index) => ({
      ...b,
      x: (index / last) * 500,
      y: 130 - (b.count / maxVal) * 90,
    }));
  };

  // Đơn hàng nằm trong khoảng thời gian của bộ lọc
  const filteredOrders = useMemo(() => {
    const { start, end } = getPeriodRange(period, selectedMonth, selectedYear);
    return orders.filter((o) => {
      const d = getOrderDate(o);
      return d && d >= start && d < end;
    });
  }, [orders, period, selectedMonth, selectedYear]);

  const chartData = useMemo(
    () => buildChartData(orders, period, selectedMonth, selectedYear),
    [orders, period, selectedMonth, selectedYear],
  );

  const trendData = useMemo(
    () => buildTrendData(orders, period, selectedMonth, selectedYear),
    [orders, period, selectedMonth, selectedYear],
  );

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

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Chưa đăng nhập -> không có gì để tải, đưa thẳng về trang login
        // thay vì để Dashboard kẹt "..." vô nghĩa.
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axiosOriginal.get(
        `${API_BASE_URL}/api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const userData = response.data?.data || response.data;
      setUserProfile(userData);

      if (userData?.id) {
        fetchData(userData.id);
      } else {
        // Profile trả về nhưng không có id hợp lệ -> fetchData sẽ không
        // bao giờ chạy, cũng phải tắt loading để tránh kẹt "...".
        setLoading(false);
        setLoadError(t("dashboard.loadErrorNetwork", "Unable to load data. Please try again."));
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error?.config?.url, error);
      setLoading(false);

      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        // Phiên đăng nhập hết hạn / không hợp lệ -> về login luôn
        navigate("/login");
        return;
      }

      setLoadError(t("dashboard.loadErrorNetwork", "Unable to load data. Please try again."));
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Badge chờ duyệt ở Header luôn tính trên TOÀN BỘ đơn, không theo bộ lọc
  const pendingOrders = orders.filter((o) => {
    const st = String(o.status || o.order_status || "").toLowerCase();
    return (
      st === "1" || st === "pending" || st === "chờ duyệt" || st === "chờ xử lý"
    );
  }).length;

  // Các số liệu dưới đây thay đổi theo bộ lọc Tuần / Tháng / Năm
  const completedOrders = filteredOrders.filter(isCompletedOrder).length;

  const totalRevenue = filteredOrders
    .filter(isCompletedOrder)
    .reduce(
      (sum, o) => sum + Number(o.total ?? o.total_amount ?? o.total_price ?? 0),
      0,
    );

  const weekStroke = generateSmoothPath(chartData);
  const weekArea = weekStroke ? `${weekStroke} L 500 150 L 0 150 Z` : "";
  const hasWeekData = chartData.some((d) => d.count > 0);

  const formattedRevenue = `${Number(totalRevenue).toLocaleString("vi-VN")} đ`;

  return (
    <div className="w-full min-h-full bg-slate-50 dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      <div className="w-full space-y-7 max-w-[1600px] mx-auto">
        <Header userProfile={userProfile} pendingOrders={pendingOrders} />

        <WelcomeBanner
          userProfile={userProfile}
          loading={loading}
          onRefresh={() => fetchData()}
          language={i18n.language?.slice(0, 2)}
          period={period}
          onPeriodChange={setPeriod}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          year={selectedYear}
          onYearChange={setSelectedYear}
        />

        {loadError && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <span>⚠️ {loadError}</span>

            <button
              type="button"
              onClick={() => fetchUserProfile()}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
            >
              {t("dashboard.retry", "Retry")}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <MetricCard
            icon={Package}
            value={loading ? "..." : totalProductsCount}
            title={t("dashboard.productsOnSale")}
            unit={t("dashboard.productsUnit")}
            colorTheme="amber"
          />

          <MetricCard
            icon={CheckCircle2}
            value={loading ? "..." : filteredOrders.length}
            title={t("dashboard.totalOrders")}
            unit={t("dashboard.completedUnit", { count: completedOrders })}
            colorTheme="emerald"
          />

          <MetricCard
            icon={Coins}
            value={loading ? "..." : formattedRevenue}
            title={t("dashboard.totalRevenue")}
            colorTheme="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#14161f] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-5 flex flex-col justify-between hover:border-orange-500/30 dark:hover:border-orange-500/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />{" "}
                  {t(`dashboard.chartTitle_${period}`, {
                    defaultValue: {
                      week: "Số lượng đơn hàng tuần qua",
                      month: `Số lượng đơn hàng trong tháng ${selectedMonth + 1}`,
                      year:
                        selectedYear === "all"
                          ? "Số lượng đơn hàng trong 5 năm gần nhất"
                          : `Số lượng đơn hàng trong năm ${selectedYear}`,
                    }[period],
                  })}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(`dashboard.chartDesc_${period}`, {
                    defaultValue: {
                      week: "Đơn hàng tạo ra trong 7 ngày qua",
                      month: `Đơn hàng tạo ra theo từng ngày trong tháng ${selectedMonth + 1}`,
                      year:
                        selectedYear === "all"
                          ? "Đơn hàng tạo ra theo từng năm, từ năm nay lùi về 4 năm trước"
                          : `Đơn hàng tạo ra theo từng tháng trong năm ${selectedYear}`,
                    }[period],
                  })}
                </p>
              </div>
              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse"></span>
                {t("dashboard.live")}
              </span>
            </div>

            <div className="w-full h-36 relative flex items-end">
              {!loading && !loadError && !hasWeekData && (
                <p className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-400 dark:text-slate-600">
                  {t("dashboard.noWeekData")}
                </p>
              )}

              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {weekArea && <path d={weekArea} fill="url(#orangeGlow)" />}
                {weekStroke && (
                  <path
                    d={weekStroke}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {chartData.map((pt, i) => (
                  <g key={i} className="group/node cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={chartData.length > 12 ? 3 : 5}
                      className="fill-orange-500 stroke-white dark:stroke-[#14161f] stroke-[3] transition-all group-hover/node:r-7"
                    />
                    <title>
                      {t("dashboard.ordersTooltip", {
                        label: pt.label,
                        date: pt.dateStr,
                        count: pt.count,
                      })}
                    </title>
                  </g>
                ))}
              </svg>
            </div>

            <div
              className="flex justify-between text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5"
            >
              {chartData.map((d, index) => {
                const step = chartData.length > 12 ? 5 : 1;
                const show =
                  index % step === 0 || index === chartData.length - 1;
                return (
                  <span
                    key={index}
                    className={`flex-1 ${
                      d.isCurrent
                        ? "text-orange-600 dark:text-orange-400 font-extrabold"
                        : ""
                    }`}
                  >
                    {show ? d.label : ""}
                  </span>
                );
              })}
            </div>
          </div>

          <MonthlyOrderVelocity
            monthChartData={trendData}
            period={period}
            year={selectedYear}
          />
          <OrderStatusDonut orders={filteredOrders} />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;