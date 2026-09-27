import React from "react";
import { Ticket, Plus } from "lucide-react";

const VoucherHeader = ({ userProfile, onOpenModal }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14161f] border border-white/5 p-6 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
          <Ticket className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">
              Quản lý Voucher cá nhân
            </h1>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              ID Người đăng: {userProfile?.id || "N/A"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh sách các mã ưu đãi do bạn (
            {userProfile?.full_name || userProfile?.username || "Tài khoản"})
            trực tiếp tạo
          </p>
        </div>
      </div>

      <button
        onClick={onOpenModal}
        className="py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Tạo Voucher Mới</span>
      </button>
    </div>
  );
};

export default VoucherHeader;
