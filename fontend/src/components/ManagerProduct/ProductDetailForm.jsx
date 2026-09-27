import React, { useRef, useState, useEffect } from "react";
import { Save, Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductVariants from "../AddProduct/ProductVariants";

// ── QUY ƯỚC DỊCH CỦA TRANG NÀY ───────────────────────────────────────────────
//  • Chữ CỐ ĐỊNH của giao diện (nhãn, tiêu đề, nút...) -> i18n: t("productDetail.*")
//    và bọc trong <Static> để Google Translate bỏ qua (tránh dịch chồng).
//  • Dữ liệu ĐỘNG (tên, mô tả, thông số, danh mục, thương hiệu...) -> Google
//    Translate tự dịch. Vấn đề: GT KHÔNG dịch value của <input>/<textarea>, nên
//    ở chế độ XEM (isReadOnly) các giá trị này được hiển thị dạng chữ thường
//    bằng <ReadOnlyText>. Ở chế độ SỬA vẫn là <input> để không bao giờ dịch
//    (và làm hỏng) dữ liệu đang được chỉnh sửa/lưu.
const Static = ({ children }) => (
  <span translate="no" className="notranslate">
    {children}
  </span>
);

// Giá trị dữ liệu ở chế độ chỉ xem. Bọc trong <span> để khi Google Translate
// chèn <font> thì nó nằm BÊN TRONG span, không phá text node mà React đang giữ
// (nếu không sẽ dính lỗi "removeChild" khi dữ liệu đổi).
const ReadOnlyText = ({ value, className = "" }) => (
  <div className={className}>
    <span>{value}</span>
  </div>
);

// Giữ đúng kích thước/màu sắc của <input>/<textarea> cũ để giao diện không đổi.
const READONLY_FIELD =
  "w-full bg-[#F4F7FE] rounded-2xl px-5 py-3.5 font-bold text-sm text-[#1B2559] min-h-[3rem] break-words";
const READONLY_TEXTAREA =
  "w-full bg-[#F4F7FE] rounded-2xl px-5 py-4 font-bold text-sm text-[#1B2559] min-h-[8.25rem] whitespace-pre-wrap break-words";
const READONLY_ATTR =
  "flex-1 bg-[#F4F7FE] border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#1B2559] min-h-[3rem] break-words";

const ProductDetailForm = ({
  isReadOnly,
  saving,
  error,
  editForm = {},
  setEditForm,
  attributes = [],
  setAttributes,
  variants = [],
  setVariants,
  variantValues = [],
  setVariantValues,
  brands = [],
  categories = [],
  onBack,
  onSave,
}) => {
  const { t } = useTranslation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const categoryContainerRef = useRef(null);
  const brandContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryContainerRef.current &&
        !categoryContainerRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        brandContainerRef.current &&
        !brandContainerRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------------------------------------------
  // BIẾN THỂ HÀNG HÓA — dùng chung component ProductVariants.jsx cho
  // cả 3 màn hình: Thêm mới / Xem chi tiết / Sửa sản phẩm.
  //
  // `variantGroups` lưu theo đúng cấu trúc mà ProductVariants.jsx cần:
  //   { size, color, stock, price, old_price, localImagePreview, imageFile,
  //     subVariants: [{ color, stock, price, old_price, localImagePreview, imageFile }] }
  //
  // Mỗi khi variantGroups đổi, tự "làm phẳng" (flatten) ra định dạng
  // variantValues cũ ([{ variant_combination, price, old_price, stock }])
  // để phần lưu/gọi API phía ngoài không cần sửa gì thêm.
  // ---------------------------------------------------------------
  const [variantGroups, setVariantGroups] = useState([]);
  const didHydrateVariants = useRef(false);

  // Nạp dữ liệu biến thể CŨ (khi xem chi tiết / sửa sản phẩm) từ
  // variantValues (dạng phẳng do API trả về) ngược lại thành cấu trúc
  // lồng size -> color mà ProductVariants.jsx hiển thị. Chỉ chạy 1 lần
  // khi có dữ liệu ban đầu, tránh ghi đè lúc người dùng đang sửa.
  useEffect(() => {
    if (didHydrateVariants.current) return;
    if (!Array.isArray(variantValues) || variantValues.length === 0) return;

    const groupsMap = new Map();
    variantValues.forEach((vv) => {
      // API thật trả về "sku" dạng "128GB-Xanh" (Size-Color, cách nhau
      // bởi dấu "-"), KHÔNG có field "variant_combination". Ưu tiên
      // đọc từ "sku"; nếu không có thì mới thử "variant_combination"
      // (phòng trường hợp dữ liệu đến từ nơi khác có định dạng khác).
      let size = "";
      let color = "";

      if (typeof vv?.sku === "string" && vv.sku.includes("-")) {
        const parts = vv.sku.split("-");
        size = parts[0] || "";
        color = parts.slice(1).join("-") || ""; // phòng khi color có dấu "-"
      } else if (Array.isArray(vv?.variant_combination)) {
        size = vv.variant_combination[0] || "";
        color = vv.variant_combination[1] || "";
      }

      const entry = {
        color,
        stock: vv?.stock ?? 0,
        price: vv?.price ?? "",
        old_price: vv?.old_price ?? "",
        localImagePreview: vv?.image_url || vv?.image || null,
        imageFile: null,
      };

      if (!groupsMap.has(size)) {
        groupsMap.set(size, []);
      }
      groupsMap.get(size).push(entry);
    });

    const hydrated = Array.from(groupsMap.entries()).map(([size, entries]) => {
      const [first, ...rest] = entries;
      return {
        size,
        color: first.color,
        stock: first.stock,
        price: first.price,
        old_price: first.old_price,
        localImagePreview: first.localImagePreview,
        imageFile: null,
        subVariants: rest,
      };
    });

    setVariantGroups(hydrated);
    didHydrateVariants.current = true;
  }, [variantValues]);

  // Làm phẳng variantGroups -> variantValues mỗi khi có thay đổi, để
  // phần lưu sản phẩm (dùng variantValues) luôn nhận dữ liệu mới nhất.
  useEffect(() => {
    if (!didHydrateVariants.current && variantGroups.length === 0) return;

    const flat = [];
    variantGroups.forEach((group) => {
      const combination = [group.size, group.color].filter(
        (v) => v !== undefined && v !== null && v !== "",
      );
      flat.push({
        variant_combination: combination,
        price: group.price,
        old_price: group.old_price,
        stock: group.stock,
        // 🌟 THÊM: mang theo cả file ảnh MỚI (nếu vừa chọn) lẫn URL ảnh
        // CŨ (nếu chưa đổi gì) — thiếu 2 field này khiến parent
        // (Products.jsx) không có cách nào biết cần upload ảnh gì,
        // hoặc giữ lại ảnh cũ, dẫn đến mất ảnh sau khi lưu.
        imageFile: group.imageFile || null,
        image_url: group.imageFile ? null : group.localImagePreview || null,
      });

      (group.subVariants || []).forEach((sub) => {
        const subCombination = [group.size, sub.color].filter(
          (v) => v !== undefined && v !== null && v !== "",
        );
        flat.push({
          variant_combination: subCombination,
          price: sub.price || group.price,
          old_price: sub.old_price || group.old_price,
          stock: sub.stock,
          imageFile: sub.imageFile || null,
          image_url: sub.imageFile ? null : sub.localImagePreview || null,
        });
      });
    });

    setVariantValues(flat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantGroups]);

  const handleAddNewVariantRow = () => {
    if (isReadOnly) return;
    setVariantGroups([
      ...variantGroups,
      {
        size: "",
        color: "",
        stock: 0,
        price: "",
        old_price: "",
        localImagePreview: null,
        imageFile: null,
        subVariants: [],
      },
    ]);
  };

  const handleRemoveVariantRow = (idx) => {
    if (isReadOnly) return;
    setVariantGroups(variantGroups.filter((_, i) => i !== idx));
  };

  const handleUpdateVariantInList = (idx, field, value) => {
    if (isReadOnly) return;
    let next = [...variantGroups];
    next[idx] = { ...next[idx], [field]: value };

    // 🌟 Khi người dùng gõ "Kích thước (Size)" trùng với 1 nhóm KHÁC
    // đã tồn tại sẵn, tự động gộp dòng đang gõ thành "biến thể phụ"
    // (subVariant) của nhóm đó — thay vì giữ làm 1 thẻ riêng trùng size.
    if (field === "size" && value && value.trim() !== "") {
      const trimmedValue = value.trim();
      const targetIdx = next.findIndex(
        (g, i) => i !== idx && (g.size || "").trim() === trimmedValue,
      );

      if (targetIdx !== -1) {
        const movingRow = next[idx];
        const merged = [...next];
        const targetGroup = { ...merged[targetIdx] };
        targetGroup.subVariants = [
          ...(targetGroup.subVariants || []),
          {
            color: movingRow.color,
            stock: movingRow.stock,
            price: movingRow.price,
            old_price: movingRow.old_price,
            localImagePreview: movingRow.localImagePreview,
            imageFile: movingRow.imageFile,
          },
        ];
        merged[targetIdx] = targetGroup;
        // Xóa dòng vừa gõ (idx) vì đã được gộp vào nhóm targetIdx
        next = merged.filter((_, i) => i !== idx);
      }
    }

    setVariantGroups(next);
  };

  const handleVariantImageChange = (idx, e) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const next = [...variantGroups];
    next[idx] = {
      ...next[idx],
      imageFile: file,
      localImagePreview: URL.createObjectURL(file),
    };
    setVariantGroups(next);
  };

  const handleRemoveVariantImage = (idx) => {
    if (isReadOnly) return;
    const next = [...variantGroups];
    next[idx] = { ...next[idx], imageFile: null, localImagePreview: null };
    setVariantGroups(next);
  };

  const handleAddSubVariantRow = (idx) => {
    if (isReadOnly) return;
    const next = [...variantGroups];
    const subVariants = Array.isArray(next[idx].subVariants)
      ? [...next[idx].subVariants]
      : [];
    subVariants.push({
      color: "",
      stock: 0,
      price: "",
      old_price: "",
      localImagePreview: null,
      imageFile: null,
    });
    next[idx] = { ...next[idx], subVariants };
    setVariantGroups(next);
  };

  const handleRemoveSubVariantRow = (idx, subIdx) => {
    if (isReadOnly) return;
    const next = [...variantGroups];
    next[idx] = {
      ...next[idx],
      subVariants: next[idx].subVariants.filter((_, i) => i !== subIdx),
    };
    setVariantGroups(next);
  };

  const handleUpdateSubVariantInList = (idx, subIdx, field, value) => {
    if (isReadOnly) return;
    const next = [...variantGroups];
    const subVariants = [...next[idx].subVariants];
    subVariants[subIdx] = { ...subVariants[subIdx], [field]: value };
    next[idx] = { ...next[idx], subVariants };
    setVariantGroups(next);
  };

  const handleSubVariantImageChange = (idx, subIdx, e) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const next = [...variantGroups];
    const subVariants = [...next[idx].subVariants];
    subVariants[subIdx] = {
      ...subVariants[subIdx],
      imageFile: file,
      localImagePreview: URL.createObjectURL(file),
    };
    next[idx] = { ...next[idx], subVariants };
    setVariantGroups(next);
  };

  const handleRemoveSubVariantImage = (idx, subIdx) => {
    if (isReadOnly) return;
    const next = [...variantGroups];
    const subVariants = [...next[idx].subVariants];
    subVariants[subIdx] = {
      ...subVariants[subIdx],
      imageFile: null,
      localImagePreview: null,
    };
    next[idx] = { ...next[idx], subVariants };
    setVariantGroups(next);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7FE]">
      {/* HEADER */}
      <header className="h-20 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between border-b border-gray-50 shrink-0 z-10">
        <div>
          <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
            <Static>{t("productDetail.breadcrumb")}</Static>
          </p>
          <h1 className="text-xl font-black text-[#1B2559] mt-0.5">
            <Static>
              {isReadOnly
                ? t("productDetail.titleView")
                : t("productDetail.titleEdit")}
            </Static>
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer"
          >
            <Static>{t("productDetail.back")}</Static>
          </button>
          {!isReadOnly && (
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-[#1B59F8] hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <Static>
                {saving
                  ? t("productDetail.saving")
                  : t("productDetail.saveChanges")}
              </Static>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl">
            {/* <span> để Google Translate bọc <font> bên trong span thay vì
                đụng thẳng vào text node do React quản lý */}
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* 1. THÔNG TIN CƠ BẢN */}
            <section className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider border-b border-gray-50 pb-3">
                <Static>{t("productDetail.basicInfo")}</Static>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.name")}</Static>
                  </label>
                  {isReadOnly ? (
                    <ReadOnlyText
                      value={editForm?.name}
                      className={READONLY_FIELD}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editForm?.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.imageUrl")}</Static>
                  </label>
                  {/* Đường dẫn ảnh là URL -> luôn giữ là <input>, không dịch */}
                  <input
                    disabled={isReadOnly}
                    type="text"
                    translate="no"
                    value={editForm?.image || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, image: e.target.value })
                    }
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.specification")}</Static>
                  </label>
                  {isReadOnly ? (
                    <ReadOnlyText
                      value={editForm?.specification}
                      className={READONLY_FIELD}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editForm?.specification || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: e.target.value,
                        })
                      }
                      className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.description")}</Static>
                  </label>
                  {isReadOnly ? (
                    <ReadOnlyText
                      value={editForm?.description || editForm?.desc || ""}
                      className={READONLY_TEXTAREA}
                    />
                  ) : (
                    <textarea
                      rows={5}
                      value={editForm?.description || editForm?.desc || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                          desc: e.target.value,
                        })
                      }
                      className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-4 font-bold outline-none text-sm text-[#1B2559] resize-none disabled:text-[#1B2559] disabled:opacity-100"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* 2. BIẾN THỂ HÀNG HÓA — dùng chung component ProductVariants */}
            <ProductVariants
              variants={variantGroups}
              isReadOnly={isReadOnly}
              handleAddNewVariantRow={handleAddNewVariantRow}
              handleRemoveVariantRow={handleRemoveVariantRow}
              handleUpdateVariantInList={handleUpdateVariantInList}
              handleVariantImageChange={handleVariantImageChange}
              handleRemoveVariantImage={handleRemoveVariantImage}
              handleAddSubVariantRow={handleAddSubVariantRow}
              handleRemoveSubVariantRow={handleRemoveSubVariantRow}
              handleUpdateSubVariantInList={handleUpdateSubVariantInList}
              handleSubVariantImageChange={handleSubVariantImageChange}
              handleRemoveSubVariantImage={handleRemoveSubVariantImage}
            />

            {/* 3. THÔNG SỐ KỸ THUẬT (ĐÃ SỬA LỖI MỜ CHỮ / BỊ TRẮNG) */}
            <section className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider">
                  <Static>{t("productDetail.techSpecs")}</Static>
                </h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      setAttributes([
                        ...(attributes || []),
                        { name: "", key: "", value: "" },
                      ])
                    }
                    className="text-xs font-black bg-blue-50 text-[#1B59F8] hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />{" "}
                    <Static>{t("productDetail.addSpec")}</Static>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {Array.isArray(attributes) &&
                  attributes.map((attr, idx) => {
                    const attrName =
                      attr?.name !== undefined
                        ? attr.name
                        : attr?.key !== undefined
                          ? attr.key
                          : "";
                    const attrValue =
                      attr?.value !== undefined ? attr.value : "";

                    // Chế độ xem: hiện tên + giá trị thông số dạng chữ thường
                    // để Google Translate dịch được (nó không dịch value của <input>).
                    if (isReadOnly) {
                      return (
                        <div key={idx} className="flex gap-4 items-center">
                          <ReadOnlyText
                            value={attrName}
                            className={READONLY_ATTR}
                          />
                          <ReadOnlyText
                            value={attrValue}
                            className={READONLY_ATTR}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="flex gap-4 items-center">
                        <input
                          type="text"
                          translate="no"
                          placeholder={t("productDetail.specNamePlaceholder")}
                          value={attrName}
                          onChange={(e) => {
                            const next = [...attributes];
                            next[idx] = {
                              ...next[idx],
                              name: e.target.value,
                              key: e.target.value,
                            };
                            setAttributes(next);
                          }}
                          className="flex-1 bg-[#F4F7FE] border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#1B2559] placeholder-gray-400 outline-none focus:bg-white focus:border-blue-500 disabled:text-[#1B2559] disabled:opacity-100"
                        />
                        <input
                          type="text"
                          translate="no"
                          placeholder={t("productDetail.specValuePlaceholder")}
                          value={attrValue}
                          onChange={(e) => {
                            const next = [...attributes];
                            next[idx] = { ...next[idx], value: e.target.value };
                            setAttributes(next);
                          }}
                          className="flex-1 bg-[#F4F7FE] border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#1B2559] placeholder-gray-400 outline-none focus:bg-white focus:border-blue-500 disabled:text-[#1B2559] disabled:opacity-100"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAttributes(
                              attributes.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-red-500 hover:bg-red-50 p-3 rounded-2xl shrink-0 cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>

          {/* CỘT BÊN PHẢI: PHÂN LOẠI & GIÁ */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider border-b border-gray-50 pb-3">
                <Static>{t("productDetail.classifyAndPrice")}</Static>
              </h3>

              <div ref={categoryContainerRef} className="relative">
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  <Static>{t("productDetail.category")}</Static>
                </label>
                {isReadOnly ? (
                  <ReadOnlyText
                    value={editForm?.category_input}
                    className={READONLY_FIELD}
                  />
                ) : (
                  <input
                    type="text"
                    value={editForm?.category_input || ""}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        category_input: e.target.value,
                        // 🌟 Người dùng đang tự gõ (không phải chọn từ danh
                        // sách có sẵn) -> xóa category_id cũ đi. Nếu không
                        // xóa, lúc lưu code sẽ tưởng đây vẫn là category cũ
                        // (ID cũ) dù chữ hiển thị đã đổi sang tên khác.
                        category_id: "",
                      });
                      setShowCategoryDropdown(true);
                    }}
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                  />
                )}
                {showCategoryDropdown && !isReadOnly && (
                  // Tên danh mục lấy từ DB -> để Google Translate dịch. Khi bấm
                  // chọn, code vẫn lấy `cat.name` GỐC từ dữ liệu (không đọc chữ
                  // trên màn hình) nên giá trị lưu xuống DB không bị ảnh hưởng.
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto">
                    {categories
                      .filter((c) =>
                        (c.name || "")
                          .toLowerCase()
                          .includes(
                            (editForm?.category_input || "").toLowerCase(),
                          ),
                      )
                      .map((cat) => (
                        <button
                          key={cat.id || cat.name}
                          type="button"
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              category_input: cat.name,
                              // 🌟 Chọn từ danh sách có sẵn -> gắn thẳng ID
                              // thật, để lúc lưu backend cập nhật ĐÚNG
                              // category này thay vì tạo mới 1 bản ghi
                              // trùng tên.
                              category_id: cat.id != null ? String(cat.id) : "",
                            });
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#F4F7FE] rounded-xl text-xs font-bold text-[#1B2559]"
                        >
                          {/* <span>: danh sách bị lọc/đổi liên tục khi gõ, bọc lại
                              để Google Translate không phá text node của React */}
                          <span>{cat.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div ref={brandContainerRef} className="relative">
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  <Static>{t("productDetail.brand")}</Static>
                </label>
                {isReadOnly ? (
                  <ReadOnlyText
                    value={editForm?.brand_input}
                    className={READONLY_FIELD}
                  />
                ) : (
                  <input
                    type="text"
                    value={editForm?.brand_input || ""}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        brand_input: e.target.value,
                        // 🌟 Tự gõ (không chọn từ danh sách) -> xóa brand_id
                        // cũ, tránh lưu nhầm giữ nguyên brand cũ.
                        brand_id: "",
                      });
                      setShowBrandDropdown(true);
                    }}
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                  />
                )}
                {showBrandDropdown && !isReadOnly && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto">
                    {brands
                      .filter((b) =>
                        (typeof b === "string" ? b : b.name || "")
                          .toLowerCase()
                          .includes(
                            (editForm?.brand_input || "").toLowerCase(),
                          ),
                      )
                      .map((b, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const brandName =
                              typeof b === "string" ? b : b.name;
                            const brandId = typeof b === "string" ? "" : b.id;
                            setEditForm({
                              ...editForm,
                              brand_input: brandName,
                              // 🌟 Gắn thẳng ID thật khi chọn từ danh sách.
                              brand_id: brandId != null ? String(brandId) : "",
                            });
                            setShowBrandDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[#F4F7FE] rounded-xl text-xs font-bold text-[#1B2559]"
                        >
                          <span>{typeof b === "string" ? b : b.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.price")}</Static>
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="number"
                    value={editForm?.price || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                    <Static>{t("productDetail.oldPrice")}</Static>
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="number"
                    value={editForm?.oldprice || editForm?.old_price || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, oldprice: e.target.value })
                    }
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] disabled:text-[#1B2559] disabled:opacity-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                  <Static>{t("productDetail.totalStock")}</Static>
                </label>
                <input
                  type="text"
                  value={editForm?.quanity || editForm?.stock || "0"}
                  className="w-full bg-[#EEEFf4] border-none rounded-2xl px-5 py-3.5 font-black outline-none text-sm text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailForm;
