import React from "react";
import { CheckCircle2 } from "lucide-react";

const SuccessModal = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center transform animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200/60">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-base font-black text-slate-900 leading-tight">
          {modal.title}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-2 px-1 leading-relaxed">
          {modal.message}
        </p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
