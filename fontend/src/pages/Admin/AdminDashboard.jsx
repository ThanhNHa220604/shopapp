import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarRange, RefreshCw } from "lucide-react";

// Sub-components Dashboard
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import StatsGrid from "../../components/dashboard/StatsGrid";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import OrdersTab from "../../components/ManagerOrder/OrderTable";
import ProductsTab from "../../components/dashboard/ProductsTab";
import MyProductsTab from "../../components/dashboard/MyProductsTab";
import DeletedProducts from "../../components/dashboard/Deletedproducts";

// Các trang Admin khác
import ManageBanners from "./ManageBanners";
import Settings from "../Settings";
import ManageNews from "./ManageNews";
import ManageFlashSale from "./ManageFlashSale";
import Users from "./Users";
import AddProduct from "../Manager/AddProduct";
import DeleteModal from "../../components/ManagerProduct/DeleteModal";
import ProductDetailForm from "../../components/ManagerProduct/ProductDetailForm";
import SuccessModal from "../../components/AddProduct/Successmodal";
import Voucher from "../VoucherManager";
import Chats from "../../components/ManagerChat/ManagerChat";

// Hook & Utils
import {
  useAdminDashboard,
  formatRevenue,
  getImageUrl,
} from "../../components/dashboard/useAdminDashboard";
import { useAppSettings } from "../../hooks/useAppSettings";
import { parseRevenueDate } from "../../utils/orderUtils";

/**
 * QUY ƯỚC DỊCH TRONG FILE NÀY
 * ---------------------------------------------------------------
 * - Chữ CỐ ĐỊNH của giao diện (menu, nút, nhãn...) -> dịch bằng i18next: t("...").
 *   Các vùng này được bọc translate="no" để Google Translate KHÔNG dịch lần 2
 *   (tránh dịch chồng, và tránh Google chèn <font> vào DOM do React quản lý).
 * - Nội dung ĐỘNG (tên sản phẩm, đơn hàng, banner, tin tức, tin nhắn...) ->
 *   để mặc định, Google Translate sẽ tự dịch theo cookie "googtrans".
 *
 * Wrapper dùng `className="contents"` (display: contents) nên KHÔNG làm
 * thay đổi layout flex/grid của phần tử bên trong.
 */
const NoTranslate = ({ children }) => (
  <div translate="no" className="contents">
    {children}
  </div>
);

// Lấy ngày của đơn hàng để lọc theo kỳ (dùng chung hàm parseRevenueDate
// để khớp với cách DashboardCharts/StatsGrid đang tính ngày cho đơn hàng)
const getOrderPeriodDate = (order) => {
  const raw = parseRevenueDate(order) || order.createdAt || order.created_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

// Khoảng thời gian [start, end) theo bộ lọc Tuần / Tháng / Năm
const getPeriodRange = (period, month, year) => {
  const now = new Date();
  if (period === "week") {
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return { start: new Date(y, m, d - 6), end: new Date(y, m, d + 1) };
  }
  if (period === "month") {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 1),
    };
  }
  // year
  return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - i,
);

