import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";

// Lấy từ biến môi trường REACT_APP_API_URL (định nghĩa trong .env),
// fallback về "/api" nếu chưa có biến này.
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
const API_URL = `${API_BASE_URL}/products/search-by-image`;

const formatVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export default function ImageSearch() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Kích thước ảnh phải nhỏ hơn ${maxSizeMB}MB.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResults([]);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn ảnh trước khi tìm kiếm.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Field name phải khớp với multer.single("image") bên backend
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tìm kiếm thất bại");
      }

      setResults(data.data || []);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {/* KHU VỰC CHỌN / XEM TRƯỚC ẢNH */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-2xl py-14 px-4 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors"
        >
          <Upload size={28} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-700">
            Chọn ảnh để tìm kiếm
          </span>
          <span className="text-xs text-slate-400">
            JPG, PNG hoặc WEBP — tối đa 5MB
          </span>
        </button>
      ) : (
        <div className="relative border border-indigo-200 rounded-2xl p-3 bg-indigo-50/40">
          <button
            type="button"
            onClick={handleReset}
            className="absolute -top-2.5 -right-2.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 rounded-full p-1 shadow-sm transition-colors"
            title="Xóa ảnh đã chọn"
          >
            <X size={14} />
          </button>
          <img
            src={previewUrl}
            alt="Ảnh xem trước"
            className="mx-auto max-h-64 rounded-xl object-contain"
          />
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* HÀNG NÚT HÀNH ĐỘNG — LUÔN CỐ ĐỊNH, KHÔNG BỊ ĐẨY BỞI PREVIEW */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !selectedFile}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-black py-2.5 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tìm...
            </>
          ) : (
            "Tìm kiếm"
          )}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-colors"
          >
            Chọn ảnh khác
          </button>
        )}
      </div>

      {/* KẾT QUẢ */}
      {loading && (
        <p className="mt-6 text-sm text-slate-500 text-center">
          Đang phân tích ảnh, vui lòng chờ trong giây lát...
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-500 mb-3">
            Tìm thấy {results.length} sản phẩm tương tự:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => {
              const hasDiscount =
                product.oldprice && product.oldprice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((product.oldprice - product.price) / product.oldprice) *
                      100,
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
      )}

      {!loading && !error && results.length === 0 && selectedFile && (
        <p className="mt-4 text-xs text-slate-400 text-center">
          Nhấn "Tìm kiếm" để bắt đầu tìm sản phẩm tương tự.
        </p>
      )}
    </div>
  );
}
