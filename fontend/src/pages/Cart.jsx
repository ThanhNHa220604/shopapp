import React, { useState, useEffect } from "react";
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertTriangle,
  X,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cart";

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
  });

  const fetchCart = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const cart_id = localStorage.getItem("cart_id");

      if (!token && !cart_id) {
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await cartService.getCartItems(cart_id || "");

      let arrayData = [];
      if (Array.isArray(response)) {
        arrayData = response;
      } else if (response && Array.isArray(response.data)) {
        arrayData = response.data;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        arrayData = response.data.data;
      } else if (
        response &&
        response.cart_items &&
        Array.isArray(response.cart_items)
      ) {
        arrayData = response.cart_items;
      }

      setItems(Array.isArray(arrayData) ? arrayData : []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu từ API giỏ hàng:", error);

      if (
        error.response?.status === 401 ||
        error.response?.data?.code === "Unauthorized"
      ) {
        alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        navigate("/login");
        return;
      }

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (item, delta) => {
    const currentQty = item.quantity || item.quanity || 1;
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      setDeleteModal({ isOpen: true, itemId: item.id });
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: nextQty, quanity: nextQty } : i,
      ),
    );

    try {
      await cartService.updateCartItem(item.id, {
        quantity: nextQty,
        quanity: nextQty,
      });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng mặt hàng:", error);

      if (
        error.response?.status === 401 ||
        error.response?.data?.code === "Unauthorized"
      ) {
        navigate("/login");
        return;
      }

      fetchCart();
    }
  };

  const handleTriggerRemove = (id) => {
    setDeleteModal({ isOpen: true, itemId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.itemId;
    if (!id) return;

    setDeleteModal({ isOpen: false, itemId: null });
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await cartService.deleteCartItem(id);
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      fetchCart();
    }
  };

  // Helper hàm lấy giá thực tế áp dụng (Ưu tiên Flash Sale)
  const getItemPrice = (item) => {
    // 1. Nếu backend CartController đã trả về trường applied_price
    if (item?.applied_price !== undefined && item?.applied_price !== null) {
      return Number(item.applied_price);
    }

    const productData = item?.products || item?.Product || {};

    // 2. Kiểm tra nếu có chiến dịch Flash Sale trong sản phẩm
    const activeSale = productData?.flash_sale_products?.find(
      (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
    );
    if (activeSale && activeSale.flash_sale_price) {
      return Number(activeSale.flash_sale_price);
    }

    // 3. Ngược lại lấy giá Variant hoặc giá gốc Product
    const variantData =
      item?.product_variant_values ||
      item?.product_variant_value ||
      item?.ProductVariantValue ||
      null;

    const variantPrice = variantData?.price;
    const basePrice = productData.price || 0;

    return variantPrice !== undefined && variantPrice !== null
      ? Number(variantPrice)
      : Number(basePrice);
  };

  // Tính tổng tiền toàn bộ giỏ hàng dựa theo giá thực tế
  const subtotal = (items || []).reduce((sum, item) => {
    const price = getItemPrice(item);
    const qty = item?.quantity || item?.quanity || 1;
    return sum + price * qty;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu giỏ hàng...
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#1B2559]">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Có vẻ như bạn chưa chọn được sản phẩm ưng ý nào. Hãy quay lại
              trang chủ để tiếp tục khám phá nhé!
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center bg-blue-600 text-white px-6 py-3.5 rounded-xl text-xs font-black shadow-lg"
          >
            Quay lại mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans text-[#1B2559] pb-20 pt-6 relative">
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-[#111c44]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative text-center space-y-5">
            <button
              onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-[#1B2559]">
                Xóa sản phẩm này?
              </h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">
                Bạn có chắc chắn muốn loại bỏ sản phẩm này ra khỏi giỏ hàng
                không?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
                className="py-3 border-2 border-gray-100 text-gray-500 text-xs font-black rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-3 bg-red-500 text-white text-xs font-black rounded-xl"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-[#1B2559] flex items-center gap-3">
              Giỏ hàng của bạn{" "}
              <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-1 rounded-full">
                {items.length}
              </span>
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-xs font-black"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              if (!item) return null;
              const productData = item.products || item.Product || {};
              const variantData =
                item.product_variant_values ||
                item.product_variant_value ||
                item.ProductVariantValue ||
                null;

              const name = productData.name || "Sản phẩm không tên";
              const image =
                variantData?.image_url ||
                variantData?.image ||
                productData.image ||
                "https://placehold.co/150";

              // Lấy giá chuẩn đã xử lý Flash Sale
              const price = getItemPrice(item);
              const qty = item.quantity || item.quanity || 1;

              // Kiểm tra xem sản phẩm có đang áp dụng Flash Sale không
              const isFlashSale =
                (item?.applied_price &&
                  productData.price &&
                  item.applied_price < productData.price) ||
                productData?.flash_sale_products?.some(
                  (fsp) => fsp.flash_sale && fsp.flash_sale.status === 1,
                );

              const originalPrice =
                variantData?.price !== undefined && variantData?.price !== null
                  ? variantData.price
                  : productData.price || 0;

              let variantDisplayLabel = "";
              if (
                variantData &&
                variantData.sku &&
                typeof variantData.sku === "string"
              ) {
                const skuParts = variantData.sku.split("-");
                const isNumericSku = skuParts.every((part) => !isNaN(part));
                if (isNumericSku) {
                  variantDisplayLabel = `Bản cấu hình #${skuParts.join(" / Màu #")}`;
                } else {
                  variantDisplayLabel = skuParts
                    .map((part) => part.replace(/([A-Z]+)/g, " $1").trim())
                    .join(" • ");
                }
              }

              const finalVariantText =
                variantData?.variant_text_label || variantDisplayLabel;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-50 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-[#F4F7FE] rounded-2xl overflow-hidden flex items-center justify-center p-2 shrink-0 relative">
                      <img
                        src={image}
                        alt={name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="text-xs font-black text-[#1B2559] truncate">
                        {name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {isFlashSale && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded-md">
                            <Zap className="w-3 h-3 fill-white" /> Flash Sale
                          </span>
                        )}
                        {variantData ? (
                          <span className="inline-flex items-center text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md">
                            Phiên bản: {finalVariantText}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[9px] font-bold bg-gray-50 text-gray-400 px-2.5 py-0.5 rounded-md">
                            Sản phẩm gốc (Base)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="flex items-center bg-gray-50 p-1 rounded-xl">
                      <button
                        onClick={() => handleUpdateQty(item, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-black text-gray-800">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end w-28">
                        <span className="text-xs font-black text-blue-600 text-right">
                          {(price * qty).toLocaleString()}đ
                        </span>
                        {isFlashSale && originalPrice > price && (
                          <span className="text-[10px] font-bold text-gray-400 line-through text-right">
                            {(Number(originalPrice) * qty).toLocaleString()}đ
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleTriggerRemove(item.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 sticky top-6">
            <div className="bg-white border border-gray-50 p-6 rounded-[32px] shadow-sm space-y-5">
              <h2 className="text-sm font-black text-[#1B2559] border-b border-gray-50 pb-3 uppercase tracking-wider">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Tạm tính ({items.length} mặt hàng)</span>
                  <span className="text-[#1B2559]">
                    {subtotal.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-500 font-black flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Miễn phí
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-100 pt-4 flex justify-between items-baseline">
                  <span className="text-xs font-black text-[#1B2559]">
                    Tổng cộng:
                  </span>
                  <span className="font-black text-xl text-blue-600">
                    {subtotal.toLocaleString()}đ
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate("/checkout", { state: { checkoutItems: items } })
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"
              >
                Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
