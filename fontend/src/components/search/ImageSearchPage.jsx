import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ImageOff } from "lucide-react";
import ImageSearchResults from "./ImageSearchResults"; // sửa lại đường dẫn nếu bạn đặt khác thư mục

const ImageSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dữ liệu được truyền qua từ ImageSearchModal lúc navigate(..., { state })
  const results = location.state?.results;
  const previewUrl = location.state?.previewUrl;

  // Trường hợp vào thẳng URL này (F5 lại trang, hoặc share link) sẽ không có
  // location.state — hiển thị thông báo và mời quay lại tìm kiếm.
  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <ImageOff size={40} className="text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-600 mb-1">
          Không có dữ liệu tìm kiếm
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Vui lòng quay lại trang chủ và thử tìm kiếm bằng hình ảnh lại.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER RIÊNG CỦA TRANG KẾT QUẢ */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Về trang chủ"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-indigo-600" />
            <h1 className="text-base font-black text-slate-800">
              Kết quả tìm kiếm bằng hình ảnh
            </h1>
          </div>
        </div>
      </div>

      {/* NỘI DUNG */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {previewUrl && (
          <div className="mb-6 flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Ảnh đã tìm kiếm"
              className="w-16 h-16 object-cover rounded-xl border border-slate-200"
            />
            <p className="text-xs text-slate-500">Ảnh bạn đã dùng để tìm kiếm</p>
          </div>
        )}

        {results.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            Không tìm thấy sản phẩm nào tương tự với ảnh bạn cung cấp.
          </p>
        ) : (
          <ImageSearchResults results={results} />
        )}
      </div>
    </div>
  );
};

export default ImageSearchPage;