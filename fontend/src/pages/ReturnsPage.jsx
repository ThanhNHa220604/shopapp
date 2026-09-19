import React from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

const ReturnsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-slate-200 space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-black text-white">Chính Sách Đổi Trả</h1>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Áp dụng cho tất cả các sản phẩm Laptop, Điện thoại, Phụ kiện công
          nghệ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#181a26] border border-emerald-500/20 p-6 rounded-2xl">
          <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5" /> Điều kiện Đổi Trả Miễn Phí (30 ngày)
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li>Sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất.</li>
            <li>Máy còn nguyên tem bảo hành, không bị trầy xước, móp méo.</li>
            <li>Hộp sản phẩm còn nguyên vẹn, đầy đủ phụ kiện đi kèm.</li>
            <li>Có hóa đơn mua hàng hoặc thông tin đơn hàng điện tử.</li>
          </ul>
        </div>

        <div className="bg-[#181a26] border border-rose-500/20 p-6 rounded-2xl">
          <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Trường hợp Không Hỗ Trợ Đổi Trả
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li>
              Thiết bị bị vào nước, rơi vỡ, biến dạng do tác động ngoại lực.
            </li>
            <li>Tự ý Root/Jailbreak hoặc can thiệp vào Firmware hệ thống.</li>
            <li>Sản phẩm bị mất hộp hoặc phụ kiện đi kèm.</li>
            <li>Hết thời hạn 30 ngày kể từ ngày nhận hàng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
