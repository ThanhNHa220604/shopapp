import React, { useState, useEffect } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
import {
  isInWishlist,
  toggleWishlist,
  isUserLoggedIn,
} from "../../utils/wishlist";

const NO_IMAGE_FALLBACK = "https://placehold.co/300x300?text=No+Image";

const ProductCard = ({
  product,
  isFlashSale = false,
  flashSaleData = null,
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Kiểm tra sản phẩm có trong wishlist của ĐÚNG người dùng hiện tại không,
  // và cập nhật lại khi wishlist / tài khoản thay đổi (đăng nhập, đăng xuất...)
  useEffect(() => {
    const syncFavorite = () => setIsFavorite(isInWishlist(product.id));
    syncFavorite();

    window.addEventListener("wishlistUpdated", syncFavorite);
    window.addEventListener("userUpdated", syncFavorite);
    window.addEventListener("storage", syncFavorite);
    return () => {
      window.removeEventListener("wishlistUpdated", syncFavorite);
      window.removeEventListener("userUpdated", syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [product.id]);

  // Xử lý nút yêu thích (toggleWishlist tự lưu theo user và báo cho Header)
  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Khách vãng lai không được thêm yêu thích -> hiện modal thông báo
    if (!isUserLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    setIsFavorite(toggleWishlist(product));
  };

  useEffect(() => {
    if (!showLoginModal) return;
    const onKeyDown = (e) => e.key === "Escape" && setShowLoginModal(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showLoginModal]);

  const getProductImage = (imageName) =>
    getImageUrl(imageName, NO_IMAGE_FALLBACK);

  // Định dạng hiển thị số lượng bán (VD: 1200 -> 1.2k)
  const formatSold = (num) => {
    const sold = Number(num || 0);
    if (sold >= 1000) return (sold / 1000).toFixed(1) + "k";
    return sold;
  };

  // 1. TÍNH GIÁ VÀ GIẢM GIÁ DỰA TRÊN DB (price, oldprice)
  const currentPrice = Number(product.price || 0);
  const dbOldPrice = Number(product.oldprice || 0);

  // Giá bán thực tế (Nếu flash sale thì ưu tiên giá flash sale, không thì dùng price)
  const salePrice = isFlashSale
    ? Number(flashSaleData?.flash_sale_price || currentPrice)
    : currentPrice;

  // Giá gốc trước giảm (Nêu flash sale dùng price gốc, thường dùng oldprice trong DB)
  const baseOriginalPrice = isFlashSale
    ? currentPrice
    : dbOldPrice > currentPrice
      ? dbOldPrice
      : 0;

  // Tính % giảm giá
  const discountPercent =
    baseOriginalPrice > salePrice
      ? Math.round(((baseOriginalPrice - salePrice) / baseOriginalPrice) * 100)
      : 0;

  // 2. LẤY SỐ LƯỢNG ĐÃ BÁN VÀ ĐÁNH GIÁ TỪ DB
  const soldCount = product.total_sold || product.buyturn || 0;
  const ratingCount = product.total_ratings || 0;
  const ratingScore = Number(product.rating || 5);

  const isOutOfStock =
    isFlashSale &&
    (flashSaleData?.flash_sale_sold || 0) >=
      (flashSaleData?.flash_sale_stock || 0);

  // Modal thông báo cho khách vãng lai. Dùng portal để không bị cắt bởi thẻ
  // và stopPropagation để bấm trong modal không làm mở trang chi tiết sản phẩm.
  const loginModal =
    showLoginModal &&
    createPortal(
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowLoginModal(false);
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            Bạn chưa thể thêm sản phẩm yêu thích
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            Khách vãng lai không có quyền lưu sản phẩm yêu thích. Vui lòng đăng
            nhập để sử dụng tính năng này.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                navigate("/login");
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5d34e8] hover:bg-[#4d28d0] shadow-md shadow-purple-200 transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="group bg-white rounded-2xl p-4 border border-gray-100/80 shadow-sm hover:shadow-xl hover:border-purple-200/50 cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-full"
      >
        {/* Label giảm giá (% từ oldprice hoặc flash sale) */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full z-10 shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Nút Yêu thích */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-gray-50/90 hover:bg-white rounded-full transition-all duration-200 z-30 shadow-md border border-gray-100 class-heart-button"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          />
        </button>

        {/* Ảnh sản phẩm */}
        <div className="aspect-square bg-gray-50/50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-3 border border-gray-50 z-0">
          <img
            src={getProductImage(product.image)}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = NO_IMAGE_FALLBACK;
            }}
          />
        </div>

        {/* Thông tin chi tiết */}
        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-800 font-bold text-xs line-clamp-2 leading-snug group-hover:text-[#5d34e8] transition-colors duration-200 min-h-[32px]">
              {product.name}
            </h3>

            {/* ĐÁNH GIÁ (rating, total_ratings) VÀ ĐÃ BÁN (buyturn/total_sold) */}
            <div className="flex items-center justify-between text-[10px] mt-1.5 gap-1">
              <div className="text-amber-400 flex items-center gap-1">
                <span>★</span>
                <span className="font-bold text-gray-700">
                  {ratingScore > 0 ? ratingScore.toFixed(1) : "5.0"}
                </span>
                <span className="text-gray-400 font-medium">
                  ({ratingCount})
                </span>
              </div>

              {/* ĐÃ BÁN */}
              <span className="text-gray-400 font-medium shrink-0">
                Đã bán {formatSold(soldCount)}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* GIÁ TIỀN (price & oldprice) */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <p className="text-[#5d34e8] font-black text-sm tracking-tight">
                {salePrice.toLocaleString("vi-VN")}đ
              </p>
              {baseOriginalPrice > salePrice && (
                <p className="text-gray-400 line-through text-[10px]">
                  {baseOriginalPrice.toLocaleString("vi-VN")}đ
                </p>
              )}
            </div>

            {/* Tiến trình Flash Sale */}
            {isFlashSale && flashSaleData && (
              <div className="space-y-1">
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative border border-gray-50">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((flashSaleData.flash_sale_sold || 0) / flashSaleData.flash_sale_stock) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                  <span>Đã bán: {flashSaleData.flash_sale_sold || 0}</span>
                  <span>Kho: {flashSaleData.flash_sale_stock}</span>
                </div>
              </div>
            )}

            {/* Nút MUA NGAY */}
            <button
              disabled={isOutOfStock}
              className={`w-full font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98]
              ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-purple-50 text-[#5d34e8] group-hover:bg-[#5d34e8] group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-200"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? "HẾT HÀNG" : "MUA NGAY"}</span>
            </button>
          </div>
        </div>
      </div>
      {loginModal}
    </>
  );
};

export default ProductCard;
