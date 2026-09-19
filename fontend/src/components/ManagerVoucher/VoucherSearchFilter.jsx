import React from "react";
import { Search, RefreshCw } from "lucide-react";

const VoucherSearchFilter = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
  loading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#14161f] border border-white/5 p-4 rounded-2xl">
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo mã hoặc tên voucher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1c26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      <button
        onClick={onRefresh}
        className="p-2.5 bg-[#1a1c26] hover:bg-[#232635] text-slate-300 rounded-xl border border-white/5 transition-all"
        title="Làm mới"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
};

export default VoucherSearchFilter;
