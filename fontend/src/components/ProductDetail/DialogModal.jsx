// Gộp chung hai Modal (thành công và lỗi) vào một component dùng chung, điều khiển qua props.
import React from "react";
import { X, AlertTriangle, CheckCircle, ShoppingBag } from "lucide-react";

const DialogModal = ({ isOpen, onClose, type, title, message, onAction, actionText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111c44]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
        </button>

        {type === "error" ? (
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-orange-500">
            <AlertTriangle className="w-9 h-9" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-green-500">
            <CheckCircle className="w-9 h-9" />
          </div>
        )}

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-[#1B2559]">{title}</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed px-2">{message}</p>
        </div>

        {type === "error" ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={onAction || onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all active:scale-[0.98] shadow-md shadow-blue-600/10"
            >
              {actionText || "Đã hiểu"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-black rounded-xl transition-all active:scale-[0.98]"
            >
              Tiếp tục xem
            </button>
            <button
              type="button"
              onClick={onAction}
              className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-md shadow-blue-600/10"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Xem giỏ hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogModal;