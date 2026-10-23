import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import orderService from "../services/order";

const MAX_TRIES = 8; // hỏi tối đa 8 lần
const INTERVAL_MS = 2000; // mỗi lần cách nhau 2 giây

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();

  // MoMo redirect về kèm: orderId (dạng "DH17_1730000000000"), resultCode, message...
  const momoOrderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");

  // "DH17_1730000000000" -> "DH17"
  const orderCode = momoOrderId ? momoOrderId.split("_")[0] : null;

  // checking | paid | pending | failed
  // Nếu MoMo báo thất bại/hủy (resultCode khác 0) thì hiện thất bại luôn.
  // Ngược lại KHÔNG tin URL để báo thành công, phải hỏi server.
  const [state, setState] = useState(
    resultCode && resultCode !== "0" ? "failed" : "checking",
  );

  useEffect(() => {
    if (state !== "checking") return;
    if (!momoOrderId) {
      setState("failed");
      return;
    }

    let tries = 0;
    let timer;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await orderService.verifyMomo(momoOrderId);
        const d = res?.data || res;
        if (cancelled) return;

        if (d?.is_paid) return setState("paid");
      } catch (err) {
        console.error("Lỗi xác minh thanh toán:", err);
      }

      if (cancelled) return;
      tries += 1;
      if (tries < MAX_TRIES) timer = setTimeout(check, INTERVAL_MS);
      else setState("pending");
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [momoOrderId, state]);

  const views = {
    checking: {
      icon: "…",
      iconClass: "bg-gray-100 text-gray-500",
      title: "Đang xác nhận thanh toán...",
      desc: "Vui lòng đợi trong giây lát, không đóng trang này.",
    },
    paid: {
      icon: "✓",
      iconClass: "bg-green-100 text-green-500",
      title: "Thanh toán & Đặt hàng thành công!",
      desc: `Cảm ơn bạn đã mua hàng.${orderCode ? ` Mã đơn hàng: ${orderCode}` : ""}`,
    },
    pending: {
      icon: "!",
      iconClass: "bg-yellow-100 text-yellow-600",
      title: "Chưa nhận được xác nhận từ MoMo",
      desc: `Nếu bạn đã thanh toán, đơn sẽ được cập nhật trong ít phút. Nếu chưa thấy cập nhật, vui lòng liên hệ hỗ trợ.${orderCode ? ` Mã đơn hàng: ${orderCode}` : ""}`,
    },
    failed: {
      icon: "✕",
      iconClass: "bg-red-100 text-red-500",
      title: "Thanh toán thất bại hoặc đã bị hủy",
      desc: "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.",
    },
  };
  const v = views[state];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${v.iconClass}`}
      >
        {v.icon}
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{v.title}</h1>
      <p className="text-gray-600 mb-6 max-w-md">{v.desc}</p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Trang chủ
        </Link>
        <Link
          to="/carts"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Xem lại đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;