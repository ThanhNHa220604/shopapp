import React from "react";
import { useNavigate } from "react-router-dom";

const Wishlist = ({ boughtProducts }) => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-3xl font-black tracking-tight">Sản phẩm đề xuất</h1>
      <p className="text-gray-400 text-sm -mt-4 font-medium">
        Dựa trên lịch sử mua hàng của bạn.
      </p>
      {boughtProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          Bạn chưa mua sản phẩm nào để đề xuất.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {boughtProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/products/${p.id}`)}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-600 transition-all group"
            >
              <div className="h-36 bg-gray-50 overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {p.name}
                </p>
                <p className="text-blue-600 font-bold text-sm mt-1">
                  {Number(p.price).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Wishlist;
