import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Heart,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import productService from "../services/product";
import cartService from "../services/cart";
import api from "../services/api";

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";
const PAGE_SIZE = 15; // 🌟 Số lượng sản phẩm hiển thị trên 1 trang (Khớp với BE)

// 🟢 ÁNH XẠ TIẾNG ANH (URL) -> TIẾNG VIỆT (TÌM KIẾM DB + HIỂN THỊ)
const SEARCH_TRANSLATE_MAP = {
  Headphone: "Tai nghe",
  Speaker: "Loa",
  Keyboard: "Bàn phím",
  Mouse: "Chuột",
  Powerbank: "Sạc dự phòng",
  Charger: "Cáp sạc",
  Laptop: "Laptop",
  Phone: "Điện thoại",
};

const LABEL_MAP = {
  Accessories: "Phụ kiện",
  Audio: "Thiết bị âm thanh",
  Smartphones: "Điện thoại",
  Laptops: "Laptop",
  ...SEARCH_TRANSLATE_MAP,
};

const CATEGORY_META = {
  Laptops: {
    title: "Laptop",
    desc: "Khám phá bộ sưu tập laptop cao cấp với hiệu năng vượt trội, thiết kế tối giản và bền bỉ.",
  },
  Smartphones: {
    title: "Điện thoại",
    desc: "Khám phá bộ sưu tập smartphone cao cấp với ngôn ngữ thiết kế tối giản, công nghệ tiên tiến nhất thế giới.",
  },
  Audio: {
    title: "Thiết bị âm thanh",
    desc: "Trải nghiệm âm thanh đỉnh cao với bộ sưu tập thiết bị âm thanh chất lượng cao.",
  },
  Accessories: {
    title: "Phụ kiện",
    desc: "Phụ kiện công nghệ cao cấp, hoàn thiện trải nghiệm của bạn.",
  },
};

const SORT_OPTIONS = ["Mới nhất", "Giá tăng dần", "Giá giảm dần"];

