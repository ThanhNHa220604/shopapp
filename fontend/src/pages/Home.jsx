import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Shield,
  Truck,
  Headset,
  ChevronRight,
  Menu,
  Tv,
  Camera,
  Keyboard,
  MousePointer,
  BatteryCharging,
  Speaker,
  Cpu,
  Clock,
} from "lucide-react";
import api from "../services/api";
import contentService from "../services/content";

// Import Components con
import ProductCard from "../components/Atomic/ProductCard";
import HeroBanner from "../components/Home/HeroBanner";
import FlashSaleSection from "../components/Home/FlashSaleSection";

// 🎨 DÙNG BẰNG TÙY CHỈNH CLASS HOẶC TỐI ƯU CÁC CLASS TRÙNG LẶP (TAILWIND REUSABLE STYLES)
const NO_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const SECTION_WRAPPER = "w-full px-2 sm:px-4 md:px-6 mt-6 md:mt-8";
const CARD_BOX =
  "w-full bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-indigo-100/80";
const SECTION_TITLE =
  "font-black text-[#6338f6] text-sm sm:text-base md:text-lg tracking-wide uppercase border-l-4 border-[#6338f6] pl-3";
const VIEW_ALL_BTN =
  "text-[#6338f6] hover:text-indigo-800 font-extrabold text-xs sm:text-sm flex items-center gap-1 transition-colors group";

// 🌟 DANH MỤC SIDEBAR
const sidebarCategories = [
  { key: "Smartphones", name: "Điện thoại & Tablet", icon: Smartphone },
  { key: "Laptops", name: "Laptop & Máy tính bộ", icon: Laptop },
  { key: "Audio", name: "Thiết bị âm thanh", icon: Headphones },
  { key: "Watch", name: "Đồng hồ thông minh", icon: Watch },
  { key: "Cpu", name: "Linh kiện máy tính", icon: Cpu },
  { key: "Tv", name: "Màn hình & Tivi", icon: Tv },
  {
    key: "Accessories",
    search: "Charger",
    name: "Phụ kiện & Cáp sạc",
    icon: BatteryCharging,
  },
  {
    key: "Accessories",
    search: "Keyboard",
    name: "Thiết bị ngoại vi",
    icon: Keyboard,
  },
  { key: "Camera", name: "Camera & Máy ảnh", icon: Camera },
  { key: "SmartHome", name: "Thiết bị SmartHome", icon: Shield },
];

// 🌟 DANH MỤC TRÒN
const circleCategories = [
  { key: "Smartphones", name: "Điện thoại", icon: Smartphone },
  { key: "Laptops", name: "Laptop", icon: Laptop },
  { key: "Audio", search: "Headphone", name: "Tai nghe", icon: Headphones },
  { key: "Watch", name: "Đồng hồ", icon: Watch },
  { key: "Audio", search: "Speaker", name: "Loa Bluetooth", icon: Speaker },
  { key: "Camera", name: "Máy ảnh", icon: Camera },
  { key: "Accessories", search: "Keyboard", name: "Bàn phím", icon: Keyboard },
  {
    key: "Accessories",
    search: "Mouse",
    name: "Chuột Gaming",
    icon: MousePointer,
  },
  {
    key: "Accessories",
    search: "Powerbank",
    name: "Sạc dự phòng",
    icon: BatteryCharging,
  },
];

const features = [
  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn từ 499k" },
  { icon: Shield, title: "Đổi trả dễ dàng", desc: "Trong 7 ngày" },
  { icon: Shield, title: "Thanh toán an toàn", desc: "Nhiều hình thức" },
  { icon: Shield, title: "Sản phẩm chính hãng", desc: "Cam kết 100%" },
  { icon: Headset, title: "Hỗ trợ 24/7", desc: "1900 1234" },
];

