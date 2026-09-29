// src/utils/imageUrl.js
//
// Dùng chung 1 nguồn cấu hình với services/api.js (biến REACT_APP_API_URL)
// để đảm bảo URL ảnh và URL gọi API luôn trỏ về đúng 1 backend, tránh lệch
// nhau giữa dev (localhost) và khi deploy qua Docker/Nginx/ngrok.
//
// Ví dụ:
//   REACT_APP_API_URL = "http://localhost:5000/api"  (dev mặc định)
//     -> origin backend = "http://localhost:5000"
//   REACT_APP_API_URL = "/api"  (khi build cho Docker/Nginx, set trong .env.production
//     hoặc build ARG của Dockerfile)
//     -> origin backend = "" -> ảnh dùng đường dẫn tương đối "/uploads/..."
//        -> Nginx tự proxy theo đúng domain hiện tại (localhost, ngrok, domain thật...)

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Bỏ hậu tố "/api" (nếu có) để lấy origin gốc của backend
export const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Chuẩn hóa URL ảnh, hỗ trợ cả 2 kiểu dữ liệu backend có thể trả về:
 *  - "xxx.jpg"            (chỉ tên file, không có prefix)
 *  - "/uploads/xxx.jpg"   (đã có sẵn prefix /uploads/)
 *  - "http(s)://..."      (URL tuyệt đối, giữ nguyên)
 *
 * Dùng cho: ảnh sản phẩm, banner, tin tức... (mọi thứ được backend serve
 * qua thư mục tĩnh /uploads/)
 *
 * @param {string} imageName - giá trị trường "image" từ API
 * @param {string} fallback - URL ảnh mặc định khi không có/lỗi ảnh
 */
export const getImageUrl = (imageName, fallback) => {
  if (!imageName) return fallback;
  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    return imageName;
  }

  let clean = imageName.replace(/^\/+/, ""); // bỏ dấu "/" ở đầu (nếu có)
  if (!clean.startsWith("uploads/")) {
    clean = `uploads/${clean}`; // thêm "uploads/" nếu thiếu
  }
  return `${BACKEND_ORIGIN}/${clean}`;
};

/**
 * Chuẩn hóa URL avatar người dùng.
 * Hỗ trợ mọi dạng dữ liệu có thể nằm trong DB/localStorage:
 *  - "xxx.png"                 (chỉ tên file)
 *  - "/uploads/xxx.png"        (đã có prefix uploads)
 *  - "/api/images/xxx.png"     (prefix cũ của route avatar)
 *  - "http(s)://..."           (URL tuyệt đối, giữ nguyên)
 *
 * Luôn trả về: {BACKEND_ORIGIN}/uploads/xxx.png
 *
 * @param {string} avatarPath - giá trị trường "avatar" từ API/localStorage
 * @param {string} fallback - URL ảnh mặc định khi không có/lỗi ảnh
 */
export const getAvatarUrl = (avatarPath, fallback = "") => {
  if (!avatarPath || typeof avatarPath !== "string") return fallback;

  const path = avatarPath.trim();

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  // Bỏ "/" đầu và mọi prefix cũ (kể cả bị lặp), chỉ giữ lại tên file
  let filename = path.replace(/^\/+/, "");
  const prefixRegex = /^(api\/images|api\/uploads|images|uploads)\/+/i;
  while (prefixRegex.test(filename)) {
    filename = filename.replace(prefixRegex, "");
  }

  if (!filename) return fallback;

  return `${BACKEND_ORIGIN}/uploads/${filename}`;
};
