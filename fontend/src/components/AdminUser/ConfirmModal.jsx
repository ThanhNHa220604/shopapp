//(Modal xác nhận)


import { AlertTriangle, Info } from "lucide-react";

export const ConfirmModal = ({ modalConfig, closeModal }) => {
  if (!modalConfig.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#181a26] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              modalConfig.variant === "danger"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : modalConfig.variant === "warning"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            {modalConfig.variant === "info" ? (
              <Info className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{modalConfig.title}</h3>
            <p className="text-slate-300 text-sm mt-1">{modalConfig.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {modalConfig.type === "confirm" && (
            <button
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
          )}
          <button
            onClick={modalConfig.onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              modalConfig.variant === "danger"
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : modalConfig.variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {modalConfig.type === "confirm" ? "Xác nhận" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
};