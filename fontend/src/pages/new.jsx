import React, { useState, useEffect } from "react";
import { Clock, ArrowRight, ChevronLeft, AlertCircle } from "lucide-react";
import contentService from "../services/content"; // Gọi dịch vụ lấy dữ liệu từ Backend

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 State quản lý bài viết đang mở để xem chi tiết nội dung đầy đủ
  const [selectedPost, setSelectedPost] = useState(null);

  // Hàm bổ trợ xử lý hiển thị đúng đường dẫn ảnh từ Backend
  const getImageUrl = (imgName) => {
    if (!imgName)
      return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1500";
    if (imgName.startsWith("http://") || imgName.startsWith("https://")) {
      return imgName;
    }
    return `${IMAGE_BASE_URL}${imgName}`;
  };

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    contentService
      .getNews()
      .then((res) => {
        if (!ignore) {
          const actualNewsData = res?.data
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
          setPosts(actualNewsData);
        }
      })
      .catch((err) =>
        console.error("Lỗi lấy danh sách tin tức từ Backend:", err),
      )
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Cuộn lên đầu trang mỗi khi người dùng click xem chi tiết bài viết
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPost]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#6338f6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu tin tức...
          </p>
        </div>
      </div>
    );
  }

  // ── GIAO DIỆN XEM CHI TIẾT BÀI VIẾT KHI ĐƯỢC CLICK ───────────────────────
  if (selectedPost) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-[#6338f6] selection:text-white">
        <div className="w-full px-2 sm:px-4 md:px-6 pt-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Nút quay lại */}
            <button
              onClick={() => setSelectedPost(null)}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#6338f6] text-slate-700 hover:text-white font-extrabold text-xs rounded-xl shadow-sm transition-all duration-200 border border-indigo-100/80"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>QUAY LẠI DANH SÁCH</span>
            </button>

            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-indigo-100/80 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="text-[#6338f6] bg-indigo-50 px-3 py-1 rounded-lg font-black">
                    {selectedPost.category || "Tin tức"}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {new Date(
                      selectedPost.createdAt ||
                        selectedPost.created_at ||
                        Date.now(),
                    ).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {selectedPost.title}
                </h1>
              </div>

              {/* Khung ảnh chi tiết */}
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                <img
                  src={getImageUrl(selectedPost.image)}
                  className="w-full h-full object-cover"
                  alt="news-detail-cover"
                />
              </div>

              {/* Nội dung bài viết */}
              <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm md:text-base border-t border-slate-100 pt-6">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-[#6338f6] selection:text-white">
      <div className="w-full px-2 sm:px-4 md:px-6 pt-4 space-y-4">
        {/* Banner tiêu đề thiết kế tràn viền */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-4 sm:p-6">
          <div className="border-l-4 border-[#6338f6] pl-3.5 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Bản Tin Công Nghệ
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">
              Cập nhật xu hướng, đánh giá sản phẩm và hướng dẫn mới nhất
            </p>
          </div>
        </div>

        {/* Danh sách Tin Tức tràn viền chuẩn thiết bị */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {posts.map((post, i) => (
            <article
              key={post.id || i}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer flex flex-col md:flex-row gap-4 sm:gap-6 bg-white p-3.5 sm:p-5 rounded-2xl border border-indigo-100/80 shadow-sm hover:shadow-md hover:border-[#6338f6] transition-all duration-200 w-full overflow-hidden"
            >
              {/* Khối Ảnh bo tròn */}
              <div className="w-full md:w-1/4 aspect-[16/10] md:aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0 relative">
                <img
                  src={getImageUrl(post.image)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  alt="news-thumbnail"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#6338f6] text-white font-black text-[8px] sm:text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  {post.category || "Tin tức"}
                </span>
              </div>

              {/* Khối Nội dung bên phải */}
              <div className="flex-1 flex flex-col justify-between py-0.5 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {new Date(
                      post.createdAt || post.created_at || Date.now(),
                    ).toLocaleDateString("vi-VN")}
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 group-hover:text-[#6338f6] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Nút Đọc chi tiết */}
                <div className="flex items-center gap-1 text-xs font-black text-[#6338f6] group-hover:text-indigo-800 transition-colors uppercase tracking-wider pt-1">
                  <span>Đọc chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Trường hợp hệ thống trống tin tức */}
        {posts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-indigo-100/80 flex flex-col items-center justify-center text-center space-y-3 shadow-sm w-full">
            <AlertCircle className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Hiện tại chưa có bài viết tin tức nào được đăng tải.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
