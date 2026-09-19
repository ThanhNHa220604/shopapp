import { useEffect, useState } from "react";
import i18n from "../i18n";
import {
  applyGoogleTranslateLanguage,
  getGoogleTranslateLanguage,
} from "../utils/translator";

export const SETTINGS_CHANGE_EVENT = "app-settings-changed";

const normalizeLanguage = (language) => (language === "en" ? "en" : "vi");

export const useAppSettings = () => {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  const [language, setLanguageState] = useState(
    () => localStorage.getItem("language") || "vi",
  );

  useEffect(() => {
    const syncSettings = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      const currentLanguage = normalizeLanguage(
        localStorage.getItem("language") || "vi",
      );

      setThemeState(currentTheme);
      setLanguageState(currentLanguage);

      document.documentElement.classList.toggle(
        "dark",
        currentTheme === "dark",
      );

      document.documentElement.lang = currentLanguage;

      if (i18n.language !== currentLanguage) {
        i18n.changeLanguage(currentLanguage);
      }
    };

    syncSettings();

    window.addEventListener(SETTINGS_CHANGE_EVENT, syncSettings);
    window.addEventListener("storage", syncSettings);
    window.addEventListener("languageChanged", syncSettings);

    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, syncSettings);
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("languageChanged", syncSettings);
    };
  }, []);

  const changeTheme = (newTheme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);

    document.documentElement.classList.toggle("dark", newTheme === "dark");

    window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
  };

  /**
   * Đổi ngôn ngữ cho CẢ HAI tầng:
   * 1. i18next  -> dịch UI cố định (menu, nút, label)
   * 2. Google Translate -> dịch nội dung động (mô tả sản phẩm, đánh giá...)
   *
   * Vì Google Translate cần reload trang để áp dụng cookie mới, hàm này
   * lưu localStorage TRƯỚC khi reload, để lúc trang tải lại, syncSettings()
   * ở trên tự động khôi phục đúng theme + gọi i18n.changeLanguage đúng lúc.
   */
  const changeLanguage = async (newLanguage) => {
    const validLanguage = normalizeLanguage(newLanguage);

    if (validLanguage === language) return; // không đổi gì thì thôi, khỏi reload

    // 1. Lưu trước để sau khi reload, syncSettings() đọc đúng giá trị mới
    localStorage.setItem("language", validLanguage);

    // 2. Đổi i18next ngay (để nếu vì lý do gì đó không reload kịp, UI cố
    //    định vẫn đổi đúng — ví dụ khi component unmount trước reload)
    await i18n.changeLanguage(validLanguage);
    document.documentElement.lang = validLanguage;

    // 3. Ghi cookie Google Translate rồi reload để engine dịch áp dụng
    applyGoogleTranslateLanguage(validLanguage);

    window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));

    window.location.reload();
  };

  return {
    theme,
    language,
    changeTheme,
    changeLanguage,
    // tiện cho nơi cần biết Google Translate hiện đang ở ngôn ngữ nào
    // (thường trùng với `language`, hữu ích khi debug)
    googleTranslateLanguage: getGoogleTranslateLanguage,
  };
};
