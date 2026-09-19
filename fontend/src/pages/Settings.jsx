import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import settingService from "../services/setting";
import authService from "../services/auth";
import { useAppSettings } from "../hooks/useAppSettings";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?background=2563eb&color=fff&name=User";

const FALLBACK_SETTINGS = {
  theme: "light",
  accent: "blue",
  language: "vi",
  storeInfo: {
    name: "",
    hotline: "",
    email: "",
    address: "",
    maintenanceMode: false,
  },
  salesConfig: {
    flatShippingFee: 0,
    freeShippingThreshold: 0,
    enableOrderSound: true,
  },
};

const ACCENT_OPTIONS = [
  { key: "blue", color: "#2563eb" },
  { key: "emerald", color: "#10b981" },
  { key: "violet", color: "#8b5cf6" },
  { key: "amber", color: "#f59e0b" },
  { key: "rose", color: "#f43f5e" },
];

function mapSettingsFromApi(data = {}) {
  return {
    theme: data.theme ?? FALLBACK_SETTINGS.theme,
    accent: data.accent_color ?? FALLBACK_SETTINGS.accent,
    language: data.language ?? FALLBACK_SETTINGS.language,
    storeInfo: {
      name: data.store_name ?? FALLBACK_SETTINGS.storeInfo.name,
      hotline: data.store_hotline ?? FALLBACK_SETTINGS.storeInfo.hotline,
      email: data.store_email ?? FALLBACK_SETTINGS.storeInfo.email,
      address: data.store_address ?? FALLBACK_SETTINGS.storeInfo.address,
      maintenanceMode:
        data.maintenance_mode ?? FALLBACK_SETTINGS.storeInfo.maintenanceMode,
    },
    salesConfig: {
      flatShippingFee:
        data.shipping_fee ?? FALLBACK_SETTINGS.salesConfig.flatShippingFee,
      freeShippingThreshold:
        data.free_shipping_threshold ??
        FALLBACK_SETTINGS.salesConfig.freeShippingThreshold,
      enableOrderSound:
        data.enable_order_sound ??
        FALLBACK_SETTINGS.salesConfig.enableOrderSound,
    },
  };
}

function buildSettingsPayload({
  theme,
  accent,
  language,
  storeInfo,
  salesConfig,
}) {
  return {
    theme,
    accent_color: accent,
    language,
    store_name: storeInfo.name,
    store_hotline: storeInfo.hotline,
    store_email: storeInfo.email,
    store_address: storeInfo.address,
    maintenance_mode: storeInfo.maintenanceMode,
    shipping_fee: salesConfig.flatShippingFee,
    free_shipping_threshold: salesConfig.freeShippingThreshold,
    enable_order_sound: salesConfig.enableOrderSound,
  };
}

