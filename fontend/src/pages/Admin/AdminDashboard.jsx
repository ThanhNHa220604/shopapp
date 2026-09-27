import React from "react";
import { useTranslation } from "react-i18next";

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
              {/* Card Thống Kê Tổng Quan */}
              <StatsGrid
                stats={stats}
                orders={orders}
                loadingStats={loadingStats}
                formatRevenue={formatRevenue}
              />

              {/* Biểu đồ Tuần & Phân bổ đơn hàng */}
              <DashboardCharts
                orders={orders}
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
