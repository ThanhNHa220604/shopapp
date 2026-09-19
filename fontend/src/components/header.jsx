import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  ChevronDown,
  Home,
  Package,
  Zap,
  Tag,
  Newspaper,
  Info,
  ShieldCheck,
  Phone,
  Mic,
} from "lucide-react";
import productService from "../services/product";
import cartService from "../services/cart";
import authService from "../services/auth";
import useVoiceSearch from "../hooks/useVoiceSearch";
import ChatWidget from "./Chat/ChatWidget";

// MẢNG MENU ĐIỀU HƯỚNG
const navLinks = [
  { label: "Trang chủ", path: "/", icon: Home },
  { label: "Sản phẩm", path: "/products", icon: Package },
  { label: "Flash Sale", path: "/products?flashsale=true", icon: Zap },
  { label: "Ưu đãi", path: "/products?tag=deals", icon: Tag },
  { label: "Tin tức", path: "/news", icon: Newspaper },
  { label: "Giới thiệu", path: "/about", icon: Info },
  { label: "Chính sách", path: "/policy", icon: ShieldCheck },
  { label: "Liên hệ", path: "/contact", icon: Phone },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");

  const [searchFocused, setSearchFocused] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [allProductsCache, setAllProductsCache] = useState([]);
  const searchContainerRef = useRef(null);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const wishlistRef = useRef(null);
  // Giữ bản sao mới nhất của allProductsCache để dùng trong các event
  // listener (closure cũ sẽ không thấy state mới nếu không có ref này).
  const allProductsRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra đường dẫn active
  const isLinkActive = (linkPath) => {
    const currentFullPath = location.pathname + location.search;
    if (linkPath === "/products") {
      return location.pathname === "/products" && !location.search;
    }
    return currentFullPath === linkPath;
  };

  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    return `http://localhost:3000/api/images/${avatarPath}`;
  };

  const syncCartBadgeCount = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const cart_id = localStorage.getItem("cart_id");
      const role = authService.getRole();
      const normalizedRole = role ? String(role).toLowerCase() : "";

      if (
        normalizedRole === "manager" ||
        normalizedRole === "admin" ||
        (!token && !cart_id)
      ) {
        setCartCount(0);
        return;
      }

      const res = await cartService.getCartItems(cart_id || "");
      let totalQty = 0;

      if (Array.isArray(res)) {
        totalQty = res.reduce(
          (acc, item) => acc + Number(item.quantity || item.quanity || 0),
          0,
        );
      } else if (res && Array.isArray(res.data)) {
        totalQty = res.data.reduce(
          (acc, item) => acc + Number(item.quantity || item.quanity || 0),
          0,
        );
      }
      setCartCount(totalQty);
    } catch (error) {
      console.error("Lỗi đồng bộ Badge giỏ hàng:", error);
    }
  };

  // Chỉ giữ lại các sản phẩm trong wishlist mà vẫn còn tồn tại thật
  // trong danh sách sản phẩm hiện có (chưa bị xóa/ngừng bán).
  // Nếu cache sản phẩm chưa tải xong (mảng rỗng), giữ nguyên wishlist
  // để tránh xóa nhầm trước khi có dữ liệu để so sánh.
  const cleanWishlistAgainstProducts = (favs, products) => {
    if (!Array.isArray(favs) || favs.length === 0) return [];
    if (!Array.isArray(products) || products.length === 0) return favs;
    const validIds = new Set(products.map((p) => String(p.id)));
    return favs.filter((item) => validIds.has(String(item.id)));
  };

  const syncWishlist = () => {
    const favs = JSON.parse(localStorage.getItem("wishlist")) || [];
    const cleaned = cleanWishlistAgainstProducts(favs, allProductsRef.current);

    // Nếu có sản phẩm bị loại bỏ (đã xóa/ngừng bán), ghi lại localStorage
    // để dọn rác luôn, không chỉ ẩn ở giao diện.
    if (cleaned.length !== favs.length) {
      localStorage.setItem("wishlist", JSON.stringify(cleaned));
    }
    setWishlistItems(cleaned);
  };

  const checkLoginStatus = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      setIsLoggedIn(true);
      const rawRole = authService.getRole();
      const role = rawRole ? String(rawRole).toLowerCase() : null;
      setUserRole(role);

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserAvatarUrl(
            parsedUser?.avatar ? formatAvatarUrl(parsedUser.avatar) : "",
          );
        }
      } catch (e) {
        console.error("Lỗi parse thông tin user tại Header:", e);
        setUserAvatarUrl("");
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserAvatarUrl("");
    }
  };

  useEffect(() => {
    productService
      .getAllProducts()
      .then((res) => {
        const products = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setAllProductsCache(products);
        allProductsRef.current = products;
        // Cache sản phẩm vừa tải xong — lọc lại wishlist ngay để loại
        // bỏ những sản phẩm đã bị xóa/ngừng bán.
        syncWishlist();
      })
      .catch((err) => console.error("Lỗi tải cache tìm kiếm:", err));

    checkLoginStatus();
    syncCartBadgeCount();
    syncWishlist();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("cartUpdated", syncCartBadgeCount);
    window.addEventListener("wishlistUpdated", syncWishlist);
    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("userUpdated", checkLoginStatus);

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(event.target)) {
        setWishlistOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", syncCartBadgeCount);
      window.removeEventListener("wishlistUpdated", syncWishlist);
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("userUpdated", checkLoginStatus);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [location]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSuggestions([]);
      return;
    }
    const filtered = allProductsCache
      .filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
    setLiveSuggestions(filtered);
  }, [searchQuery, allProductsCache]);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUserRole(null);
    setCartCount(0);
    setUserAvatarUrl("");
    navigate("/");
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 🎤 Voice Search — nói tới đâu điền vào ô search tới đó (giống gõ tay),
  // nói xong (kết quả final) thì tự động chuyển trang kết quả tìm kiếm.
  const handleVoiceResult = (transcript, isFinal) => {
    setSearchQuery(transcript);
    setSearchFocused(true);

    if (isFinal && transcript.trim()) {
      navigate(`/products?search=${encodeURIComponent(transcript.trim())}`);
      setSearchFocused(false);
    }
  };

  const {
    isSupported: voiceSupported,
    listening: voiceListening,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceSearch({ onResult: handleVoiceResult });

  const handleMicClick = () => {
    if (voiceListening) {
      stopListening();
    } else {
      setSearchQuery("");
      startListening();
    }
  };

  return (
    <header className="w-full font-sans z-50 sticky top-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 backdrop-blur-md border-b-2 border-indigo-300 shadow-[0_6px_25px_rgba(79,70,229,0.18)]">
      {/* 1. MAIN NAVBAR */}
      <div
        className={`w-full border-b border-indigo-300/60 transition-all duration-100 ${
          scrolled ? "py-2 bg-indigo-200/90 backdrop-blur-md" : "py-3.5"
        }`}
      >
        <div className="w-full px-4 sm:px-8 xl:px-12 flex justify-between items-center gap-4 lg:gap-8">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-700 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform duration-75">
              ThanHNha
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 block mt-1 animate-ping"></span>
          </Link>

          {/* SEARCH BOX */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-xl relative hidden md:block"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-white/95 rounded-2xl border border-indigo-300 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all shadow-sm px-4 py-2 group"
            >
              <input
                type="text"
                className="bg-transparent flex-1 outline-none text-xs font-bold text-slate-800 placeholder-slate-400 py-0.5"
                placeholder={
                  voiceListening
                    ? "Đang nghe... hãy nói tên sản phẩm"
                    : "Tìm kiếm sản phẩm, thương hiệu mong muốn..."
                }
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  title={
                    voiceListening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"
                  }
                  className={`p-1 mr-1 rounded-lg transition-colors ${
                    voiceListening
                      ? "text-rose-600 animate-pulse"
                      : "text-slate-400 hover:text-indigo-600"
                  }`}
                >
                  <Mic size={16} className="stroke-[2.5]" />
                </button>
              )}
              <button
                type="submit"
                className="text-slate-400 group-focus-within:text-indigo-600 hover:text-indigo-600 transition-colors p-1"
              >
                <Search size={16} className="stroke-[2.5]" />
              </button>
            </form>

            {voiceError && (
              <p className="absolute top-full left-0 mt-1 text-[11px] text-rose-600 font-bold px-2">
                {voiceError === "not-allowed"
                  ? "Vui lòng cho phép truy cập micro để dùng tìm kiếm bằng giọng nói."
                  : "Không nhận diện được giọng nói, thử lại nhé."}
              </p>
            )}

            {/* LIVE SUGGESTIONS */}
            {searchFocused && liveSuggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md mt-2 rounded-2xl shadow-2xl border border-indigo-200 p-3 z-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 mb-1">
                  Sản phẩm gợi ý cho bạn
                </p>
                <div className="flex flex-col gap-1">
                  {liveSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onMouseDown={() => {
                        setSearchFocused(false);
                        setSearchQuery("");
                        navigate(`/products/${prod.id}`);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-indigo-50/80 rounded-xl cursor-pointer transition-colors group"
                    >
                      <img
                        src={prod.image}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200/60 group-hover:border-indigo-200"
                        alt="suggestion-thumb"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 truncate group-hover:text-indigo-600">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-black text-indigo-600">
                          {Number(prod.price || 0).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* USER & CART ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            {userRole !== "manager" && userRole !== "admin" && (
              <div className="relative hidden sm:block" ref={wishlistRef}>
                <button
                  onClick={() => setWishlistOpen(!wishlistOpen)}
                  className={`p-2.5 rounded-xl border transition-all duration-75 ${
                    wishlistOpen || wishlistItems.length > 0
                      ? "text-rose-600 bg-rose-50 border-rose-300"
                      : "text-slate-800 bg-white/90 border-indigo-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                  }`}
                >
                  <Heart
                    size={18}
                    className={
                      wishlistItems.length > 0
                        ? "fill-rose-500 text-rose-500"
                        : "stroke-[2.2]"
                    }
                  />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>

                {wishlistOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-indigo-200 p-3.5 z-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 pb-2 border-b border-slate-100">
                      Sản phẩm yêu thích ({wishlistItems.length})
                    </p>

                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
                        Chưa có sản phẩm yêu thích nào.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mt-2 pr-1 scrollbar-thin">
                        {wishlistItems.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setWishlistOpen(false);
                              navigate(`/products/${prod.id}`);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-rose-50/60 rounded-xl cursor-pointer transition-colors group border border-transparent hover:border-rose-100"
                          >
                            <img
                              src={
                                prod.image &&
                                (prod.image.startsWith("http://") ||
                                  prod.image.startsWith("https://"))
                                  ? prod.image
                                  : `http://localhost:5000/uploads/${prod.image}`
                              }
                              className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200/60"
                              alt={prod.name}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                                {prod.name}
                              </p>
                              <p className="text-[11px] font-black text-indigo-600">
                                {Number(prod.price || 0).toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {userRole !== "manager" && userRole !== "admin" && (
              <Link
                to="/carts"
                className="p-2.5 text-slate-800 hover:text-indigo-700 bg-white/90 border border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 rounded-xl relative transition-all duration-75"
              >
                <ShoppingCart size={18} className="stroke-[2.2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* CHAT (Khách hàng <-> Shop) */}
            {isLoggedIn && <ChatWidget />}

            {/* USER MENU */}
            <div className="relative group/user">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 bg-white/90 border border-indigo-300 p-1.5 pr-3 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-colors duration-75">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                    {userAvatarUrl ? (
                      <img
                        src={userAvatarUrl}
                        alt="User Avatar"
                        className="w-full h-full object-cover block"
                        onError={(e) => {
                          e.target.style.display = "none";
                          setUserAvatarUrl("");
                        }}
                      />
                    ) : userRole === "manager" ? (
                      "M"
                    ) : userRole === "admin" ? (
                      "A"
                    ) : (
                      "U"
                    )}
                  </div>
                  <ChevronDown size={14} className="text-slate-600 font-bold" />
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-300 block"
                >
                  Đăng nhập
                </Link>
              )}

              {isLoggedIn && (
                <div className="absolute right-0 top-full pt-2 opacity-0 pointer-events-none group-hover/user:opacity-100 group-hover/user:pointer-events-auto transition-all duration-75 z-50 w-52">
                  <div className="bg-white rounded-2xl shadow-2xl border border-indigo-200 p-2 flex flex-col gap-1">
                    {(userRole === "admin" ||
                      userRole === "super_admin" ||
                      userRole === "1") && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <User size={15} /> Trang quản trị
                      </Link>
                    )}
                    {userRole === "manager" && (
                      <Link
                        to="/manager/dashboard"
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <User size={15} /> Trang quản trị
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100/80 rounded-xl transition-colors"
                    >
                      <User size={15} /> Hồ sơ cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut size={15} /> Đăng xuất tài khoản
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-800 hover:bg-indigo-50 rounded-xl md:hidden transition-colors border border-indigo-300"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MENU DANH MỤC: ĐÃ XÓA SCROLLBAR, CÁC MỤC CÁCH NHAU RẤT ĐẸP MẮT */}
      <div className="w-full bg-indigo-300/40 hidden md:block border-t border-indigo-300/60 py-2.5">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-around gap-3 lg:gap-5 overflow-hidden">
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            const IconComponent = link.icon;

            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer group shrink-0 ${
                  active
                    ? "bg-[#6338f6] text-white shadow-md shadow-violet-500/30 scale-[1.03]"
                    : "bg-white/80 text-slate-700 hover:bg-white hover:text-[#6338f6] hover:shadow-sm"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-indigo-100/60 text-slate-600 group-hover:bg-indigo-50 group-hover:text-[#6338f6]"
                  }`}
                >
                  <IconComponent size={16} className="stroke-[2.2]" />
                </div>
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-indigo-200 p-4 space-y-4 shadow-xl relative z-50">
          <form
            onSubmit={handleSearchSubmit}
            className="flex bg-slate-100/80 rounded-xl py-2 px-3 border border-indigo-300 focus-within:bg-white focus-within:border-indigo-600"
          >
            <input
              className="bg-transparent flex-1 outline-none text-sm text-slate-800 font-medium"
              placeholder={
                voiceListening ? "Đang nghe..." : "Tìm kiếm sản phẩm..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-1.5 mr-1 rounded-lg transition-colors ${
                  voiceListening
                    ? "text-rose-600 animate-pulse"
                    : "text-slate-500"
                }`}
              >
                <Mic size={16} />
              </button>
            )}
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center"
            >
              <Search size={14} />
            </button>
          </form>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 text-sm font-extrabold py-2.5 px-3 rounded-xl transition-all duration-75 ${
                    active
                      ? "bg-[#6338f6] text-white"
                      : "text-slate-800 hover:bg-slate-100/60"
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
