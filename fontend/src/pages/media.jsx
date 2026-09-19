import React, { useState, useEffect } from "react";
import { bannerService } from "./services/media"; // Đường dẫn tới file news.js của bạn

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch danh sách banner từ API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getBanners();
        // Giả sử API trả về mảng danh sách banner ở response.data
        setBanners(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // 2. Thiết lập tự động trượt sau mỗi 3 giây
  useEffect(() => {
    if (banners.length <= 1) return; // Nếu có 1 hoặc không có banner thì không trượt

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // 3000ms = 3 giây

    return () => clearInterval(timer); // Clear bộ đếm khi component unmount
  }, [banners]);

  if (loading) return <div>Đang tải banner...</div>;
  if (banners.length === 0) return null;

  return (
    <div
      className="banner-slider-container"
      style={{ position: "relative", overflow: "hidden", width: "100%" }}
    >
      <div
        className="banner-wrapper"
        style={{
          display: "flex",
          transition: "transform 0.5s ease-in-out",
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            style={{ minWidth: "100%", boxSizing: "border-box" }}
          >
            {/* Thay đổi cấu trúc hiển thị tùy thuộc vào data trả về từ API của bạn */}
            <div
              className="banner-item"
              style={{
                background: "#0f172a",
                color: "#fff",
                padding: "40px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#3b82f6",
                    textTransform: "uppercase",
                    fontSize: "14px",
                  }}
                >
                  {banner.subTitle || "Thế giới công nghệ cao cấp"}
                </span>
                <h2 style={{ fontSize: "32px", margin: "10px 0" }}>
                  {banner.title || "Tối giản. Hiệu năng. Tinh tế."}
                </h2>
                <p style={{ opacity: 0.8, maxWidth: "500px" }}>
                  {banner.description}
                </p>
                <button
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "15px",
                  }}
                >
                  Khám phá ngay
                </button>
              </div>
              {banner.imageUrl && (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  style={{ maxWidth: "45%", borderRadius: "8px" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Điểm chấm (Dots) điều hướng bên dưới banner */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: "none",
              backgroundColor:
                currentIndex === index ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