const ProductList = () => {
  const [rawProducts, setRawProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("Mới nhất");
  const [priceRange, setPriceRange] = useState(50000000);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // 🌟 LƯU TỔNG SỐ TRANG TỪ BACKEND
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [loading, setLoading] = useState(true);

  const [isFlashSaleActive, setIsFlashSaleActive] = useState(true);
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // TRÍCH XUẤT CÁC PARAMETERS TỪ URL
  const category = searchParams.get("category");
  const rawSearchQuery = searchParams.get("search") || "";
  const isFlashSaleOnly = searchParams.get("flashsale") === "true";
  const bannerId = searchParams.get("bannerId");
  const [bannerTitle, setBannerTitle] = useState("");

  // 🟢 DỊCH TỪ KHÓA TÌM KIẾM ĐỂ GỬI API TÌM ĐÚNG DATABASE TIẾNG VIỆT
  const queryForApi = SEARCH_TRANSLATE_MAP[rawSearchQuery] || rawSearchQuery;

  const getProductImage = (p) => {
    if (!p) return "";
    if (p.image_url) return p.image_url;
    if (p.image) {
      return p.image.startsWith("http")
        ? p.image
        : `${IMAGE_BASE_URL}${p.image}`;
    }
    return "";
  };

  const displayCategory = LABEL_MAP[category] || category;
  const displaySearch = LABEL_MAP[rawSearchQuery] || rawSearchQuery;

  const meta = bannerId
    ? {
        title: bannerTitle || "Sản phẩm Ưu Đãi Banner",
        desc: "Danh sách toàn bộ sản phẩm khuyến mãi nằm trong chiến dịch quảng cáo.",
      }
    : isFlashSaleOnly
      ? {
          title: "Sản phẩm Flash Sale",
          desc: "Danh sách các sản phẩm đang trong chương trình giảm giá chớp nhoáng với số lượng có hạn.",
        }
      : rawSearchQuery
        ? { title: displaySearch, desc: "" }
        : CATEGORY_META[category] || {
            title: displayCategory || "Sản phẩm",
            desc: "",
          };

  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    if (dateTimeStr.includes("-") && !dateTimeStr.includes("/")) {
      const parsed = new Date(dateTimeStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    try {
      const cleaned = dateTimeStr.trim();
      const parts = cleaned.split(" ");
      if (parts.length !== 2) return new Date(dateTimeStr);

      let timePart = "";
      let datePart = "";
      if (parts[0].includes(":")) {
        timePart = parts[0];
        datePart = parts[1];
      } else {
        datePart = parts[0];
        timePart = parts[1];
      }

      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      const [day, month, year] = datePart.split("/").map(Number);
      return new Date(
        year,
        month - 1,
        day,
        hours || 0,
        minutes || 0,
        seconds || 0,
      );
    } catch (e) {
      const fallback = new Date(dateTimeStr);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
  };

  useEffect(() => {
    const updateWishlist = () => {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(stored);
    };
    updateWishlist();
    window.addEventListener("wishlistUpdated", updateWishlist);
    return () => window.removeEventListener("wishlistUpdated", updateWishlist);
  }, []);

  // 🟢 TẢI DỮ LIỆU TỪ API (CÓ PHÂN TRANG BE)
  useEffect(() => {
    setLoading(true);

    if (bannerId) {
      api
        .get(`/banners/${bannerId}`)
        .then((res) => {
          const bannerData = res.data?.data || res.data || {};
          setBannerTitle(bannerData.name || "");

          let bannerProducts = [];
          if (
            bannerData.bannerdetails &&
            Array.isArray(bannerData.bannerdetails)
          ) {
            bannerProducts = bannerData.bannerdetails
              .map((item) => item.product || item.products || item)
              .filter(Boolean);
          } else if (
            bannerData.products &&
            Array.isArray(bannerData.products)
          ) {
            bannerProducts = bannerData.products;
          }

          setRawProducts(bannerProducts);
          setTotalPages(1);
        })
        .catch((err) => {
          console.error("Lỗi lấy danh sách sản phẩm từ Banner:", err);
          setRawProducts([]);
        })
        .finally(() => setLoading(false));
    } else if (isFlashSaleOnly) {
      api
        .get("/flash-sales")
        .then(async (res) => {
          const sales = res.data?.data || res.data || [];

          // 🟢 1. Tìm chương trình Flash Sale đang HOẠT ĐỘNG (status === 1)
          const activeSale = sales.find((sale) => Number(sale.status) === 1);

          if (activeSale) {
            // Lấy thời gian kết thúc
            const endTimeRaw =
              activeSale.end_time || activeSale.endTime || activeSale.time_end;
            if (endTimeRaw) {
              const endTimeParsed = new Date(endTimeRaw).getTime();
              if (!isNaN(endTimeParsed)) {
                setFlashSaleEndTime(endTimeParsed);
              }
            }

            let productsList =
              activeSale.flash_sale_products ||
              activeSale.FlashSaleProducts ||
              activeSale.products ||
              [];

            // Nếu danh sách sản phẩm rỗng, gọi API chi tiết
            if (productsList.length === 0 && activeSale.id) {
              try {
                const detailRes = await api.get(
                  `/flash-sales/${activeSale.id}`,
                );
                const detailData = detailRes.data?.data || detailRes.data || {};
                productsList =
                  detailData.flash_sale_products ||
                  detailData.FlashSaleProducts ||
                  detailData.products ||
                  [];
              } catch (errDetail) {
                console.error("Lỗi lấy chi tiết Flash Sale", errDetail);
              }
            }

            setIsFlashSaleActive(true);

            // 🟢 2. Map lại danh sách sản phẩm Flash Sale
            const mappedFlashProducts = productsList
              .map((item) => {
                const prod = item.product || item;
                if (!prod) return null;
                return {
                  ...prod,
                  price: item.flash_sale_price || prod.price,
                  old_price: prod.price,
                  is_flash_sale_item: true,
                };
              })
              .filter(Boolean);

            setRawProducts(mappedFlashProducts);
            setTotalPages(1);
          } else {
            setIsFlashSaleActive(false);
            setRawProducts([]);
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy sản phẩm Flash Sale:", err);
          setIsFlashSaleActive(false);
          setRawProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      setIsFlashSaleActive(true);

      // 🌟 TRUYỀN PARAM page VÀ pageSize
      productService
        .getAllProducts({
          category: category,
          search: queryForApi,
          page: currentPage,
          pageSize: PAGE_SIZE,
        })
        .then((res) => {
          // res là response.data do productService đã trả về
          const rawList = Array.isArray(res)
            ? res
            : res?.data || res?.products || [];
          setRawProducts(rawList);

          // 🌟 CẬP NHẬT TỔNG SỐ TRANG TỪ BE
          if (res && res.totalPages) {
            setTotalPages(res.totalPages);
          } else if (res && res.total) {
            setTotalPages(Math.ceil(res.total / PAGE_SIZE));
          } else {
            setTotalPages(1);
          }
        })
        .catch((err) => console.error("Lỗi tải sản phẩm từ API:", err))
        .finally(() => setLoading(false));
    }
  }, [category, queryForApi, isFlashSaleOnly, bannerId, currentPage]); // 🌟 THÊM currentPage ĐỂ TRIGGER KHI ĐỔI TRANG

  useEffect(() => {
    if (!isFlashSaleOnly || !flashSaleEndTime) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (now >= flashSaleEndTime) {
        setIsFlashSaleActive(false);
        setRawProducts([]);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isFlashSaleOnly, flashSaleEndTime]);

  // 🟢 LỌC VÀ SẮP XẾP SẢN PHẨM TRÊN TRANG HIỆN TẠI
  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(rawProducts)) return [];
    let list = rawProducts.filter((p) => {
      if (!p) return false;
      const price = Number(p.price || 0);
      return price <= priceRange;
    });

    if (sortBy === "Giá tăng dần") {
      return [...list].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0),
      );
    }
    if (sortBy === "Giá giảm dần") {
      return [...list].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0),
      );
    }
    return list;
  }, [rawProducts, priceRange, sortBy]);

  const formatDisplayPrice = (price) => {
    const numPrice = Number(price || 0);
    if (numPrice <= 5000) return `$${numPrice.toLocaleString()}`;
    return `${numPrice.toLocaleString()}đ`;
  };

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    cartService
      .addToCart(productId, 1)
      .then(() => alert("Đã thêm vào giỏ hàng!"))
      .catch((err) => console.error("Lỗi thêm giỏ hàng:", err));
  };

  const handleToggleFavorite = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    let storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const isExist = storedWishlist.some((item) => item.id === product.id);

    if (isExist) {
      storedWishlist = storedWishlist.filter((item) => item.id !== product.id);
    } else {
      storedWishlist.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        oldprice: product.old_price || Math.round((product.price || 0) * 1.15),
        quanity: product.quanity || product.stock || 10,
      });
    }
    localStorage.setItem("wishlist", JSON.stringify(storedWishlist));
    setWishlist(storedWishlist);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Khung bộ lọc tái sử dụng (cho cả Desktop & Mobile)
  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#6338f6]" />
          Bộ lọc nâng cao
        </span>
        <button
          onClick={() => {
            setPriceRange(50000000);
            setSortBy("Mới nhất");
            handlePageChange(1);
          }}
          className="text-xs text-[#6338f6] font-bold hover:text-indigo-800"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">
          Khoảng giá tối đa
        </p>
        <input
          type="range"
          min={0}
          max={50000000}
          step={500000}
          value={priceRange}
          onChange={(e) => {
            setPriceRange(Number(e.target.value));
            handlePageChange(1);
          }}
          className="w-full accent-[#6338f6] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between items-center text-xs text-slate-700 mt-4 font-semibold">
          <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
            0đ
          </span>
          <span className="bg-indigo-50/80 text-[#6338f6] px-3 py-1.5 rounded-lg border border-indigo-100 font-bold">
            {priceRange.toLocaleString()}đ
          </span>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">
          Sắp xếp theo
        </p>
        <div className="flex flex-col gap-2.5">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-[#6338f6] bg-indigo-50/40 text-[#6338f6] font-bold"
                    : "border-slate-100 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="sort"
                  checked={isSelected}
                  onChange={() => {
                    setSortBy(opt);
                    handlePageChange(1);
                  }}
                  className="w-4 h-4 accent-[#6338f6]"
                />
                <span className="text-sm font-semibold">{opt}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12 selection:bg-[#6338f6] selection:text-white">
      {/* Hero Header sát viền */}
      <div className="w-full px-2 sm:px-4 md:px-6 pt-4 pb-2 relative z-10 select-none">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-4 sm:p-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#6338f6] mb-1.5 block">
            {bannerId
              ? "Chiến dịch Banner"
              : isFlashSaleOnly
                ? "Săn Deal Hot"
                : displayCategory || "Khám Phá"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {meta.title}
          </h1>
          {meta.desc && (
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              {meta.desc}
            </p>
          )}
        </div>
      </div>

      {/* Main Container tràn viền chuẩn Responsive */}
      <div className="w-full px-2 sm:px-4 md:px-6 mt-4 flex flex-col lg:flex-row gap-4 md:gap-6 items-start relative z-10">
        {/* Nút lọc cho Mobile/Tablet */}
        <div className="lg:hidden w-full flex items-center justify-between bg-white p-3.5 rounded-2xl border border-indigo-100/80 shadow-sm">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 text-xs font-bold text-[#6338f6] bg-indigo-50/80 px-3.5 py-2 rounded-xl border border-indigo-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc & Sắp xếp</span>
          </button>
          <span className="text-xs font-bold text-slate-500">
            {filteredAndSortedProducts.length} sản phẩm
          </span>
        </div>

        {/* Modal bộ lọc trên Mobile */}
        {showMobileFilter && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end lg:hidden">
            <div className="w-4/5 max-w-sm bg-white h-full p-5 overflow-y-auto shadow-2xl relative flex flex-col justify-between">
              <div>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="pt-6">
                  <FilterContent />
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full mt-6 py-3 bg-[#6338f6] text-white font-extrabold rounded-xl uppercase text-xs tracking-wider shadow-md shadow-indigo-200"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Filters cho Desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-6 z-30 bg-white border border-indigo-100/80 rounded-2xl p-6 shadow-sm">
            <FilterContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full min-w-0">
          {loading ? (
            <div className="text-center py-20 bg-white border border-indigo-100/80 rounded-2xl shadow-sm text-slate-400 text-xs font-bold">
              Đang tải danh sách sản phẩm...
            </div>
          ) : isFlashSaleOnly && !isFlashSaleActive ? (
            <div className="text-center py-16 bg-white border border-dashed border-red-200 rounded-2xl shadow-sm px-6">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">
                ⚡
              </div>
              <p className="text-slate-800 text-sm font-extrabold">
                Chương trình Flash Sale đã kết thúc hoặc chưa bắt đầu
              </p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-indigo-100/80 rounded-2xl shadow-sm">
              <p className="text-slate-500 text-xs font-bold">
                Không tìm thấy sản phẩm nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grid 2 cột mobile, 3 tablet, 4-5 desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredAndSortedProducts.map((p) => {
                  if (!p) return null;
                  const mockOldPrice =
                    p.old_price || Math.round((p.price || 0) * 1.15);
                  const isFavorite = wishlist.some((item) => item.id === p.id);

                  return (
                    <Link
                      to={`/products/${p.id}`}
                      key={p.id}
                      className="group relative bg-white rounded-2xl p-3 border border-indigo-100/80 shadow-sm hover:border-[#6338f6] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {p.is_flash_sale_item && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-black text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full z-10">
                          ⚡ FLASH SALE
                        </span>
                      )}

                      <button
                        onClick={(e) => handleToggleFavorite(e, p)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-50/90 hover:bg-white rounded-full transition-all duration-200 z-30 border border-slate-100"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`}
                        />
                      </button>

                      <div className="relative bg-slate-50/50 border border-slate-100 aspect-square rounded-xl flex items-center justify-center p-3 group-hover:bg-indigo-50/20 transition-colors">
                        {getProductImage(p) ? (
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="text-slate-400 text-[10px] font-bold">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      <div className="pt-3 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-2 min-h-[32px] sm:min-h-[38px] group-hover:text-[#6338f6] transition-colors leading-snug">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">
                              (88)
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="text-[#6338f6] font-black text-sm sm:text-base">
                              {formatDisplayPrice(p.price)}
                            </span>
                            <span className="text-slate-400 line-through text-[10px] font-bold">
                              {formatDisplayPrice(mockOldPrice)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(e, p.id)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-[#6338f6] hover:bg-[#6338f6] hover:text-white flex items-center justify-center transition-all duration-200 shrink-0"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* PHÂN TRANG KHI totalPages > 1 */}
              {totalPages > 1 && (
                <div className="mt-8 pt-4 flex items-center justify-center gap-2 select-none">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-200
                      ${
                        currentPage === 1
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-indigo-50 active:scale-95"
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 border
                          ${
                            isActive
                              ? "bg-[#6338f6] border-[#6338f6] text-white shadow-md shadow-indigo-200"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 active:scale-95"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-200
                      ${
                        currentPage === totalPages
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-indigo-50 active:scale-95"
                      }`}
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
