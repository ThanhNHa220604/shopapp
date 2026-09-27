import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { appendProductAndExportExcel } from "../../utils/Exportproductsexcel";
import {
  parseRevenueDate,
  isDeliveredOrder,
  getOrderAmount,
} from "../../utils/orderUtils";

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

export const formatRevenue = (num) => {
  if (!num || isNaN(num) || num === 0) return "0đ";
  return `${Number(num).toLocaleString("vi-VN")}đ`;
};
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string")
    return "https://placehold.co/600x400?text=Khong+Co+Anh";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  return `${IMAGE_BASE_URL}${imagePath}`;
};

export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const getTabFromPath = () => {
    const path = location.pathname.replace("/admin/", "").replace("/admin", "");
    return path || "dashboard";
  };

  const [activeTab, setActiveTabState] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTabState(getTabFromPath());
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (tab === "dashboard") navigate("/admin");
    else navigate(`/admin/${tab}`);
  };

  // State Profile, Products & Orders
  const [userProfile, setUserProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // State Phân Trang Sản Phẩm
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(16);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Delete State
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // State Xem/Sửa chi tiết sản phẩm
  const [editProduct, setEditProduct] = useState(null);
  const [isFullDetailMode, setIsFullDetailMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    image: "",
    price: "",
    oldprice: "",
    quanity: "0",
    description: "",
    specification: "",
    brand_id: "",
    brand_input: "",
    category_id: "",
    category_input: "",
  });
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantValues, setVariantValues] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Stats State
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    revenueGrowth: 0,
    activeStores: 0,
    newOrders: 0,
    orderGrowth: 0,
    newUsers: 0,
    userGrowth: 0,
    userGroups: 0,
    completionRate: 0,
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const calculateGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/users/profile").catch(() => null);
      if (res?.data) {
        const userData = res.data?.data || res.data;
        setUserProfile(userData);
        return userData;
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin Profile:", err);
    }
    return null;
  };

  const fetchDashboardStats = async (currentUserId) => {
    const userId = currentUserId || userProfile?.id;
    if (!userId) return;

    setLoadingStats(true);
    try {
      const [ordersRes, usersRes, storesRes] = await Promise.all([
        api.get(`/orders?manager_id=${userId}`).catch(() => ({ data: [] })),
        api.get("/users").catch(() => ({ data: [] })),
        api.get("/stores").catch(() => ({ data: [] })),
      ]);

      const rawOrdersArray = ordersRes.data?.data || ordersRes.data || [];
      const userList = usersRes.data?.data || usersRes.data || [];
      const storeList = storesRes.data?.data || storesRes.data || [];

      const orderList = rawOrdersArray.filter((order) => {
        if (order.manager_id || order.seller_id) {
          return String(order.manager_id || order.seller_id) === String(userId);
        }
        return true;
      });

      setOrders(orderList);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      let thisMonthRevenue = 0,
        lastMonthRevenue = 0;
      let thisMonthOrdersCount = 0,
        lastMonthOrdersCount = 0;
      let completedOrdersCount = 0;

      let backlogCount = 0,
        inProgressCount = 0,
        reviewCount = 0,
        doneCount = 0;

      orderList.forEach((order) => {
        const isDelivered = isDeliveredOrder(order);
        const revenueDate =
          parseRevenueDate(order) || new Date(order.createdAt || Date.now());
        const amount = getOrderAmount(order);
        const statusStr = String(
          order.status || order.order_status || "",
        ).toLowerCase();

        // Chỉ cộng doanh thu nếu đơn hàng ĐÃ HOÀN THÀNH / ĐÃ GIAO (Status = 4)
        if (isDelivered) {
          doneCount++;
          completedOrdersCount++;

          if (
            revenueDate.getMonth() === currentMonth &&
            revenueDate.getFullYear() === currentYear
          ) {
            thisMonthRevenue += amount;
          } else if (
            revenueDate.getMonth() === prevMonth &&
            revenueDate.getFullYear() === prevYear
          ) {
            lastMonthRevenue += amount;
          }
        }

        // Đếm tổng số đơn phát sinh trong tháng
        if (
          revenueDate.getMonth() === currentMonth &&
          revenueDate.getFullYear() === currentYear
        ) {
          thisMonthOrdersCount += 1;
        } else if (
          revenueDate.getMonth() === prevMonth &&
          revenueDate.getFullYear() === prevYear
        ) {
          lastMonthOrdersCount += 1;
        }

        // Thống kê phân bổ theo biểu đồ tròn
        if (statusStr === "1" || statusStr.includes("pending")) backlogCount++;
        else if (
          statusStr === "2" ||
          statusStr === "3" ||
          statusStr.includes("processing") ||
          statusStr.includes("shipped")
        )
          inProgressCount++;
        else if (
          statusStr === "5" ||
          statusStr.includes("cancel") ||
          statusStr.includes("refund")
        )
          reviewCount++;
      });

      setPieData([
        { name: "Tồn đọng", value: backlogCount, color: "#f59e0b" },
        { name: "Đang làm", value: inProgressCount, color: "#8b5cf6" },
        { name: "Đã hủy", value: reviewCount, color: "#ef4444" },
        { name: "Hoàn thành", value: doneCount, color: "#10b981" },
      ]);

      setStats({
        monthlyRevenue: thisMonthRevenue,
        revenueGrowth: calculateGrowthPercentage(
          thisMonthRevenue,
          lastMonthRevenue,
        ),
        activeStores: storeList.length > 0 ? storeList.length : 1,
        newOrders: thisMonthOrdersCount,
        orderGrowth: calculateGrowthPercentage(
          thisMonthOrdersCount,
          lastMonthOrdersCount,
        ),
        newUsers: userList.length,
        userGrowth: 0,
        userGroups: 1,
        completionRate:
          orderList.length > 0
            ? Math.round((completedOrdersCount / orderList.length) * 100)
            : 0,
      });
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAllSystemProducts = (
    page = currentPage,
    search = productSearch,
  ) => {
    setLoadingProducts(true);
    api
      .get(
        `/products?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
      )
      .then((res) => {
        const responseData = res.data;

        const list =
          responseData?.data ||
          responseData?.products ||
          responseData?.items ||
          (Array.isArray(responseData) ? responseData : []);

        const total =
          responseData?.total ??
          responseData?.totalItems ??
          responseData?.totalProducts ??
          responseData?.count ??
          responseData?.pagination?.total ??
          responseData?.pagination?.totalItems ??
          list.length;

        const pages =
          responseData?.totalPages ??
          responseData?.pagination?.totalPages ??
          Math.max(1, Math.ceil(total / pageSize));

        setProducts(list);
        setTotalProducts(total);
        setTotalPages(pages);
      })
      .catch((err) => {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      })
      .finally(() => setLoadingProducts(false));
  };

  const fetchMyOrders = () => {
    if (!userProfile?.id) return;
    setLoadingOrders(true);
    api
      .get(`/orders?manager_id=${userProfile.id}`)
      .then((res) => setOrders(res.data?.data || res.data || []))
      .catch((err) => console.error("Lỗi tải đơn hàng:", err))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    fetchUserProfile().then((userData) => {
      if (userData?.id) fetchDashboardStats(userData.id);
    });
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get("/brands?pageSize=1000&limit=1000").catch(() => null),
          api.get("/categories?pageSize=1000&limit=1000").catch(() => null),
        ]);
        const normalize = (res) => {
          if (!res) return [];
          const d = res.data;
          if (Array.isArray(d)) return d;
          if (Array.isArray(d?.data)) return d.data;
          if (Array.isArray(d?.brands)) return d.brands;
          if (Array.isArray(d?.categories)) return d.categories;
          return [];
        };
        setBrands(normalize(brandRes));
        setCategories(normalize(catRes));
      } catch (err) {
        console.error("Lỗi tải brands/categories:", err);
      }
    };
    fetchMetadata();
  }, []);

  const openFullMode = async (product, readOnlyMode) => {
    setDetailError("");
    setIsReadOnly(readOnlyMode);
    setEditProduct(product);

    try {
      const res = await api.get(`/products/${product.id}`);
      const prod = res.data?.data || res.data || product;

      // 🌟 Nạp thẳng category_id/brand_id từ sản phẩm, ĐỒNG THỜI nạp cả
      // category_input/brand_input (chữ hiển thị trong ô nhập của
      // ProductDetailForm.jsx) — trước đây chỉ nạp mỗi ID nên ô nhập
      // luôn hiện trống trơn, và mỗi lần lưu lại gửi đúng ID cũ dù
      // người dùng đã chọn category/brand khác trên giao diện.
      const currentBrand = brands.find(
        (b) => Number(b.id) === Number(prod.brand_id),
      );
      const currentCategory = categories.find(
        (c) => Number(c.id) === Number(prod.category_id),
      );

      setEditForm({
        name: prod.name || "",
        image: prod.image || "",
        price: prod.price ? String(prod.price) : "",
        oldprice: prod.oldprice ? String(prod.oldprice) : "",
        quanity: prod.quanity ? String(prod.quanity) : "0",
        description: prod.description || prod.desc || "",
        specification: prod.specification || "",
        brand_id: prod.brand_id != null ? String(prod.brand_id) : "",
        brand_input: currentBrand ? currentBrand.name : prod.brand_name || "",
        category_id: prod.category_id != null ? String(prod.category_id) : "",
        category_input: currentCategory
          ? currentCategory.name
          : prod.category_name || "",
      });

      const rawProductAttributes =
        prod.ProductAttributes ||
        prod.product_attributes ||
        prod.attributes ||
        [];
      setAttributes(
        Array.isArray(rawProductAttributes)
          ? rawProductAttributes.map((attr) => ({
              name: attr.Attribute?.name || attr.name || "",
              value: attr.value || "",
            }))
          : [],
      );

      const rawVariantValues =
        prod.product_variant_values ||
        prod.variant_values ||
        prod.variants ||
        [];
      if (Array.isArray(rawVariantValues)) {
        setVariantValues(
          rawVariantValues.map((v) => {
            let combi = [];
            if (Array.isArray(v.variant_combination)) {
              combi = v.variant_combination;
            } else if (Array.isArray(v.values)) {
              combi = v.values;
            } else if (v.sku) {
              combi = v.sku.split("-");
            }
            if (combi.length === 0) combi = ["Mặc định"];

            return {
              variant_combination: combi,
              price: v.price ? String(v.price) : String(prod.price || 0),
              old_price:
                v.old_price || v.oldprice
                  ? String(v.old_price || v.oldprice)
                  : "",
              stock: String(v.stock !== undefined ? v.stock : v.quanity || 0),
              sku: v.sku || "",
              image_url: v.image_url || v.image || null,
            };
          }),
        );
      } else {
        setVariantValues([]);
      }

      setVariants([]);
      setIsFullDetailMode(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      alert("Không thể tải toàn bộ dữ liệu từ Database.");
    }
  };

  const closeFullMode = () => {
    setIsFullDetailMode(false);
    setEditProduct(null);
  };

  const uploadImageToServer = async (file) => {
    if (!file) return "";
    try {
      const formData = new FormData();
      formData.append("images", file);

      const uploadRes = await api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileName = uploadRes.data?.files?.[0];
      if (fileName) {
        return `http://localhost:5000/uploads/${fileName}`;
      }
      return "";
    } catch (err) {
      console.error("Lỗi upload ảnh biến thể:", err);
      return "";
    }
  };

  const confirmSuccessModal = () => {
    setSuccessModal({ open: false, message: "" });
    closeFullMode();
    fetchAllSystemProducts(currentPage, productSearch);
  };

  const handleSaveProduct = async () => {
    setDetailError("");
    setSaving(true);
    try {
      // 🌟 category_id/brand_id đến thẳng từ dropdown (khi người dùng
      // CHỌN 1 mục có sẵn) — luôn là ID thật đã tồn tại trong DB.
      // Nếu rỗng (người dùng tự gõ tên khác, ProductDetailForm.jsx đã
      // xóa ID cũ) thì mới thử khớp theo tên / tạo mới, y hệt logic ở
      // Products.jsx, để 2 nơi luôn nhất quán.
      let finalBrandId = editForm.brand_id ? Number(editForm.brand_id) : null;
      let finalCategoryId = editForm.category_id
        ? Number(editForm.category_id)
        : null;

      const cleanedBrandInput = (editForm.brand_input || "").trim();
      const cleanedCategoryInput = (editForm.category_input || "").trim();

      if (!finalBrandId && cleanedBrandInput) {
        const matchedBrand = brands.find(
          (b) =>
            (b.name || "").trim().toLowerCase() ===
            cleanedBrandInput.toLowerCase(),
        );
        if (matchedBrand) {
          finalBrandId = Number(matchedBrand.id);
        } else {
          const newBrandRes = await api.post("/brands", {
            name: cleanedBrandInput,
          });
          finalBrandId = Number(
            newBrandRes.data?.id || newBrandRes.data?.data?.id,
          );
          setBrands((prev) => [
            ...prev,
            { id: finalBrandId, name: cleanedBrandInput },
          ]);
        }
      }

      if (!finalCategoryId && cleanedCategoryInput) {
        const matchedCategory = categories.find(
          (c) =>
            (c.name || "").trim().toLowerCase() ===
            cleanedCategoryInput.toLowerCase(),
        );
        if (matchedCategory) {
          finalCategoryId = Number(matchedCategory.id);
        } else {
          const newCatRes = await api.post("/categories", {
            name: cleanedCategoryInput,
          });
          finalCategoryId = Number(
            newCatRes.data?.id || newCatRes.data?.data?.id,
          );
          setCategories((prev) => [
            ...prev,
            { id: finalCategoryId, name: cleanedCategoryInput },
          ]);
        }
      }

      const formattedVariants = variants
        .filter((v) => v.name && v.name.trim() !== "")
        .map((v) => ({
          name: v.name.trim(),
          values:
            Array.isArray(v.tags) && v.tags.length > 0 ? v.tags : ["Mặc định"],
        }));

      const formattedVariantValues = await Promise.all(
        variantValues.map(async (vv) => {
          let finalImageUrl = vv.image_url || null;
          if (vv.imageFile) {
            const uploaded = await uploadImageToServer(vv.imageFile);
            finalImageUrl = uploaded || null;
          }

          return {
            variant_combination: Array.isArray(vv.variant_combination)
              ? vv.variant_combination
              : [vv.variant_combination],
            price: Number(vv.price) || 0,
            old_price: vv.old_price ? Number(vv.old_price) : null,
            stock: Number(vv.stock) || 0,
            image_url: finalImageUrl,
          };
        }),
      );

      const body = {
        name: editForm.name,
        image: editForm.image,
        price: editForm.price ? Number(editForm.price) : 0,
        oldprice: editForm.oldprice ? Number(editForm.oldprice) : null,
        quanity: Number(editForm.quanity) || 0,
        description: editForm.description,
        specification: editForm.specification,
        attributes: attributes.filter(
          (attr) => attr.name.trim() && attr.value.trim(),
        ),
        variants: formattedVariants,
        variant_values: formattedVariantValues,
        brand_id: finalBrandId,
        category_id: finalCategoryId,
        user_id: userProfile?.id,
      };

      await api.put(`/products/${editProduct.id}`, body);
      setSuccessModal({
        open: true,
        message: "Cập nhật sản phẩm thành công!",
      });
      // 🌟 Cập nhật cũng ghi lại vào Excel, không chỉ riêng lúc tạo mới.
      // Excel cần TÊN (chữ) chứ không phải ID số, nên tra lại tên thật
      // từ danh sách brands/categories đã tải trước khi ghi ra file —
      // nếu không, Exportproductsexcel.js sẽ fallback về ghi thẳng
      // brand_id/category_id (số) vì `body` không có brand_name/
      // category_name.
      const finalBrandName =
        brands.find((b) => Number(b.id) === Number(finalBrandId))?.name || "";
      const finalCategoryName =
        categories.find((c) => Number(c.id) === Number(finalCategoryId))
          ?.name || "";

      appendProductAndExportExcel(
        { ...body, brand_name: finalBrandName, category_name: finalCategoryName },
        formattedVariantValues,
      );
    } catch (err) {
      setDetailError(
        err.response?.data?.error || err.message || "Lưu dữ liệu thất bại.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products" || activeTab === "my-products") {
      setCurrentPage(1);
      fetchAllSystemProducts(1, productSearch);
    }
  }, [productSearch]);

  useEffect(() => {
    if (activeTab === "products" || activeTab === "my-products") {
      fetchAllSystemProducts(currentPage, productSearch);
    }
    if (activeTab === "orders") fetchMyOrders();
  }, [activeTab, currentPage]);

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteProduct.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setDeleteProduct(null);
    } catch (err) {
      alert(
        "Lỗi khi xóa sản phẩm: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const myProducts = products.filter(
    (p) => String(p.user_id || p.manager_id) === String(userProfile?.id),
  );

  const pendingCount = orders.filter(
    (o) =>
      String(o.status) === "1" ||
      String(o.status).toLowerCase().includes("pending"),
  ).length;

  return {
    activeTab,
    setActiveTab,
    userProfile,
    products,
    myProducts,
    orders,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalProducts,
    loadingProducts,
    loadingOrders,
    loadingStats,
    productSearch,
    setProductSearch,
    orderSearch,
    setOrderSearch,
    deleteProduct,
    setDeleteProduct,
    deleting,
    stats,
    weeklyData,
    pieData,
    pendingCount,
    handleDeleteProduct,
    handleLogout,
    openFullMode,
    closeFullMode,
    isFullDetailMode,
    isReadOnly,
    successModal,
    confirmSuccessModal,
    editForm,
    setEditForm,
    attributes,
    setAttributes,
    variants,
    setVariants,
    variantValues,
    setVariantValues,
    brands,
    categories,
    saving,
    detailError,
    handleSaveProduct,
  };
};