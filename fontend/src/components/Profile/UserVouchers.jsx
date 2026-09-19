import React, { useState, useEffect } from "react";
import { Ticket, Clock, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import voucherService from "../../services/voucherService";

// 🟢 Hàm tìm giá trị thông minh sâu trong object
// Hỗ trợ 3 kiểu dữ liệu API hay trả về:
//   1) Object lồng nhau:      { voucher: { discount_value: 10 } }
//   2) Key dạng "dotted":     { "voucher.discount_value": 10 }
//   3) Key phẳng bình thường: { discount_value: 10 }
const findValueInTree = (obj, keys, isNumber = false) => {
  if (!obj || typeof obj !== "object") return undefined;

  const tryParse = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (isNumber) {
      const num = Number(val);
      if (!isNaN(num) && num > 0) return num;
      return undefined;
    }
    return val;
  };

  // 1. Kiểm tra trực tiếp ở level hiện tại (key thường)
  for (const key of keys) {
    const found = tryParse(obj[key]);
    if (found !== undefined) return found;
  }

  // 2. Kiểm tra các key dạng "dotted" ngay tại level hiện tại
  //    ví dụ: obj["voucher.discount_value"] hoặc obj["Voucher.discount_value"]
  for (const objKey of Object.keys(obj)) {
    if (objKey.includes(".")) {
      const lastSegment = objKey.split(".").pop();
      const matchedKey = keys.find(
        (k) => k.toLowerCase() === lastSegment.toLowerCase(),
      );
      if (matchedKey) {
        const found = tryParse(obj[objKey]);
        if (found !== undefined) return found;
      }
    }
  }

  // 3. Tìm kiếm đệ quy trong các object con (voucher, Voucher, detail, ...)
  for (const key of Object.keys(obj)) {
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      const found = findValueInTree(obj[key], keys, isNumber);
      if (found !== undefined) return found;
    }
  }

  // 4. Fallback: chấp nhận cả giá trị số = 0 (ví dụ đơn tối thiểu = 0)
  if (isNumber) {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        const num = Number(obj[key]);
        if (!isNaN(num)) return num;
      }
    }
    // Fallback cho key dạng dotted với giá trị = 0
    for (const objKey of Object.keys(obj)) {
      if (objKey.includes(".")) {
        const lastSegment = objKey.split(".").pop();
        const matchedKey = keys.find(
          (k) => k.toLowerCase() === lastSegment.toLowerCase(),
        );
        if (
          matchedKey &&
          obj[objKey] !== undefined &&
          obj[objKey] !== null &&
          obj[objKey] !== ""
        ) {
          const num = Number(obj[objKey]);
          if (!isNaN(num)) return num;
        }
      }
    }
  }

  return undefined;
};

const UserVouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserVouchers();
  }, []);

  const extractVoucherInfo = (rawItem) => {
    const code =
      findValueInTree(rawItem, ["code", "voucher_code", "voucherCode"]) || "";

    const discountType = String(
      findValueInTree(rawItem, ["discount_type", "discountType", "type"]) ||
        "percent",
    ).toLowerCase();

    const discountVal =
      findValueInTree(
        rawItem,
        [
          "discount_value",
          "discountValue",
          "discount_amount",
          "discountAmount",
          "value",
        ],
        true,
      ) || 0;

    const maxDiscount =
      findValueInTree(
        rawItem,
        [
          "max_discount_amount",
          "maxDiscountAmount",
          "max_discount",
          "maxDiscount",
        ],
        true,
      ) || 0;

    const minOrder =
      findValueInTree(
        rawItem,
        ["min_order_value", "minOrderValue", "min_order", "minOrder"],
        true,
      ) || 0;

    const title =
      findValueInTree(rawItem, ["title", "name", "description"]) || "";

    const endDate =
      findValueInTree(rawItem, [
        "end_date",
        "endDate",
        "expired_at",
        "expires_at",
      ]) || "";

    return {
      id: rawItem.id || findValueInTree(rawItem, ["id"]),
      code,
      discountType,
      discountVal,
      maxDiscount,
      minOrder,
      title,
      endDate,
    };
  };

  const fetchUserVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getUserSavedVouchers();

      // 🔍 Bật dòng dưới nếu vẫn còn sai dữ liệu, xem cấu trúc thật API trả về
      // console.log("RAW VOUCHER RESPONSE:", JSON.stringify(res, null, 2));

      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.vouchers)) {
        list = res.vouchers;
      } else if (Array.isArray(res?.data?.vouchers)) {
        list = res.data.vouchers;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      }

      setVouchers(list);
    } catch (error) {
      console.error("Lỗi khi tải danh sách voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-[28px] border border-gray-100 min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">
            Đang tải danh sách voucher...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-white rounded-[28px] border border-gray-100 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Kho Voucher của tôi
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Danh sách các mã giảm giá bạn đã lưu và sẵn sàng sử dụng
            </p>
          </div>
        </div>
        <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
          {vouchers.length} Mã khả dụng
        </span>
      </div>

      {/* Empty State */}
      {vouchers.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              Bạn chưa lưu mã giảm giá nào
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy khám phá các sản phẩm và thu thập thêm nhiều ưu đãi hấp dẫn.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sắm Tết ngay</span>
          </button>
        </div>
      ) : (
        /* Voucher List */
        <div className="grid grid-cols-1 gap-4">
          {vouchers.map((item, index) => {
            const v = extractVoucherInfo(item);

            return (
              <div
                key={v.id || index}
                className="relative flex items-stretch bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Viền khuyết hiệu ứng vé */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-r border-amber-200 z-10" />

                {/* Nội dung */}
                <div className="p-4 pl-6 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {v.code && (
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {v.code}
                      </span>
                    )}
                    {v.minOrder > 0 ? (
                      <span className="text-[10px] font-bold text-slate-500">
                        Đơn từ {v.minOrder.toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        Đơn bất kỳ
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900">
                        {v.discountType === "percent" ||
                        v.discountType === "percentage"
                          ? `Giảm ${v.discountVal}%`
                          : `Giảm ${v.discountVal.toLocaleString("vi-VN")}đ`}
                      </h4>

                      {/* Hiển thị mức giảm tối đa nếu có (áp dụng cho giảm theo %) */}
                      {v.maxDiscount > 0 && (
                        <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          Tối đa {v.maxDiscount.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>

                    {v.title && (
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {v.title}
                      </p>
                    )}
                  </div>

                  {v.endDate && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700/80 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserVouchers;
