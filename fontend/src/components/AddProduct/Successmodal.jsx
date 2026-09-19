import React from "react";

/**
 * Modal thông báo thành công dùng chung (thay cho window.alert()).
 *
 * Props:
 * - open: boolean — có hiển thị modal hay không
 * - message: string — nội dung thông báo
 * - onConfirm: () => void — chạy khi người dùng bấm nút xác nhận
 * - confirmText: string — chữ trên nút xác nhận (mặc định "Đã hiểu")
 * - title: string — tiêu đề modal (mặc định "Thành công!")
 */
const SuccessModal = ({
  open,
  message,
  onConfirm,
  confirmText = "Đã hiểu",
  title = "Thành công!",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={onConfirm}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;