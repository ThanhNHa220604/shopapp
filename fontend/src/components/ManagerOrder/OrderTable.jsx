import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  ClipboardList,
  PackageCheck,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const IMAGE_BASE = "http://localhost:5000/api/images";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tìm kiếm & Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Quản lý trạng thái phân trang từ Server
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalOrders: 0,
    totalPages: 1,
  });

  // Popup Xem chi tiết & Xác nhận
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const getOrderId = (order, index) => order.id || order.order_id || index + 1;

  const getCustomerName = (order) => {
    if (order.user?.name) return order.user.name;
    if (order.User?.name) return order.User.name;
    if (order.user?.fullname) return order.user.fullname;
    if (order.customer_name) return order.customer_name;
    if (order.receiver_name) return order.receiver_name;
    if (order.shipping_address?.name) return order.shipping_address.name;

    if (order.user_id) return `Khách hàng (ID: ${order.user_id})`;

    if (order.note && order.note.includes("Khách hàng:")) {
      const match = order.note.match(/Khách hàng:\s*([^.]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return "Khách hàng vãng lai";
  };

  const getCustomerPhone = (order) =>
    order.phone ||
    order.user?.phone ||
    order.User?.phone ||
    order.receiver_phone ||
    order.shipping_address?.phone ||
    "Chưa có SĐT";

  // 🎯 BÓC TÁCH CHÍNH XÁC CẤU TRÚC ĐỊA CHỈ 4 CẤP TỪ BACKEND
  const getOrderAddressDetails = (order) => {
    if (!order) {
      return {
        street: "Chưa chọn",
        ward: "Chưa chọn",
        district: "Chưa chọn",
        city: "Chưa chọn",
        fullAddress: "Chưa cung cấp địa chỉ",
      };
    }

    let rawAddr =
      order.address || order.shipping_address || order.shippingAddress;
    let parsedObj = null;

    // Xử lý nếu rawAddr là Chuỗi JSON
    if (typeof rawAddr === "string") {
      try {
        const parsed = JSON.parse(rawAddr);
        if (parsed && typeof parsed === "object") {
          parsedObj = parsed;
        }
      } catch (e) {
        parsedObj = null;
      }
    } else if (typeof rawAddr === "object" && rawAddr !== null) {
      parsedObj = rawAddr;
    }

    // 1. Trường hợp Backend lưu dưới dạng JSON Object { street, ward, district, city }
    if (parsedObj) {
      const street =
        parsedObj.street ||
        parsedObj.address ||
        parsedObj.specific_address ||
        parsedObj.address_detail ||
        parsedObj.detail ||
        "";
      const ward =
        parsedObj.ward ||
        parsedObj.ward_name ||
        parsedObj.phuong ||
        parsedObj.xa ||
        "";
      const district =
        parsedObj.district ||
        parsedObj.district_name ||
        parsedObj.quan ||
        parsedObj.huyen ||
        "";
      const city =
        parsedObj.city ||
        parsedObj.city_name ||
        parsedObj.province ||
        parsedObj.province_name ||
        parsedObj.tinh ||
        "";
      const fullAddress = parsedObj.fullAddress || parsedObj.full_address || "";

      const displayStreet =
        street && street !== "Chưa chọn" ? street : "Chưa chọn";
      const displayWard = ward && ward !== "Chưa chọn" ? ward : "Chưa chọn";
      const displayDistrict =
        district && district !== "Chưa chọn" ? district : "Chưa chọn";
      const displayCity = city && city !== "Chưa chọn" ? city : "Chưa chọn";

      let computedFull = fullAddress;
      if (!computedFull || computedFull === "Chưa cung cấp địa chỉ") {
        const parts = [
          displayStreet,
          displayWard,
          displayDistrict,
          displayCity,
        ].filter((p) => p !== "Chưa chọn");
        computedFull =
          parts.length > 0 ? parts.join(", ") : "Chưa cung cấp địa chỉ";
      }

      return {
        street: displayStreet,
        ward: displayWard,
        district: displayDistrict,
        city: displayCity,
        fullAddress: computedFull,
      };
    }

    // 2. Tương thích dữ liệu cũ (Địa chỉ dạng chuỗi gộp plain string)
    let street = "";
    let ward = "";
    let district = "";
    let city = "";
    const addressStr = typeof rawAddr === "string" ? rawAddr : "";

    if (addressStr.includes(",")) {
      const parts = addressStr
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const unassigned = [];

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const lower = p.toLowerCase();

        if (
          !city &&
          (lower.includes("tỉnh") ||
            lower.includes("thành phố") ||
            lower.includes("tp.") ||
            lower.startsWith("tp "))
        ) {
          city = p;
        } else if (
          !district &&
          (lower.includes("quận") ||
            lower.includes("huyện") ||
            lower.includes("thị xã") ||
            lower.startsWith("tx.") ||
            lower.startsWith("tx "))
        ) {
          district = p;
        } else if (
          !ward &&
          (lower.includes("phường") ||
            lower.includes("xã") ||
            lower.includes("thị trấn") ||
            lower.startsWith("tt.") ||
            lower.startsWith("tt "))
        ) {
          ward = p;
        } else {
          unassigned.unshift(p);
        }
      }

      if (unassigned.length > 0) street = unassigned.join(", ");
    } else if (addressStr) {
      street = addressStr;
    }

    const displayStreet = street.trim() || "Chưa chọn";
    const displayWard = ward.trim() || "Chưa chọn";
    const displayDistrict = district.trim() || "Chưa chọn";
    const displayCity = city.trim() || "Chưa chọn";

    const parts = [
      displayStreet,
      displayWard,
      displayDistrict,
      displayCity,
    ].filter((p) => p !== "Chưa chọn");

    return {
      street: displayStreet,
      ward: displayWard,
      district: displayDistrict,
      city: displayCity,
      fullAddress:
        parts.length > 0 ? parts.join(", ") : "Chưa cung cấp địa chỉ",
    };
  };

  const getCustomerAddress = (order) =>
    getOrderAddressDetails(order).fullAddress;

  const getTotalPrice = (order) =>
    order.total_price ?? order.total ?? order.total_amount ?? 0;

  const getOrderItems = (order) => {
    if (Array.isArray(order.order_detail)) return order.order_detail;
    if (Array.isArray(order.order_details)) return order.order_details;
    if (Array.isArray(order.OrderDetails)) return order.OrderDetails;
    if (Array.isArray(order.items)) return order.items;
    return [];
  };

  const getProductName = (item) => {
    return (
      item.products?.name ||
      item.product?.name ||
      item.Product?.name ||
      item.name ||
      "Sản phẩm"
    );
  };

  const getSKUAndVariant = (item) => {
    let sku = null;
    const variantList = [];

    sku =
      item.sku ||
      item.product_variant_value?.sku ||
      item.product_variant_values?.sku ||
      item.product_variant?.sku ||
      item.ProductVariant?.sku ||
      item.products?.sku ||
      item.product?.sku ||
      null;

    const addVariant = (group, value) => {
      if (!value) return;
      const strVal = String(value).trim();
      if (!strVal || strVal === "Mặc định") return;
      if (group) {
        variantList.push(`${group}: ${strVal}`);
      } else {
        variantList.push(strVal);
      }
    };

    const pvv = item.product_variant_values || item.product_variant_value;
    if (pvv?.variant_name) {
      addVariant(null, pvv.variant_name);
    }

    if (item.variant_name) addVariant(null, item.variant_name);
    if (item.variant && typeof item.variant === "string")
      addVariant(null, item.variant);
    if (item.color) addVariant("Màu", item.color);
    if (item.size) addVariant("Size", item.size);

    ["attributes", "options", "variant_data", "product_variant_value"].forEach(
      (key) => {
        if (typeof item[key] === "string" && item[key].startsWith("{")) {
          try {
            const parsed = JSON.parse(item[key]);
            if (parsed.name || parsed.value) {
              addVariant(
                parsed.name || parsed.variant_name,
                parsed.value || parsed.val,
              );
            }
          } catch (e) {}
        }
      },
    );

    const targets = [
      pvv,
      item.product_variant,
      item.ProductVariant,
      item.variant_value,
      item.variant_values,
    ].filter(Boolean);

    targets.forEach((target) => {
      if (Array.isArray(target)) {
        target.forEach((v) => {
          const gName =
            v.variant?.name || v.variants?.name || v.group_name || "";
          const val = v.variant_value?.value || v.value || v.name || "";
          addVariant(gName, val);
        });
      } else if (typeof target === "object") {
        const valObj = target.variant_value || target.variant_values || target;
        const gName =
          valObj.variant?.name ||
          valObj.variants?.name ||
          target.variant?.name ||
          target.group_name ||
          "";
        const val =
          valObj.value ||
          valObj.name ||
          target.value ||
          target.variant_name ||
          "";

        addVariant(gName, val);
      }
    });

    const uniqueVariants = [...new Set(variantList)];
    const finalVariant =
      uniqueVariants.length > 0 ? uniqueVariants.join(" | ") : null;

    return {
      sku: sku,
      variant: finalVariant,
    };
  };

  const formatImageUrl = (item) => {
    const pvv =
      item.product_variant_values ||
      item.product_variant_value ||
      item.product_variant;

    const rawImage =
      pvv?.image_url ||
      item.products?.image ||
      item.product?.image ||
      item.Product?.image ||
      item.image;

    if (!rawImage) return null;
    if (rawImage.startsWith("http")) return rawImage;

    // DB lưu dạng "uploads/xxx.webp" -> bỏ tiền tố "uploads/" để khớp route /api/images/<tên file>
    // Nếu backend phục vụ ảnh tại /uploads/... thì đổi thành: `http://localhost:5000/${path}` (không bỏ "uploads/")
    const path = rawImage.replace(/^\/+/, "").replace(/^uploads\//, "");
    return `${IMAGE_BASE}/${path}`;
  };

  const fetchData = async (page = 1, status = "ALL") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      let managerId = "";
      try {
        const profileRes = await axios.get(
          "http://localhost:5000/api/users/profile",
          config,
        );
        managerId = profileRes.data?.data?.id || profileRes.data?.id || "";
      } catch (err) {
        console.error("Lỗi lấy thông tin Manager profile:", err);
      }

      let url = `http://localhost:5000/api/orders?page=${page}&manager_id=${managerId}`;
      if (status !== "ALL") {
        url += `&status=${status}`;
      }

      const ordersRes = await axios.get(url, config);
      const resData = ordersRes.data;
      const rawOrders = resData?.data || resData || [];
      setOrders(Array.isArray(rawOrders) ? rawOrders : []);

      if (resData.pagination) {
        setPaginationInfo({
          totalOrders: resData.pagination.totalOrders || rawOrders.length,
          totalPages: resData.pagination.totalPages || 1,
        });
      } else {
        setPaginationInfo({
          totalOrders: rawOrders.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, selectedStatus);
  }, [currentPage, selectedStatus]);

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((o) => {
    let matchSearch = true;
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const idMatch = String(getOrderId(o, 0)).toLowerCase().includes(term);
      const phoneMatch = getCustomerPhone(o).toLowerCase().includes(term);
      const nameMatch = getCustomerName(o).toLowerCase().includes(term);
      const addressMatch = getCustomerAddress(o).toLowerCase().includes(term);
      matchSearch = idMatch || phoneMatch || nameMatch || addressMatch;
    }
    return matchSearch;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchData(currentPage, selectedStatus);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
    }
  };

  const triggerConfirm = (orderId, newStatus) => {
    const statusTextMap = {
      1: "Chờ duyệt",
      2: "Đã duyệt",
      3: "Đang giao",
      4: "Đã giao",
      5: "Hủy đơn",
    };

    setModalConfig({
      isOpen: true,
      title: "Xác nhận chuyển trạng thái",
      message: `Bạn có chắc chắn muốn chuyển đơn hàng #${orderId} sang trạng thái "${
        statusTextMap[newStatus] || newStatus
      }"?`,
      onConfirm: () => handleUpdateStatus(orderId, newStatus),
    });
  };

  const renderStatusBadge = (status) => {
    const s = String(status ?? 1);
    switch (s) {
      case "1":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
            <Clock className="w-3.5 h-3.5" /> Chờ duyệt
          </span>
        );
      case "2":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5 w-max">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
          </span>
        );
      case "3":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5 w-max">
            <Truck className="w-3.5 h-3.5" /> Đang giao
          </span>
        );
      case "4":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã giao
          </span>
        );
      case "5":
      case "0":
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-max">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 max-w-[1600px] mx-auto text-slate-100 font-sans antialiased">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-orange-500" /> Danh Sách Đơn
            Hàng Cửa Hàng
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý và xử lý quy trình vận chuyển các đơn hàng chứa sản phẩm của
            bạn.
          </p>
        </div>

        <button
          onClick={() => fetchData(currentPage, selectedStatus)}
          className="px-4 py-2.5 rounded-xl bg-[#14161f] border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all w-fit active:scale-95 shadow-sm"
        >
          <RefreshCw
            className={`w-4 h-4 text-orange-400 ${loading ? "animate-spin" : ""}`}
          />
          <span>Tải lại dữ liệu</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-[#14161f] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm Mã đơn, SĐT, Tên, Địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b0c10] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "1", label: "Chờ duyệt" },
            { id: "2", label: "Đã duyệt" },
            { id: "3", label: "Đang giao" },
            { id: "4", label: "Đã giao" },
            { id: "5", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedStatus === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                  : "bg-[#0b0c10] text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#14161f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-xs font-semibold tracking-wide">
              Đang tải danh sách đơn hàng...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto stroke-[1.5]" />
            <p className="text-sm font-bold text-white">Chưa có đơn hàng nào</p>
            <p className="text-xs text-slate-500">
              Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b1e2b]/80 border-b border-white/5 text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Mã đơn hàng</th>
                  <th className="py-4 px-6">Thông tin khách hàng</th>
                  <th className="py-4 px-6">Sản phẩm & Phân loại</th>
                  <th className="py-4 px-6">Tổng tiền</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredOrders.map((order, index) => {
                  const orderId = getOrderId(order, index);
                  const customerName = getCustomerName(order);
                  const phone = getCustomerPhone(order);
                  const address = getCustomerAddress(order);
                  const totalPrice = getTotalPrice(order);
                  const items = getOrderItems(order);
                  const currentStatus = String(order.status ?? 1);
                  const isCompletedOrCancelled =
                    currentStatus === "4" || currentStatus === "5";

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-white">
                        <span className="text-orange-400">#{orderId}</span>
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          {order.created_at || order.createdAt
                            ? new Date(
                                order.created_at || order.createdAt,
                              ).toLocaleDateString("vi-VN")
                            : "Mới tạo"}
                        </span>
                      </td>

                      <td className="py-4 px-6 max-w-[220px]">
                        <div
                          className="font-bold text-slate-200 truncate"
                          title={customerName}
                        >
                          {customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />{" "}
                          {phone}
                        </div>
                        <div
                          className="text-[11px] text-slate-400 mt-1 flex items-start gap-1 line-clamp-2"
                          title={address}
                        >
                          <MapPin className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                          <span className="text-slate-300 font-medium">
                            {address}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        {items.length > 0 ? (
                          <div className="space-y-2">
                            {items.slice(0, 2).map((item, idx) => {
                              const pName = getProductName(item);
                              const qty =
                                item.quantity ||
                                item.quanity ||
                                item.amount ||
                                1;
                              const { sku, variant } = getSKUAndVariant(item);

                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] gap-2">
                                    <span
                                      className="text-slate-200 truncate font-semibold"
                                      title={pName}
                                    >
                                      • {pName}
                                    </span>
                                    <span className="text-orange-400 font-bold shrink-0 bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                      x{qty}
                                    </span>
                                  </div>

                                  <div className="pl-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                                    {sku && (
                                      <span className="bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                        <Tag className="w-2.5 h-2.5 text-orange-400" />
                                        {sku}
                                      </span>
                                    )}
                                    {variant && (
                                      <span className="bg-orange-500/10 text-orange-300 font-medium px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">
                                        <Layers className="w-2.5 h-2.5 text-amber-400" />
                                        {variant}
                                      </span>
                                    )}
                                    {!sku && !variant && (
                                      <span className="text-slate-500 italic text-[10px]">
                                        (Mặc định)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {items.length > 2 && (
                              <div className="text-[10px] text-slate-500 italic pl-2">
                                +{items.length - 2} sản phẩm khác...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">
                            Không có chi tiết
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-black text-amber-400 text-sm">
                        {Number(totalPrice).toLocaleString("vi-VN")} đ
                      </td>

                      <td className="py-4 px-6">
                        {renderStatusBadge(currentStatus)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={currentStatus}
                            disabled={isCompletedOrCancelled}
                            onChange={(e) =>
                              triggerConfirm(orderId, e.target.value)
                            }
                            className={`bg-[#0b0c10] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-medium transition-all ${
                              isCompletedOrCancelled
                                ? "opacity-50 cursor-not-allowed bg-slate-900/50 text-slate-500"
                                : "cursor-pointer hover:border-white/20"
                            }`}
                          >
                            <option value="1">Chờ duyệt</option>
                            <option value="2">Đã duyệt</option>
                            <option value="3">Đang giao</option>
                            <option value="4">Đã giao</option>
                            <option value="5">Hủy đơn</option>
                          </select>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all border border-white/5"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-4 h-4 text-orange-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* THANH PHÂN TRANG */}
        {!loading && (
          <div className="px-6 py-4 bg-[#1b1e2b]/50 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Hiển thị{" "}
              <span className="font-bold text-white">
                Trang {currentPage} / {paginationInfo.totalPages}
              </span>{" "}
              (Tổng cộng{" "}
              <span className="font-bold text-white">
                {paginationInfo.totalOrders}
              </span>{" "}
              đơn hàng)
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-[#0b0c10] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from(
                { length: paginationInfo.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-xl font-extrabold text-xs transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                      : "bg-[#0b0c10] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === paginationInfo.totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, paginationInfo.totalPages),
                  )
                }
                className="p-2 rounded-xl bg-[#0b0c10] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POPUP CONFIRM */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14161f] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                {modalConfig.title}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {modalConfig.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() =>
                  setModalConfig({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  if (modalConfig.onConfirm) await modalConfig.onConfirm();
                  setModalConfig({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-extrabold shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DETAIL (HIỂN THỊ CHI TIẾT 4 CẤP ĐỊA CHỈ) */}
      {selectedOrder &&
        (() => {
          const addressInfo = getOrderAddressDetails(selectedOrder);

          return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                    Chi tiết đơn hàng #{getOrderId(selectedOrder, 0)}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  {/* THÔNG TIN KHÁCH HÀNG & ĐỊA CHỈ */}
                  <div className="bg-[#0b0c10] p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200">
                      <User className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-slate-400">Khách hàng:</span>
                      <strong className="text-white">
                        {getCustomerName(selectedOrder)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 text-slate-200">
                      <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-slate-400">Số điện thoại:</span>
                      <span className="text-slate-200 font-semibold">
                        {getCustomerPhone(selectedOrder)}
                      </span>
                    </div>

                    {/* KHU VỰC ĐỊA CHỈ BÓC TÁCH CHI TIẾT */}
                    <div className="pt-2 border-t border-white/5 space-y-2.5">
                      <div className="flex items-start gap-2 text-slate-200">
                        <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <div className="w-full">
                          <span className="text-slate-400 font-semibold">
                            Địa chỉ giao hàng hoàn chỉnh:
                          </span>
                          <p className="text-orange-300 font-bold mt-1 text-xs bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 leading-relaxed">
                            {addressInfo.fullAddress}
                          </p>
                        </div>
                      </div>

                      {/* HIỂN THỊ CHUẨN 4 Ô ĐỊA CHỈ */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-500 block text-[10px]">
                            Tỉnh / Thành phố:
                          </span>
                          <span className="text-slate-200 font-bold mt-0.5 block">
                            {addressInfo.city}
                          </span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-500 block text-[10px]">
                            Quận / Huyện:
                          </span>
                          <span className="text-slate-200 font-bold mt-0.5 block">
                            {addressInfo.district}
                          </span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-500 block text-[10px]">
                            Phường / Xã:
                          </span>
                          <span className="text-slate-200 font-bold mt-0.5 block">
                            {addressInfo.ward}
                          </span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                          <span className="text-slate-500 block text-[10px]">
                            Địa chỉ cụ thể:
                          </span>
                          <span
                            className="text-slate-200 font-bold mt-0.5 block truncate"
                            title={addressInfo.street}
                          >
                            {addressInfo.street}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DANH SÁCH SẢN PHẨM */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <PackageCheck className="w-4 h-4 text-orange-400" />
                      <span>
                        Danh sách sản phẩm (
                        {getOrderItems(selectedOrder).length})
                      </span>
                    </div>

                    <div className="bg-[#0b0c10] rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                      {getOrderItems(selectedOrder).length > 0 ? (
                        getOrderItems(selectedOrder).map((item, idx) => {
                          const pName = getProductName(item);
                          const pImage = formatImageUrl(item);
                          const qty =
                            item.quantity || item.quanity || item.amount || 1;
                          const price = item.price || item.unit_price || 0;
                          const { sku, variant } = getSKUAndVariant(item);

                          return (
                            <div
                              key={idx}
                              className="p-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {pImage && (
                                  <img
                                    src={pImage}
                                    alt={pName}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                    className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                                  />
                                )}
                                <div className="min-w-0 space-y-1">
                                  <p className="font-bold text-slate-200 truncate">
                                    {pName}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {sku && (
                                      <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-orange-400" />
                                        SKU: {sku}
                                      </span>
                                    )}
                                    {variant && (
                                      <span className="bg-orange-500/10 text-orange-300 font-medium text-[10px] px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-amber-400" />
                                        {variant}
                                      </span>
                                    )}
                                    {!sku && !variant && (
                                      <span className="text-slate-500 italic text-[10px]">
                                        (Mặc định)
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-slate-400">
                                    Đơn giá:{" "}
                                    {Number(price).toLocaleString("vi-VN")} đ
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-extrabold text-xs">
                                  x{qty}
                                </span>
                                <p className="text-amber-400 font-black mt-1">
                                  {Number(price * qty).toLocaleString("vi-VN")}{" "}
                                  đ
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic">
                          Không tìm thấy danh sách chi tiết sản phẩm
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div className="p-3 bg-[#0b0c10] border border-white/5 rounded-xl text-slate-400 italic">
                      " {selectedOrder.note} "
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-bold">
                      Tổng thanh toán:
                    </span>
                    <span className="text-amber-400 font-black text-base">
                      {Number(getTotalPrice(selectedOrder)).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      đ
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-90 transition-all active:scale-95"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default OrderTable;
