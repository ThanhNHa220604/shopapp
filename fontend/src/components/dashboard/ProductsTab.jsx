import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const ProductsTab = ({
  products = [],
  loadingProducts,
  productSearch,
  setProductSearch,
  getImageUrl,
  currentPage = 1,
  setCurrentPage,
  totalPages = 1,
  totalProducts = 0,
  pageSize = 16,
}) => {
  // Helper render tên sản phẩm
  const renderProductName = (prod) => {
    if (!prod) return "Không có tên";
    if (typeof prod.name === "object" && prod.name !== null) {
      return prod.name.name || JSON.stringify(prod.name);
    }
    return String(prod.name || "Không có tên");
  };

  // Helper render danh mục
  const renderCategoryName = (prod) => {
    if (!prod) return "Chưa phân loại";
    const cat = prod.category || prod.Category;
    if (cat && typeof cat === "object")
      return cat.name || cat.title || "Danh mục";
    if (typeof cat === "string") return cat;
    if (prod.category_id) return `Danh mục #${prod.category_id}`;
    return "Chưa phân loại";
  };

  // Helper render người tạo
  const renderCreatorName = (prod) => {
    if (!prod) return "Quản lý / Nhà bán";
    const userObj = prod.User || prod.user;
    if (userObj && typeof userObj === "object") {
      return (
        userObj.name || userObj.username || userObj.email || "Tài khoản User"
      );
    }
    if (prod.authorName) {
      return typeof prod.authorName === "object"
        ? prod.authorName.name || "Tác giả"
        : String(prod.authorName);
    }
    return "Quản lý / Nhà bán";
  };

  // Helper render giá
  const renderProductPrice = (prod) => {
    if (!prod) return "0đ";
    let priceValue =
      typeof prod.price === "object" && prod.price !== null
        ? prod.price.value || prod.price.amount || 0
        : prod.price;
    const parsed = parseFloat(priceValue);
    return isNaN(parsed) ? "0đ" : `${parsed.toLocaleString("vi-VN")}đ`;
  };

  const safeProductsList = Array.isArray(products) ? products : [];

  // Tạo danh sách các số trang [1, 2, 3, ...]
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="bg-[#121520] border border-white/5 rounded-2xl p-6 space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-white">
            Tất cả sản phẩm hệ thống ({totalProducts})
          </h3>
          <p className="text-xs text-slate-400">
            Danh sách toàn bộ sản phẩm đã lưu từ tất cả người bán & gian hàng
            (Quyền Admin)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#1b1f2e] border border-white/10 rounded-xl px-3 py-2 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên sản phẩm..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table Content */}
      {loadingProducts ? (
        <div className="text-center py-12 text-slate-400 text-xs font-bold">
          Đang tải danh sách sản phẩm...
        </div>
      ) : safeProductsList.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs font-bold">
          Không tìm thấy sản phẩm nào.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[11px] font-extrabold uppercase bg-white/5">
                  <th className="py-3 px-4">Hình ảnh</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Đơn giá</th>
                  <th className="py-3 px-4">Người đăng tải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {safeProductsList.map((prod, idx) => (
                  <tr
                    key={prod.id || prod._id || idx}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 px-4">
                      <img
                        src={getImageUrl(prod.image || prod.imageUrl)}
                        alt="product"
                        className="w-12 h-12 object-cover rounded-lg border border-white/10"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/50x50?text=Khong+Co+Anh";
                        }}
                      />
                    </td>
                    <td className="py-2 px-4 font-bold text-white">
                      {renderProductName(prod)}
                    </td>
                    <td className="py-2 px-4 text-slate-400">
                      {renderCategoryName(prod)}
                    </td>
                    <td className="py-2 px-4 font-extrabold text-amber-400">
                      {renderProductPrice(prod)}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {renderCreatorName(prod)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thanh Phân Trang UI Cập Nhật Có Icon Trước & Sau */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400">
              Hiển thị{" "}
              <span className="font-bold text-white">
                {totalProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-white">
                {Math.min(currentPage * pageSize, totalProducts)}
              </span>{" "}
              trên tổng số{" "}
              <span className="font-bold text-white">{totalProducts}</span> sản
              phẩm
            </div>

            {/* Cụm Nút Phân Trang */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#0e1017] rounded-2xl border border-white/5">
              {/* Nút Trước (Prev) */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Trang trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Các nút số trang */}
              {renderPageNumbers().map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm font-black rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/30 scale-105"
                        : "text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Nút Sau (Next) */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
                className="w-10 h-10 flex items-center justify-center text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Trang sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsTab;
