import React from "react";
import {
  Ticket,
  X,
  Percent,
  Coins,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";

// Backend có thể trả apply_scope: "all" | "specific_products" | "specific_categories"
const isSpecificScope = (scope) =>
  scope === "specific_products" || scope === "specific_categories";

// Lấy danh sách id sản phẩm áp dụng từ voucher, chấp nhận nhiều dạng field
// backend có thể trả về (mảng id thuần / mảng object / mảng pivot).
const extractProductIds = (voucher) => {
  const rawList =
    voucher?.product_ids ??
    voucher?.products ??
    voucher?.voucher_products ??
    [];

  return (Array.isArray(rawList) ? rawList : [])
    .map((p) => {
      if (typeof p === "object" && p !== null) {
        return p.id ?? p.product_id ?? p.productId;
      }
      return p;
    })
    .filter((id) => id !== undefined && id !== null);
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-slate-400 font-bold">{label}</span>
    <span className="text-white font-bold text-right">{value}</span>
  </div>
);

// products: mảng sản phẩm của user hiện tại (đã fetch sẵn ở trang cha),
// dùng để đối chiếu ra tên/ảnh sản phẩm từ product_ids của voucher.
const VoucherDetailModal = ({ isOpen, onClose, voucher, products = [] }) => {
  if (!isOpen || !voucher) return null;

  const isPercent =
    voucher.discount_type === "percent" ||
    voucher.discount_type === "percentage";

  const productIds = extractProductIds(voucher);
  const appliedProducts = products.filter((p) => productIds.includes(p.id));

  const formatDate = (val) => {
    if (!val) return "Không giới hạn";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-xl p-6 relative space-y-5 my-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pr-8">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Chi Tiết Voucher</span>
          </h2>

          {voucher.is_active ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <CheckCircle className="w-3 h-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <XCircle className="w-3 h-3" /> Tạm dừng
            </span>
          )}
        </div>

        <div className="text-xs space-y-5">
          {/* Mã & tiêu đề */}
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-sm">
              {voucher.code}
            </span>
            {isPercent ? (
              <span className="text-emerald-400 flex items-center gap-1 font-black text-sm">
                <Percent className="w-4 h-4" />
                {voucher.discount_value}%
              </span>
            ) : (
              <span className="text-orange-400 flex items-center gap-1 font-black text-sm">
                <Coins className="w-4 h-4" />
                {Number(voucher.discount_value || 0).toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>

          <p className="text-white font-bold text-sm">{voucher.title}</p>

          {/* Thông tin điều kiện */}
          <div className="bg-white/5 rounded-xl px-4">
            <InfoRow
              label="Giảm tối đa"
              value={
                voucher.max_discount_amount
                  ? `${Number(voucher.max_discount_amount).toLocaleString("vi-VN")} đ`
                  : "Không giới hạn"
              }
            />
            <InfoRow
              label="Đơn tối thiểu"
              value={
                voucher.min_order_value
                  ? `${Number(voucher.min_order_value).toLocaleString("vi-VN")} đ`
                  : "Không yêu cầu"
              }
            />
            <InfoRow
              label="Tổng lượt dùng"
              value={
                <span className="flex items-center gap-1 justify-end">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {voucher.used_count || 0} / {voucher.usage_limit || "∞"}
                </span>
              }
            />
            <InfoRow
              label="Lượt dùng / khách"
              value={voucher.limit_per_user || 1}
            />
          </div>

          {/* Thời gian */}
          <div className="bg-white/5 rounded-xl px-4">
            <InfoRow
              label={
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Bắt đầu
                </span>
              }
              value={formatDate(voucher.start_date)}
            />
            <InfoRow
              label={
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Kết thúc
                </span>
              }
              value={formatDate(voucher.end_date)}
            />
          </div>

          {/* Phạm vi áp dụng */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Phạm vi áp dụng
              </span>
              <span className="text-white font-bold">
                {isSpecificScope(voucher.apply_scope)
                  ? `${appliedProducts.length} sản phẩm cụ thể`
                  : "Tất cả sản phẩm"}
              </span>
            </div>

            {isSpecificScope(voucher.apply_scope) && (
              <>
                {appliedProducts.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    {productIds.length > 0
                      ? "Không tìm thấy thông tin sản phẩm trong danh sách hiện có."
                      : "Chưa có sản phẩm nào được chọn."}
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5 max-h-52 overflow-y-auto">
                    {appliedProducts.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover bg-[#1a1c26] flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-bold truncate">
                            {p.name}
                          </p>
                          {p.price != null && (
                            <p className="text-slate-400 text-[11px]">
                              {Number(p.price).toLocaleString("vi-VN")} đ
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 font-bold rounded-xl border border-white/5"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailModal;
