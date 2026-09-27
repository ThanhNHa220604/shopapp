import React, { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";

/**
 * Modal chọn sản phẩm áp dụng voucher.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - products: mảng sản phẩm của user hiện tại, ví dụ:
 *     [{ id, name, image, price }, ...]
 *   (Trang cha tự fetch theo user_id rồi truyền xuống,
 *    hoặc bạn có thể sửa lại để component này tự gọi API)
 * - selectedIds: mảng id sản phẩm đang được chọn (formData.product_ids)
 * - onConfirm: (idsArray) => void  -> gọi khi bấm "Xác nhận"
 */
const ProductPickerModal = ({
  isOpen,
  onClose,
  products = [],
  selectedIds = [],
  onConfirm,
}) => {
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState(selectedIds);

  // Đồng bộ lại khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
      setSearch("");
    }
  }, [isOpen, selectedIds]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q));
  }, [products, search]);

  if (!isOpen) return null;

  const toggleProduct = (id) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (tempSelected.length === filteredProducts.length) {
      setTempSelected([]);
    } else {
      setTempSelected(filteredProducts.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-lg p-5 relative space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-black text-white">Chọn sản phẩm áp dụng</h3>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1c26] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={toggleAll}
            className="text-orange-400 font-bold hover:underline"
          >
            {tempSelected.length === filteredProducts.length &&
            filteredProducts.length > 0
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
          <span className="text-slate-400">
            Đã chọn:{" "}
            <span className="text-white font-bold">{tempSelected.length}</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-8">
              Không tìm thấy sản phẩm nào.
            </p>
          ) : (
            filteredProducts.map((product) => {
              const checked = tempSelected.includes(product.id);
              return (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                      checked
                        ? "bg-orange-500 border-orange-500"
                        : "border-white/20 bg-[#1a1c26]"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleProduct(product.id);
                    }}
                  >
                    {checked && <Check className="w-3 h-3 text-slate-950" />}
                  </div>

                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 rounded-lg object-cover bg-[#1a1c26]"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">
                      {product.name}
                    </p>
                    {product.price != null && (
                      <p className="text-slate-400 text-[11px]">
                        {Number(product.price).toLocaleString("vi-VN")} đ
                      </p>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 text-xs font-bold rounded-xl border border-white/5"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-orange-500/20"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;
