//Chứa thông tin cấu hình, màu sắc và cụm nút Mua hàng.
import React from "react";
import { ShoppingCart, CreditCard, Layers } from "lucide-react";

const ProductInfo = ({
  product,
  displayPrice,
  displayOldPrice,
  displayStock,
  allAvailableSizes,
  selectedSize,
  handleSelectSize,
  colorsForActiveSize,
  selectedColor,
  handleSelectColor,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-xl font-black tracking-tight text-[#1B2559] leading-snug">
            {product.name}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Mã SP: #{product.id}
          </p>
        </div>

        <div className="flex items-baseline gap-3 bg-[#F4F7FE] p-4 rounded-2xl border border-gray-50">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            {displayPrice.toLocaleString()}đ
          </span>
          {displayOldPrice && (
            <span className="text-xs font-bold text-gray-400 line-through">
              {displayOldPrice.toLocaleString()}đ
            </span>
          )}
        </div>

        {allAvailableSizes.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              1. Lựa chọn Cấu hình
            </span>
            <div className="flex flex-wrap gap-2">
              {allAvailableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                    selectedSize === size
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10"
                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSize && colorsForActiveSize.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
              2. Lựa chọn Màu sắc
            </span>
            <div className="flex flex-wrap gap-2">
              {colorsForActiveSize.map((colorObj) => (
                <button
                  key={colorObj.colorName}
                  disabled={colorObj.stock <= 0}
                  onClick={() => handleSelectColor(colorObj)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-2 ${
                    colorObj.stock <= 0
                      ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-100 line-through"
                      : selectedColor === colorObj.colorName
                        ? "bg-[#1B2559] text-white border-[#1B2559] shadow-md"
                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {colorObj.colorName}
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                      selectedColor === colorObj.colorName
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Kho: {colorObj.stock}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Trạng thái kho:</span>
          <span
            className={`font-black ${displayStock > 0 ? "text-green-500" : "text-red-500"}`}
          >
            {displayStock > 0
              ? `Còn hàng (Sẵn có: ${displayStock} sản phẩm)`
              : "Hết hàng"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onAddToCart(true)}
            disabled={displayStock <= 0}
            className="w-full bg-blue-50 text-blue-600 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100/50"
          >
            <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ hàng
          </button>
          <button
            onClick={onBuyNow}
            disabled={displayStock <= 0}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" /> Mua ngay lập tức
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;