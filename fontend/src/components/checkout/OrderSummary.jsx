import { ShieldCheck, Lock, BadgeCheck, Tag, Ticket } from "lucide-react";

const OrderSummary = ({
  items,
  loading,
  subtotal,
  discountAmount,
  total,
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  setAppliedVoucher,
  voucherError,
  applyingVoucher,
  handleApplyVoucher,
  setShowVoucherModal,
  handleSubmit,
  placing,
  payment,
}) => {
  return (
    <div className="sticky top-6 space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">
          Tóm tắt đơn hàng
        </h2>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4 mb-5">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Đang tải...
            </p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Không có sản phẩm nào để thanh toán.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                  {item.products?.image ? (
                    <img
                      src={item.products.image}
                      alt={item.products.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                      No Img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.products?.name}
                  </p>
                  {item.skuLabel && (
                    <p className="text-xs text-gray-400 font-medium truncate">
                      Phân loại:{" "}
                      <span className="text-gray-600 font-semibold">
                        {item.skuLabel}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-blue-500 font-medium">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  {(
                    (item.price || item.products?.price || 0) * item.quantity
                  ).toLocaleString("vi-VN")}
                  đ
                </p>
              </div>
            ))
          )}
        </div>

        {/* Nhập & Chọn Voucher */}
        <div className="border-t border-gray-100 pt-4 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Mã giảm giá / Voucher</span>
            </label>
            <button
              type="button"
              onClick={() => setShowVoucherModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Chọn từ Ví Voucher</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã (VD: SALE2026)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-semibold outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              disabled={applyingVoucher || !voucherCode}
              className="bg-gray-900 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              {applyingVoucher ? "..." : "Áp dụng"}
            </button>
          </div>

          {voucherError && (
            <p className="text-[11px] text-red-500 mt-1.5 font-medium">
              {voucherError}
            </p>
          )}

          {appliedVoucher && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs text-green-700 font-bold">
              <span>✓ Đã áp dụng mã {appliedVoucher.code}</span>
              <button
                onClick={() => {
                  setAppliedVoucher(null);
                  setVoucherCode("");
                }}
                className="text-red-500 text-[10px] underline hover:text-red-700"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>

        {/* Bảng giá */}
        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Tạm tính</span>
            <span className="font-medium text-gray-800">
              {subtotal.toLocaleString("vi-VN")}đ
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Giảm giá (Voucher)</span>
              <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Phí vận chuyển</span>
            <span className="font-semibold text-blue-600">Miễn phí</span>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-1">
          <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
          <span className="text-xl font-black text-blue-600">
            {total.toLocaleString("vi-VN")}đ
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={placing || items.length === 0}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-sm tracking-wide"
        >
          {placing
            ? "Đang kết nối cổng thanh toán..."
            : payment === "momo"
              ? "Thanh toán qua Ví MoMo"
              : payment === "bank"
                ? "Lấy mã QR Ngân hàng"
                : "Đặt hàng ngay"}
        </button>

        <div className="flex items-center justify-center gap-4 mt-4">
          <ShieldCheck className="w-5 h-5 text-gray-300" />
          <Lock className="w-5 h-5 text-gray-300" />
          <BadgeCheck className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
