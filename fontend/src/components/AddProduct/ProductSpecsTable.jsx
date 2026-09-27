//Bảng chỉnh sửa thông số kỹ thuật (Spec).
import React from "react";
import { Plus, Minus } from "lucide-react";

const ProductSpecsTable = ({
  specifications,
  handleAddNewSpecRow,
  handleRemoveSpecRow,
  handleUpdateSpecInList,
}) => {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50/50 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h3 className="text-sm font-black uppercase text-[#1B2559] tracking-wider">
          Thông số kỹ thuật sản phẩm
        </h3>
        <button
          type="button"
          onClick={handleAddNewSpecRow}
          className="text-xs font-black bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm thông số mới
        </button>
      </div>

      {specifications.length > 0 ? (
        <div className="overflow-hidden border border-gray-100 rounded-2xl">
          <table className="w-full border-collapse text-left text-xs font-bold text-[#1B2559]">
            <thead>
              <tr className="bg-[#F4F7FE] text-gray-400 uppercase text-[9px] tracking-wider border-b border-gray-100">
                <th className="p-4 w-2/5">Tên thông số (Key)</th>
                <th className="p-4">Giá trị hiển thị (Value)</th>
                <th className="p-4 text-center w-14">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {specifications.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={s.key}
                      onChange={(e) =>
                        handleUpdateSpecInList(idx, "key", e.target.value)
                      }
                      className="w-full bg-[#F4F7FE] border-none outline-none rounded-xl px-3 py-2 font-bold text-xs text-[#1B2559]"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) =>
                        handleUpdateSpecInList(idx, "value", e.target.value)
                      }
                      className="w-full bg-[#F4F7FE] border-none outline-none rounded-xl px-3 py-2 font-bold text-xs text-[#1B2559]"
                    />
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
          Chưa có thông số kỹ thuật nào.
        </div>
      )}
    </section>
  );
};

export default ProductSpecsTable;

