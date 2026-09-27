import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { newsService } from "../../services/media";
import {
  Trash2,
  Edit2,
  Plus,
  FileText,
  Type,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const ManageNews = ({ getImageUrl }) => {
  // ── STATES QUẢN LÝ TIN TỨC (NEWS) ──────────────────────────────────────────
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Form tạo/sửa Tin tức
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsContent, setNewNewsContent] = useState("");
  const [newNewsImage, setNewNewsImage] = useState("");
  const [uploadingNews, setUploadingNews] = useState(false);
  const [isNewsDragActive, setIsNewsDragActive] = useState(false);

  // State quản lý chế độ Sửa (null: Thêm mới, id cụ thể: Đang sửa bài đó)
  const [editingNewsId, setEditingNewsId] = useState(null);

  // ── FETCH DANH SÁCH TIN TỨC (NEWS) ──────────────────────────────────────────
  const fetchAdminNews = () => {
    setLoadingNews(true);
    newsService
      .getNews()
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setNews(data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách tin tức:", error);
      })
      .finally(() => {
        setLoadingNews(false);
      });
  };

  useEffect(() => {
    fetchAdminNews();
  }, []);

  // ── XỬ LÝ UPLOAD ẢNH TIN TỨC ────────────────────────────────────────────────
  const handleNewsImageUpload = async (e) => {
    const file = e.target?.files ? e.target.files[0] : e;
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploadingNews(true);
    try {
      const res = await api.post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.files && res.data.files.length > 0) {
        setNewNewsImage(res.data.files[0]);
      }
    } catch (error) {
      console.error("Lỗi upload ảnh tin tức:", error);
      alert("Tải ảnh lên máy chủ thất bại!");
    } finally {
      setUploadingNews(false);
    }
  };

  // ── XỬ LÝ LƯU (TẠO MỚI HOẶC CẬP NHẬT) TIN TỨC ───────────────────────────────
  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsContent.trim() || !newNewsImage) {
      alert("Vui lòng điền đầy đủ tiêu đề, nội dung và hình ảnh tin tức!");
      return;
    }

    const payload = {
      title: newNewsTitle.trim(),
      content: newNewsContent.trim(),
      image: newNewsImage,
    };

    try {
      if (editingNewsId) {
        await api.put(`/news/${editingNewsId}`, payload);
      } else {
        if (newsService.createNews) {
          await newsService.createNews(payload);
        } else {
          await api.post("/news", payload);
        }
      }

      handleCancelEdit();
      fetchAdminNews();
    } catch (error) {
      console.error("Lỗi xử lý bài viết:", error);
      alert(error.response?.data?.message || "Thao tác dữ liệu thất bại");
    }
  };

  // ── XỬ LÝ KÍCH HOẠT CHẾ ĐỘ SỬA ─────────────────────────────────────────────
  const handleEditClick = (item) => {
    setEditingNewsId(item.id);
    setNewNewsTitle(
      item.title && typeof item.title === "object" ? "" : String(item.title),
    );
    setNewNewsContent(
      item.content && typeof item.content === "object"
        ? ""
        : String(item.content),
    );
    setNewNewsImage(item.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hủy sửa bài viết
  const handleCancelEdit = () => {
    setEditingNewsId(null);
    setNewNewsTitle("");
    setNewNewsContent("");
    setNewNewsImage("");
  };

  // ── XỬ LÝ XÓA TIN TỨC ───────────────────────────────────────────────────────
  const handleDeleteNews = async (id) => {
    if (
      !window.confirm(
        "Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa bài viết này không?",
      )
    )
      return;
    try {
      await api.delete(`/news/${id}`);
      if (editingNewsId === id) handleCancelEdit();
      fetchAdminNews();
    } catch (error) {
      console.error("Lỗi khi xóa tin tức:", error);
      alert("Không thể xóa bài viết này!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start p-2 bg-slate-50/50 min-h-screen font-sans">
      {/* ── BÊN TRÁI: FORM ĐĂNG / SỬA TIN TỨC (4 Cột) ── */}
      <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm sticky top-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 ${
                editingNewsId
                  ? "bg-amber-500 text-white rotate-12"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {editingNewsId ? (
                <Edit2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-800 tracking-tight">
                {editingNewsId ? "Cập Nhật Tin Tức" : "Tạo Bài Viết Mới"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Editor Workspace
              </p>
            </div>
          </div>
          {editingNewsId && (
            <button
              onClick={handleCancelEdit}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Hủy chế độ chỉnh sửa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSaveNews} className="space-y-5">
          {/* Trường nhập Tiêu đề */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" /> Tiêu đề bài viết
            </label>
            <input
              type="text"
              placeholder="Tiêu đề hấp dẫn, ngắn gọn..."
              value={newNewsTitle}
              onChange={(e) => setNewNewsTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-800 placeholder-slate-400 shadow-2xs"
            />
          </div>

          {/* Trường nhập Nội dung */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Nội dung chi
              tiết
            </label>
            <textarea
              rows={7}
              placeholder="Viết nội dung bài viết truyền thông của bạn..."
              value={newNewsContent}
              onChange={(e) => setNewNewsContent(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium text-slate-700 leading-relaxed scrollbar-thin shadow-2xs"
            />
          </div>

          {/* Kéo thả hình ảnh */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Ảnh bìa hiển
              thị
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer relative transition-all duration-300 group ${
                isNewsDragActive
                  ? "border-indigo-500 bg-indigo-50/40 scale-[0.99]"
                  : "border-slate-200 bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsNewsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsNewsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsNewsDragActive(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  handleNewsImageUpload(file);
                } else {
                  alert("Hệ thống chỉ chấp nhận định dạng tệp tin hình ảnh!");
                }
              }}
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleNewsImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Kéo thả hoặc Duyệt file ảnh
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Hỗ trợ PNG, JPG, JPEG, WEBP
                </p>
              </div>
            </div>

            {/* Trạng thái xử lý ảnh */}
            {uploadingNews && (
              <div className="mt-2 flex items-center gap-2 text-indigo-600 text-[10px] font-bold bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tối ưu
                dung lượng ảnh lên Cloud...
              </div>
            )}
            {newNewsImage && !uploadingNews && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 shadow-3xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-emerald-800 font-extrabold truncate">
                    Upload ảnh thành công
                  </p>
                  <p className="text-[9px] text-emerald-600/80 font-medium truncate">
                    {newNewsImage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Các nút Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full font-black py-3 rounded-xl text-xs transition-all uppercase tracking-widest text-white shadow-md active:scale-98 ${
                editingNewsId
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              }`}
            >
              {editingNewsId ? "Cập nhật bài viết" : "Đăng lên trang chủ"}
            </button>
          </div>
        </form>
      </div>

      {/* ── BÊN PHẢI: HIỂN THỊ DANH SÁCH BÀI VIẾT (8 Cột) ── */}
      <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-black text-sm text-slate-800 tracking-tight">
            Cơ sở dữ liệu Tin tức
          </h3>
          <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
            Live Feed Management
          </p>
        </div>

        {loadingNews ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs font-bold text-slate-500 tracking-wide">
              Đang đồng bộ dữ liệu bài viết...
            </p>
          </div>
        ) : !Array.isArray(news) || news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-400">Kho lưu trữ rỗng</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Chưa có bài viết tin tức nào được khởi tạo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {news.map((item, index) => (
              <div
                key={item.id || index}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 border rounded-2xl p-4 bg-white transition-all duration-300 hover:shadow-lg hover:border-slate-300/60 ${
                  editingNewsId === item.id
                    ? "border-amber-400 bg-amber-50/10 ring-2 ring-amber-400/20"
                    : "border-slate-100"
                }`}
              >
                {/* Ảnh cover bài viết */}
                <div className="w-full sm:w-28 aspect-video sm:h-20 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 shadow-2xs relative group">
                  <img
                    src={getImageUrl(item.image)}
                    alt="news analytics"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x200?text=No+Cover";
                    }}
                  />
                </div>

                {/* Khối chữ: Tiêu đề & Nội dung chi tiết */}
                <div className="flex-1 min-w-0 space-y-1 w-full sm:my-auto">
                  <p className="font-black text-slate-800 text-sm sm:text-base line-clamp-1 tracking-tight leading-snug">
                    {item.title && typeof item.title === "object"
                      ? "Dữ liệu bị lỗi"
                      : String(item.title)}
                  </p>
                  <p className="text-xs text-slate-400/90 font-medium line-clamp-2 leading-relaxed pr-2">
                    {item.content && typeof item.content === "object"
                      ? "Nội dung không hợp lệ"
                      : String(item.content)}
                  </p>
                </div>

                {/* Các nút công cụ điều khiển */}
                <div className="flex items-center gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto justify-end shrink-0">
                  <button
                    onClick={() => handleEditClick(item)}
                    title="Chỉnh sửa toàn bộ bài viết"
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl shadow-3xs bg-white transition-all hover:scale-105 active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    title="Xóa bài viết vĩnh viễn"
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl shadow-3xs bg-white transition-all hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNews;
