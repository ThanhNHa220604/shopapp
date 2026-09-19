import React from "react";
import { ChevronRight, Eye, Edit2, Trash2 } from "lucide-react";

const ProductTable = ({
  loading,
  currentItems,
  isViewAll,
  setIsViewAll,
  currentPage,
  setCurrentPage,
  totalPages,
  openFullMode,
  setDeleteProduct,
}) => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-base">
          Danh sách sản phẩm
        </h2>
        <button
          onClick={() => {
            setIsViewAll(!isViewAll);
            setCurrentPage(1);
          }}
          className="text-xs text-[#1B59F8] font-bold flex items-center gap-1 bg-blue-50/60 px-3 py-1.5 rounded-xl"
        >
          {isViewAll ? "Bật phân trang" : "Xem tất cả"}{" "}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-bold">
          Đang tải dữ liệu...
        </div>
      ) : (
        <table className="w-full text-sm flex-1">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-100">
              {["Sản phẩm", "Giá", "Giá cũ", "Tồn kho", "Hành động"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-black tracking-widest text-gray-400 uppercase px-4 py-4 first:px-8 last:px-8"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image || "https://placehold.co/48x48"}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/48x48?text=Error";
                      }}
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[260px]">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-bold text-[#1B59F8]">
                  {Number(product.price || 0).toLocaleString("vi-VN")}₫
                </td>
                <td className="px-4 py-4 text-gray-400 line-through text-xs">
                  {Number(product.oldprice || 0).toLocaleString("vi-VN")}₫
                </td>
                <td className="px-4 py-4 font-bold text-gray-700">
                  {product.quanity}
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openFullMode(product, true)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openFullMode(product, false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!isViewAll && totalPages > 1 && (
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs font-bold text-gray-400">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
