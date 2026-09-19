//Quản lý Tên, Ảnh chính, Đặc điểm nổi bật và Mô tả chi tiết.
import React from "react";
import { Upload, X } from "lucide-react";

const BasicInfoForm = ({
  addForm,
  setAddForm,
  localImagePreview,
  handleImageChange,
  handleRemoveImage,
  fileInputRef,
}) => {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50/50 space-y-5">
      <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider border-b border-gray-50 pb-3">
        Thông tin cơ bản
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
            Tên sản phẩm sản xuất *
          </label>
          <input
            type="text"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            className="w-full bg-[#F4F7FE] border-2 border-transparent rounded-2xl px-5 py-3.5 font-bold outline-none text-sm text-[#1B2559] focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
            Hình ảnh chính của sản phẩm *
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {!localImagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#F4F7FE] hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-[#1B2559]">
                  Bấm hoặc Kéo thả file ảnh tại đây
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">
                  Hỗ trợ các định dạng PNG, JPG, JPEG
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-40 h-40 border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm group bg-white">
              <img
                src={localImagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 text-white hover:bg-red-500 transition-colors shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
            Đặc điểm nổi bật / Tính năng chính
          </label>
          <textarea
            rows={4}
            value={addForm.specification}
            onChange={(e) =>
              setAddForm({ ...addForm, specification: e.target.value })
            }
            placeholder="Nhập các tính năng nổi bật của sản phẩm..."
            className="w-full bg-[#F4F7FE] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none text-sm text-[#1B2559] resize-none focus:border-blue-500 focus:bg-white shadow-inner transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
            Mô tả thông tin chi tiết sản phẩm
          </label>
          <textarea
            rows={4}
            value={addForm.desc}
            onChange={(e) => setAddForm({ ...addForm, desc: e.target.value })}
            className="w-full bg-[#F4F7FE] border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none text-sm text-[#1B2559] resize-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>
    </section>
  );
};

export default BasicInfoForm;
