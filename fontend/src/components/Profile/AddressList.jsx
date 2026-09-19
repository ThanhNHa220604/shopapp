import React from "react";
import { MapPin } from "lucide-react";

const AddressList = ({ orders }) => {
  const uniqueAddresses = orders
    .filter((o) => o.address)
    .filter((o, i, arr) => arr.findIndex((x) => x.address === o.address) === i);

  return (
    <>
      <h1 className="text-3xl font-black tracking-tight">Địa chỉ nhận hàng</h1>
      {uniqueAddresses.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <p className="text-lg font-medium">Chưa có địa chỉ nào.</p>
          <p className="text-sm mt-1">Hãy đặt hàng để lưu địa chỉ giao hàng.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueAddresses.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 font-medium text-base break-words">
                  {order.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AddressList;
