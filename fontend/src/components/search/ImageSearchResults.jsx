import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";

const formatVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

// results: mảng sản phẩm trả về từ API search-by-image
export default function ImageSearchResults({ results }) {
  const navigate = useNavigate();

  if (!results || results.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-3">
        Tìm thấy {results.length} sản phẩm tương tự:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((product) => {
          const hasDiscount =
            product.oldprice && product.oldprice > product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((product.oldprice - product.price) / product.oldprice) * 100,
              )
            : 0;

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="relative bg-slate-50">
                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md z-10">
                    -{discountPercent}%
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md z-10">
                  Giống {product.similarity}%
                </span>
                {product.image ? (
                  <img
                    src={getImageUrl(product.image, "")}
                    alt={product.name || "Sản phẩm"}
                    className="w-full h-32 sm:h-36 object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-36 flex items-center justify-center text-slate-300">
                    <ImageOff size={24} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800 line-clamp-2 min-h-[2.2em]">
                  {product.name || "Không có tên"}
                </p>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-indigo-600">
                    {formatVND(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatVND(product.oldprice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
