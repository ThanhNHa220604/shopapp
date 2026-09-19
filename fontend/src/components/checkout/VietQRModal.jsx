import { X } from "lucide-react";

const VietQRModal = ({ qrData, onClose }) => {
  if (!qrData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Quét mã QR để Thanh Toán
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Mở app ngân hàng bất kỳ để quét mã
        </p>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4 inline-block">
          <img
            src={qrData.qrImageUrl}
            alt="VietQR Code"
            className="w-60 h-60 object-contain mx-auto rounded-lg"
          />
        </div>

        <p className="text-sm font-semibold text-blue-600 mb-4">
          Số tiền: {qrData.total?.toLocaleString("vi-VN")}đ
        </p>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          Đã hoàn tất chuyển khoản
        </button>
      </div>
    </div>
  );
};

export default VietQRModal;
