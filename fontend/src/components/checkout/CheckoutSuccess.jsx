import { CheckCircle2 } from "lucide-react";

const CheckoutSuccess = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Đặt hàng thành công!
          </h2>
          <p className="text-gray-400 text-sm">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>
        <button
          onClick={onGoHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;