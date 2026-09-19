import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import api from "../../services/api";
import ProductCard from "../Atomic/ProductCard";

const FlashSaleSection = () => {
  const navigate = useNavigate();
  const [activeFlashSale, setActiveFlashSale] = useState(null);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [nextSlot, setNextSlot] = useState("");
  const [countdown, setCountdown] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    setLoadingFlashSale(true);
    api
      .get("/flash-sales")
      .then(async (res) => {
        const sales = res.data?.data || res.data || [];
        const activeSale = sales.find((sale) => sale.status === 1);

        if (activeSale) {
          setActiveFlashSale(activeSale);
          let productsList =
            activeSale.flash_sale_products ||
            activeSale.FlashSaleProducts ||
            activeSale.products ||
            [];

          if (productsList.length === 0 && activeSale.id) {
            try {
              const detailRes = await api.get(`/flash-sales/${activeSale.id}`);
              const detailData = detailRes.data?.data || detailRes.data || {};
              productsList =
                detailData.flash_sale_products ||
                detailData.FlashSaleProducts ||
                detailData.products ||
                [];
            } catch (errDetail) {
              try {
                const altRes = await api.get(
                  `/flash-sales/detail/${activeSale.id}`,
                );
                const altData = altRes.data?.data || altRes.data || {};
                productsList =
                  altData.flash_sale_products ||
                  altData.FlashSaleProducts ||
                  altData.products ||
                  [];
              } catch (e) {
                console.error("Không thể lấy sản phẩm:", e);
              }
            }
          }
          setFlashSaleProducts(productsList);
        } else {
          setFlashSaleProducts([]);
          setIsFlashSaleActive(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu Flash Sale:", err);
        setIsFlashSaleActive(false);
      })
      .finally(() => setLoadingFlashSale(false));
  }, []);

  useEffect(() => {
    if (!activeFlashSale || !activeFlashSale.end_time) {
      setIsFlashSaleActive(false);
      return;
    }

    const endTime = new Date(activeFlashSale.end_time);
    const endTimeMs = endTime.getTime();

    const hoursNext = String(endTime.getHours()).padStart(2, "0");
    const minutesNext = String(endTime.getMinutes()).padStart(2, "0");
    setNextSlot(`${hoursNext}:${minutesNext}`);

    const checkAndCalculateTime = () => {
      const now = new Date().getTime();
      const distance = endTimeMs - now;

      if (distance <= 0) {
        setIsFlashSaleActive(false);
        setCountdown({ hours: "00", minutes: "00", seconds: "00" });
        return false;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });

      setIsFlashSaleActive(true);
      return true;
    };

    const isActive = checkAndCalculateTime();
    let timer;
    if (isActive) {
      timer = setInterval(checkAndCalculateTime, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeFlashSale]);

  if (!isFlashSaleActive || !activeFlashSale) return null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-indigo-100/80">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-stretch">
        {/* Banner Flash Sale Tím Bên Trái */}
        <div className="lg:col-span-1 bg-gradient-to-b from-[#5d34e8] to-[#805cf5] rounded-2xl p-4 text-white flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl tracking-wider uppercase">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
              <span>FLASH SALE</span>
            </div>
            <p className="text-purple-100 text-xs font-medium uppercase tracking-wide leading-tight line-clamp-2">
              {activeFlashSale.name || "Ưu đãi chớp nhoáng"}
            </p>

            {nextSlot && (
              <div className="bg-purple-900/40 border border-purple-400/30 rounded-xl p-2 text-center">
                <span className="block text-[9px] text-purple-200 font-bold tracking-wider uppercase">
                  Khung giờ tiếp theo
                </span>
                <span className="text-xs font-black text-amber-300">
                  Bắt đầu lúc {nextSlot}
                </span>
              </div>
            )}

            <div className="space-y-1">
              <span className="block text-[9px] text-purple-200 font-bold tracking-wider uppercase">
                Kết thúc sau
              </span>
              <div className="flex items-center gap-1.5">
                <div className="bg-white text-[#5d34e8] font-black text-xs rounded-lg px-2 py-1 shadow-sm">
                  {countdown.hours}
                </div>
                <div className="text-white font-bold text-xs">:</div>
                <div className="bg-white text-[#5d34e8] font-black text-xs rounded-lg px-2 py-1 shadow-sm">
                  {countdown.minutes}
                </div>
                <div className="text-white font-bold text-xs">:</div>
                <div className="bg-white text-[#5d34e8] font-black text-xs rounded-lg px-2 py-1 shadow-sm">
                  {countdown.seconds}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/products?flashsale=true")}
            className="w-full bg-white text-[#5d34e8] hover:bg-amber-300 hover:text-slate-900 font-black py-2 rounded-xl text-xs mt-6 transition-all active:scale-95 shadow-md uppercase tracking-wider"
          >
            Xem tất cả
          </button>
        </div>

        {/* Danh sách sản phẩm Flash Sale bên phải (Dàn hàng ngang sát mép) */}
        <div className="lg:col-span-5">
          {loadingFlashSale ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 font-bold text-xs">
              Đang tải sản phẩm Flash Sale...
            </div>
          ) : !flashSaleProducts || flashSaleProducts.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 font-bold text-xs">
              Hiện tại không có sản phẩm Flash Sale nào!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
              {flashSaleProducts.map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <ProductCard
                    key={item.id}
                    product={p}
                    isFlashSale={true}
                    flashSaleData={item}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashSaleSection;
