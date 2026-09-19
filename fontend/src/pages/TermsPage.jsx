import React from "react";
import { FileText } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-slate-200 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <FileText className="w-8 h-8 text-amber-400" />
        <h1 className="text-3xl font-black text-white">Điều Khoản Dịch Vụ</h1>
      </div>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">1. Chấp nhận điều khoản</h3>
        <p>Khi truy cập và đặt hàng tại website ThanhNha, quý khách mặc nhiên đồng ý với tất cả các quy định và điều khoản hoạt động của chúng tôi.</p>
      </section>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">2. Giá cả & Sản phẩm</h3>
        <p>Giá niêm yết trên website đã bao gồm thuế VAT. ThanhNha có quyền điều chỉnh giá niêm yết tùy theo tình trạng kho hàng và chương trình khuyến mãi.</p>
      </section>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">3. Trách nhiệm người dùng</h3>
        <p>Khách hàng có trách nhiệm cung cấp thông tin chính xác khi đặt hàng và không sử dụng bất kỳ công cụ can thiệp trái phép nào vào hệ thống website.</p>
      </section>
    </div>
  );
};

export default TermsPage;