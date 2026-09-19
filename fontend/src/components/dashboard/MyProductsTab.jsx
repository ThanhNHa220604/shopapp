import React from "react";
import ProductTable from "../ManagerProduct/ProductTable";

const MyProductsTab = ({
  myProducts,
  loadingProducts,
  openFullMode,
  setDeleteProduct,
  onAddNewProduct,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161f] p-5 rounded-2xl border border-white/5 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white">Sản phẩm của tôi</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh sách các sản phẩm do tài khoản Admin này trực tiếp tạo
          </p>
        </div>
        <button
          onClick={onAddNewProduct}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          + Đăng sản phẩm mới
        </button>
      </div>

      <ProductTable
        loading={loadingProducts}
        currentItems={myProducts}
        isViewAll={true}
        setIsViewAll={() => {}}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        openFullMode={openFullMode}
        setDeleteProduct={setDeleteProduct}
      />
    </div>
  );
};

export default MyProductsTab;
