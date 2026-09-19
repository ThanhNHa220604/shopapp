import React from "react";
import { CheckCircle2 } from "lucide-react";

const ProductSpec = ({ attributes }) => {
  if (!attributes || attributes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-xs">
        Đang cập nhật dữ liệu thông số kỹ thuật...
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Bảng thông số kỹ thuật thiết kế dạng Card phẳng sang trọng */}
      <div className="overflow-hidden rounded-2xl border border-blue-100/80 shadow-md bg-white">
        <div className="divide-y divide-blue-50/60">
          {attributes.map((attr, index) => {
            const attrName = attr.Attribute?.name || attr.name || "Thông số";
            const attrValue = attr.value || "Đang cập nhật";

            return (
              <div
                key={attr.id || index}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 transition-all duration-200 hover:bg-blue-50/60 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                {/* Tên thuộc tính */}
                <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-slate-600 sm:w-2/5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{attrName}</span>
                </div>

                {/* Giá trị thuộc tính */}
                <div className="font-extrabold text-xs sm:text-sm text-[#1B2559] mt-1 sm:mt-0 sm:w-3/5 sm:text-right bg-blue-50/40 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  {attrValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductSpec;
