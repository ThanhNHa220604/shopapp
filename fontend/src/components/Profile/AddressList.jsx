import React from "react";
import { MapPin, User, Phone } from "lucide-react";

// Các tên trường có thể gặp trong chuỗi JSON địa chỉ (sửa/thêm nếu DB của bạn dùng tên khác)
const FIELD_KEYS = {
  name: [
    "fullName",
    "full_name",
    "name",
    "receiver",
    "receiverName",
    "recipient",
  ],
  phone: ["phone", "phoneNumber", "phone_number", "tel", "mobile"],
  street: [
    "address",
    "street",
    "detail",
    "addressDetail",
    "address_detail",
    "specificAddress",
    "line1",
  ],
  ward: ["ward", "wardName", "ward_name", "commune"],
  district: ["district", "districtName", "district_name"],
  province: [
    "province",
    "provinceName",
    "province_name",
    "city",
    "cityName",
    "city_name",
  ],
};

// Giá trị có thể là chuỗi hoặc object dạng { name, code }
const toText = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return toText(v.name ?? v.full_name ?? v.label);
  return String(v).trim();
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const text = toText(obj[k]);
    if (text) return text;
  }
  return "";
};

// Chuyển địa chỉ (chuỗi JSON / JSON bị bọc 2 lần / chuỗi thường / object)
// thành { name, phone, text }
const parseAddress = (raw) => {
  let data = raw;

  // Giải mã tối đa 2 lớp JSON (trường hợp bị stringify 2 lần)
  for (let i = 0; i < 2 && typeof data === "string"; i++) {
    const trimmed = data.trim();
    if (!/^[{["]/.test(trimmed)) break;
    try {
      data = JSON.parse(trimmed);
    } catch {
      break;
    }
  }

  // Không phải JSON -> đây là địa chỉ dạng chữ bình thường
  if (typeof data === "string")
    return { name: "", phone: "", text: data.trim() };
  if (!data || typeof data !== "object")
    return { name: "", phone: "", text: "" };

  const name = pick(data, FIELD_KEYS.name);
  const phone = pick(data, FIELD_KEYS.phone);
  const parts = [
    pick(data, FIELD_KEYS.street),
    pick(data, FIELD_KEYS.ward),
    pick(data, FIELD_KEYS.district),
    pick(data, FIELD_KEYS.province),
  ].filter(Boolean);

  // Không nhận ra trường nào -> nối tất cả giá trị chữ lại cho dễ đọc
  const text =
    parts.length > 0
      ? parts.join(", ")
      : Object.values(data).map(toText).filter(Boolean).join(", ");

  return { name, phone, text };
};

const AddressList = ({ orders = [] }) => {
  // Chuyển từng đơn thành địa chỉ đã đọc được, bỏ đơn rỗng, bỏ địa chỉ trùng
  const uniqueAddresses = orders
    .filter((o) => o.address)
    .map((o) => ({ id: o.id, ...parseAddress(o.address) }))
    .filter((a) => a.text)
    .filter(
      (a, i, arr) =>
        arr.findIndex(
          (x) => x.text === a.text && x.name === a.name && x.phone === a.phone,
        ) === i,
    );

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
          {uniqueAddresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {(addr.name || addr.phone) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-gray-800">
                    {addr.name && (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {addr.name}
                      </span>
                    )}
                    {addr.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {addr.phone}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-gray-700 font-medium text-base break-words">
                  {addr.text}
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