export default function Settings() {
  const { t } = useTranslation();
  // theme dùng chung với toàn app qua hook (đổi là áp dụng ngay + đồng bộ
  // Sidebar/Header). `appLanguage` là ngôn ngữ ĐANG thực sự áp dụng, khác
  // với `language` state bên dưới — vốn chỉ là giá trị đang CHỌN trên UI,
  // sẽ được áp dụng thật khi bấm "Lưu" (xem handleSave).
  const {
    theme,
    changeTheme,
    language: appLanguage,
    changeLanguage,
  } = useAppSettings();

  const [role] = useState(() => authService.getRole());

  const [accent, setAccent] = useState(FALLBACK_SETTINGS.accent);

  const [language, setLanguage] = useState(appLanguage);

  const [activeTab, setActiveTab] = useState("ui");
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  const [storeInfo, setStoreInfo] = useState(FALLBACK_SETTINGS.storeInfo);
  const [salesConfig, setSalesConfig] = useState(FALLBACK_SETTINGS.salesConfig);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState(null);

  const currentAccount = authService.getUser() || {};
  const [profile] = useState({
    name: currentAccount.name || "Người dùng",
    email: currentAccount.email || "",
    avatar: currentAccount.avatar || FALLBACK_AVATAR,
  });

  const isAdmin = role === "admin";

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setIsLoadingSettings(true);
      setLoadError(null);

      try {
        const response = await settingService.getSettings();

        if (cancelled) return;

        const settingsData = response?.data ?? response;
        const mapped = mapSettingsFromApi(settingsData);

        const validLanguage =
          mapped.language === "en" || mapped.language === "vi"
            ? mapped.language
            : appLanguage;

        setAccent(mapped.accent);
        setLanguage(validLanguage);
        setStoreInfo(mapped.storeInfo);
        setSalesConfig(mapped.salesConfig);

        // Đồng bộ theme từ server nếu khác theme đang áp dụng. Cố ý KHÔNG
        // tự áp dụng `validLanguage` ở đây — vì changeLanguage() sẽ reload
        // trang (do Google Translate), gây reload ngay khi vừa vào trang
        // Cài đặt nếu server lưu ngôn ngữ khác localStorage. Ngôn ngữ chỉ
        // thực sự áp dụng khi người dùng bấm "Lưu".
        if (mapped.theme && mapped.theme !== theme) {
          changeTheme(mapped.theme);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Lỗi tải cấu hình hệ thống:", err);
        setLoadError(t("settings.loadError"));
      } finally {
        if (!cancelled) setIsLoadingSettings(false);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
    // Chỉ chạy 1 lần khi mount — cố ý không đưa theme/appLanguage/
    // changeTheme vào deps để tránh gọi lại API mỗi khi các giá trị đó
    // đổi (theme có thể đổi ngay khi người dùng bấm nút Sáng/Tối).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sau khi changeLanguage() reload trang, thông báo "Lưu thành công" bị
  // mất theo. Khôi phục lại nó nếu có để trong sessionStorage (xem
  // handleSave bên dưới).
  useEffect(() => {
    const pending = sessionStorage.getItem("settings-pending-toast");
    if (!pending) return;

    sessionStorage.removeItem("settings-pending-toast");

    try {
      const { message, type } = JSON.parse(pending);
      showToast(message, type);
    } catch {
      // dữ liệu lỗi định dạng, bỏ qua
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playOrderChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.08 + 0.3,
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn("Audio play blocked:", e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        showToast(t("settings.passwordMismatch"), "error");
        return;
      }

      if (newPassword.length < 6) {
        showToast(t("settings.passwordLength"), "warning");
        return;
      }

      showToast(t("settings.passwordDemo"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsSaving(true);

    try {
      const payload = buildSettingsPayload({
        theme,
        accent,
        language,
        storeInfo,
        salesConfig,
      });

      await settingService.updateSettings(payload);

      const languageChanged = language !== appLanguage;

      if (languageChanged) {
        // changeLanguage() sẽ reload trang (Google Translate cần đọc lại
        // cookie khi tải trang), nên toast phải lưu tạm để hiện lại sau
        // khi trang tải lại xong (xem effect "pending-toast" ở trên).
        sessionStorage.setItem(
          "settings-pending-toast",
          JSON.stringify({
            message: t("settings.saveSuccess"),
            type: "success",
          }),
        );

        await changeLanguage(language);
        return; // trang chuẩn bị reload, không cần chạy tiếp bên dưới
      }

      showToast(t("settings.saveSuccess"));
    } catch (err) {
      console.error("Lỗi lưu cấu hình hệ thống:", err);
      showToast(
        err.response?.data?.message || t("settings.saveError"),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        width: "0%",
        label: t("settings.passwordEmpty"),
        color: "bg-gray-300",
      };
    }

    let score = 0;

    if (newPassword.length >= 8) score += 35;
    if (/[A-Z]/.test(newPassword)) score += 30;
    if (/[0-9]/.test(newPassword)) score += 35;

    if (score < 40) {
      return {
        width: "33%",
        label: t("settings.passwordWeak"),
        color: "bg-red-500",
      };
    }

    if (score < 80) {
      return {
        width: "66%",
        label: t("settings.passwordMedium"),
        color: "bg-amber-500",
      };
    }

    return {
      width: "100%",
      label: t("settings.passwordStrong"),
      color: "bg-emerald-500",
    };
  };

  const passStrength = getPasswordStrength();

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-400">
          {t("settings.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center space-x-2 text-white animate-bounce ${
            toast.type === "error"
              ? "bg-red-600"
              : toast.type === "warning"
                ? "bg-amber-500 text-slate-900"
                : "bg-emerald-600"
          }`}
        >
          <span>
            {toast.type === "error"
              ? "✕"
              : toast.type === "warning"
                ? "⚠️"
                : "✓"}
          </span>

          <span>{toast.message}</span>
        </div>
      )}

      {loadError && (
        <div className="bg-amber-500 text-slate-900 py-2 px-4 text-xs font-bold text-center">
          ⚠️ {loadError}
        </div>
      )}

      {announcementVisible && (
        <div className="bg-blue-600 text-white py-2 px-4 text-xs font-semibold flex justify-between items-center">
          <div className="mx-auto flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
              Bản Demo
            </span>

            <span>
              Đồ án tốt nghiệp: Trang quản trị & cài đặt thương mại điện tử
              chuyên nghiệp
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            className="opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t("settings.title")}
            </h1>

            <p className="text-xs text-slate-400">
              {t("settings.website")}:{" "}
              <strong className="text-blue-600 dark:text-blue-400">
                {storeInfo.name || t("settings.noName")}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                if (salesConfig.enableOrderSound) playOrderChimeSound();

                showToast(t("settings.newOrderMessage"));
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <span>🔔</span>
              <span>{t("settings.tryNewOrder")}</span>
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 gap-2">
              <span className="text-slate-400 text-[11px]">
                {t("settings.role")}:
              </span>

              <span
                className={`px-2.5 py-1 rounded-lg ${
                  isAdmin
                    ? "bg-blue-600 text-white"
                    : "bg-amber-500 text-slate-900"
                }`}
              >
                {isAdmin
                  ? t("settings.admin")
                  : role
                    ? role.toUpperCase()
                    : "N/A"}
              </span>
            </div>
          </div>
        </header>

        {!isAdmin && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-start space-x-2">
            <span className="text-base">ℹ️</span>

            <div>
              <strong>{t("settings.managerModeTitle")}:</strong>{" "}
              {t("settings.managerModeText")}
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-2 overflow-x-auto pb-1">
          {[
            { id: "ui", label: t("settings.tabs.ui"), icon: "🎨" },
            { id: "store", label: t("settings.tabs.store"), icon: "🏬" },
            { id: "sales", label: t("settings.tabs.sales"), icon: "🚚" },
            { id: "security", label: t("settings.tabs.security"), icon: "🔒" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 shrink-0 ${
                activeTab === tab.id
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
        >
          {activeTab === "ui" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("settings.themeTitle")}
              </h2>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => changeTheme("light")}
                  className={`p-4 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-2 ${
                    theme === "light"
                      ? "border-blue-600 bg-blue-50/20 text-blue-600"
                      : "border-slate-200 text-slate-600 dark:text-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span>☀️</span>
                  <span>{t("settings.light")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => changeTheme("dark")}
                  className={`p-4 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-2 ${
                    theme === "dark"
                      ? "border-blue-600 bg-slate-700 text-blue-400"
                      : "border-slate-200 text-slate-600 dark:text-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span>🌙</span>
                  <span>{t("settings.dark")}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold mb-2">
                  {t("settings.accentTitle")}
                </label>

                <div className="flex flex-wrap gap-3">
                  {ACCENT_OPTIONS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setAccent(item.key)}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        accent === item.key
                          ? "ring-2 ring-offset-2 ring-slate-400 border-white"
                          : "border-transparent"
                      }`}
                      title={item.key}
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold mb-2">
                  {t("settings.languageTitle")}
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full max-w-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-xs font-semibold outline-none"
                >
                  <option value="vi">{t("settings.viLabel")}</option>
                  <option value="en">{t("settings.enLabel")}</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("settings.storeTitle")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.storeName")}
                  </label>

                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeInfo.name}
                    onChange={(event) =>
                      setStoreInfo({
                        ...storeInfo,
                        name: event.target.value,
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.hotline")}
                  </label>

                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeInfo.hotline}
                    onChange={(event) =>
                      setStoreInfo({
                        ...storeInfo,
                        hotline: event.target.value,
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.email")}
                  </label>

                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={storeInfo.email}
                    onChange={(event) =>
                      setStoreInfo({
                        ...storeInfo,
                        email: event.target.value,
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.address")}
                  </label>

                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={storeInfo.address}
                    onChange={(event) =>
                      setStoreInfo({
                        ...storeInfo,
                        address: event.target.value,
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-rose-900 dark:text-rose-200">
                    {t("settings.maintenanceTitle")}
                  </p>

                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {t("settings.maintenanceText")}
                  </p>
                </div>

                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={storeInfo.maintenanceMode}
                  onChange={(event) =>
                    setStoreInfo({
                      ...storeInfo,
                      maintenanceMode: event.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-rose-600 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {activeTab === "sales" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("settings.salesTitle")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.shippingFee")}
                  </label>

                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={salesConfig.flatShippingFee}
                    onChange={(event) =>
                      setSalesConfig({
                        ...salesConfig,
                        flatShippingFee: Number(event.target.value),
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.freeShippingThreshold")}
                  </label>

                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={salesConfig.freeShippingThreshold}
                    onChange={(event) =>
                      setSalesConfig({
                        ...salesConfig,
                        freeShippingThreshold: Number(event.target.value),
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      !isAdmin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {t("settings.orderSoundTitle")}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    {t("settings.orderSoundText")}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={playOrderChimeSound}
                    className="px-3 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-xs font-bold"
                  >
                    {t("settings.listenTest")}
                  </button>

                  <input
                    type="checkbox"
                    checked={salesConfig.enableOrderSound}
                    onChange={(event) =>
                      setSalesConfig({
                        ...salesConfig,
                        enableOrderSound: event.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("settings.securityTitle")}
              </h2>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500"
                />

                <div>
                  <p className="font-extrabold text-sm">{profile.name}</p>

                  <p className="text-xs text-slate-400">
                    {profile.email} ({role ? role.toUpperCase() : "N/A"})
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.currentPassword")}
                  </label>

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.newPassword")}
                  </label>

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {t("settings.confirmPassword")}
                  </label>

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold outline-none"
                  />
                </div>

                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>{t("settings.passwordStrength")}</span>
                      <span>{passStrength.label}</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: passStrength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:scale-[1.02]"
            >
              {isSaving ? t("settings.saving") : t("settings.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}