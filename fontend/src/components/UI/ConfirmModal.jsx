import React from "react";
import { AlertCircle } from "lucide-react";

const ConfirmModal = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center transform animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-base font-black text-slate-900 leading-tight">
          {modal.title}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-2 px-1 leading-relaxed">
          {modal.message}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={modal.onConfirm}
            className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-500/10"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
