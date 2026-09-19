//Quản lý danh mục, thương hiệu, giá bán, giá cũ và tổng kho tự động.
import React from "react";
import { ChevronDown } from "lucide-react";

const OrganizationForm = ({
  categoryInput,
  setCategoryInput,
  showCategoryDropdown,
  setShowCategoryDropdown,
  categories,
  categoryContainerRef,
  brandInput,
  setBrandInput,
  showBrandDropdown,
  setShowBrandDropdown,
  suggestedBrands,
  brandContainerRef,
  addForm,
  setAddForm,
}) => {
  return (
    <div className="space-y-8">
      {/* Phân loại tổ chức */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50/50 space-y-5">
        <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider border-b border-gray-50 pb-3">
          Phân loại tổ chức
        </h3>
        <div className="space-y-4">
          <div className="relative" ref={categoryContainerRef}>
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
              Danh mục ngành hàng *
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onFocus={(e) => {
                  setShowCategoryDropdown(true);
                  e.target.select();
                }}
                className="w-full bg-[#F4F7FE] border-none rounded-2xl pl-4 pr-9 py-3.5 font-bold outline-none text-xs text-[#1B2559] focus:bg-[#EAEFFC] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="absolute right-2.5 text-gray-400 hover:text-[#1B2559]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {showCategoryDropdown && categories.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl divide-y divide-gray-50">
                {categories
                  .filter((c) => {
                    if (
                      !categoryInput ||
                      categories.some(
                        (cat) =>
                          cat.name.toLowerCase() ===
                          categoryInput.trim().toLowerCase(),
                      )
                    ) {
                      return true;
                    }
                    return c.name
                      .toLowerCase()
                      .includes(categoryInput.toLowerCase());
                  })
                  .map((cat) => (
                    <li
                      key={cat.id}
                      onClick={() => {
                        setCategoryInput(cat.name);
                        setShowCategoryDropdown(false);
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-[#1B2559] hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {cat.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="relative" ref={brandContainerRef}>
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
              Thương hiệu *
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onFocus={(e) => {
                  setShowBrandDropdown(true);
                  e.target.select();
                }}
                className="w-full bg-[#F4F7FE] border-none rounded-2xl pl-4 pr-9 py-3.5 font-bold outline-none text-xs text-[#1B2559] focus:bg-[#EAEFFC] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                className="absolute right-2.5 text-gray-400 hover:text-[#1B2559]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {showBrandDropdown && suggestedBrands.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl divide-y divide-gray-50">
                {suggestedBrands
                  .filter((b) => {
                    if (
                      !brandInput ||
                      suggestedBrands.some(
                        (brand) =>
                          brand.toLowerCase() ===
                          brandInput.trim().toLowerCase(),
                      )
                    ) {
                      return true;
                    }
                    return b.toLowerCase().includes(brandInput.toLowerCase());
                  })
                  .map((brand, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setBrandInput(brand);
                        setShowBrandDropdown(false);
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-[#1B2559] hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {brand}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Giá bán & Kho hàng gốc */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50/50 space-y-5">
        <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider border-b border-gray-50 pb-3">
          Giá bán & Kho hàng gốc
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
              Giá bán hiện tại ($) *
            </label>
            <input
              type="number"
              value={addForm.price}
              onChange={(e) =>
                setAddForm({ ...addForm, price: e.target.value })
              }
              className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
              Old Price ($)
            </label>
            <input
              type="number"
              value={addForm.oldprice}
              onChange={(e) =>
                setAddForm({ ...addForm, oldprice: e.target.value })
              }
              className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
              Tổng kho gốc (Tự động)
            </label>
            <input
              type="text"
              value={addForm.quanity}
              className="w-full bg-[#EEEFf4] border-none rounded-2xl px-5 py-3.5 font-black outline-none text-sm text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrganizationForm;