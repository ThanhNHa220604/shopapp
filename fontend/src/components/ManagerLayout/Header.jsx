import React, { useEffect, useRef, useState } from "react";
import { Mail, Shield, Phone, X } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAppSettings } from "../../hooks/useAppSettings";

const Header = ({ userProfile: propUserProfile }) => {
  const { t } = useTranslation();
  const { theme } = useAppSettings();

  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(propUserProfile || null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (propUserProfile) {
      setUser(propUserProfile);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUser(response.data?.data || response.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin cá nhân:", error);
      }
    };

    fetchProfile();
  }, [propUserProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;

    return `http://localhost:5000/uploads/${avatar}`;
  };

  const formatRole = (rawRole) => {
    const roleValue = String(rawRole ?? "")
      .trim()
      .toLowerCase();

    if (roleValue === "1" || roleValue === "user") {
      return t("roles.user");
    }

    if (roleValue === "2" || roleValue === "manager") {
      return t("roles.manager");
    }

    if (roleValue === "3" || roleValue === "admin") {
      return t("roles.admin");
    }

    return rawRole || t("common.notAvailable");
  };

  const name =
    user?.name ||
    user?.fullname ||
    user?.username ||
    "Thanh Nha";

  const roleText = formatRole(
    user?.role_id ?? user?.role ?? user?.role_name,
  );

  const email = user?.email || "user1@gmail.com";
  const phone = user?.phone || user?.phone_number || "901000001";
  const avatarUrl = getAvatarUrl(user?.avatar || user?.image);
  const isDark = theme === "dark";

  return (
    <header
      className={`w-full px-6 py-3 flex items-center justify-between border-b transition-colors duration-300 relative ${
        isDark
          ? "bg-[#0d0f17] text-white border-white/5"
          : "bg-white text-slate-800 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold tracking-tight">
          {t("header.managerPage")}
        </h2>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowProfile((previous) => !previous)}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer outline-none shadow-sm ${
            isDark
              ? "bg-[#171925] border-white/10 hover:border-white/20 text-white"
              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
          }`}
        >
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 rounded-full" />
          </div>

          <div className="text-left">
            <p className="text-xs font-black leading-tight">{name}</p>
            <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider mt-0.5">
              {email}
            </p>
          </div>
        </button>

        {showProfile && (
          <div
            className={`absolute right-0 top-full mt-2 w-80 border rounded-2xl p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-[#121522] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div
              className={`flex items-start justify-between pb-4 border-b ${
                isDark ? "border-white/10" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/80"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-500/80 flex items-center justify-center text-amber-400 font-bold text-lg">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-black">{name}</h3>

                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-400 uppercase tracking-wide">
                    {roleText}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfile(false)}
                aria-label={t("common.close")}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <div
                className={`border rounded-xl p-3 flex items-center gap-3 ${
                  isDark
                    ? "bg-[#1a1d2d] border-white/5"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />

                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("header.email")}
                  </p>

                  <p className="text-xs font-bold truncate mt-0.5">
                    {email}
                  </p>
                </div>
              </div>

              <div
                className={`border rounded-xl p-3 flex items-center gap-3 ${
                  isDark
                    ? "bg-[#1a1d2d] border-white/5"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("header.role")}
                  </p>

                  <p className="text-xs font-bold mt-0.5">
                    {roleText}
                  </p>
                </div>
              </div>

              <div
                className={`border rounded-xl p-3 flex items-center gap-3 ${
                  isDark
                    ? "bg-[#1a1d2d] border-white/5"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("header.phone")}
                  </p>

                  <p className="text-xs font-bold mt-0.5">{phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;