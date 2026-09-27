import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
const API_URL = `${API_BASE_URL}/products/search-by-image`;

// props:
// - open: boolean, có hiển thị modal hay không
// - onClose: gọi khi đóng modal (bấm X, bấm ra ngoài, hoặc sau khi tìm xong)
export default function ImageSearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

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

      const results = data.data || [];
      const searchedPreviewUrl = previewUrl;

      // Đóng modal, dọn state, rồi điều hướng sang trang kết quả full-screen,
      // truyền kết quả + ảnh preview qua location.state
      resetState();
      onClose?.();
      navigate("/search-image", {
        state: { results, previewUrl: searchedPreviewUrl },
      });
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative p-5">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Đóng"
        >
          <X size={18} />
        </button>

        <h2 className="text-sm font-black text-slate-800 mb-4 pr-6">
          Tìm kiếm sản phẩm bằng hình ảnh
        </h2>

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
            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-300 rounded-xl py-8 px-4 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors"
          >
            <Upload size={24} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-700">
              Chọn ảnh để tìm kiếm
            </span>
            <span className="text-[11px] text-slate-400">
              JPG, PNG hoặc WEBP — tối đa 5MB
            </span>
          </button>
        ) : (
          <div className="relative border border-indigo-200 rounded-xl p-2 bg-indigo-50/40">
            <button
              type="button"
              onClick={resetState}
              className="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 rounded-full p-1 shadow-sm transition-colors"
              title="Xóa ảnh đã chọn"
            >
              <X size={12} />
            </button>
            <img
              src={previewUrl}
              alt="Ảnh xem trước"
              className="mx-auto max-h-40 rounded-lg object-contain"
            />
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !selectedFile}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-black py-2.5 rounded-xl transition-colors"
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
      </div>
    </div>
  );
}