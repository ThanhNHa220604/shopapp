//Component khó nhất - Độc lập toàn bộ giao diện quản lý Biến thể gốc & phụ thuộc (Sub-variants).
import React from "react";
import { Plus, Minus, Upload, X } from "lucide-react";

const ProductVariants = ({
  variants,
  isReadOnly = false,
  handleAddNewVariantRow,
  handleRemoveVariantRow,
  handleUpdateVariantInList,
  handleVariantImageChange,
  handleRemoveVariantImage,
  handleAddSubVariantRow,
  handleRemoveSubVariantRow,
  handleUpdateSubVariantInList,
  handleSubVariantImageChange,
  handleRemoveSubVariantImage,
}) => {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50/50 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider">
          Thuộc tính & Biến thể hàng hóa
        </h3>
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleAddNewVariantRow}
            className="text-xs font-black bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl flex items-center gap-1 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm biến thể mới
          </button>
        )}
      </div>

      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                    Kích thước (Size)
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="text"
                    value={v.size}
                    placeholder="Ví dụ: 128GB"
                    onChange={(e) =>
                      handleUpdateVariantInList(idx, "size", e.target.value)
                    }
                    className="w-full bg-[#F4F7FE] border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold text-[#1B2559] focus:bg-white focus:border-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                    Màu sắc gốc
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="text"
                    value={v.color}
                    placeholder="Ví dụ: Đen"
                    onChange={(e) =>
                      handleUpdateVariantInList(idx, "color", e.target.value)
                    }
                    className="w-full bg-[#F4F7FE] border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold text-[#1B2559] focus:bg-white focus:border-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                    Kho hàng
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      handleUpdateVariantInList(idx, "stock", e.target.value)
                    }
                    className="w-full bg-[#F4F7FE] border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold text-[#1B2559] focus:bg-white focus:border-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-red-400 mb-1">
                    Giá cũ ($)
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="number"
                    value={v.old_price}
                    placeholder="Giá cũ"
                    onChange={(e) =>
                      handleUpdateVariantInList(
                        idx,
                        "old_price",
                        e.target.value,
                      )
                    }
                    className="w-full bg-[#FFF5F5] border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 focus:bg-white focus:border-red-400 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-blue-500 mb-1">
                    Giá bán ($)
                  </label>
                  <input
                    disabled={isReadOnly}
                    type="number"
                    value={v.price}
                    placeholder="Giá bán"
                    onChange={(e) =>
                      handleUpdateVariantInList(idx, "price", e.target.value)
                    }
                    className="w-full bg-[#EEF2FF] border border-transparent rounded-xl px-3 py-2.5 text-xs font-bold text-blue-700 focus:bg-white focus:border-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-4">
                  {!isReadOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                        title="Xóa nhóm biến thể này"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSubVariantRow(idx)}
                        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all border border-blue-100"
                        title="Thêm thuộc tính con"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Upload ảnh Biến thể chính */}
              {!isReadOnly && (
                <div className="pt-2 border-t border-gray-50">
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-1.5 tracking-wider">
                    Hình ảnh riêng biến thể
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id={`variant-img-${idx}`}
                    className="hidden"
                    onChange={(e) => handleVariantImageChange(idx, e)}
                  />
                  {!v.localImagePreview ? (
                    <label
                      htmlFor={`variant-img-${idx}`}
                      className="w-full max-w-md border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer bg-[#F4F7FE] hover:bg-blue-50/30 transition-all group"
                    >
                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-xs font-bold text-[#1B2559]">
                        Tải ảnh từ thiết bị
                      </span>
                    </label>
                  ) : (
                    <div className="relative w-24 h-24 border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white group">
                      <img
                        src={v.localImagePreview}
                        alt="Variant"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              {isReadOnly && v.localImagePreview && (
                <div className="pt-2 border-t border-gray-50">
                  <label className="block text-[9px] uppercase font-black text-gray-400 mb-1.5 tracking-wider">
                    Hình ảnh riêng biến thể
                  </label>
                  <div className="w-24 h-24 border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <img
                      src={v.localImagePreview}
                      alt="Variant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Biến thể con phụ thuộc */}
              {v.subVariants && v.subVariants.length > 0 && (
                <div className="pl-6 border-l-2 border-blue-500/30 space-y-4 mt-2 bg-gray-50/50 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block mb-1">
                    Các biến thể phụ thuộc ({v.size || "Trống"})
                  </span>
                  {v.subVariants.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="border border-gray-100 bg-white rounded-xl p-3 space-y-3 shadow-2xs"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <div>
                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={sub.color}
                            placeholder="Màu sắc phụ..."
                            onChange={(e) =>
                              handleUpdateSubVariantInList(
                                idx,
                                sIdx,
                                "color",
                                e.target.value,
                              )
                            }
                            className="w-full bg-[#F4F7FE] border border-gray-100 rounded-xl px-3 py-2 text-xs text-[#1B2559] font-bold outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <input
                            disabled={isReadOnly}
                            type="number"
                            value={sub.stock}
                            placeholder="Kho hàng phụ"
                            onChange={(e) =>
                              handleUpdateSubVariantInList(
                                idx,
                                sIdx,
                                "stock",
                                e.target.value,
                              )
                            }
                            className="w-full bg-[#F4F7FE] border border-gray-100 rounded-xl px-3 py-2 text-xs text-[#1B2559] font-bold outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <input
                            disabled={isReadOnly}
                            type="number"
                            value={sub.old_price}
                            placeholder="Giá cũ riêng"
                            onChange={(e) =>
                              handleUpdateSubVariantInList(
                                idx,
                                sIdx,
                                "old_price",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-red-500 font-bold outline-none focus:border-red-400 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <input
                            disabled={isReadOnly}
                            type="number"
                            value={sub.price}
                            placeholder="Giá bán riêng"
                            onChange={(e) =>
                              handleUpdateSubVariantInList(
                                idx,
                                sIdx,
                                "price",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-blue-600 font-bold outline-none focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="text-right">
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSubVariantRow(idx, sIdx)
                              }
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload ảnh biến thể phụ */}
                      {!isReadOnly && (
                        <div className="pt-2 border-t border-gray-50">
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                            Ảnh biến thể phụ
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            id={`sub-variant-img-${idx}-${sIdx}`}
                            className="hidden"
                            onChange={(e) =>
                              handleSubVariantImageChange(idx, sIdx, e)
                            }
                          />
                          {!sub.localImagePreview ? (
                            <label
                              htmlFor={`sub-variant-img-${idx}-${sIdx}`}
                              className="w-full max-w-xs border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer bg-[#F4F7FE] hover:bg-blue-50/30 transition-all group"
                            >
                              <Upload className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                              <span className="text-xs font-bold text-[#1B2559]">
                                Chọn từ máy tính
                              </span>
                            </label>
                          ) : (
                            <div className="relative w-16 h-16 border border-gray-100 rounded-xl overflow-hidden shadow-2xs bg-white">
                              <img
                                src={sub.localImagePreview}
                                alt="Sub Variant"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveSubVariantImage(idx, sIdx)
                                }
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-md bg-black/60 text-white hover:bg-red-500 transition-colors shadow"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {isReadOnly && sub.localImagePreview && (
                        <div className="pt-2 border-t border-gray-50">
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                            Ảnh biến thể phụ
                          </label>
                          <div className="w-16 h-16 border border-gray-100 rounded-xl overflow-hidden shadow-2xs bg-white">
                            <img
                              src={sub.localImagePreview}
                              alt="Sub Variant"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
          Chưa có biến thể nào được định nghĩa.
        </div>
      )}
    </section>
  );
};

export default ProductVariants;
