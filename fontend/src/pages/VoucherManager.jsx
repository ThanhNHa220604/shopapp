import React, { useEffect, useState } from "react";
import axios from "axios";

import VoucherHeader from "../components/ManagerVoucher/VoucherHeader";
import VoucherSearchFilter from "../components/ManagerVoucher/VoucherSearchFilter";
import VoucherTable from "../components/ManagerVoucher/VoucherTable";
import AddVoucherModal from "../components/ManagerVoucher/AddVoucherModal";
import EditVoucherModal from "../components/ManagerVoucher/EditVoucherModal";
import {
  AlertModal,
  ConfirmModal,
} from "../components/ManagerVoucher/ActionModals";
import VoucherDetailModal from "../components/ManagerVoucher/VoucherDetailModal";
import productService from "../services/product";

const API_BASE = "http://localhost:5000/api";

// Role trong hệ thống lưu dạng số: ADMIN = 3, MANAGER = 2, USER = 1.
// Hàm này chuyển về tên chữ thường chuẩn để gửi lên backend (created_by_type),
// đồng thời chịu được trường hợp role đã là chuỗi sẵn ("admin"/"manager"...).
const getRoleName = (role) => {
  const roleMap = { 1: "user", 2: "manager", 3: "admin" };
  if (roleMap[role] !== undefined) return roleMap[role];

  const roleStr = String(role ?? "").toLowerCase();
  if (["1", "user"].includes(roleStr)) return "user";
  if (["2", "manager", "staff"].includes(roleStr)) return "manager";
  if (["3", "admin"].includes(roleStr)) return "admin";

  return "manager"; // fallback an toàn
};

// Modal dùng nội bộ giá trị "all" | "specific" cho gọn UI,
// nhưng backend (InsertVoucherRequest/Joi) yêu cầu đúng 1 trong:
// "all" | "specific_products" | "specific_categories"
const mapApplyScope = (scope) => {
  if (scope === "specific") return "specific_products";
  return "all";
};

const ManagerVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Danh sách sản phẩm của user hiện tại, dùng cho phần chọn sản phẩm áp dụng voucher
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState(null);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showAlert = (message, type = "info", title = "Thông báo") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const showConfirm = (message, onConfirm, title = "Xác nhận xóa") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await onConfirm();
      },
    });
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        fetchVouchers(null);
        return;
      }

      const res = await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data?.data || res.data;
      setUserProfile(user);

      fetchVouchers(user);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      fetchVouchers(null);
    }
  };

  const fetchVouchers = async (currentUser = userProfile) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const userId = currentUser?.id || currentUser?._id;

      const endpoint = userId
        ? `${API_BASE}/vouchers?creator_id=${userId}`
        : `${API_BASE}/vouchers`;

      const res = await axios.get(endpoint, config);
      const rawData = res.data?.data || res.data?.vouchers || res.data || [];

      let myVouchers = Array.isArray(rawData) ? rawData : [];

      if (userId) {
        myVouchers = myVouchers.filter((v) => {
          const creatorId =
            v.creator_id ??
            v.user_id ??
            v.created_by ??
            v.creator?.id ??
            v.creator?._id;
          return String(creatorId) === String(userId);
        });
      }

      setVouchers(myVouchers);
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher:", error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      // Backend tự lọc theo token: MANAGER chỉ nhận sản phẩm của mình,
      // ADMIN nhận tất cả. Không cần và không nên tự truyền user_id từ client.
      const res = await productService.getMyProducts();
      const rawData = res?.data || [];
      const list = Array.isArray(rawData) ? rawData : [];

      // Chuẩn hóa field để khớp với ProductPickerModal (id, name, image, price).
      const normalized = list.map((p) => ({
        ...p,
        id: p.id ?? p._id,
        name: p.name ?? p.title ?? p.product_name ?? "Sản phẩm",
        image: p.image ?? p.thumbnail ?? p.images?.[0] ?? null,
        price: p.price ?? p.sale_price ?? p.original_price ?? null,
      }));

      setProducts(normalized);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Xử lý tạo mới
  const handleAddSubmit = async (formData, resetForm) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const userId = userProfile?.id || userProfile?._id || null;

      const payload = {
        ...formData,
        discount_type:
          formData.discount_type === "percentage"
            ? "percent"
            : formData.discount_type,
        creator_id: userId,
        created_by_type: getRoleName(userProfile?.role),
        discount_value: Number(formData.discount_value),
        max_discount_amount: formData.max_discount_amount
          ? Number(formData.max_discount_amount)
          : null,
        min_order_value: formData.min_order_value
          ? Number(formData.min_order_value)
          : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        limit_per_user: Number(formData.limit_per_user),
        // 🟢 apply_scope backend cần đúng enum: all | specific_products | specific_categories
        apply_scope: mapApplyScope(formData.apply_scope),
        product_ids:
          formData.apply_scope === "specific" ? formData.product_ids : [],
      };

      await axios.post(`${API_BASE}/vouchers`, payload, config);
      showAlert("Thêm Voucher mới thành công!", "success");

      resetForm();
      setIsAddModalOpen(false);
      fetchVouchers(userProfile);
    } catch (error) {
      console.error("Lỗi khi tạo voucher:", error);
      showAlert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng thử lại!",
        "error",
      );
    }
  };

  // Mở modal sửa
  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsEditModalOpen(true);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = (voucher) => {
    setViewingVoucher(voucher);
    setIsDetailModalOpen(true);
  };

  // Xử lý cập nhật voucher
  const handleEditSubmit = async (formData) => {
    const voucherId = editingVoucher?.id || editingVoucher?._id;

    if (!voucherId) {
      showAlert("Không tìm thấy ID của Voucher cần cập nhật!", "error");
      return;
    }

    const safeToISO = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const userId = userProfile?.id || userProfile?._id || null;

      const payload = {
        code: String(formData.code || "").trim(),
        title: String(formData.title || "").trim(),
        discount_type: formData.discount_type || "percentage",
        discount_value: Number(formData.discount_value) || 0,
        max_discount_amount: formData.max_discount_amount
          ? Number(formData.max_discount_amount)
          : null,
        min_order_value: formData.min_order_value
          ? Number(formData.min_order_value)
          : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        limit_per_user: Number(formData.limit_per_user) || 1,
        start_date: safeToISO(formData.start_date),
        end_date: safeToISO(formData.end_date),
        // 🟢 apply_scope backend cần đúng enum: all | specific_products | specific_categories
        apply_scope: mapApplyScope(formData.apply_scope),
        product_ids:
          formData.apply_scope === "specific" ? formData.product_ids : [],
        is_active: formData.is_active ? 1 : 0,
        creator_id: userId,
        created_by_type: getRoleName(userProfile?.role),
      };

      console.log("--> Đang gửi PUT tới:", `${API_BASE}/vouchers/${voucherId}`);
      console.log("--> Payload gửi đi:", payload);

      const res = await axios.put(
        `${API_BASE}/vouchers/${voucherId}`,
        payload,
        config,
      );
      console.log("--> Phản hồi Backend:", res.data);

      showAlert("Cập nhật Voucher thành công!", "success");
      setIsEditModalOpen(false);
      setEditingVoucher(null);
      fetchVouchers(userProfile);
    } catch (error) {
      console.error("Lỗi API Cập nhật Voucher:", error);
      showAlert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi cập nhật!",
        "error",
      );
    }
  };
  const handleDelete = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa voucher này không?", async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/vouchers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert("Xóa voucher thành công!", "success");
        fetchVouchers(userProfile);
      } catch (error) {
        console.error("Lỗi khi xóa voucher:", error);
        showAlert("Không thể xóa voucher!", "error");
      }
    });
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans">
      <VoucherHeader
        userProfile={userProfile}
        onOpenModal={() => setIsAddModalOpen(true)}
      />

      <VoucherSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={() => fetchVouchers(userProfile)}
        loading={loading}
      />

      <VoucherTable
        vouchers={filteredVouchers}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onView={handleOpenDetail}
      />

      <AddVoucherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        products={products}
      />

      <EditVoucherModal
        isOpen={isEditModalOpen}
        editingVoucher={editingVoucher}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleEditSubmit}
        products={products}
      />

      <ConfirmModal
        confirmModal={confirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <VoucherDetailModal
        isOpen={isDetailModalOpen}
        voucher={viewingVoucher}
        products={products}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingVoucher(null);
        }}
      />

      <AlertModal
        alertModal={alertModal}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ManagerVoucher;