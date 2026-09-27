import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteModal = ({ deleteProduct, deleting, onCancel, onConfirm }) => {
  if (!deleteProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border">
        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl">
          <AlertTriangle className="shrink-0" />
          <div>
            <p className="font-bold text-sm">Xác nhận xóa sản phẩm?</p>
            <p className="text-xs text-red-400 mt-0.5">
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-semibold line-clamp-2 px-1">
          Bạn có chắc chắn muốn xóa sản phẩm{" "}
          <span className="font-bold text-gray-800">
            "{deleteProduct.name}"
          </span>
          ?
        </p>
        <div className="flex gap-3 pt-2">
          <button
            disabled={deleting}
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl text-xs"
          >
            Hủy
          </button>
          <button
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-xs"
          >
            {deleting ? "Đang xóa..." : "Xóa ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;