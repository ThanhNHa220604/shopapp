import React from "react";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  Coins,
  CheckCircle,
  XCircle,
} from "lucide-react";

const VoucherTable = ({ vouchers, loading, onEdit, onDelete, onView }) => {
  if (loading) {
    return (
      <div className="bg-[#14161f] border border-white/5 rounded-2xl p-12 text-center text-slate-400 text-xs">
        Đang tải danh sách voucher của bạn...
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-[#14161f] border border-white/5 rounded-2xl p-12 text-center text-slate-400 text-xs">
        Bạn chưa đăng voucher nào.
      </div>
    );
  }

  return (
    <div className="bg-[#14161f] border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1a1c26] text-slate-400 font-extrabold uppercase tracking-wider border-b border-white/5">
              <th className="p-4">Mã Voucher</th>
              <th className="p-4">Tiêu đề</th>
              <th className="p-4">Mức giảm</th>
              <th className="p-4">Lượt dùng</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {vouchers.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4">
                  <span className="font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    {v.code}
                  </span>
                </td>
                <td className="p-4 font-bold text-white max-w-[180px] truncate">
                  {v.title}
                </td>
                <td className="p-4 font-bold">
                  {v.discount_type === "percent" ||
                  v.discount_type === "percentage" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      {v.discount_value}%
                    </span>
                  ) : (
                    <span className="text-orange-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {Number(v.discount_value).toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-white font-bold">
                    {v.used_count || 0}
                  </span>{" "}
                  / <span>{v.usage_limit || "∞"}</span>
                </td>
                <td className="p-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {v.start_date
                        ? new Date(v.start_date).toLocaleDateString("vi-VN")
                        : "N/A"}{" "}
                      -{" "}
                      {v.end_date
                        ? new Date(v.end_date).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {v.is_active ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" /> Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <XCircle className="w-3 h-3" /> Tạm dừng
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(v)}
                      className="p-1.5 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border border-slate-500/20 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(v)}
                      className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(v.id)}
                      className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoucherTable;
