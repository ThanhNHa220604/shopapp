import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  Zap,
  Cpu,
  Ticket,
  Copy,
  Check,
} from "lucide-react";
import productService from "../services/product";
import cartService from "../services/cart";
import voucherService from "../services/voucherService";

// Import Components
import ImageGallery from "../components/ProductDetail/ImageGallery";
import ProductInfo from "../components/ProductDetail/ProductInfo";
import ProductSpec from "../components/ProductDetail/ProductSpec";
import DialogModal from "../components/ProductDetail/DialogModal";
import ProductFeedback from "../components/feedback";

// Token Decoders
const getDecodedToken = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};

const getRoleFromToken = () => {
  const decoded = getDecodedToken();
  return decoded
    ? decoded.role || decoded.role_id || decoded.roleId || null
    : null;
};

const getUserIdFromToken = () => {
  const decoded = getDecodedToken();
  return decoded
    ? decoded.id || decoded.userId || decoded.user_id || null
    : null;
};

// Helper kiểm tra vai trò có phải là Khách hàng (USER) hay không
const isUserRole = (role) => {
  if (!role) return false;
  const r = String(role).toUpperCase();
  return r === "USER" || r === "1"; // Hỗ trợ cả kiểu chuỗi "USER" lẫn mã định danh số 1
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Voucher State
  const [vouchers, setVouchers] = useState([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [isFavorite, setIsFavorite] = useState(false);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  const currentUserId = getUserIdFromToken();

  // Call API Lấy thông tin sản phẩm
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    productService
      .getProductDetail(id)
      .then((res) => {
        if (!ignore && res) {
          const actualProductData = res.data?.data
            ? res.data.data
            : res.data
              ? res.data
              : res;
          setProduct(actualProductData);

          if (actualProductData.image) {
            setActiveImg(actualProductData.image);
          } else if (actualProductData.product_image?.[0]?.imageurl) {
            setActiveImg(actualProductData.product_image[0].imageurl);
          }

          const variantsList =
            actualProductData.product_variant_values ||
            actualProductData.variants ||
            [];
          if (variantsList.length > 0) {
            const firstVariant = variantsList[0];
            if (firstVariant.sku && typeof firstVariant.sku === "string") {
              const skuParts = firstVariant.sku.split("-");
              if (skuParts.length >= 3) {
                setSelectedSize(`${skuParts[0]}-${skuParts[1]}`);
                setSelectedColor(skuParts[2]);
              } else if (skuParts.length === 2) {
                setSelectedSize(skuParts[0]);
                setSelectedColor(skuParts[1]);
              }
            }
            if (firstVariant.image_url || firstVariant.image) {
              setActiveImg(firstVariant.image_url || firstVariant.image);
            }
          }
        }
      })
      .catch((err) => console.error("Lỗi lấy chi tiết sản phẩm:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // 🟢 Call API Lấy Voucher sản phẩm & Lấy danh sách Voucher User đã lưu từ DB
  useEffect(() => {
    if (!id) return;

    const activeToken =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const role = getRoleFromToken();

    // 1. Lấy danh sách voucher áp dụng cho sản phẩm (Ai cũng xem được)
    voucherService
      .getVouchersForProduct(id)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : res?.data?.data || res?.data || [];
        setVouchers(list);
      })
      .catch((err) =>
        console.error("Lỗi lấy danh sách voucher sản phẩm:", err),
      );

    // 2. CHỈ KHI LÀ KHÁCH HÀNG (USER) MỚI GỌI API LẤY MÃ ĐÃ LƯU
    if (activeToken && isUserRole(role)) {
      voucherService
        .getUserVouchers()
        .then((res) => {
          let savedList = [];
          if (Array.isArray(res)) {
            savedList = res;
          } else if (res && Array.isArray(res.data)) {
            savedList = res.data;
          } else if (res && Array.isArray(res.vouchers)) {
            savedList = res.vouchers;
          } else if (res && Array.isArray(res.data?.data)) {
            savedList = res.data.data;
          }

          if (Array.isArray(savedList)) {
            const ids = savedList
              .map((item) => {
                if (typeof item === "number" || typeof item === "string") {
                  return String(item);
                }
                return String(
                  item.voucher_id ||
                    item.voucher?.id ||
                    item.voucherId ||
                    item.id,
                );
              })
              .filter((vId) => vId && vId !== "undefined" && vId !== "null");

            setSavedVoucherIds(ids);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách voucher đã lưu:", err);
          setSavedVoucherIds([]);
        });
    } else {
      // Đăng xuất hoặc tài khoản Admin/Manager => Không tải voucher đã lưu
      setSavedVoucherIds([]);
    }
  }, [id, token]);

  // 🟢 HÀM LƯU VOUCHER VÀO DATABASE
  const handleSaveVoucher = async (voucher) => {
    const activeToken =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (!activeToken) {
      setShowErrorModal({
        isOpen: true,
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để thực hiện lưu mã giảm giá!",
      });
      return;
    }

    const role = getRoleFromToken();
    if (!isUserRole(role)) {
      setShowErrorModal({
        isOpen: true,
        title: "Thông báo quyền hạn",
        message:
          "Tài khoản Quản trị viên / Manager không thể sử dụng tính năng lưu mã giảm giá.",
      });
      return;
    }

    const voucherIdStr = String(voucher.id);

    if (savedVoucherIds.includes(voucherIdStr)) return;

    try {
      if (voucher.code) {
        navigator.clipboard.writeText(voucher.code);
      }

      await voucherService.saveVoucher(voucher.id);

      setSavedVoucherIds((prev) =>
        Array.from(new Set([...prev, voucherIdStr])),
      );
    } catch (err) {
      console.error("Lỗi khi lưu voucher:", err);
      const errorMsg = err.response?.data?.message || err.message || "";

      if (
        errorMsg.toLowerCase().includes("đã lưu") ||
        errorMsg.toLowerCase().includes("already")
      ) {
        setSavedVoucherIds((prev) =>
          Array.from(new Set([...prev, voucherIdStr])),
        );
      } else {
        setShowErrorModal({
          isOpen: true,
          title: "Thông báo",
          message: errorMsg || "Không thể lưu voucher này!",
        });
      }
    }
  };

  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const isExist = wishlist.some((item) => item.id === product.id);
      setIsFavorite(isExist);
    }
  }, [product]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    if (!product) return;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (isFavorite) {
      wishlist = wishlist.filter((item) => item.id !== product.id);
      setIsFavorite(false);
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        oldprice: product.oldprice,
        quanity: product.quanity || product.stock,
      });
      setIsFavorite(true);
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const normalizedVariants = useMemo(() => {
    const rawList = product?.product_variant_values || product?.variants || [];
    return rawList.map((v) => {
      let sizePart = "";
      let colorPart = "";

      if (v.sku && typeof v.sku === "string") {
        const parts = v.sku.split("-");
        if (parts.length >= 3) {
          sizePart = `${parts[0]}-${parts[1]}`;
          colorPart = parts[2];
        } else if (parts.length === 2) {
          sizePart = parts[0];
          colorPart = parts[1];
        } else {
          sizePart = v.sku;
        }
      }

      return {
        ...v,
        extractedSize: sizePart.trim(),
        extractedColor: colorPart.trim(),
      };
    });
  }, [product]);

  const allAvailableSizes = useMemo(() => {
    const sizes = new Set();
    normalizedVariants.forEach((v) => {
      if (v.extractedSize) sizes.add(v.extractedSize);
    });
    return Array.from(sizes);
  }, [normalizedVariants]);

  const colorsForActiveSize = useMemo(() => {
    if (!selectedSize) return [];
    const filteredColors = [];

    normalizedVariants.forEach((v) => {
      if (v.extractedSize === selectedSize && v.extractedColor) {
        filteredColors.push({
          colorName: v.extractedColor,
          imageUrl: v.image_url || v.image,
          stock: Number(v.stock !== undefined ? v.stock : 0),
          price: Number(v.price || 0),
          oldPrice: v.old_price ? Number(v.old_price) : null,
          variantId: v.id,
        });
      }
    });
    return filteredColors;
  }, [normalizedVariants, selectedSize]);

  const activeVariantMatch = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return (
      colorsForActiveSize.find((c) => c.colorName === selectedColor) || null
    );
  }, [selectedSize, selectedColor, colorsForActiveSize]);

  const handleSelectSize = useCallback(
    (sizeValue) => {
      setSelectedSize(sizeValue);
      const matched = normalizedVariants.filter(
        (v) => v.extractedSize === sizeValue,
      );
      if (matched.length > 0) {
        setSelectedColor(matched[0].extractedColor);
        if (matched[0].image_url || matched[0].image) {
          setActiveImg(matched[0].image_url || matched[0].image);
        }
      } else {
        setSelectedColor("");
      }
    },
    [normalizedVariants],
  );

  const handleSelectColor = useCallback((colorObj) => {
    setSelectedColor(colorObj.colorName);
    if (colorObj.imageUrl) {
      setActiveImg(colorObj.imageUrl);
    }
  }, []);

  const activeFlashSaleItem = useMemo(() => {
    if (!product) return null;

    if (
      product.flash_sale_price &&
      (product.is_flash_sale || product.flash_sale_status === 1)
    ) {
      return {
        flash_sale_price: Number(product.flash_sale_price),
        flash_sale_stock: product.flash_sale_stock,
      };
    }

    if (Array.isArray(product.flash_sale_products)) {
      const activeItem = product.flash_sale_products.find((item) => {
        const sale = item.flash_sale;
        if (!sale) return true;
        return Number(sale.status) === 1;
      });

      if (activeItem && activeItem.flash_sale_price) {
        return {
          flash_sale_price: Number(activeItem.flash_sale_price),
          flash_sale_stock: activeItem.flash_sale_stock,
        };
      }
    }

    return null;
  }, [product]);

  const displayPrice = useMemo(() => {
    if (
      activeFlashSaleItem?.flash_sale_price !== undefined &&
      activeFlashSaleItem.flash_sale_price !== null
    ) {
      return activeFlashSaleItem.flash_sale_price;
    }
    return activeVariantMatch?.price !== undefined
      ? activeVariantMatch.price
      : Number(product?.price || 0);
  }, [activeFlashSaleItem, activeVariantMatch, product]);

  const displayOldPrice = useMemo(() => {
    if (
      activeFlashSaleItem?.flash_sale_price !== undefined &&
      activeFlashSaleItem.flash_sale_price !== null
    ) {
      return activeVariantMatch?.price !== undefined
        ? activeVariantMatch.price
        : Number(product?.price || 0);
    }
    return activeVariantMatch?.oldPrice !== undefined
      ? activeVariantMatch.oldPrice
      : product?.oldprice
        ? Number(product.oldprice)
        : null;
  }, [activeFlashSaleItem, activeVariantMatch, product]);

  const displayStock = useMemo(() => {
    if (
      activeFlashSaleItem?.flash_sale_stock !== undefined &&
      activeFlashSaleItem.flash_sale_stock !== null
    ) {
      return Number(activeFlashSaleItem.flash_sale_stock);
    }
    return activeVariantMatch?.stock !== undefined
      ? activeVariantMatch.stock
      : Number(product?.quanity || product?.stock || 0);
  }, [activeFlashSaleItem, activeVariantMatch, product]);

  const executeAddToCart = async (showNotification = true) => {
    if (!product) return false;

    if (allAvailableSizes.length > 0 && (!selectedSize || !selectedColor)) {
      setShowErrorModal({
        isOpen: true,
        title: "Lựa chọn sản phẩm",
        message: "Vui lòng lựa chọn đầy đủ cấu hình và màu sắc sản phẩm!",
      });
      return false;
    }

    const variantIdToSend = activeVariantMatch
      ? activeVariantMatch.variantId
      : null;

    try {
      if (!token) {
        setShowErrorModal({
          isOpen: true,
          title: "Yêu cầu đăng nhập",
          message:
            "Vui lòng đăng nhập hệ thống trước khi thực hiện hành động này.",
        });
        return false;
      }

      const role = getRoleFromToken();
      if (!isUserRole(role)) {
        setShowErrorModal({
          isOpen: true,
          title: "Thông báo quyền hạn",
          message: "Tài khoản Quản trị viên / Manager không có quyền mua hàng.",
        });
        return false;
      }

      const cartPayload = {
        productId: Number(product.id),
        product_id: Number(product.id),
        quantity: 1,
        quanity: 1,
        price: displayPrice,
      };

      if (variantIdToSend) {
        cartPayload.productVariantValueId = Number(variantIdToSend);
        cartPayload.product_variant_value_id = Number(variantIdToSend);
        cartPayload.product_variant_id = Number(variantIdToSend);
      }

      const res = await cartService.addToCart(cartPayload);
      const activeCartId = res?.cart_id || localStorage.getItem("cart_id");

      if (activeCartId) {
        await cartService.getCartItems(activeCartId);
      }

      if (showNotification) setShowSuccessModal(true);
      return true;
    } catch (err) {
      console.error(err);
      setShowErrorModal({
        isOpen: true,
        title: "Lỗi hệ thống",
        message: "Đã xảy ra lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.",
      });
      return false;
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (allAvailableSizes.length > 0 && (!selectedSize || !selectedColor)) {
      setShowErrorModal({
        isOpen: true,
        title: "Lựa chọn sản phẩm",
        message: "Vui lòng lựa chọn đầy đủ cấu hình và màu sắc sản phẩm!",
      });
      return;
    }

    const role = getRoleFromToken();
    if (!isUserRole(role)) {
      setShowErrorModal({
        isOpen: true,
        title: "Thông báo quyền hạn",
        message: "Tài khoản Quản trị viên / Manager không có quyền mua hàng.",
      });
      return;
    }

    const variantIdToSend = activeVariantMatch
      ? activeVariantMatch.variantId
      : null;

    const skuLabel = [selectedSize, selectedColor].filter(Boolean).join(" - ");

    navigate("/checkout", {
      state: {
        isBuyNow: true,
        quantity: 1,
        variant_id: variantIdToSend,
        productVariantValueId: variantIdToSend,
        buyNowItem: {
          product_id: Number(product.id),
          variant_id: variantIdToSend,
          productVariantValueId: variantIdToSend,
          name: product.name,
          price: displayPrice,
          image: activeImg || product.image,
          skuLabel: skuLabel || null,
        },
      },
    });
  };

  const handleGoToCart = () => {
    setShowSuccessModal(false);
    navigate("/carts");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Đang tải dữ liệu sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] font-sans">
        <div className="text-center space-y-4">
          <p className="text-gray-400 font-bold">
            Không tìm thấy thông tin chi tiết của sản phẩm này.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white text-xs font-black px-6 py-3 rounded-xl"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-[#1B2559] pb-16 relative">
      <DialogModal
        isOpen={showErrorModal.isOpen}
        type="error"
        title={showErrorModal.title}
        message={showErrorModal.message}
        onClose={() => setShowErrorModal({ ...showErrorModal, isOpen: false })}
        onAction={() => {
          setShowErrorModal({ ...showErrorModal, isOpen: false });
          if (showErrorModal.title === "Yêu cầu đăng nhập") navigate("/login");
        }}
        actionText={
          showErrorModal.title === "Yêu cầu đăng nhập"
            ? "Đăng nhập ngay"
            : "Đã hiểu"
        }
      />

      <DialogModal
        isOpen={showSuccessModal}
        type="success"
        title="Thêm vào giỏ hàng thành công!"
        message="Sản phẩm đã được cập nhật vào danh sách chọn mua của bạn."
        onClose={() => setShowSuccessModal(false)}
        onAction={handleGoToCart}
      />

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-2 text-xs font-bold text-gray-400">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-[#1B2559] truncate max-w-[250px]">
          {product.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 relative">
          {activeFlashSaleItem && (
            <div className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>ĐANG FLASH SALE</span>
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            className="absolute top-6 right-6 z-20 p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-100 shadow-sm transition-all duration-300"
            title={
              isFavorite ? "Xóa khỏi mục yêu thích" : "Thêm vào mục yêu thích"
            }
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-300 active:scale-90 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>

          <ImageGallery
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            mainImage={product.image}
            variants={normalizedVariants}
          />

          <div className="lg:col-span-7 space-y-6">
            <ProductInfo
              product={product}
              displayPrice={displayPrice}
              displayOldPrice={displayOldPrice}
              displayStock={displayStock}
              allAvailableSizes={allAvailableSizes}
              selectedSize={selectedSize}
              handleSelectSize={handleSelectSize}
              colorsForActiveSize={colorsForActiveSize}
              selectedColor={selectedColor}
              handleSelectColor={handleSelectColor}
              onAddToCart={executeAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* KHỐI HIỂN THỊ VOUCHER KHẢ DỤNG FOR SẢN PHẨM */}
            {vouchers.length > 0 && (
              <div className="p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/30 border border-amber-200/80 rounded-2xl space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <span>Mã giảm giá khả dụng cho sản phẩm này</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {vouchers.length} Mã có sẵn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vouchers.map((v) => {
                    const isSaved = savedVoucherIds.some(
                      (savedId) => String(savedId) === String(v.id),
                    );

                    return (
                      <div
                        key={v.id}
                        className="relative flex items-center bg-white border border-amber-200/90 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group"
                      >
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-50/90 rounded-full border-r border-amber-200 z-10" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-50/90 rounded-full border-l border-amber-200 z-10" />

                        <div className="p-3 pl-5 flex-1 border-r border-dashed border-amber-200/80 bg-gradient-to-r from-amber-50/40 to-transparent">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-amber-600 tracking-wide uppercase">
                              {v.code}
                            </span>
                            {v.min_order_value > 0 && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                Đơn từ{" "}
                                {Number(v.min_order_value).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {v.discount_type === "percent"
                              ? `Giảm ${v.discount_value}%`
                              : `Giảm ${Number(v.discount_value).toLocaleString(
                                  "vi-VN",
                                )}đ`}
                          </p>

                          {v.max_discount && v.discount_type === "percent" && (
                            <p className="text-[10px] text-gray-500 font-medium">
                              Tối đa{" "}
                              {Number(v.max_discount).toLocaleString("vi-VN")}đ
                            </p>
                          )}
                        </div>

                        <div className="px-3 py-2 pr-4 flex flex-col items-center justify-center">
                          {isSaved ? (
                            <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã lưu</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSaveVoucher(v)}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white transition-all duration-200 shadow-xs"
                              title="Lưu mã giảm giá"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Lưu mã</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-7 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 p-6 sm:p-8 rounded-[28px] border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10 relative overflow-hidden space-y-6">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-blue-100/80 pb-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30 animate-pulse">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#1B2559] uppercase tracking-wider">
                    Thông số kỹ thuật
                  </h2>
                  <p className="text-xs text-blue-600 font-bold mt-0.5">
                    Trang bị & cấu hình phần cứng chi tiết
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-blue-100 text-blue-700 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Cấu hình chi tiết
              </span>
            </div>

            <div className="relative z-10">
              <ProductSpec attributes={product.ProductAttributes} />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-[#1B2559] border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Mô tả chi tiết
            </h2>

            <div className="text-base sm:text-[15px] text-slate-600 leading-relaxed sm:leading-7 font-medium space-y-4 whitespace-pre-line max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {product.description ||
                "Sản phẩm hiện đang được cập nhật nội dung mô tả."}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ProductFeedback
            productId={product.id}
            currentUserId={currentUserId}
            token={token}
            apiUrl="http://localhost:5000/api"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
