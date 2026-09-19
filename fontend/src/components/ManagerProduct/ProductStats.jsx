import React from "react";

const ProductStats = ({ filteredProducts }) => {
  const stats = [
    {
      label: "Tổng sản phẩm",
      value: filteredProducts.length,
      color: "text-gray-900",
    },
    {
      label: "Đang hoạt động",
      value: filteredProducts.length,
      color: "text-[#1B59F8]",
    },
    {
      label: "Hết hàng",
      value: filteredProducts.filter((p) => Number(p.quanity || 0) === 0)
        .length,
      color: "text-red-500",
    },
    {
      label: "Có tồn kho",
      value: filteredProducts
        .reduce((total, p) => total + Number(p.quanity || 0), 0)
        .toLocaleString("vi-VN"),
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-[28px] border border-gray-100/50 p-6 shadow-sm"
        >
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            {s.label}
          </p>
          <p className={`text-3xl font-black tracking-tight ${s.color}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProductStats;
