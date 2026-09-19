import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Calendar,
  Search,
  Zap,
  Check,
  TriangleAlert,
} from "lucide-react";
import api from "../../services/api";

const ManageFlashSale = ({ getImageUrl }) => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Hệ thống modal phụ để lựa chọn sản phẩm gốc từ hệ thống
  const [systemProducts, setSystemProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // 🌟 State quản lý Modal thông báo/Xác nhận cao cấp (Thay thế alert và confirm)
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: "success", // 'success' | 'confirm' | 'error'
    title: "",
    message: "",
    onConfirm: null, // Hàm thực thi khi bấm xác nhận ở loại modal 'confirm'
  });

  // 1. Lấy danh sách các chiến dịch Flash Sale từ Backend
  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/flash-sales");
      setFlashSales(res.data?.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách Flash Sale:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy danh sách sản phẩm gốc để đưa vào hàng chờ sale
  const fetchSystemProducts = async () => {
    try {
      const res = await api.get("/products");
      setSystemProducts(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Lỗi tải sản phẩm hệ thống:", error);
    }
  };

  useEffect(() => {
    fetchFlashSales();
    fetchSystemProducts();
  }, []);

  // 3. Lấy thông tin chi tiết một chiến dịch để đưa lên Form Chỉnh Sửa
  const handleEdit = async (id) => {
    setEditingId(id);
    try {
      const res = await api.get(`/flash-sales/${id}`);
      const saleData = res.data?.data;
      if (saleData) {
        setName(saleData.name);
        if (saleData.start_time)
          setStartTime(saleData.start_time.substring(0, 16).replace(" ", "T"));
        if (saleData.end_time)
          setEndTime(saleData.end_time.substring(0, 16).replace(" ", "T"));
        setStatus(saleData.status);

        const productsInSale =
          saleData.flash_sale_products?.map((item) => ({
            product_id: item.product_id,
            name: item.product?.name || "Sản phẩm không tên",
            price: item.product?.price || 0,
            image: item.product?.image || "",
            flash_sale_price: item.flash_sale_price,
            flash_sale_stock: item.flash_sale_stock,
            flash_sale_sold: item.flash_sale_sold || 0,
          })) || [];
        setSelectedProducts(productsInSale);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Thất bại",
        message: "Lỗi hệ thống khi lấy chi tiết chiến dịch Flash Sale!",
      });
    }
  };

  // 4. Hàm thực thi lệnh xóa thực tế sau khi người dùng đồng ý trên UI mới
  const executeDelete = async (id) => {
    try {
      await api.delete(`/flash-sales/${id}`);
      fetchFlashSales();
      // Hiển thị modal thành công ngay sau đó
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Xóa thành công!",
        message: "Chiến dịch Flash Sale đã được gỡ bỏ hoàn toàn khỏi hệ thống.",
      });
    } catch (error) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Lỗi xóa dữ liệu",
        message:
          "Không thể xóa chiến dịch này, vui lòng kiểm tra lại kết nối backend.",
      });
    }
  };

  // 🌟 Hàm gọi hiện Modal xác nhận xóa (Thay thế window.confirm cũ)
  const handleDelete = (id) => {
    setNotificationModal({
      isOpen: true,
      type: "confirm",
      title: "Xác nhận xóa?",
      message:
        "Bạn có chắc chắn muốn xóa chiến dịch Flash Sale này không? Hành động này không thể hoàn tác.",
      onConfirm: () => executeDelete(id),
    });
  };

  // 5. Thêm sản phẩm từ danh sách hệ thống vào hàng chờ Flash Sale
  const addProductToSale = (prod) => {
    const isExisted = selectedProducts.some((p) => p.product_id === prod.id);
    if (isExisted) {
      return setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Trùng lặp sản phẩm",
        message:
          "Sản phẩm này đã nằm trong danh sách đăng ký sale của chiến dịch này!",
      });
    }

    let originPrice =
      typeof prod?.price === "object" ? prod.price.value || 0 : prod?.price;
    originPrice = parseFloat(originPrice) || 0;

    let prodName =
      prod?.name && typeof prod.name === "object" ? prod.name.name : prod?.name;

    setSelectedProducts([
      ...selectedProducts,
      {
        product_id: prod.id,
        name: prodName || "Chưa có tên",
        price: originPrice,
        image: prod.image || prod.imageUrl || "",
        flash_sale_price: originPrice ? Math.floor(originPrice * 0.8) : 0,
        flash_sale_stock: 5,
        flash_sale_sold: 0,
      },
    ]);
  };

  // 6. Cập nhật thay đổi giá bán / số lượng kho ngay trên dòng table hàng chờ
  const updateProductRow = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    setSelectedProducts(updated);
  };

  // 7. Gửi gói dữ liệu lên Controller lưu vào Database
  const handleSave = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      return setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Thiếu thông tin",
        message:
          "Vui lòng chọn và thêm ít nhất 1 sản phẩm tham gia chương trình sale!",
      });
    }

    const formatTimeForDB = (timeStr) => {
      if (!timeStr) return "";
      return timeStr.replace("T", " ") + ":00";
    };

    const formattedProducts = selectedProducts.map((p) => ({
      product_id: Number(p.product_id),
      flash_sale_price: Number(p.flash_sale_price) || 0,
      flash_sale_stock: Number(p.flash_sale_stock) || 0,
      flash_sale_sold: Number(p.flash_sale_sold || 0),
    }));

    const payload = {
      name: name,
      start_time: formatTimeForDB(startTime),
      end_time: formatTimeForDB(endTime),
      status: Number(status),
      products: formattedProducts,
    };

    try {
      if (editingId) {
        await api.put(`/flash-sales/${editingId}`, payload);
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Cập nhật thành công!",
          message:
            "Chiến dịch Flash Sale đã được lưu các thay đổi mới vào hệ thống.",
        });
      } else {
        await api.post("/flash-sales", payload);
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Tạo chiến dịch thành công!",
          message:
            "Chiến dịch Flash Sale mới đã được khởi tạo và sẵn sàng chạy.",
        });
      }
      closeMainModal();
      fetchFlashSales();
    } catch (error) {
      console.error("Lỗi khi lưu Flash Sale:", error);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Lỗi lưu dữ liệu",
        message:
          error.response?.data?.message ||
          "Lỗi hệ thống khi lưu dữ liệu hoặc lỗi phân quyền tài khoản!",
      });
    }
  };

  const closeMainModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setStartTime("");
    setEndTime("");
    setStatus(1);
    setSelectedProducts([]);
  };

  const filteredSystemProducts = systemProducts.filter((p) => {
    const pName =
      p?.name && typeof p.name === "object" ? p.name.name : p?.name || "";
    return String(pName).toLowerCase().includes(productSearch.toLowerCase());
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 font-sans text-gray-800">
      {/* HEADER BANNER QUẢN LÝ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            <h3 className="font-black text-base text-gray-900 tracking-tight">
              Quản Lý Chiến Dịch Flash Sale
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Thiết lập khung giờ vàng và danh sách sản phẩm giảm giá shock
          </p>
        </div>
        <button
          onClick={() => {
            closeMainModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#5d34e8] hover:bg-[#4c24d4] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tạo Chiến Dịch Mới
        </button>
      </div>

      {/* DANH SÁCH CHIẾN DỊCH HIỆN TẠI */}
      <div className="overflow-x-auto border border-gray-50 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-extrabold uppercase bg-gray-50/70">
              <th className="py-3.5 px-4">Tên chiến dịch</th>
              <th className="py-3.5 px-4">Thời gian bắt đầu</th>
              <th className="py-3.5 px-4">Thời gian kết thúc</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-medium">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-400 font-bold text-[11px]"
                >
                  Đang tải dữ liệu Flash Sale...
                </td>
              </tr>
            ) : flashSales.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  Hệ thống chưa ghi nhận chiến dịch Flash Sale nào.
                </td>
              </tr>
            ) : (
              flashSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {sale.name}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(sale.start_time).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(sale.end_time).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 1
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sale.status === 1 ? "Kích hoạt" : "Tạm ẩn"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEdit(sale.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa bỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL LỚN: BIỂU MẪU CẤU HÌNH THÊM HOẶC SỬA CHIẾN DỊCH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="font-bold text-gray-900 text-sm">
                  {editingId
                    ? "Cập Nhật Cấu Hình Flash Sale"
                    : "Thiết Lập Chiến Dịch Flash Sale Mới"}
                </h4>
              </div>
              <button
                onClick={closeMainModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Nội Dung */}
            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-5 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-gray-700">
                    Tên chiến dịch chương trình *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: FLASH SALE GIỜ VÀNG - ĐÓN LỄ LỚN"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none font-medium focus:border-[#5d34e8] focus:ring-1 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    Khung giờ mở bán (Bắt đầu) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none font-medium focus:border-[#5d34e8] focus:ring-1 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    Khung giờ đóng bán (Kết thúc) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none font-medium focus:border-[#5d34e8] focus:ring-1 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-3">
                  <input
                    type="checkbox"
                    id="status-sale"
                    checked={status === 1}
                    onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-[#5d34e8] border-gray-300 rounded focus:ring-purple-400 accent-[#5d34e8]"
                  />
                  <label
                    htmlFor="status-sale"
                    className="font-bold text-gray-700 select-none cursor-pointer"
                  >
                    Kích hoạt áp dụng chiến dịch ngay sau khi lưu dữ liệu
                  </label>
                </div>
              </div>

              {/* BẢNG CẤU HÌNH SẢN PHẨM KHUYẾN MÃI */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-gray-900 text-xs">
                    Sản phẩm tham gia khuyến mãi
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="text-xs text-[#5d34e8] font-extrabold hover:text-[#4c24d4] hover:underline"
                  >
                    + Chọn sản phẩm từ kho hàng
                  </button>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-gray-400 text-[10px] font-extrabold uppercase bg-gray-50 border-b border-gray-100">
                        <th className="py-2.5 px-3">Sản phẩm</th>
                        <th className="py-2.5 px-3">Giá gốc hệ thống</th>
                        <th className="py-2.5 px-3 w-32">Giá Flash Sale (đ)</th>
                        <th className="py-2.5 px-3 w-28">Số lượng kho sale</th>
                        <th className="py-2.5 px-3 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {selectedProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-8 text-gray-400 font-medium"
                          >
                            Chưa chọn sản phẩm nào. Nhấp vào nút phía trên để
                            thêm sản phẩm gốc.
                          </td>
                        </tr>
                      ) : (
                        selectedProducts.map((prod, index) => (
                          <tr
                            key={prod.product_id || index}
                            className="hover:bg-gray-50/20"
                          >
                            <td className="py-2.5 px-3 flex items-center gap-2">
                              <img
                                src={getImageUrl(prod.image)}
                                className="w-9 h-9 object-cover rounded-lg border border-gray-100"
                                alt=""
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/50x50?text=No+Image";
                                }}
                              />
                              <span className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">
                                {prod.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 font-bold">
                              {parseFloat(prod.price || 0).toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                required
                                value={prod.flash_sale_price}
                                onChange={(e) =>
                                  updateProductRow(
                                    index,
                                    "flash_sale_price",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 outline-none font-bold text-purple-700 focus:border-[#5d34e8]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="1"
                                required
                                value={prod.flash_sale_stock}
                                onChange={(e) =>
                                  updateProductRow(
                                    index,
                                    "flash_sale_stock",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 outline-none font-bold text-gray-800 focus:border-[#5d34e8]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedProducts(
                                    selectedProducts.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Modal Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={closeMainModal}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5d34e8] hover:bg-[#4c24d4] text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Lưu chiến dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PHỤ: CHỌN NHANH SẢN PHẨM GỐC TỪ HỆ THỐNG */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-xs">
                Lựa chọn sản phẩm kho hàng
              </h5>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-50">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm cần tìm kiếm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-transparent text-xs outline-none w-full font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-gray-50 text-xs">
              {filteredSystemProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium">
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              ) : (
                filteredSystemProducts.map((prod) => {
                  let mappedPrice =
                    typeof prod?.price === "object"
                      ? prod.price.value || 0
                      : prod?.price;
                  let mappedName =
                    prod?.name && typeof prod.name === "object"
                      ? prod.name.name
                      : prod?.name;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        addProductToSale(prod);
                        setIsProductModalOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-purple-50/40 cursor-pointer transition-colors rounded-xl"
                    >
                      <img
                        src={getImageUrl(prod.image || prod.imageUrl)}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                        alt=""
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/50x50?text=No+Image";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {mappedName || "Không có tên"}
                        </p>
                        <p className="text-[11px] text-purple-700 font-extrabold mt-0.5">
                          {parseFloat(mappedPrice || 0).toLocaleString("vi-VN")}
                          đ
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 ── MODAL THÔNG BÁO & XÁC NHẬN ĐA NĂNG ĐỒNG BỘ 100% ── */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] w-full max-w-sm p-8 shadow-2xl text-center space-y-5 border border-gray-50 animate-in zoom-in-95 duration-200">
            {/* 1. GIAO DIỆN MODAL XÁC NHẬN XÓA (ỨNG VỚI ẢNH MẪU 3) */}
            {notificationModal.type === "confirm" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100">
                  <TriangleAlert className="w-8 h-8 text-red-500 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-900 font-extrabold text-base tracking-tight">
                    {notificationModal.title}
                  </h4>
                  <p className="text-gray-500 font-medium text-[11px] leading-relaxed px-2">
                    {notificationModal.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationModal({
                        ...notificationModal,
                        isOpen: false,
                      })
                    }
                    className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (notificationModal.onConfirm)
                        notificationModal.onConfirm();
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-100 transition-all active:scale-95"
                  >
                    Đồng ý xóa
                  </button>
                </div>
              </>
            )}

            {/* 2. GIAO DIỆN THÀNH CÔNG (ỨNG VỚI ẢNH MẪU 2) */}
            {notificationModal.type === "success" && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border border-emerald-100/50">
                  <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-900 font-extrabold text-base tracking-tight">
                    {notificationModal.title}
                  </h4>
                  <p className="text-gray-500 font-medium text-[11px] leading-relaxed px-2">
                    {notificationModal.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationModal({
                        ...notificationModal,
                        isOpen: false,
                      })
                    }
                    className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold rounded-xl transition-colors"
                  >
                    Đóng lại
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationModal({
                        ...notificationModal,
                        isOpen: false,
                      })
                    }
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95"
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            )}

            {/* 3. GIAO DIỆN MODAL BÁO LỖI HỆ THỐNG */}
            {notificationModal.type === "error" && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto border border-amber-100">
                  <TriangleAlert className="w-8 h-8 text-amber-500 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-gray-900 font-extrabold text-base tracking-tight">
                    {notificationModal.title}
                  </h4>
                  <p className="text-gray-500 font-medium text-[11px] leading-relaxed px-2">
                    {notificationModal.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotificationModal({
                      ...notificationModal,
                      isOpen: false,
                    })
                  }
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 pt-2"
                >
                  Đã hiểu
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFlashSale;
