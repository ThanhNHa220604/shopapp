import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cartService from "../services/cart";
import orderService from "../services/order";
import voucherService from "../services/voucherService";

import ShippingForm from "../components/checkout/ShippingForm";
import PaymentMethods from "../components/checkout/PaymentMethods";
import OrderSummary from "../components/checkout/OrderSummary";
import VoucherModal from "../components/checkout/VoucherModal";
import VietQRModal from "../components/checkout/VietQRModal";
import CheckoutSuccess from "../components/checkout/CheckoutSuccess";

// Nhận diện message lỗi kiểu "đã hết số lần / lượt sử dụng cho phép".
// Dùng chung cho cả lúc apply thật và lúc pre-check danh sách Ví Voucher.
const isUsageExceededMessage = (msg) => {
  const m = String(msg || "").toLowerCase();
  return (
    m.includes("hết số lần") ||
    m.includes("hết lượt") ||
    m.includes("vượt quá số lần") ||
    m.includes("used up") ||
    m.includes("usage limit") ||
    m.includes("exceed")
  );
};

const getValidUserId = () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;
  try {
    if (savedUser.startsWith("{")) {
      const parsed = JSON.parse(savedUser);
      return parsed.id || parsed.user_id || null;
    }
    return 1;
  } catch (e) {
    return null;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowState = location.state || null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState("momo");
  const [qrModalData, setQrModalData] = useState(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // User Vouchers State
  const [userVouchers, setUserVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "", // địa chỉ cụ thể (số nhà, tên đường) - user nhập
    ward: "", // phường / xã - user chọn
    district: "", // quận / huyện - user chọn
    city: "", // tỉnh / thành phố - user chọn, KHÔNG set mặc định
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  useEffect(() => {
    const userId = getValidUserId();
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi tiến hành thanh toán!");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserVouchers = async () => {
      const userId = getValidUserId();
      if (!userId) return;
      try {
        setLoadingVouchers(true);
        const response =
          (await voucherService.getUserVouchers?.(userId)) ||
          (await voucherService.getMyVouchers?.(userId)) ||
          (await voucherService.getVouchers?.());
        const data = response?.data || response?.vouchers || response || [];
        setUserVouchers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi lấy voucher:", err);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchUserVouchers();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (buyNowState && (buyNowState.isReorder || buyNowState.items)) {
          const reorderProducts =
            buyNowState.items || buyNowState.products || [];
          setItems(
            reorderProducts.map((item) => ({
              id: item.id || `reorder-${item.product_id}`,
              quantity: Number(item.quanity || item.quantity || 1),
              variant_id: item.variant_id || item.productVariantValueId || null,
              product_variant_value_id:
                item.variant_id || item.productVariantValueId || null,
              skuLabel: item.skuLabel || null,
              price: Number(
                item.applied_price || item.price || item.products?.price || 0,
              ),
              products: item.products ||
                item.product || {
                  id: item.product_id || item.id,
                  name: item.name || "Sản phẩm",
                  price: Number(item.price || 0),
                  image: item.image || "",
                },
            })),
          );
          setLoading(false);
          return;
        }

        const buyNowItem =
          buyNowState?.buyNowItem || buyNowState?.buyNowProduct || buyNowState;
        const targetProductId =
          buyNowItem?.product_id || buyNowItem?.productId || buyNowItem?.id;

        if (buyNowState && targetProductId) {
          const itemPrice = Number(
            buyNowState.price ||
              buyNowItem.variant_price ||
              buyNowItem.price ||
              0,
          );
          const chosenVariantId =
            buyNowState.variant_id ||
            buyNowState.productVariantValueId ||
            buyNowItem?.variant_id ||
            buyNowItem?.productVariantValueId ||
            buyNowItem?.product_variant_value_id ||
            null;

          setItems([
            {
              id: `buynow-${targetProductId}`,
              quantity: Number(
                buyNowState.quantity || buyNowState.quanity || 1,
              ),
              variant_id: chosenVariantId,
              product_variant_value_id: chosenVariantId,
              skuLabel: buyNowItem.skuLabel || null,
              price: itemPrice,
              products: {
                id: targetProductId,
                name: buyNowItem.name || "Sản phẩm mua ngay",
                price: itemPrice,
                image: buyNowItem.image_url || buyNowItem.image || "",
              },
            },
          ]);
          setLoading(false);
          return;
        }

        const cart_id = localStorage.getItem("cart_id");
        if (!cart_id) {
          setLoading(false);
          return;
        }
        const resData = await cartService.getCartItems(cart_id);
        let cartItemsArray = Array.isArray(resData)
          ? resData
          : resData?.data ||
            resData?.cart_items ||
            resData?.data?.cart_items ||
            [];

        setItems(
          cartItemsArray.map((item) => {
            const chosenVariantId =
              item.variant_id || item.product_variant_value_id || null;
            return {
              ...item,
              quantity: Number(item.quantity || item.quanity || 1),
              variant_id: chosenVariantId,
              product_variant_value_id: chosenVariantId,
              price: Number(item.applied_price || item.products?.price || 0),
              skuLabel:
                item.product_variant_values?.variant_text_label ||
                item.product_variant_values?.sku ||
                null,
            };
          }),
        );
      } catch (err) {
        console.error("Lỗi nạp giỏ hàng:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [buyNowState]);

  // Kiểm tra 1 voucher đã hết lượt sử dụng hay chưa / có còn hiệu lực không.
  // API GET /vouchers/user-saved trả về mảng { voucher_id, voucher: {...} },
  // và giờ backend đã tự tính sẵn 2 field trong `voucher`:
  //   - user_used_count : số lần CHÍNH user này đã dùng voucher (từ bảng voucher_usages)
  //   - is_exhausted     : true nếu voucher không còn dùng được nữa
  // Hàm này vẫn giữ vài fallback (usage_limit/limit_per_user, dò field khác...)
  // để không bị vỡ nếu sau này response thay đổi hoặc thiếu field.
  const isVoucherExhausted = useCallback((item) => {
    if (!item) return true;
    const v = item.voucher || item; // hỗ trợ cả 2 dạng: item lồng .voucher hoặc voucher phẳng

    // 0) Backend đã tính sẵn -> ưu tiên dùng luôn, đáng tin cậy nhất
    if (typeof v.is_exhausted === "boolean") return v.is_exhausted;

    // 1) Voucher đang bị tắt (admin set is_active = 0)
    if (v.is_active === 0 || v.is_active === false) return true;

    // 2) Nếu API trả thẳng số lượt còn lại của user cho voucher này
    const remaining =
      v.remaining_uses ??
      v.remaining_quantity ??
      v.remaining ??
      v.usage_remaining ??
      v.remaining_usage;
    if (remaining !== undefined && remaining !== null && remaining !== "") {
      return Number(remaining) <= 0;
    }

    // 3) Giới hạn lượt dùng THEO TỪNG USER (limit_per_user) + số lần user đã dùng
    const userLimit =
      v.limit_per_user ?? v.user_usage_limit ?? v.per_user_limit;
    const userUsed =
      v.user_used_count ??
      v.user_usage_count ??
      v.times_used_by_user ??
      v.used_by_user;
    if (
      userLimit !== undefined &&
      userLimit !== null &&
      userUsed !== undefined &&
      userUsed !== null
    ) {
      return Number(userUsed) >= Number(userLimit);
    }

    // 4) Giới hạn lượt dùng TỔNG (usage_limit) + tổng số đã dùng
    //    usage_limit = null/0 => không giới hạn tổng, bỏ qua check này
    const totalLimit = v.usage_limit;
    const totalUsed = v.used_count ?? v.used ?? v.times_used;
    if (totalLimit !== undefined && totalLimit !== null && totalLimit !== 0) {
      if (totalUsed !== undefined && totalUsed !== null) {
        return Number(totalUsed) >= Number(totalLimit);
      }
    }

    // 5) Cờ / trạng thái trực tiếp khác nếu backend trả sẵn kết quả đã tính
    if (
      v.is_used_up === true ||
      v.is_available === false ||
      v.status === "used_up" ||
      v.status === "exhausted" ||
      v.status === "out_of_stock"
    ) {
      return true;
    }

    // Không đủ dữ liệu để xác định -> vẫn hiển thị (an toàn hơn là ẩn nhầm)
    return false;
  }, []);

  // Danh sách voucher hợp lệ để hiển thị trong modal chọn voucher
  // (đã lọc bỏ những voucher user dùng hết lượt cho phép, dựa trên is_exhausted
  // do backend trả sẵn từ /vouchers/user-saved).
  const availableUserVouchers = useMemo(
    () => userVouchers.filter((v) => !isVoucherExhausted(v)),
    [userVouchers, isVoucherExhausted],
  );

  const { subtotal, discountAmount, total } = useMemo(() => {
    const sub = items.reduce((sum, i) => {
      const price = Number(i.price || i.products?.price || 0);
      const qty = Number(i.quantity || 1);
      return sum + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 0 : qty);
    }, 0);

    let discount = 0;
    if (appliedVoucher) {
      if (
        appliedVoucher.discount_amount !== undefined &&
        !isNaN(Number(appliedVoucher.discount_amount))
      ) {
        discount = Number(appliedVoucher.discount_amount);
      } else if (
        appliedVoucher.discount_type === "percent" ||
        appliedVoucher.discount_type === "percentage"
      ) {
        discount = (sub * Number(appliedVoucher.discount_value || 0)) / 100;
        if (appliedVoucher.max_discount_amount) {
          discount = Math.min(
            discount,
            Number(appliedVoucher.max_discount_amount),
          );
        }
      } else {
        discount = Number(appliedVoucher.discount_value || 0);
      }
    }

    if (isNaN(discount)) discount = 0;
    const finalTotal = Math.max(0, sub - discount);

    return {
      subtotal: isNaN(sub) ? 0 : sub,
      discountAmount: discount,
      total: isNaN(finalTotal) ? 0 : finalTotal,
    };
  }, [items, appliedVoucher]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const applyVoucherByCode = async (codeToApply) => {
    if (!codeToApply || !codeToApply.trim()) return;
    setVoucherError("");
    setApplyingVoucher(true);

    try {
      const res = await voucherService.applyVoucher({
        code: codeToApply.trim(),
        cartItems: items.map((i) => ({
          product_id: i.products?.id || i.product_id,
          price: Number(i.price || i.products?.price || 0),
          quantity: Number(i.quantity || 1),
        })),
      });

      const resData = res?.data?.data || res?.data || res?.voucher || res;

      // ⚠️ Backend đôi khi trả HTTP 200 nhưng body chỉ chứa { message: "..." }
      // báo lỗi (vd: "Bạn đã sử dụng hết số lần cho phép với mã ..."), không
      // có field discount nào cả. Axios không tự throw trong trường hợp này,
      // nên phải tự kiểm tra và coi đây là lỗi để không set appliedVoucher.
      const hasDiscountInfo =
        resData?.discount_amount !== undefined ||
        resData?.discount_value !== undefined ||
        resData?.discount_type !== undefined;
      const looksLikeError =
        res?.success === false ||
        res?.error === true ||
        resData?.success === false ||
        resData?.error === true ||
        (typeof resData?.message === "string" && !hasDiscountInfo);

      if (looksLikeError) {
        throw new Error(
          resData?.message || res?.message || "Mã giảm giá không hợp lệ.",
        );
      }

      setAppliedVoucher({
        code: codeToApply.toUpperCase(),
        discount_amount: Number(
          resData.discount_amount || resData.discount_value || 0,
        ),
        discount_type: resData.discount_type || "fixed",
        discount_value: Number(resData.discount_value || 0),
        ...resData,
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Mã giảm giá không hợp lệ.";
      setVoucherError(errMsg);
      setAppliedVoucher(null);

      // Nếu lỗi là do đã dùng hết số lượt cho phép -> loại voucher này khỏi
      // Ví Voucher ngay lập tức (fallback an toàn, phòng trường hợp dữ liệu
      // is_exhausted từ /vouchers/user-saved bị lệch so với thực tế lúc apply).
      if (isUsageExceededMessage(errMsg)) {
        const upperCode = codeToApply.trim().toUpperCase();
        setUserVouchers((prev) =>
          prev.filter((v) => {
            const code = v.code || v.voucher_code || v.voucher?.code;
            return String(code || "").toUpperCase() !== upperCode;
          }),
        );
      }
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Pre-check bằng cách gọi thử /vouchers/apply đã được loại bỏ: giờ backend
  // (getUserSavedVouchers) đã tự trả sẵn is_exhausted/user_used_count cho từng
  // voucher trong /vouchers/user-saved, nên isVoucherExhausted() ở trên đủ để
  // lọc chính xác mà không cần gọi thêm API nào khi mở modal.

  const handleSubmit = async () => {
    setError("");
    const userId = getValidUserId();
    if (!userId) return setError("Vui lòng đăng nhập tài khoản để thanh toán.");
    if (!form.name || !form.phone)
      return setError("Vui lòng nhập họ tên và số điện thoại.");
    if (!form.city) return setError("Vui lòng chọn Tỉnh / Thành phố.");
    if (!form.district) return setError("Vui lòng chọn Quận / Huyện.");
    if (!form.ward) return setError("Vui lòng chọn Phường / Xã.");
    if (!form.address)
      return setError("Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường).");
    if (
      payment === "card" &&
      (!form.cardNumber || !form.cardExpiry || !form.cardCvc)
    )
      return setError("Vui lòng điền đầy đủ thông tin thẻ tín dụng.");

    setPlacing(true);
    try {
      const cart_id = localStorage.getItem("cart_id") || items[0]?.cart_id;
      const buyNowItem =
        buyNowState?.buyNowItem || buyNowState?.buyNowProduct || buyNowState;
      const targetProductId =
        buyNowItem?.product_id || buyNowItem?.productId || buyNowItem?.id;
      const isBuyNow = !!(buyNowState && targetProductId);
      const isReorder = !!(buyNowState && buyNowState.isReorder);

      let orderPayload = {
        total: Number(total),
        note: `Khách: ${form.name}. ĐC: ${form.address}, ${form.ward}, ${form.district}, ${form.city}. SĐT: ${form.phone}`,
        payment_method: payment,
        phone: form.phone,
        address: {
          street: form.address,
          ward: form.ward,
          district: form.district,
          city: form.city,
        },
        user_id: Number(userId),
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
      };

      if (isReorder) {
        orderPayload.items = items.map((item) => ({
          product_id: Number(item.products?.id || item.product_id),
          variant_id: item.variant_id ? Number(item.variant_id) : null,
          product_variant_value_id: item.variant_id
            ? Number(item.variant_id)
            : null,
          quanity: Number(item.quantity),
          quantity: Number(item.quantity),
        }));
      } else if (isBuyNow) {
        const chosenVariantId =
          buyNowState.variant_id ||
          buyNowState.productVariantValueId ||
          buyNowItem?.variant_id ||
          items[0]?.variant_id ||
          null;
        orderPayload.product_id = Number(targetProductId);
        orderPayload.quanity = Number(buyNowState.quantity || 1);
        orderPayload.quantity = Number(buyNowState.quantity || 1);
        orderPayload.variant_id = chosenVariantId
          ? Number(chosenVariantId)
          : null;
        orderPayload.product_variant_value_id = chosenVariantId
          ? Number(chosenVariantId)
          : null;
      } else {
        orderPayload.cart_id = cart_id ? Number(cart_id) : null;
      }

      const response = await orderService.checkoutCart(orderPayload);
      const resData = response?.data || response;

      if (payment === "momo") {
        const redirectUrl =
          resData?.paymentUrl || resData?.payUrl || resData?.data?.paymentUrl;
        if (redirectUrl) {
          if (!isBuyNow && !isReorder) localStorage.removeItem("cart_id");
          window.location.href = redirectUrl;
          return;
        }
      }

      if (payment === "bank") {
        const qrUrl =
          resData?.qrImageUrl || resData?.data?.qrImageUrl || resData?.qrCode;
        if (qrUrl) {
          setQrModalData({
            qrImageUrl: qrUrl,
            orderId: resData?.order_id || resData?.data?.order_id,
            total,
          });
          if (!isBuyNow && !isReorder) localStorage.removeItem("cart_id");
          return;
        }
      }

      if (!isBuyNow && !isReorder) localStorage.removeItem("cart_id");
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Đặt hàng thất bại.",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (success) return <CheckoutSuccess onGoHome={() => navigate("/")} />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Thanh toán
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Hoàn tất đơn hàng của bạn với quy trình bảo mật chuẩn quốc tế.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <ShippingForm form={form} onChange={handleChange} />
            <PaymentMethods
              payment={payment}
              setPayment={setPayment}
              form={form}
              onChange={handleChange}
            />
            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>

          <div className="lg:col-span-5">
            <OrderSummary
              items={items}
              loading={loading}
              subtotal={subtotal}
              discountAmount={discountAmount}
              total={total}
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              appliedVoucher={appliedVoucher}
              setAppliedVoucher={setAppliedVoucher}
              voucherError={voucherError}
              applyingVoucher={applyingVoucher}
              handleApplyVoucher={() => applyVoucherByCode(voucherCode)}
              setShowVoucherModal={setShowVoucherModal}
              handleSubmit={handleSubmit}
              placing={placing}
              payment={payment}
            />
          </div>
        </div>
      </div>

      <VoucherModal
        show={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        loading={loadingVouchers}
        vouchers={availableUserVouchers}
        appliedVoucher={appliedVoucher}
        onSelect={(v) => {
          const code = v.code || v.voucher_code || v.voucher?.code;
          if (code) {
            setVoucherCode(code);
            setShowVoucherModal(false);
            applyVoucherByCode(code);
          }
        }}
      />

      <VietQRModal
        qrData={qrModalData}
        onClose={() => {
          setQrModalData(null);
          setSuccess(true);
        }}
      />
    </div>
  );
};

export default Checkout;
