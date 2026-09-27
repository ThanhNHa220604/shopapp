import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();

  // MoMo trả về các tham số URL như: orderId, resultCode, message...
  const orderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");

  const isSuccess = resultCode === "0" || !resultCode; // resultCode = 0 là MoMo thành công

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {isSuccess ? (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán & Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã mua hàng. {orderId && `Mã đơn hàng: ${orderId}`}
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
            ✕
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán thất bại hoặc đã bị hủy
          </h1>
          <p className="text-gray-600 mb-6">
            Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức
            khác.
          </p>
        </>
      )}

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