const Home = () => {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [homeNews, setHomeNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const handleCategoryClick = (cat) => {
    if (!cat) return;
    if (typeof cat === "string") {
      navigate(`/products?category=${encodeURIComponent(cat)}`);
      return;
    }
    if (cat.search) {
      navigate(
        `/products?category=${encodeURIComponent(cat.key)}&search=${encodeURIComponent(cat.search)}`,
      );
    } else {
      navigate(`/products?category=${encodeURIComponent(cat.key)}`);
    }
  };

  useEffect(() => {
    setLoadingTop(true);
    api
      .get("/products")
      .then((res) => {
        let prodArray = [];
        if (res.data) {
          if (Array.isArray(res.data)) prodArray = res.data;
          else if (res.data.data && Array.isArray(res.data.data))
            prodArray = res.data.data;
          else if (res.data.data?.rows && Array.isArray(res.data.data.rows))
            prodArray = res.data.data.rows;
          else if (res.data.rows && Array.isArray(res.data.rows))
            prodArray = res.data.rows;
        }

        const sorted = [...prodArray].sort(
          (a, b) => (b.buyturn || 0) - (a.buyturn || 0),
        );
        setTopProducts(sorted.slice(0, 14));
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm trang chủ:", err))
      .finally(() => setLoadingTop(false));

    setLoadingNews(true);
    contentService
      .getNews()
      .then((res) => {
        const actualNewsData = res?.data
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setHomeNews(actualNewsData.slice(0, 3));
      })
      .catch((err) => console.error("Lỗi lấy tin tức ở trang chủ:", err))
      .finally(() => setLoadingNews(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12 selection:bg-[#6338f6] selection:text-white">
      {/* ── SECTION 1: SIDEBAR + HERO SLIDER ── */}
      <section className="w-full px-2 sm:px-4 md:px-6 pt-3 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-indigo-100/80 p-3 h-[420px]">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#6338f6] to-indigo-600 text-white font-extrabold rounded-xl mb-2 text-xs tracking-wider uppercase shadow-md shadow-indigo-200 shrink-0">
            <Menu className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
          </div>

          <div className={`flex-1 overflow-y-auto space-y-0.5 ${NO_SCROLLBAR}`}>
            {sidebarCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryClick(cat)}
                className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#6338f6] hover:bg-indigo-50/80 rounded-xl cursor-pointer transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5">
                  <cat.icon className="w-4 h-4 text-slate-400 group-hover:text-[#6338f6] transition-colors" />
                  <span>{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#6338f6] group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 w-full">
          <HeroBanner />
        </div>
      </section>

      {/* ── SECTION 2: FEATURES BAR ── */}
      <section className="w-full px-2 sm:px-4 md:px-6 mt-4 md:mt-6">
        <div className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-5 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 border border-indigo-100/80">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 justify-center md:justify-start md:border-r border-slate-100 last:border-0 px-1 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#6338f6]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">
                  {f.title}
                </h4>
                <p className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5 font-bold">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: CIRCLE CATEGORIES ── */}
      <section className={SECTION_WRAPPER}>
        <div
          className={`w-full bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto border border-indigo-100/80 ${NO_SCROLLBAR}`}
        >
          {circleCategories.map((c, i) => (
            <div
              key={i}
              onClick={() => handleCategoryClick(c)}
              className="flex flex-col items-center text-center shrink-0 group cursor-pointer w-20"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50/60 group-hover:bg-[#6338f6] text-[#6338f6] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-indigo-100 group-hover:border-transparent group-hover:shadow-md group-hover:shadow-indigo-200">
                <c.icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="text-xs font-extrabold text-slate-700 group-hover:text-[#6338f6] mt-2.5 transition-colors whitespace-nowrap">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: FLASH SALE ── */}
      <div className={SECTION_WRAPPER}>
        <FlashSaleSection />
      </div>

      {/* ── SECTION 5: SẢN PHẨM BÁN CHẠY ── */}
      <section className={SECTION_WRAPPER}>
        <div className={`${CARD_BOX} space-y-5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className={SECTION_TITLE}>Sản Phẩm Bán Chạy Nhất</h3>
            <button
              onClick={() => navigate("/products")}
              className={VIEW_ALL_BTN}
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loadingTop ? (
            <div className="text-center p-10 text-slate-400 text-xs font-bold">
              Đang tải sản phẩm bán chạy...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3">
              {topProducts.map((p) => (
                <ProductCard key={p.id} product={p} isFlashSale={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 6: TIN TỨC ── */}
      <section className={SECTION_WRAPPER}>
        <div className={`${CARD_BOX} space-y-5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className={SECTION_TITLE}>Tin tức & Cẩm nang công nghệ</h3>
            <button onClick={() => navigate("/news")} className={VIEW_ALL_BTN}>
              <span>Xem Tất Cả</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loadingNews ? (
            <div className="text-center p-10 text-slate-400 text-xs font-bold">
              Đang tải tin tức...
            </div>
          ) : homeNews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic font-bold">
              Chưa có bài viết nào.
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {homeNews.map((post, idx) => (
                <div
                  key={post.id || idx}
                  onClick={() => navigate("/news")}
                  className="group cursor-pointer flex flex-col sm:flex-row gap-4 bg-indigo-50/30 p-3.5 sm:p-4 rounded-2xl border border-indigo-100/60 hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all duration-200 w-full"
                >
                  <div className="w-full sm:w-1/4 h-36 sm:h-32 rounded-xl overflow-hidden bg-slate-100 relative flex-shrink-0">
                    <img
                      src={
                        post.image
                          ? post.image.startsWith("http")
                            ? post.image
                            : `http://localhost:5000/uploads/${post.image}`
                          : "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1500"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-[#6338f6] text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                      {post.category || "Tin tức"}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(
                            post.createdAt || post.created_at || Date.now(),
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base line-clamp-1 group-hover:text-[#6338f6] transition-colors leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs font-black text-[#6338f6] uppercase tracking-wider inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-150">
                        Đọc thêm <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 7: GRID BANNER ── */}
      <section
        className={`${SECTION_WRAPPER} grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6`}
      >
        <div
          onClick={() => handleCategoryClick("Laptops")}
          className="bg-gradient-to-br from-indigo-50 to-blue-100/50 rounded-2xl p-5 sm:p-6 flex items-center justify-between border border-indigo-100 hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div className="space-y-2">
            <h4 className="font-black text-sm sm:text-base text-indigo-950">
              Laptop Chính Hãng
            </h4>
            <button className="bg-[#6338f6] hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl mt-2 uppercase tracking-wider transition-colors shadow-sm">
              Mua ngay
            </button>
          </div>
          <Laptop className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400/30 group-hover:scale-110 transition-transform duration-200 shrink-0" />
        </div>

        <div
          onClick={() => handleCategoryClick("Audio")}
          className="bg-gradient-to-br from-purple-50 to-indigo-100/50 rounded-2xl p-5 sm:p-6 flex items-center justify-between border border-purple-100 hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div className="space-y-2">
            <h4 className="font-black text-sm sm:text-base text-purple-950">
              Tai Nghe Cao Cấp
            </h4>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-4 py-2 rounded-xl mt-2 uppercase tracking-wider transition-colors shadow-sm">
              Mua ngay
            </button>
          </div>
          <Headphones className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400/30 group-hover:scale-110 transition-transform duration-200 shrink-0" />
        </div>

        <div
          onClick={() => handleCategoryClick("Accessories")}
          className="bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-2xl p-5 sm:p-6 flex items-center justify-between border border-emerald-100 hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div className="space-y-2">
            <h4 className="font-black text-sm sm:text-base text-emerald-950">
              Phụ Kiện Công Nghệ
            </h4>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl mt-2 uppercase tracking-wider transition-colors shadow-sm">
              Mua ngay
            </button>
          </div>
          <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400/30 group-hover:scale-110 transition-transform duration-200 shrink-0" />
        </div>
      </section>
    </div>
  );
};

export default Home;
