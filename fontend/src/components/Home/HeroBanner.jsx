import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannerService } from "../../services/media";

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

const HeroBanner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${IMAGE_BASE_URL}${image}`;
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getBanners();
        let bannerArray = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            bannerArray = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            bannerArray = response.data.data;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            bannerArray = response.data.rows;
          }
        }
        setBanners(bannerArray);
      } catch (error) {
        console.error("Lỗi khi tải banners:", error);
        setBanners([]);
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!Array.isArray(banners) || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  // Hàm chuyển hướng khi click vào Banner hoặc nút Khám phá
  const handleBannerClick = (bannerId) => {
    navigate(`/products?bannerId=${bannerId}`);
  };

  // Hàm chuyển sang Banner tiếp theo
  const handleNextBanner = (e) => {
    e.stopPropagation();
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  // Hàm lùi lại Banner trước đó
  const handlePrevBanner = (e) => {
    e.stopPropagation();
    setCurrentBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length,
    );
  };

  if (loadingBanners) {
    return (
      <div className="w-full h-full min-h-[340px] lg:h-[420px] flex items-center justify-center bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium text-sm animate-pulse">
        Đang tải banner...
      </div>
    );
  }

  if (!Array.isArray(banners) || banners.length === 0) {
    return (
      <div className="w-full h-full min-h-[340px] lg:h-[420px] flex items-center justify-center bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium text-sm">
        Không có banner nào hiển thị.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-100 rounded-2xl relative overflow-hidden min-h-[340px] lg:h-[420px] shadow-sm border border-purple-100/60 group">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{
          width: `${banners.length * 100}%`,
          transform: `translateX(-${(currentBannerIndex * 100) / banners.length}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            onClick={() => handleBannerClick(banner.id)}
            className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-10 shrink-0 gap-4 cursor-pointer"
            style={{ width: `${100 / banners.length}%` }}
          >
            {/* CỘT BÊN TRÁI: TIÊU ĐỀ & MÔ TẢ */}
            <div className="max-w-md space-y-4 z-10 text-center md:text-left flex-1">
              <div>
                <span className="bg-[#5d34e8] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  SIÊU ƯU ĐÃI
                </span>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2 mt-3">
                  {banner.name || "Khuyến mãi Công Nghệ"}
                </h1>
              </div>

              <p className="text-slate-600 text-xs md:text-sm font-medium line-clamp-2 leading-relaxed">
                Đừng bỏ lỡ chương trình giảm giá cực sâu kèm nhiều phần quà hấp
                dẫn chỉ có trong tuần này.
              </p>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick(banner.id);
                  }}
                  className="bg-[#5d34e8] hover:bg-[#4a25c9] text-white font-bold px-7 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  KHÁM PHÁ NGAY
                </button>
              </div>
            </div>

            {/* CỘT BÊN PHẢI: HÌNH ẢNH BANNER */}
            <div className="relative w-full md:w-1/2 h-full flex items-center justify-center shrink-0">
              {banner.image && (
                <img
                  src={getImageUrl(banner.image)}
                  alt={banner.name}
                  className="max-h-[220px] md:max-h-[320px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 NÚT ICON CHUYỂN BANNER (SẼ HIỆN KHI RÊ CHUỘT VÀO BANNER HOẶC DÙNG DẠNG MẶC ĐỊNH) */}
      {banners.length > 1 && (
        <>
          {/* Nút lùi lại < */}
          <button
            onClick={handlePrevBanner}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-[#5d34e8] backdrop-blur-md flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-90"
            title="Banner trước"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Nút chuyển tiếp > */}
          <button
            onClick={handleNextBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-[#5d34e8] backdrop-blur-md flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-90"
            title="Banner kế tiếp"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* DẤU CHẤM DƯỚI SLIDE */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentBannerIndex(index);
            }}
            className={`h-2 rounded-full transition-all ${
              currentBannerIndex === index
                ? "bg-[#5d34e8] w-6"
                : "bg-slate-300 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
