// src/utils/wishlist.js
// Lưu danh sách yêu thích RIÊNG cho từng người dùng:
//   - Đã đăng nhập  -> localStorage["wishlist_<user_id>"]
//   - Khách vãng lai -> KHÔNG được lưu yêu thích (phải đăng nhập)

const safeParse = (raw, fallback) => {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

// Giải mã payload của JWT (phòng khi object "user" không có id)
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
};

// Trả về id người dùng đang đăng nhập, hoặc "guest" nếu chưa đăng nhập
export const getCurrentUserId = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!token) return "guest";

  const user = safeParse(localStorage.getItem("user"), null);
  const fromUser =
    user?.id ?? user?.user_id ?? user?.userId ?? user?._id ?? user?.email;
  if (fromUser) return String(fromUser);

  const payload = decodeJwtPayload(token);
  const fromToken =
    payload?.id ?? payload?.user_id ?? payload?.userId ?? payload?.sub;
  return fromToken ? String(fromToken) : "guest";
};

// Đã đăng nhập hay chưa
export const isUserLoggedIn = () => getCurrentUserId() !== "guest";

export const getWishlistKey = () => `wishlist_${getCurrentUserId()}`;

export const getWishlist = () => {
  if (!isUserLoggedIn()) return []; // khách vãng lai: luôn rỗng
  const list = safeParse(localStorage.getItem(getWishlistKey()), []);
  return Array.isArray(list) ? list : [];
};

// notify = false: không phát sự kiện (dùng khi Header tự dọn rác, tránh lặp vô hạn)
export const saveWishlist = (list, { notify = true } = {}) => {
  if (!isUserLoggedIn()) return; // chặn ghi khi chưa đăng nhập
  localStorage.setItem(getWishlistKey(), JSON.stringify(list));
  if (notify) window.dispatchEvent(new Event("wishlistUpdated"));
};

export const isInWishlist = (productId) =>
  getWishlist().some((item) => String(item.id) === String(productId));

// Thêm/bỏ 1 sản phẩm. Trả về true nếu vừa được thêm, false nếu vừa bị bỏ,
// null nếu chưa đăng nhập (không làm gì cả).
export const toggleWishlist = (product) => {
  if (!isUserLoggedIn()) return null;
  const list = getWishlist();
  const exists = list.some((item) => String(item.id) === String(product.id));
  const next = exists
    ? list.filter((item) => String(item.id) !== String(product.id))
    : [...list, product];
  saveWishlist(next);
  return !exists;
};