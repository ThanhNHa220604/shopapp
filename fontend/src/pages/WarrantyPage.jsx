import React from "react";
import { ShieldCheck, Search, Clock, Wrench, CheckCircle } from "lucide-react";

const WarrantyPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-slate-200">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white">Trung Tâm Bảo Hành & Sửa Chữa</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Tra cứu thông tin bảo hành, quy trình xử lý sự cố thiết bị công nghệ chính hãng tại ThanhNha.
        </p>
      </div>

      {/* Tra cứu bảo hành */}
      <div className="bg-[#181a26] border border-white/10 rounded-2xl p-6 mb-10 text-center max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-white mb-2">Tra cứu hạn bảo hành</h3>
        <p className="text-xs text-slate-400 mb-4">Nhập IMEI hoặc Số điện thoại mua hàng để kiểm tra</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập IMEI / SĐT..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
          <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4" /> Tra cứu
          </button>
        </div>
      </div>

      {/* Quy trình bảo hành */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#181a26] border border-white/5 p-6 rounded-2xl">
          <Clock className="w-8 h-8 text-amber-400 mb-4" />
          <h4 className="font-bold text-white mb-2">1. Tiếp nhận & Kiểm tra</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kỹ thuật viên kiểm tra lỗi phần cứng/phần mềm trực tiếp trong vòng 15-30 phút.
          </p>
        </div>

        <div className="bg-[#181a26] border border-white/5 p-6 rounded-2xl">
          <Wrench className="w-8 h-8 text-teal-400 mb-4" />
          <h4 className="font-bold text-white mb-2">2. Xử lý & Thay thế</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sử dụng linh kiện chính hãng 100%. Thời gian xử lý trung bình từ 3 - 7 ngày làm việc.
          </p>
        </div>

        <div className="bg-[#181a26] border border-white/5 p-6 rounded-2xl">
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" />
          <h4 className="font-bold text-white mb-2">3. Bàn giao thiết bị</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kiểm tra lại toàn bộ chức năng, dán tem bảo hành mới và bàn giao tận tay khách hàng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;