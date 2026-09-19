import * as XLSX from "xlsx";

// 🌟 Đọc từ biến môi trường (.env) — CRA bắt buộc phải có tiền tố
// "REACT_APP_" thì mới được nhúng vào bundle phía client. Nếu .env
// chưa khai báo, dùng giá trị mặc định để không bị lỗi undefined.
const STORAGE_KEY =
  process.env.REACT_APP_EXPORT_STORAGE_KEY ||
  "shopapp_published_products_log";
const FILE_NAME =
  process.env.REACT_APP_EXPORT_FILE_NAME ||
  "danh_sach_san_pham_da_xuat_ban.xlsx";

const HANDLE_DB_NAME = "shopapp_file_handles_db";
const HANDLE_STORE_NAME = "handles";
const HANDLE_KEY = "excel_export_handle";

const supportsFileSystemAccess = () =>
  typeof window !== "undefined" && "showSaveFilePicker" in window;

// ── IndexedDB: lưu FileSystemFileHandle giữa các lần tải lại trang ──────────
// (localStorage chỉ lưu được chuỗi text, không lưu được object handle này)
function openHandleDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HANDLE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(HANDLE_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandleToDB(handle) {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, "readwrite");
    tx.objectStore(HANDLE_STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandleFromDB() {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, "readonly");
    const req = tx.objectStore(HANDLE_STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function clearHandleFromDB() {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, "readwrite");
    tx.objectStore(HANDLE_STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Xin lại quyền đọc/ghi cho 1 handle đã lưu trước đó. Trình duyệt luôn yêu
// cầu xin lại quyền mỗi phiên mới vì lý do bảo mật, kể cả khi đã cấp trước đó.
async function ensurePermission(handle) {
  const opts = { mode: "readwrite" };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  if ((await handle.requestPermission(opts)) === "granted") return true;
  return false;
}

/**
 * Cho người dùng CHỌN (hoặc TẠO MỚI) 1 file .xlsx duy nhất để dùng làm
 * "sổ ghi chép" sản phẩm đã xuất bản. Chỉ cần gọi 1 lần (ví dụ khi bấm nút
 * "Chọn file Excel"); handle được lưu lại (IndexedDB) để dùng cho các lần
 * sau, kể cả sau khi tải lại trang - không cần chọn lại mỗi lần.
 *
 * QUAN TRỌNG: phải được gọi trực tiếp từ 1 sự kiện người dùng (vd: onClick
 * của nút bấm), vì trình duyệt chặn việc tự ý mở File Picker nếu không có
 * tương tác trực tiếp từ người dùng.
 */
export async function chooseExcelFile() {
  if (!supportsFileSystemAccess()) {
    return {
      success: false,
      message:
        "Trình duyệt này không hỗ trợ chọn file trực tiếp (chỉ Chrome/Edge/Cốc Cốc mới hỗ trợ). Hệ thống sẽ tự dùng cách tải file mới mỗi lần như trước.",
    };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: FILE_NAME,
      types: [
        {
          description: "Excel Workbook",
          accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [".xlsx"],
          },
        },
      ],
    });

    await saveHandleToDB(handle);
    return { success: true, fileName: handle.name };
  } catch (err) {
    // Người dùng bấm Cancel trên hộp thoại chọn file -> không phải lỗi thật
    if (err?.name === "AbortError") {
      return { success: false, cancelled: true };
    }
    console.error("Lỗi khi chọn file Excel:", err);
    return { success: false, error: err.message };
  }
}

/** Bỏ chọn file hiện tại, lần lưu tiếp theo sẽ hỏi chọn lại từ đầu. */
export async function forgetExcelFile() {
  await clearHandleFromDB();
}

/**
 * Kiểm tra hiện đã có file nào được chọn từ trước hay chưa, và còn quyền
 * ghi hay không (dùng để hiển thị trạng thái trên giao diện, ví dụ
 * "Đang ghi vào: danh_sach.xlsx" hoặc nút "Chọn file Excel").
 */
export async function getChosenExcelFileInfo() {
  if (!supportsFileSystemAccess()) return null;
  try {
    const handle = await loadHandleFromDB();
    if (!handle) return null;
    const granted = await ensurePermission(handle);
    return { name: handle.name, granted };
  } catch {
    return null;
  }
}

// Đọc toàn bộ danh sách hiện có trong 1 file .xlsx (qua handle) -> mảng object
async function readExistingRowsFromHandle(handle) {
  const file = await handle.getFile();
  if (file.size === 0) return [];

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

// Ghi đè toàn bộ danh sách vào ĐÚNG file đã chọn (không tải file mới)
async function writeRowsToHandle(handle, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(15, key.length + 4),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

  const wbArray = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const writable = await handle.createWritable();
  await writable.write(wbArray);
  await writable.close();
}

function buildNewRow(product, variantValues) {
  const variantSummary = Array.isArray(variantValues)
    ? variantValues
        .map((vv) => {
          const combi = Array.isArray(vv.variant_combination)
            ? vv.variant_combination.join("-")
            : "";
          return `${combi} (SL: ${vv.stock || 0}, Giá: ${vv.price || 0})`;
        })
        .join(" | ")
    : "";

  const totalVariantStock = Array.isArray(variantValues)
    ? variantValues.reduce((sum, vv) => sum + (Number(vv.stock) || 0), 0)
    : 0;

  return {
    "Thời gian xuất bản": new Date().toLocaleString("vi-VN"),
    "Tên sản phẩm": product.name || "",
    "Giá bán": product.price || 0,
    "Giá cũ": product.oldprice || "",
    "Thương hiệu": product.brand_name || product.brand_id || "",
    "Danh mục": product.category_name || product.category_id || "",
    "Tổng kho": totalVariantStock || product.quanity || 0,
    "Số biến thể": Array.isArray(variantValues) ? variantValues.length : 0,
    "Chi tiết biến thể": variantSummary,
    "Mô tả": product.description || "",
  };
}

/**
 * Thêm 1 sản phẩm vừa lưu/xuất bản vào ĐÚNG 1 FILE EXCEL DUY NHẤT.
 *
 * - Nếu trình duyệt hỗ trợ File System Access API VÀ người dùng đã chọn
 *   sẵn 1 file (qua chooseExcelFile()) và còn quyền ghi -> đọc file đó,
 *   thêm dòng mới, GHI ĐÈ lại đúng file đó. Không tải file mới, không
 *   sinh ra bản sao (1), (2)...
 * - Nếu CHƯA chọn file, hoặc trình duyệt không hỗ trợ (Firefox, Safari...)
 *   -> tự động dùng lại cách cũ (localStorage + luôn tải 1 file MỚI chứa
 *   toàn bộ dữ liệu tích luỹ) để tính năng không bị gãy.
 *
 * @returns {Promise<{success:boolean, mode?: "single-file"|"legacy-download", fileName?:string, totalRecords?:number, needsFilePick?:boolean}>}
 */
export async function appendProductAndExportExcel(product, variantValues = []) {
  const newRow = buildNewRow(product, variantValues);

  if (supportsFileSystemAccess()) {
    try {
      const handle = await loadHandleFromDB();
      if (handle && (await ensurePermission(handle))) {
        const existingRows = await readExistingRowsFromHandle(handle);
        const updatedRows = [...existingRows, newRow];
        await writeRowsToHandle(handle, updatedRows);
        return {
          success: true,
          mode: "single-file",
          fileName: handle.name,
          totalRecords: updatedRows.length,
        };
      }
    } catch (err) {
      console.error(
        "Lỗi khi ghi trực tiếp vào file đã chọn, chuyển sang cách dự phòng:",
        err,
      );
      // Không throw ở đây - rơi xuống fallback để không làm hỏng cả luồng lưu sản phẩm
    }
  }

  // Dự phòng: chưa chọn file (hoặc trình duyệt không hỗ trợ) -> cách cũ
  const legacyResult = legacyAppendAndDownload(newRow);
  return {
    ...legacyResult,
    // Gợi ý cho UI hiển thị nhắc người dùng bấm "Chọn file Excel" để
    // chuyển sang chế độ ghi 1 file duy nhất, nếu trình duyệt hỗ trợ.
    needsFilePick: supportsFileSystemAccess(),
  };
}

// Cách cũ: localStorage + luôn tải về 1 file MỚI chứa toàn bộ dữ liệu tích luỹ
function legacyAppendAndDownload(newRow) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existingList = raw ? JSON.parse(raw) : [];

    const updatedList = [...existingList, newRow];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const worksheet = XLSX.utils.json_to_sheet(updatedList);
    worksheet["!cols"] = Object.keys(updatedList[0] || {}).map((key) => ({
      wch: Math.max(15, key.length + 4),
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
    XLSX.writeFile(workbook, FILE_NAME);

    return {
      success: true,
      mode: "legacy-download",
      totalRecords: updatedList.length,
    };
  } catch (err) {
    console.error("Lỗi khi xuất Excel (cách dự phòng):", err);
    return { success: false, error: err };
  }
}

/**
 * Xóa toàn bộ lịch sử tích lũy kiểu cũ (localStorage). Không ảnh hưởng tới
 * file đã chọn qua File System Access API (nếu có).
 */
export function clearExportedProductsLog() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * BACKUP: tải về 1 file .json chứa toàn bộ lịch sử sản phẩm đã tích
 * lũy trong localStorage (chế độ cũ) — dùng để cất giữ ở nơi an toàn
 * trước khi xóa cache trình duyệt, đổi máy, v.v.
 */
export function backupExportedProductsLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];

    if (data.length === 0) {
      return { success: false, message: "Chưa có dữ liệu nào để sao lưu." };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_san_pham_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: data.length };
  } catch (err) {
    console.error("Lỗi khi sao lưu:", err);
    return { success: false, error: err.message };
  }
}

/**
 * KHÔI PHỤC: đọc nội dung 1 file .json đã backup trước đó, ghi lại
 * vào localStorage (chế độ cũ) để tiếp tục tích lũy từ đúng chỗ đã dừng.
 */
export function restoreExportedProductsLog(jsonFileContent, mode = "replace") {
  try {
    const restoredData = JSON.parse(jsonFileContent);
    if (!Array.isArray(restoredData)) {
      throw new Error("File backup không đúng định dạng (phải là 1 danh sách).");
    }

    if (mode === "merge") {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const merged = [...existing, ...restoredData];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return { success: true, count: merged.length };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredData));
    return { success: true, count: restoredData.length };
  } catch (err) {
    console.error("Lỗi khi khôi phục backup:", err);
    return { success: false, error: err.message };
  }
}