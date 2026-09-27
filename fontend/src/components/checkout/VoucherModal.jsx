import { Ticket, X } from "lucide-react";

const VoucherModal = ({
  show,
  onClose,
  loading,
  vouchers,
  appliedVoucher,
  onSelect,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" /> Kho Voucher của bạn
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Đang tải danh sách voucher...
            </p>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-400 text-sm">
                Bạn chưa sở hữu mã giảm giá nào.
              </p>
            </div>
          ) : (
            vouchers.map((v) => {
              const voucherData = v.voucher || v;
              const code = voucherData.code || v.code || v.voucher_code || "";
              const isApplied = appliedVoucher?.code === code;

              return (
                <div
                  key={v.id || code}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isApplied
                      ? "border-green-500 bg-green-50/40"
                      : "border-gray-200 hover:border-blue-400 bg-white"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-gray-900 text-sm tracking-wide">
                        {code}
                      </span>
                      {voucherData.discount_type === "percent" ? (
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                          Giảm {voucherData.discount_value}%
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          Giảm{" "}
                          {Number(
                            voucherData.discount_value || 0
                          ).toLocaleString("vi-VN")}
                          đ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {voucherData.description ||
                        "Áp dụng cho các sản phẩm hợp lệ"}
                    </p>
                    {voucherData.min_order_amount && (
                      <p className="text-[11px] text-gray-400">
                        Đơn tối thiểu:{" "}
                        {Number(voucherData.min_order_amount).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelect(v)}
                    disabled={isApplied}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      isApplied
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isApplied ? "Đã chọn" : "Áp dụng"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;