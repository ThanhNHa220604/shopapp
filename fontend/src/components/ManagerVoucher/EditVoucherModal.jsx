import React, { useState, useEffect } from "react";
import { Ticket, X, Package, Trash2 } from "lucide-react";
import ProductPickerModal from "./Productpickermodal";

// Hàm hỗ trợ chuyển đổi ngày về định dạng YYYY-MM-DDTHH:mm chuẩn của HTML input
const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Backend lưu apply_scope dạng: "all" | "specific_products" | "specific_categories"
// UI nội bộ chỉ dùng "all" | "specific" cho gọn -> cần map 2 chiều.
const scopeFromBackend = (scope) => {
  if (scope === "specific_products" || scope === "specific_categories") {
    return "specific";
  }
  return "all";
};

// products: mảng sản phẩm của user hiện tại, do trang cha fetch theo user_id
// rồi truyền xuống, ví dụ: [{ id, name, image, price }, ...]
const EditVoucherModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingVoucher,
  products = [],
}) => {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_amount: "",
    min_order_value: "",
    usage_limit: "",
    limit_per_user: 1,
    start_date: "",
    end_date: "",
    apply_scope: "all", // "all" | "specific"
    product_ids: [],
    is_active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (editingVoucher) {
      // Tuỳ backend trả về mảng id thuần, mảng object sản phẩm, hay mảng pivot
      // (vd: { product_id }) — hàm dưới đây thử bắt hết các trường hợp phổ biến.
      const rawProductList =
        editingVoucher.product_ids ??
        editingVoucher.products ??
        editingVoucher.voucher_products ??
        [];

      const extractedIds = (
        Array.isArray(rawProductList) ? rawProductList : []
      ).map((p) => {
        if (typeof p === "object" && p !== null) {
          return p.id ?? p.product_id ?? p.productId;
        }
        return p;
      });

      setFormData({
        code: editingVoucher.code || "",
        title: editingVoucher.title || "",
        discount_type: editingVoucher.discount_type || "percentage",
        discount_value: editingVoucher.discount_value ?? "",
        max_discount_amount: editingVoucher.max_discount_amount ?? "",
        min_order_value: editingVoucher.min_order_value ?? "",
        usage_limit: editingVoucher.usage_limit ?? "",
        limit_per_user: editingVoucher.limit_per_user ?? 1,
        start_date: formatDateForInput(editingVoucher.start_date),
        end_date: formatDateForInput(editingVoucher.end_date),
        apply_scope: scopeFromBackend(editingVoucher.apply_scope),
        product_ids: extractedIds.filter(
          (id) => id !== undefined && id !== null,
        ),
        is_active: Boolean(editingVoucher.is_active),
      });
    }
  }, [editingVoucher]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedProducts = products.filter((p) =>
    formData.product_ids.includes(p.id),
  );

  const removeProduct = (id) => {
    setFormData({
      ...formData,
      product_ids: formData.product_ids.filter((pid) => pid !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-xl p-6 relative space-y-5 my-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-amber-400" />
          <span>Chỉnh Sửa Voucher</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Mã Voucher *
              </label>
              <input
                type="text"
                required
                placeholder="VD: SUMMER2026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Tiêu đề *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Giảm giá hè 2026"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Loại giảm giá
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({ ...formData, discount_type: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Mức giảm giá *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Mức giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                placeholder="Bỏ trống nếu không giới hạn"
                value={formData.max_discount_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount_amount: e.target.value,
                  })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Giá trị đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                placeholder="VD: 100000"
                value={formData.min_order_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Tổng số lượt dùng
              </label>
              <input
                type="number"
                placeholder="Bỏ trống nếu không giới hạn"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Số lần dùng / 1 khách hàng
              </label>
              <input
                type="number"
                min="1"
                value={formData.limit_per_user}
                onChange={(e) =>
                  setFormData({ ...formData, limit_per_user: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full bg-[#1a1c26] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="block text-slate-400 font-bold mb-1">
              Phạm vi áp dụng
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="apply_scope_edit"
                  checked={formData.apply_scope === "all"}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      apply_scope: "all",
                      product_ids: [],
                    })
                  }
                  className="w-4 h-4 text-orange-500 focus:ring-0"
                />
                <span className="text-white font-bold">Tất cả sản phẩm</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="apply_scope_edit"
                  checked={formData.apply_scope === "specific"}
                  onChange={() =>
                    setFormData({ ...formData, apply_scope: "specific" })
                  }
                  className="w-4 h-4 text-orange-500 focus:ring-0"
                />
                <span className="text-white font-bold">Sản phẩm cụ thể</span>
              </label>
            </div>

            {formData.apply_scope === "specific" && (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-white/5">
                  <span className="text-slate-300 font-bold">
                    Sản phẩm đã chọn ({selectedProducts.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex items-center gap-1 text-blue-400 font-bold hover:underline"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Chọn sản phẩm
                  </button>
                </div>

                {selectedProducts.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    Chưa chọn sản phẩm nào.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5 max-h-40 overflow-y-auto">
                    {selectedProducts.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="text-white truncate">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded bg-[#1a1c26] border-white/10 text-orange-500 focus:ring-0"
              />
              <span className="text-white font-bold">Kích hoạt</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 font-bold rounded-xl border border-white/5"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </form>
      </div>

      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        products={products}
        selectedIds={formData.product_ids}
        onConfirm={(ids) => setFormData({ ...formData, product_ids: ids })}
      />
    </div>
  );
};

export default EditVoucherModal;
