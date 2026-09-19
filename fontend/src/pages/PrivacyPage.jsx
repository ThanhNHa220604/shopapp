import React from "react";
import { Lock } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-slate-200 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Lock className="w-8 h-8 text-amber-400" />
        <h1 className="text-3xl font-black text-white">Chính Sách Bảo Mật</h1>
      </div>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">
          1. Thu thập thông tin cá nhân
        </h3>
        <p>
          ThanhNha thu thập thông tin người dùng bao gồm: Họ tên, Số điện thoại,
          Email, Địa chỉ giao hàng khi người dùng đặt hàng hoặc đăng ký tài
          khoản trên hệ thống.
        </p>
      </section>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">
          2. Mục đích sử dụng thông tin
        </h3>
        <p>
          Thông tin thu thập chỉ được dùng vào mục đích xử lý đơn hàng, giao
          hàng, bảo hành sản phẩm và gửi thông báo ưu đãi (nếu khách hàng đăng
          ký nhận tin).
        </p>
      </section>

      <section className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold text-white">3. Cam kết bảo mật</h3>
        <p>
          Chúng tôi sử dụng mã hóa SSL để bảo vệ dữ liệu giao dịch tài chính.
          Cam kết không chia sẻ, bán dữ liệu cá nhân cho bên thứ ba vì mục đích
          thương mại.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPage;
