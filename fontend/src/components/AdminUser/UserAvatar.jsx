//Component xử lý Avatar & Fallback

import { useState, useEffect } from "react";
import api from "../../services/api";

// Chuẩn hóa URL avatar -> luôn ra dạng {origin backend}/uploads/<tên file>
// Xử lý được mọi dạng: "xxx.png", "/uploads/xxx.png", "/api/images/xxx.png",
// và cả URL bị lặp "/api/images//api/images/xxx.png"
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || typeof avatarPath !== "string") return null;

  const p = avatarPath.trim();
  if (/^(data|blob):/i.test(p)) return p;

  // Ảnh từ bên ngoài (Google, Facebook...) thì giữ nguyên
  if (/^https?:\/\//i.test(p) && !/\/(api\/images|uploads)\//i.test(p)) {
    return p;
  }

  // Chỉ lấy tên file cuối cùng, bỏ hết mọi prefix (kể cả bị lặp)
  const clean = p.split("?")[0].split("#")[0];
  const filename = clean.substring(clean.lastIndexOf("/") + 1);
  if (!filename) return null;

  const baseURL = api.defaults.baseURL
    ? api.defaults.baseURL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";

  return `${baseURL}/uploads/${filename}`;
};

export const UserAvatar = ({ user, colorClass }) => {
  const avatarUrl = getAvatarUrl(user?.avatar);
  const [imgError, setImgError] = useState(false);

  // Avatar đổi (hoặc đổi sang user khác) thì thử tải lại
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "Avatar"}
        className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${colorClass} shrink-0`}
    >
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};