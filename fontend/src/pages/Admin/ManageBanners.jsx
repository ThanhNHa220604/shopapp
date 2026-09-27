import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  PackagePlus,
  X,
} from "lucide-react";

// ── BANNER STATUS ────────────────────────────────────────────────────────────
const BannerStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  SCHEDULED: 2,
  EXPIRED: 3,
};

const ManageBanners = ({ getImageUrl }) => {
  // ── STATES QUẢN LÝ BANNER ──────────────────────────────────────────────────
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerSearch, setBannerSearch] = useState("");
  const [bannerPage, setBannerPage] = useState(1);
  const [bannerTotalPages, setBannerTotalPages] = useState(1);

  // Form Banner
  const [newBannerName, setNewBannerName] = useState("");
  const [newBannerImage, setNewBannerImage] = useState("");
  const [newBannerStatus, setNewBannerStatus] = useState(BannerStatus.ACTIVE);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 🟢 State lưu danh sách sản phẩm liên quan
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Modal chọn sản phẩm từ kho
  const [showProductModal, setShowProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // ── FETCH DANH SÁCH BANNER ────────────────────────────────────────────────
  const fetchAdminBanners = async () => {
    setLoadingBanners(true);
    try {
      const response = await api.get(
        `/banners?search=${bannerSearch}&page=${bannerPage}&isAdmin=true`,
      );

      if (response && response.data) {
        setBanners(response.data.data || response.data.banners || []);
        setBannerTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error);
    } finally {
      setLoadingBanners(false);
    }
  };

  // ── FETCH KHO SẢN PHẨM MỞ MODAL ──────────────────────────────────────────
  const fetchProductsList = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products?search=${productSearch}&limit=20`);
      if (res && res.data) {
        setAllProducts(res.data.data || res.data.products || []);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAdminBanners();
  }, [bannerPage, bannerSearch]);

  useEffect(() => {
    if (showProductModal) {
      fetchProductsList();
    }
  }, [showProductModal, productSearch]);

  // ── UPLOAD ẢNH ────────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target?.files ? e.target.files[0] : e;
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const res = await api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.files && res.data.files.length > 0) {
        setNewBannerImage(res.data.files[0]);
      }
    } catch (error) {
      console.error("Lỗi upload ảnh banner:", error);
      alert("Tải ảnh lên máy chủ thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // 🟢 THÊM / XÓA SẢN PHẨM NỔI BẬT
  const handleAddProduct = (prod) => {
    if (selectedProducts.some((p) => p.id === prod.id)) {
      alert("Sản phẩm này đã được thêm vào danh sách!");
      return;
    }
    setSelectedProducts((prev) => [...prev, prod]);
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── LƯU BANNER ────────────────────────────────────────────────────────────
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!newBannerName.trim() || !newBannerImage) {
      alert("Vui lòng nhập đầy đủ tên và upload ảnh!");
      return;
    }

    if (Number(newBannerStatus) === BannerStatus.SCHEDULED) {
      if (!startTime || !endTime) {
        alert("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!");
        return;
      }
      if (new Date(startTime) >= new Date(endTime)) {
        alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
        return;
      }
    }

    // 🟢 Payload khớp với bảng bannerdetail
    const payload = {
      name: newBannerName.trim(),
      image: newBannerImage,
      status: Number(newBannerStatus),
      product_ids: selectedProducts.map((p) => p.id),
    };

    // Chỉ bổ sung start_time/end_time khi chọn SCHEDULED
    if (Number(newBannerStatus) === BannerStatus.SCHEDULED) {
      payload.start_time = startTime;
      payload.end_time = endTime;
    }

    try {
      if (editingBannerId) {
        await api.put(`/banners/${editingBannerId}`, payload);
      } else {
        await api.post("/banners", payload);
      }
      handleCancelEdit();
      fetchAdminBanners();
    } catch (error) {
      console.error("Lỗi xử lý banner:", error);
      alert(error.response?.data?.message || "Thao tác dữ liệu thất bại");
    }
  };

  // ── SỬA BANNER ────────────────────────────────────────────────────────────
  const handleEditClick = (item) => {
    setEditingBannerId(item.id);
    setNewBannerName(
      item.name && typeof item.name === "object" ? "" : String(item.name),
    );
    setNewBannerStatus(Number(item.status));
    setNewBannerImage(item.image || "");
    setStartTime(
      item.start_time
        ? new Date(item.start_time).toISOString().slice(0, 16)
        : "",
    );
    setEndTime(
      item.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : "",
    );

    // Map danh sách sản phẩm từ bannerdetail hoặc products liên kết
    if (item.bannerdetails && Array.isArray(item.bannerdetails)) {
      setSelectedProducts(
        item.bannerdetails.map((bd) => bd.product || bd).filter(Boolean),
      );
    } else if (item.products && Array.isArray(item.products)) {
      setSelectedProducts(item.products);
    } else {
      setSelectedProducts([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBannerId(null);
    setNewBannerName("");
    setNewBannerImage("");
    setNewBannerStatus(BannerStatus.ACTIVE);
    setStartTime("");
    setEndTime("");
    setSelectedProducts([]);
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này không?")) return;
    try {
      await api.delete(`/banners/${id}`);
      if (editingBannerId === id) handleCancelEdit();
      fetchAdminBanners();
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
      alert("Không thể xóa banner này!");
    }
  };

  const renderBannerStatusTag = (status) => {
    const numericStatus = Number(status);
    switch (numericStatus) {
      case BannerStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
            Đang hiển thị
          </span>
        );
      case BannerStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Đang ẩn
            (Nháp)
          </span>
        );
      case BannerStatus.SCHEDULED:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Lên lịch
            chạy
          </span>
        );
      case BannerStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Hết hiệu
            lực
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-gray-500">Không rõ</span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* ── FORM BÊN TRÁI ── */}
      <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.02]">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            {editingBannerId ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              {editingBannerId ? "Chỉnh sửa Banner" : "Thêm mới Banner"}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              Thiết lập quảng cáo và giới thiệu sản phẩm
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Tên chiến dịch Banner
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Bộ sưu tập Laptop Gaming 2026..."
              value={newBannerName}
              onChange={(e) => setNewBannerName(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#5d34e8] outline-none font-medium text-gray-800 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Cấu hình trạng thái hiển thị
            </label>
            <select
              value={newBannerStatus}
              onChange={(e) => setNewBannerStatus(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-[#5d34e8] outline-none font-bold text-gray-700 cursor-pointer transition-all"
            >
              <option value={BannerStatus.ACTIVE}>
                🟢 Hoạt động (Hiện trên trang chủ)
              </option>
              <option value={BannerStatus.INACTIVE}>
                🟡 Tạm ẩn (Lưu kho dữ liệu nháp)
              </option>
              <option value={BannerStatus.SCHEDULED}>
                🔵 Lên lịch (Hẹn giờ phát sóng)
              </option>
              <option value={BannerStatus.EXPIRED}>
                🔴 Hết hạn (Hạ băng rôn quảng cáo)
              </option>
            </select>
          </div>

          {/* Ô CHỌN GIỜ (CHỈ HIỆN KHI LÊN LỊCH) */}
          {Number(newBannerStatus) === BannerStatus.SCHEDULED && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">
                  Khung giờ mở (Bắt đầu) *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-[#5d34e8] outline-none font-medium text-gray-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">
                  Khung giờ đóng (Kết thúc) *
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:border-[#5d34e8] outline-none font-medium text-gray-700"
                />
              </div>
            </div>
          )}

          {/* 🟢 DANH SÁCH SẢN PHẨM GIỚI THIỆU */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700">
                Sản phẩm giới thiệu liên quan
              </label>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                + Chọn sản phẩm từ kho hàng
              </button>
            </div>

            {selectedProducts.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                      <th className="p-2.5">SẢN PHẨM</th>
                      <th className="p-2.5 text-right">GIÁ HỆ THỐNG</th>
                      <th className="p-2.5 text-center">XÓA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-2.5 font-bold text-gray-800">
                          <div className="flex items-center gap-2">
                            <img
                              src={getImageUrl ? getImageUrl(p.image) : p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0"
                              onError={(e) =>
                                (e.target.src =
                                  "https://placehold.co/100?text=No+Img")
                              }
                            />
                            <span className="line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-semibold text-indigo-600 whitespace-nowrap">
                          {p.price?.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-rose-400 hover:text-rose-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-gray-200 rounded-xl text-center bg-gray-50/50">
                <p className="text-xs text-gray-400 font-medium">
                  Chưa chọn sản phẩm nào cho Banner này.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Hình ảnh Banner
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center bg-gray-50/30 hover:bg-gray-50/80 hover:border-indigo-500 cursor-pointer relative transition-all ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-gray-200"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/"))
                  handleImageUpload(file);
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <ImageIcon className="w-6 h-6 text-gray-400" />
                <p className="text-xs font-bold text-[#002b66]">
                  Bấm chọn hoặc Kéo thả ảnh vào đây
                </p>
              </div>
            </div>

            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-indigo-600 text-[10px] font-bold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Đang đồng bộ hóa
                ảnh...
              </div>
            )}
            {newBannerImage && !uploading && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[10px] text-emerald-800 font-extrabold truncate">
                  {newBannerImage}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {editingBannerId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs uppercase"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 font-bold py-2.5 rounded-xl text-xs uppercase text-white ${
                editingBannerId
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-[#5d34e8] hover:bg-[#4a25c9]"
              }`}
            >
              {editingBannerId ? "Cập nhật thay đổi" : "Kích hoạt banner"}
            </button>
          </div>
        </form>
      </div>

      {/* ── BÊN PHẢI: DANH SÁCH BANNER ── */}
      <div className="lg:col-span-2 bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.02] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              Danh mục Media Banner
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              Danh sách toàn bộ banner hiển thị trên hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              value={bannerSearch}
              onChange={(e) => setBannerSearch(e.target.value)}
              className="bg-transparent text-xs outline-none w-full sm:w-44 font-medium text-gray-800"
            />
          </div>
        </div>

        {loadingBanners ? (
          <div className="flex justify-center py-12 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-bold">
            Không có banner nào.
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex flex-col sm:flex-row items-center gap-4 border rounded-2xl p-3.5 bg-white transition-all ${
                  editingBannerId === item.id
                    ? "border-amber-300 bg-amber-50/10 ring-1 ring-amber-300"
                    : "border-gray-100"
                }`}
              >
                <div className="relative rounded-xl border border-gray-100 w-full sm:w-32 h-20 bg-gray-50 shrink-0 overflow-hidden">
                  <img
                    src={getImageUrl(item.image)}
                    alt="banner"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/600x400?text=Error")
                    }
                  />
                  <div className="absolute top-1 left-1 bg-black/60 text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
                    ID: {item.id}
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full space-y-1">
                  <p className="font-extrabold text-gray-900 text-sm truncate">
                    {String(item.name)}
                  </p>
                  <div className="flex items-center gap-2">
                    {renderBannerStatusTag(item.status)}
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                      {item.bannerdetails?.length || item.products?.length || 0}{" "}
                      sản phẩm
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(item.id)}
                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 MODAL CHỌN SẢN PHẨM TỪ KHO HÀNG */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-indigo-600" /> Chọn sản
                phẩm giới thiệu
              </h4>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-gray-800 font-medium"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {loadingProducts ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Đang tải danh sách...
                </div>
              ) : allProducts.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Không tìm thấy sản phẩm.
                </div>
              ) : (
                allProducts.map((prod) => {
                  const isSelected = selectedProducts.some(
                    (p) => p.id === prod.id,
                  );
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={
                            getImageUrl ? getImageUrl(prod.image) : prod.image
                          }
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/100?text=No+Img")
                          }
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-indigo-600 font-bold">
                            {prod.price?.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isSelected}
                        onClick={() => handleAddProduct(prod)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Đã chọn" : "Thêm"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBanners;
