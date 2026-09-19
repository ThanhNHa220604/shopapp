//Component xử lý Avatar & Fallback


import api from "../../services/api";

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (
    avatarPath.startsWith("http://") ||
    avatarPath.startsWith("https://") ||
    avatarPath.startsWith("data:")
  ) {
    return avatarPath;
  }
  const baseURL = api.defaults.baseURL
    ? api.defaults.baseURL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";

  let cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  if (!cleanPath.startsWith("/uploads/")) {
    cleanPath = `/uploads${cleanPath}`;
  }
  return `${baseURL}${cleanPath}`;
};

export const UserAvatar = ({ user, colorClass }) => {
  const avatarUrl = getAvatarUrl(user?.avatar);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user.name || "Avatar"}
        className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
        onError={(e) => {
          e.target.style.display = "none";
          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
        }}
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