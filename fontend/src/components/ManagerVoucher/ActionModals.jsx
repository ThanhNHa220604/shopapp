import React from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

export const ConfirmModal = ({ confirmModal, onClose }) => {
  if (!confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl relative">
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {confirmModal.title}
          </h3>
          <p className="text-xs text-slate-400">{confirmModal.message}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 text-xs font-bold rounded-xl border border-white/5 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={confirmModal.onConfirm}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all"
          >
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export const AlertModal = ({ alertModal, onClose }) => {
  if (!alertModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl relative">
        {alertModal.type === "success" && (
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        )}

        {alertModal.type === "error" && (
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
            <XCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
        )}

        {alertModal.type === "info" && (
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
            <Info className="w-6 h-6 stroke-[2.5]" />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">{alertModal.title}</h3>
          <p className="text-xs text-slate-400">{alertModal.message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