// Thanh lọc Tuần / Tháng / Năm, đặt phía trên StatsGrid, giống bên Manager
const DashboardPeriodFilter = ({
  period,
  onPeriodChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  onRefresh,
}) => {
  const PERIODS = [
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
    { key: "year", label: "Năm" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#121520] border border-white/5 rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 pl-1 pr-2 uppercase tracking-wider">
        <CalendarRange className="w-3.5 h-3.5" />
        Thống kê theo
      </div>

      <div
        role="group"
        className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5"
      >
        {PERIODS.map(({ key, label }) => {
          const active = period === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onPeriodChange(key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                active
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {period === "month" && (
        <select
          aria-label="Chọn tháng"
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/60"
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m} className="bg-[#121520] text-white">
              Tháng {m + 1}
            </option>
          ))}
        </select>
      )}

      {period === "year" && (
        <select
          aria-label="Chọn năm"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/60"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y} className="bg-[#121520] text-white">
              Năm {y}
            </option>
          ))}
        </select>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="ml-auto inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-bold text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Làm mới
        </button>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { t } = useTranslation();

  // Hook dùng chung với Settings.jsx: tự đồng bộ theme (class "dark"),
  // document.lang và i18n mỗi khi cài đặt đổi (event "app-settings-changed",
  // "storage") hoặc sau khi trang reload do đổi ngôn ngữ Google Translate.
  // Không cần tự viết listener + đọc localStorage ở đây nữa.
  useAppSettings();

  const {
    activeTab,
    setActiveTab,
    userProfile,
    products,
    myProducts,
    orders,
    // Phân trang
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalProducts,
    // Status & Search
    loadingProducts,
    loadingOrders,
    loadingStats,
    productSearch,
    setProductSearch,
    orderSearch,
    setOrderSearch,
    deleteProduct,
    setDeleteProduct,
    deleting,
    stats,
    pieData,
    pendingCount,
    handleDeleteProduct,
    handleLogout,
    // Form Chi tiết
    openFullMode,
    closeFullMode,
    isFullDetailMode,
    isReadOnly,
    editForm,
    setEditForm,
    attributes,
    setAttributes,
    variants,
    setVariants,
    variantValues,
    setVariantValues,
    brands,
    categories,
    saving,
    detailError,
    handleSaveProduct,
    // Modal thông báo cập nhật thành công
    successModal,
    confirmSuccessModal,
  } = useAdminDashboard();

  // Bộ lọc Tuần / Tháng / Năm cho tab Dashboard (không ảnh hưởng các tab khác)
  const [period, setPeriod] = useState("week"); // "week" | "month" | "year"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const filteredOrders = useMemo(() => {
    const { start, end } = getPeriodRange(period, selectedMonth, selectedYear);
    return orders.filter((o) => {
      const d = getOrderPeriodDate(o);
      return d && d >= start && d < end;
    });
  }, [orders, period, selectedMonth, selectedYear]);

  const periodLabel =
    period === "week"
      ? "7 ngày gần nhất"
      : period === "month"
        ? `tháng ${selectedMonth + 1}`
        : `năm ${selectedYear}`;

  if (isFullDetailMode) {
    return (
      <div className="flex h-screen w-full bg-slate-100 dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100 antialiased font-sans overflow-hidden transition-colors duration-300">
        <NoTranslate>
          <Sidebar activeTab={activeTab} onLogout={handleLogout} />
        </NoTranslate>

        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-[#0b0d14]">
          <div className="p-8 max-w-[1600px] w-full mx-auto flex-1">
            <ProductDetailForm
              isReadOnly={isReadOnly}
              saving={saving}
              error={detailError}
              editForm={editForm}
              setEditForm={setEditForm}
              attributes={attributes}
              setAttributes={setAttributes}
              variants={variants}
              setVariants={setVariants}
              variantValues={variantValues}
              setVariantValues={setVariantValues}
              brands={brands}
              categories={categories}
              onBack={closeFullMode}
              onSave={handleSaveProduct}
            />
          </div>
        </main>

        <NoTranslate>
          <SuccessModal
            open={successModal.open}
            message={successModal.message}
            onConfirm={confirmSuccessModal}
          />
        </NoTranslate>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100 antialiased font-sans overflow-hidden transition-colors duration-300">
      {/* 1. Sidebar (chữ cố định -> i18n) */}
      <NoTranslate>
        <Sidebar activeTab={activeTab} onLogout={handleLogout} />
      </NoTranslate>

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-[#0b0d14]">
        <NoTranslate>
          <Header
            userProfile={userProfile}
            pendingCount={pendingCount}
            totalOrdersCount={orders.length}
            setActiveTab={setActiveTab}
          />
        </NoTranslate>

        <div className="p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1">
          {activeTab === "dashboard" && (
            <>
              {/* Bộ lọc Tuần / Tháng / Năm */}
              <NoTranslate>
                <DashboardPeriodFilter
                  period={period}
                  onPeriodChange={setPeriod}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  year={selectedYear}
                  onYearChange={setSelectedYear}
                />
              </NoTranslate>

              {/* Card Thống Kê Tổng Quan (theo bộ lọc) */}
              <StatsGrid
                stats={stats}
                orders={filteredOrders}
                periodLabel={periodLabel}
                loadingStats={loadingStats}
                formatRevenue={formatRevenue}
              />

              {/* Biểu đồ & Phân bổ đơn hàng (theo bộ lọc) */}
              <DashboardCharts
                orders={filteredOrders}
                period={period}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                pieData={pieData}
                formatRevenue={formatRevenue}
              />
            </>
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={products}
              loadingProducts={loadingProducts}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              getImageUrl={getImageUrl}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              totalProducts={totalProducts}
              openFullMode={openFullMode}
              setDeleteProduct={setDeleteProduct}
            />
          )}

          {activeTab === "my-products" && (
            <MyProductsTab
              myProducts={myProducts}
              loadingProducts={loadingProducts}
              openFullMode={openFullMode}
              setDeleteProduct={setDeleteProduct}
              onAddNewProduct={() => setActiveTab("add-product")}
            />
          )}

          {activeTab === "add-product" && (
            <div className="space-y-4">
              <button
                translate="no"
                onClick={() => setActiveTab("products")}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors font-bold"
              >
                ← {t("adminDashboard.backToProducts")}
              </button>
              <AddProduct onSuccess={() => setActiveTab("products")} />
            </div>
          )}

          {activeTab === "orders" && (
            <OrdersTab
              orders={orders}
              loadingOrders={loadingOrders}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              formatRevenue={formatRevenue}
            />
          )}

          {activeTab === "users" && <Users />}
          {activeTab === "banners" && (
            <ManageBanners getImageUrl={getImageUrl} />
          )}
          {activeTab === "news" && <ManageNews getImageUrl={getImageUrl} />}
          {activeTab === "flashsale" && (
            <ManageFlashSale getImageUrl={getImageUrl} />
          )}
          {activeTab === "vouchers" && <Voucher />}
          {activeTab === "deleted-products" && <DeletedProducts />}
          {activeTab === "chats" && <Chats />}

          {/* Settings: toàn bộ chữ đã dùng t() nên không cho Google dịch lại */}
          {activeTab === "settings" && (
            <NoTranslate>
              <Settings />
            </NoTranslate>
          )}
        </div>
      </main>

      {/* Modal xóa sản phẩm (chữ cố định -> i18n) */}
      <NoTranslate>
        <DeleteModal
          deleteProduct={deleteProduct}
          deleting={deleting}
          onCancel={() => setDeleteProduct(null)}
          onConfirm={handleDeleteProduct}
        />
      </NoTranslate>
    </div>
  );
};

export default AdminDashboard;
