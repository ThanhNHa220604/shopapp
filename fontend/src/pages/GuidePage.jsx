import React from "react";
import { ShoppingCart, CreditCard, Truck, PackageCheck } from "lucide-react";

const GuidePage = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "1. Chọn sản phẩm",
      desc: "Tìm kiếm thiết bị yêu thích, chọn cấu hình & màu sắc rồi bấm 'Thêm vào giỏ hàng'.",
    },
    {
      icon: CreditCard,
      title: "2. Đặt hàng & Thanh toán",
      desc: "Điền thông tin nhận hàng, chọn phương thức thanh toán (COD, Chuyển khoản, Thẻ, Trả góp).",
    },
    {
      icon: Truck,
      title: "3. Xác nhận & Vận chuyển",
      desc: "Nhân viên chăm sóc tư vấn sẽ gọi xác nhận đơn. Đơn hàng được giao từ 1 - 3 ngày.",
    },
    {
      icon: PackageCheck,
      title: "4. Nhận hàng & Kiểm tra",
      desc: "Đồng kiểm cùng shipper, thử máy trước khi thanh toán và hoàn tất mua hàng.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-slate-200">
      <h1 className="text-3xl font-black text-white text-center mb-8">
        Hướng Dẫn Mua Hàng Online
      </h1>
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="flex gap-5 bg-[#181a26] border border-white/5 p-6 rounded-2xl items-start"
            >
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuidePage;
