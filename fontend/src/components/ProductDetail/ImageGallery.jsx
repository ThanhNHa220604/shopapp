// Quản lý trạng thái và danh sách ảnh của sản phẩm.
import React from "react";

const ImageGallery = ({ activeImg, setActiveImg, mainImage, variants }) => {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="aspect-square w-full rounded-2xl bg-[#F4F7FE] overflow-hidden border border-gray-100 flex items-center justify-center p-4">
        <img
          src={activeImg || "https://placehold.co/600x600?text=No+Image"}
          alt="Product Main"
          className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300"
        />
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {mainImage && (
          <button
            onClick={() => setActiveImg(mainImage)}
            className={`w-16 h-16 rounded-xl border-2 p-1 bg-[#F4F7FE] shrink-0 flex items-center justify-center transition-all ${
              activeImg === mainImage ? "border-blue-600" : "border-transparent"
            }`}
          >
            <img
              src={mainImage}
              className="max-w-full max-h-full object-contain"
              alt="main-thumb"
            />
          </button>
        )}

        {variants.map(
          (v, i) =>
            (v.image_url || v.image) && (
              <button
                key={i}
                onClick={() => setActiveImg(v.image_url || v.image)}
                className={`w-16 h-16 rounded-xl border-2 p-1 bg-[#F4F7FE] shrink-0 flex items-center justify-center transition-all ${
                  activeImg === (v.image_url || v.image)
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={v.image_url || v.image}
                  className="max-w-full max-h-full object-contain"
                  alt={`thumb-${i}`}
                />
              </button>
            ),
        )}
      </div>
    </div>
  );
};

export default ImageGallery;