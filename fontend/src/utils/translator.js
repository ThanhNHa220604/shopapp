/**
 * utils/googleTranslate.js
 *
 * Quản lý Google Translate Website Widget để dịch NỘI DUNG ĐỘNG
 * (mô tả sản phẩm, đánh giá, bài viết...). Các nhãn/nút cố định của
 * giao diện vẫn do i18next đảm nhiệm — không liên quan tới file này.
 *
 * Cách hoạt động của Google Translate widget: nó đọc cookie "googtrans"
 * (định dạng "/<ngôn ngữ gốc>/<ngôn ngữ đích>") để biết cần dịch sang
 * ngôn ngữ nào, rồi tự quét và dịch các phần tử có translate="yes"
 * (mặc định dịch toàn trang trừ khi bị chặn bằng translate="no").
 */

const SOURCE_LANG = "vi";
const SCRIPT_ID = "google-translate-script";
const ELEMENT_ID = "google_translate_element";

const normalizeLanguage = (langCode) => (langCode === "en" ? "en" : "vi");

/**
 * Đọc ngôn ngữ Google Translate hiện tại từ cookie.
 */
export const getGoogleTranslateLanguage = () => {
  const match = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]+)/i);
  return match ? normalizeLanguage(match[1]) : SOURCE_LANG;
};

/**
 * Ghi cookie googtrans cho cả path gốc và domain hiện tại (khi deploy).
 */
const setGoogleTranslateCookie = (targetLanguage) => {
  const cookieValue = `/${SOURCE_LANG}/${targetLanguage}`;

  document.cookie = `googtrans=${cookieValue}; path=/`;

  if (window.location.hostname !== "localhost") {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
  }
};

/**
 * Khởi tạo Google Translate widget — gọi 1 lần duy nhất ở App root.
 * Widget được ẩn đi (chỉ dùng để engine dịch hoạt động), UI chuyển ngôn
 * ngữ do bạn tự làm (nút EN/VI riêng gọi changeAppLanguage bên dưới).
 */
export const initGoogleTranslate = () => {
  if (document.getElementById(SCRIPT_ID)) return; // tránh nhúng script 2 lần

  window.googleTranslateElementInit = () => {
    // eslint-disable-next-line no-undef
    new window.google.translate.TranslateElement(
      {
        pageLanguage: SOURCE_LANG,
        includedLanguages: "en,vi",
        autoDisplay: false,
        // eslint-disable-next-line no-undef
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      ELEMENT_ID,
    );
  };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
};

/**
 * Đổi ngôn ngữ dịch cho phần NỘI DUNG ĐỘNG (Google Translate).
 * Phải reload trang vì Google Translate chỉ đọc cookie lúc trang tải lại.
 *
 * Lưu ý: hàm này KHÔNG tự lưu localStorage và KHÔNG tự đổi i18next —
 * việc đó do hook useAppSettings điều phối, để tránh 2 nguồn sự thật.
 */
export const applyGoogleTranslateLanguage = (langCode) => {
  const targetLanguage = normalizeLanguage(langCode);

  if (targetLanguage === SOURCE_LANG) {
    // Về lại tiếng Việt gốc: xoá cookie thay vì set "/vi/vi"
    document.cookie =
      "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    if (window.location.hostname !== "localhost") {
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }
  } else {
    setGoogleTranslateCookie(targetLanguage);
  }
};
