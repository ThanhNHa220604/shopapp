//
//thống kê số lượng




import { Users, Plus, Zap } from "lucide-react";

export const UserStats = ({ total, newUsersToday, activeUsers }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-[#181a26] rounded-2xl border border-white/5 p-6">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Users className="w-6 h-6 text-amber-400" />
      </div>
      <p className="mt-6 text-slate-300 text-xs font-bold uppercase tracking-wider">
        Tổng khách hàng
      </p>
      <h3 className="text-3xl font-black text-white mt-1">
        {total.toLocaleString()}
      </h3>
    </div>

    <div className="bg-[#181a26] rounded-2xl border border-white/5 p-6">
      <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
        <Plus className="w-6 h-6 text-teal-400" />
      </div>
      <p className="mt-6 text-slate-300 text-xs font-bold uppercase tracking-wider">
        User mới hôm nay
      </p>
      <h3 className="text-3xl font-black text-white mt-1">
        {newUsersToday.toLocaleString()}
      </h3>
    </div>

    <div className="bg-[#181a26] rounded-2xl border border-white/5 p-6">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <Zap className="w-6 h-6 text-emerald-400" />
      </div>
      <p className="mt-6 text-slate-300 text-xs font-bold uppercase tracking-wider">
        User đang hoạt động
      </p>
      <h3 className="text-3xl font-black text-white mt-1">
        {activeUsers.toLocaleString()}
      </h3>
    </div>
  </div>
);