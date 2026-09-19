import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

// Component Ô chọn có tính năng gõ tìm kiếm (Searchable Select)
const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  disabled,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => opt.name === value || opt.code === value,
  );

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer bg-white transition-colors ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-60"
            : "hover:border-gray-300"
        }`}
      >
        <span
          className={
            selectedOption ? "text-gray-900 font-medium" : "text-gray-400"
          }
        >
          {loading
            ? "Đang tải dữ liệu..."
            : selectedOption
              ? selectedOption.name
              : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-2 max-h-60 flex flex-col">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ để tìm kiếm..."
              className="w-full border border-gray-100 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:border-blue-500 bg-gray-50"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">
                Không tìm thấy kết quả
              </p>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.code}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                    selectedOption?.code === opt.code
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>{opt.name}</span>
                  {selectedOption?.code === opt.code && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ShippingForm = ({ form, onChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // 1. Tải tất cả Tỉnh / Thành phố ở Việt Nam
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Lỗi lấy danh sách tỉnh thành:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Tải Quận / Huyện khi chọn Tỉnh / Thành
  const handleProvinceSelect = async (province) => {
    setSelectedProvinceCode(province.code);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);

    // Cập nhật giá trị vào form chính
    onChange({ target: { name: "city", value: province.name } });
    onChange({ target: { name: "district", value: "" } });
    onChange({ target: { name: "ward", value: "" } });

    setLoadingDistricts(true);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${province.code}?depth=2`,
      );
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách quận huyện:", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // 3. Tải Phường / Xã khi chọn Quận / Huyện
  const handleDistrictSelect = async (district) => {
    setSelectedDistrictCode(district.code);
    setWards([]);

    onChange({ target: { name: "district", value: district.name } });
    onChange({ target: { name: "ward", value: "" } });

    setLoadingWards(true);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${district.code}?depth=2`,
      );
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách phường xã:", err);
    } finally {
      setLoadingWards(false);
    }
  };

  // 4. Chọn Phường / Xã
  const handleWardSelect = (ward) => {
    onChange({ target: { name: "ward", value: ward.name } });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
          1
        </div>
        <h2 className="text-lg font-bold text-gray-900">Địa chỉ giao hàng</h2>
      </div>

      <div className="space-y-4">
        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Họ và tên
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Nguyễn Văn A"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Số điện thoại
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="0901 234 567"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
          />
        </div>

        {/* Ô chọn Tỉnh / Thành phố */}
        <SearchableSelect
          label="Thành phố / Tỉnh"
          options={provinces}
          value={form.city}
          onChange={handleProvinceSelect}
          placeholder="Tìm hoặc chọn Thành phố / Tỉnh"
          loading={loadingProvinces}
        />

        {/* Ô chọn Quận / Huyện & Phường / Xã */}
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            label="Quận / Huyện"
            options={districts}
            value={form.district}
            onChange={handleDistrictSelect}
            placeholder="Chọn Quận / Huyện"
            disabled={!selectedProvinceCode}
            loading={loadingDistricts}
          />

          <SearchableSelect
            label="Phường / Xã"
            options={wards}
            value={form.ward}
            onChange={handleWardSelect}
            placeholder="Chọn Phường / Xã"
            disabled={!selectedDistrictCode}
            loading={loadingWards}
          />
        </div>

        {/* Ô Địa chỉ cụ thể ở ĐƯỚI CÙNG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ cụ thể
          </label>
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Số nhà, tên đường..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
