import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, Search, FileSpreadsheet, Check } from "lucide-react";
import api from "../../services/api";
import axiosOriginal from "axios";

// Import các sub-components quản lý sản phẩm
import ProductStats from "../../components/ManagerProduct/ProductStats";
import ProductTable from "../../components/ManagerProduct/ProductTable";
import ProductDetailForm from "../../components/ManagerProduct/ProductDetailForm";
import DeleteModal from "../../components/ManagerProduct/DeleteModal";
import SuccessModal from "../../components/AddProduct/Successmodal";
import {
  appendProductAndExportExcel,
  chooseExcelFile,
  getChosenExcelFileInfo,
} from "../../utils/Exportproductsexcel";

// ⚠️ ĐÂY LÀ DỮ LIỆU, KHÔNG PHẢI CHỮ GIAO DIỆN — tuyệt đối KHÔNG dịch bằng
// i18n. Giá trị này được lưu xuống database (variant_combination / values).
// Nếu dịch theo ngôn ngữ, cùng một biến thể sẽ bị lưu thành "Mặc định" ở
// tiếng Việt nhưng "Default" ở tiếng Anh. Khi hiển thị ra màn hình, Google
// Translate sẽ tự dịch nó như mọi nội dung động khác.
const DEFAULT_VARIANT_VALUE = "Mặc định";

const ManagerProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // State quản lý danh sách sản phẩm & bộ lọc
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🌟 Trạng thái file Excel đang dùng làm "sổ ghi chép" (File System Access API)
  const [excelFileInfo, setExcelFileInfo] = useState(null); // { name, granted } | null

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewAll, setIsViewAll] = useState(false);
  const itemsPerPage = 15;

  // Điều hướng Modal & View chi tiết sâu
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isFullDetailMode, setIsFullDetailMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Form dữ liệu lõi
  const [editForm, setEditForm] = useState({
    name: "",
    image: "",
    price: "",
    oldprice: "",
    quanity: "0",
    description: "",
    specification: "",
    brand_input: "",
    brand_id: "",
    category_input: "",
    category_id: "",
  });

  // State phụ trợ
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantValues, setVariantValues] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // 🌟 Modal thông báo khi cập nhật sản phẩm thành công, thay cho alert()
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  // Thông tin User từ localStorage
  const savedUser = localStorage.getItem("user");
  const savedRole = localStorage.getItem("role");

  let parsedUser = { name: "Manager" };
  try {
    if (savedUser) {
      parsedUser = savedUser.startsWith("{")
        ? JSON.parse(savedUser)
        : { name: savedUser };
    }
  } catch (e) {
    console.error(e);
  }

  // Khởi chạy lấy dữ liệu metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get("/brands?pageSize=1000&limit=1000"),
          api.get("/categories?pageSize=1000&limit=1000"),
        ]);
        setBrands(normalizeDataList(brandRes));
        setCategories(normalizeDataList(catRes));
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetadata();
  }, []);

  // 🌟 Kiểm tra xem đã có file Excel nào được chọn từ trước hay chưa
  // (giữ nguyên qua các lần tải lại trang, nhờ IndexedDB lưu handle)
  useEffect(() => {
    getChosenExcelFileInfo().then((info) => setExcelFileInfo(info));
  }, []);

  const handleChooseExcelFile = async () => {
    const result = await chooseExcelFile();
    if (result.success) {
      setExcelFileInfo({ name: result.fileName, granted: true });
    } else if (!result.cancelled) {
      // Trình duyệt không hỗ trợ hoặc có lỗi khác -> báo cho người dùng biết
      setError(
        result.message || result.error || t("products.excelPickError"),
      );
    }
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const currentUserId =
        parsedUser?.id ||
        parsedUser?.userId ||
        (savedUser && !isNaN(savedUser) ? savedUser : null);
      const currentRole = savedRole ? savedRole.toLowerCase() : "";

      let url = "/products?pageSize=200&limit=200";
      if (
        (currentRole === "manager" || currentRole === "quản lý") &&
        currentUserId
      ) {
        url += `&user_id=${currentUserId}`;
      }

      const { data } = await api.get(url);
      setProducts(
        Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [location.key]);

  // Đồng bộ số lượng tổng kho dựa trên biến thể
  useEffect(() => {
    if (variantValues.length > 0) {
      const totalStock = variantValues.reduce(
        (sum, item) => sum + (Number(item.stock) || 0),
        0,
      );
      setEditForm((prev) => ({ ...prev, quanity: String(totalStock) }));
    }
  }, [variantValues]);

  const normalizeDataList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.brands)) return res.data.brands;
    if (res.data && Array.isArray(res.data.categories))
      return res.data.categories;
    return [];
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Mở chế độ xem/sửa chi tiết sâu
  const openFullMode = async (product, readOnlyMode) => {
    setError("");
    setIsReadOnly(readOnlyMode);
    setEditProduct(product);

    try {
      const res = await api.get(`/products/${product.id}`);
      const prod = res.data?.data || res.data || product;

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
        brand_input: currentBrand ? currentBrand.name : prod.brand_name || "",
        brand_id: currentBrand ? String(currentBrand.id) : "",
        category_input: currentCategory
          ? currentCategory.name
          : prod.category_name || "",
        category_id: currentCategory ? String(currentCategory.id) : "",
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
              // 🌟 SỬA LỖI: KHÔNG được .slice(1) ở đây — làm vậy sẽ cắt
              // mất phần tử đầu tiên (Kích thước) trong sku dạng
              // "128GB-Đen", chỉ còn lại phần màu. Giữ nguyên toàn bộ
              // mảng sau khi tách để có đủ cả size lẫn color.
              combi = v.sku.split("-");
            }
            if (combi.length === 0) combi = [DEFAULT_VARIANT_VALUE];

            return {
              variant_combination: combi,
              price: v.price ? String(v.price) : String(prod.price || 0),
              old_price:
                v.old_price || v.oldprice
                  ? String(v.old_price || v.oldprice)
                  : "",
              stock: String(v.stock !== undefined ? v.stock : v.quanity || 0),
              // 🌟 THÊM: giữ lại sku và ảnh riêng của biến thể — trước
              // đây bị bỏ sót hoàn toàn khi map dữ liệu, khiến
              // ProductDetailForm không có gì để hiển thị ảnh.
              sku: v.sku || "",
              image_url: v.image_url || v.image || null,
            };
          }),
        );
      }

      const rawVariants =
        prod.product_variants || prod.productVariants || prod.variants || [];
      if (Array.isArray(rawVariants) && rawVariants.length > 0) {
        setVariants(
          rawVariants.map((v) => ({
            name: v.name || "",
            tags: Array.isArray(v.values) ? v.values : [],
          })),
        );
      } else {
        setVariants([]);
      }

      setIsFullDetailMode(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      alert(t("products.loadDetailError"));
    }
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

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const authConfig = getAuthConfig();
      let finalBrandId = editForm.brand_id ? Number(editForm.brand_id) : null;
      let finalCategoryId = editForm.category_id
        ? Number(editForm.category_id)
        : null;

      const cleanedBrandInput = editForm.brand_input.trim();
      const cleanedCategoryInput = editForm.category_input.trim();

      // 🌟 CHỈ khi người dùng KHÔNG chọn từ dropdown (đã tự gõ tên khác,
      // nên brand_id/category_id bị ProductDetailForm.jsx xóa về rỗng)
      // mới thử khớp lại theo tên / tạo mới. Nếu đã có sẵn ID (do chọn
      // từ danh sách) thì dùng thẳng ID đó, không đụng gì tới việc
      // tạo mới category/brand nữa — đây chính là chỗ trước đây luôn
      // tạo trùng dù người dùng đã chọn đúng 1 mục có sẵn.
      if (!finalBrandId && cleanedBrandInput) {
        const matchedBrand = brands.find(
          (b) =>
            b.name.trim().toLowerCase() === cleanedBrandInput.toLowerCase(),
        );
        if (matchedBrand) {
          finalBrandId = Number(matchedBrand.id);
        } else {
          const newBrandRes = await api.post(
            "/brands",
            { name: cleanedBrandInput },
            authConfig,
          );
          finalBrandId = Number(
            newBrandRes.data?.id || newBrandRes.data?.data?.id,
          );
          // Cập nhật ngay vào state để lần sau không tạo trùng nữa.
          setBrands((prev) => [
            ...prev,
            { id: finalBrandId, name: cleanedBrandInput },
          ]);
        }
      }

      if (!finalCategoryId && cleanedCategoryInput) {
        const matchedCategory = categories.find(
          (c) =>
            c.name.trim().toLowerCase() === cleanedCategoryInput.toLowerCase(),
        );
        if (matchedCategory) {
          finalCategoryId = Number(matchedCategory.id);
        } else {
          const newCatRes = await api.post(
            "/categories",
            { name: cleanedCategoryInput },
            authConfig,
          );
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
            Array.isArray(v.tags) && v.tags.length > 0
              ? v.tags
              : [DEFAULT_VARIANT_VALUE],
        }));

      // 🌟 SỬA LỖI MẤT ẢNH: với mỗi biến thể, nếu vừa chọn file ảnh mới
      // (imageFile) thì upload nó lên server để lấy URL thật; nếu không
      // có file mới thì giữ nguyên image_url cũ đã có sẵn. Trước đây
      // bước này hoàn toàn không tồn tại, nên field image_url luôn bị
      // bỏ trống khi gửi lên backend — kể cả với ảnh chưa từng đổi.
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

      const currentUserId =
        parsedUser?.id ||
        parsedUser?.userId ||
        (savedUser && !isNaN(savedUser) ? Number(savedUser) : null);

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
        user_id: currentUserId,
      };

      await api.put(`/products/${editProduct.id}`, body, authConfig);
      setSuccessModal({
        open: true,
        message: t("products.saveSuccess"),
      });
      // 🌟 Cập nhật cũng ghi lại vào Excel, không chỉ riêng lúc tạo mới.
      // Tra lại TÊN thật của brand/category (thay vì chỉ gửi ID số) để
      // Exportproductsexcel.js ghi đúng chữ vào cột Thương hiệu/Danh
      // mục, thay vì fallback về ghi ID.
      const finalBrandName =
        brands.find((b) => Number(b.id) === Number(finalBrandId))?.name || "";
      const finalCategoryName =
        categories.find((c) => Number(c.id) === Number(finalCategoryId))
          ?.name || "";

      const excelResult = await appendProductAndExportExcel(
        {
          ...body,
          brand_name: finalBrandName,
          category_name: finalCategoryName,
        },
        formattedVariantValues,
      );
      if (!excelResult.success) {
        console.error("Ghi Excel thất bại:", excelResult.error);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || t("products.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteProduct.id}`, getAuthConfig());
      await fetchProducts();
      setDeleteProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || t("products.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search || search.trim() === "") return true;
    return p.name?.toLowerCase().includes(search.trim().toLowerCase());
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = isViewAll
    ? filteredProducts
    : filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  // ── CHẾ ĐỘ XEM CHI TIẾT SÂU / CHỈNH SỬA SẢN PHẨM ───────────────────────────
  if (isFullDetailMode) {
    return (
      <div className="w-full max-w-[1600px] mx-auto text-slate-100 font-sans antialiased">
        <ProductDetailForm
          isReadOnly={isReadOnly}
          saving={saving}
          error={error}
          editForm={editForm}
          setEditForm={setEditForm}
          attributes={attributes}
          setAttributes={setAttributes}
          variants={variants}
          setVariants={setVariants}
          variantValues={variantValues}
          setVariantValues={setVariantValues}
          brands={brands}
          categories={categories}
          onBack={() => setIsFullDetailMode(false)}
          onSave={handleSave}
        />
        <SuccessModal
          open={successModal.open}
          message={successModal.message}
          onConfirm={() => {
            setSuccessModal({ open: false, message: "" });
            setIsFullDetailMode(false);
            fetchProducts();
          }}
        />
      </div>
    );
  }

  // ── GIAO DIỆN DANH SÁCH SẢN PHẨM CHÍNH ──────────────────────────────────────
  return (
    <div className="w-full space-y-7 max-w-[1600px] mx-auto text-slate-100 font-sans antialiased">
      {/* HEADER TRANG SẢN PHẨM & TÌM KIẾM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Chữ cố định -> i18n lo. translate="no" để Google Translate KHÔNG
            dịch chồng lên (nó chỉ nên dịch dữ liệu động: tên/mô tả sản phẩm...) */}
        <div translate="no" className="notranslate">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              {t("products.title")}
            </span>
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1.5 opacity-90 tracking-wide">
            {t("products.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🌟 Trạng thái / nút chọn file Excel dùng làm sổ ghi chép duy nhất */}
          <button
            type="button"
            onClick={handleChooseExcelFile}
            title={
              excelFileInfo?.name
                ? t("products.excelActiveTitle", {
                    name: excelFileInfo.name,
                    // tên file có thể chứa & < > -> không để i18next escape
                    interpolation: { escapeValue: false },
                  })
                : t("products.excelChooseTitle")
            }
            // Cả nút gồm chữ i18n + tên file thật của người dùng -> đều không
            // được dịch. Việc này cũng tránh Google Translate bọc <font> vào
            // text node mà React đang quản lý (gây lỗi removeChild khi đổi tên file).
            translate="no"
            className={`notranslate flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all ${
              excelFileInfo?.name
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-[#181a26] border-slate-700/80 text-slate-300 hover:border-orange-500"
            }`}
          >
            {excelFileInfo?.name ? (
              <Check className="w-4 h-4" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span className="max-w-[160px] truncate">
              {excelFileInfo?.name || t("products.chooseExcel")}
            </span>
          </button>

          {/* Thanh tìm kiếm đã làm nổi bật */}
          <div className="relative w-72 md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input
              type="text"
              placeholder={t("products.searchPlaceholder")}
              translate="no"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#181a26] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-slate-600 transition-all shadow-md shadow-black/40"
            />
          </div>
        </div>
      </div>

      {/* STATS & BẢNG SẢN PHẨM */}
      <ProductStats filteredProducts={filteredProducts} />
      <ProductTable
        loading={loading}
        currentItems={currentItems}
        isViewAll={isViewAll}
        setIsViewAll={setIsViewAll}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        openFullMode={openFullMode}
        setDeleteProduct={setDeleteProduct}
      />

      {/* POPUP XÓA SẢN PHẨM */}
      <DeleteModal
        deleteProduct={deleteProduct}
        deleting={deleting}
        onCancel={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ManagerProducts;