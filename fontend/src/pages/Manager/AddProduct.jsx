import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import api from "../../services/api"; // Lùi 2 cấp để vào src/services/api

// Import các component con
import BasicInfoForm from "../../components/AddProduct/BasicInfoForm";
import ProductVariants from "../../components/AddProduct/ProductVariants";
import ProductSpecsTable from "../../components/AddProduct/ProductSpecsTable";
import OrganizationForm from "../../components/AddProduct/OrganizationForm";
import SuccessModal from "../../components/AddProduct/Successmodal";
import {
  appendProductAndExportExcel,
  backupExportedProductsLog,
  restoreExportedProductsLog,
  chooseExcelFile,
  getChosenExcelFileInfo,
} from "../../utils/Exportproductsexcel";

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editProductId = location.state?.productId || null;

  const [categories, setCategories] = useState([]);
  const [suggestedBrands, setSuggestedBrands] = useState([]);

  const [categoryInput, setCategoryInput] = useState("");
  const [brandInput, setBrandInput] = useState("");

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  // File image gốc
  const [imageFile, setImageFile] = useState(null);
  const [localImagePreview, setLocalImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const backupRestoreInputRef = useRef(null);

  // 🌟 Đọc file .json người dùng chọn và khôi phục lại lịch sử tích
  // lũy sản phẩm đã backup trước đó.
  const handleRestoreFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = restoreExportedProductsLog(
        event.target.result,
        "merge", // nối vào dữ liệu hiện có, không xóa mất dữ liệu mới hơn
      );
      if (result.success) {
        alert(
          `Khôi phục thành công! Hiện có ${result.count} sản phẩm trong lịch sử.`,
        );
      } else {
        alert(result.error || "Khôi phục thất bại, kiểm tra lại file backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset để chọn lại cùng file vẫn trigger được
  };

  const handleBackupClick = () => {
    const result = backupExportedProductsLog();
    if (!result.success) {
      alert(result.message || "Không có dữ liệu để sao lưu.");
    }
  };

  // 🌟 Chọn (hoặc tạo mới) 1 file .xlsx duy nhất để từ giờ mọi lần
  // "Lưu & Xuất bản"/"Cập nhật" sẽ tự động ghi thêm vào ĐÚNG file này,
  // thay vì tải về 1 file mới mỗi lần.
  const [chosenExcelFile, setChosenExcelFile] = useState(null);

  useEffect(() => {
    getChosenExcelFileInfo().then((info) => {
      if (info) setChosenExcelFile(info);
    });
  }, []);

  const handleChooseExcelFile = async () => {
    // Bắt buộc gọi trực tiếp trong onClick (user gesture), không được
    // đặt sau bất kỳ await nào khác trước đó.
    const result = await chooseExcelFile();
    if (result.success) {
      setChosenExcelFile({ name: result.fileName, granted: true });
      alert(
        `Đã chọn file "${result.fileName}" — từ giờ mọi lần lưu sẽ tự động ghi vào đúng file này.`,
      );
    } else if (!result.cancelled) {
      alert(result.message || result.error || "Không thể chọn file.");
    }
  };

  const categoryContainerRef = useRef(null);
  const brandContainerRef = useRef(null);

  const [addForm, setAddForm] = useState({
    name: "",
    price: "",
    oldprice: "",
    quanity: 0,
    image: "",
    desc: "",
    specification: "",
  });

  const [variants, setVariants] = useState([
    {
      size: "",
      color: "",
      price: "",
      old_price: "",
      stock: "0",
      imageFile: null,
      localImagePreview: null,
      subVariants: [],
    },
  ]);
  const [specifications, setSpecifications] = useState([]);

  // 🌟 Modal thông báo khi thêm/cập nhật sản phẩm thành công,
  // thay cho window.alert() mặc định của trình duyệt.
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryContainerRef.current &&
        !categoryContainerRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        brandContainerRef.current &&
        !brandContainerRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));

    api
      .get("/products")
      .then((res) => {
        let rawProducts = [];
        if (Array.isArray(res.data?.data?.products)) {
          rawProducts = res.data.data.products;
        } else if (Array.isArray(res.data?.data)) {
          rawProducts = res.data.data;
        } else if (Array.isArray(res.data)) {
          rawProducts = res.data;
        }

        if (rawProducts.length > 0) {
          const brands = rawProducts
            .map((p) => {
              const b = p.brand_name || p.brand || p.brandName || "";
              if (b && typeof b === "object") {
                return b.name || b.label || "";
              }
              return b;
            })
            .filter((name) => name && String(name).trim() !== "")
            .map((name) => String(name).trim());

          const uniqueBrands = [...new Set(brands)];
          setSuggestedBrands(uniqueBrands);
        } else {
          setSuggestedBrands([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách sản phẩm cào Brand:", err);
        setSuggestedBrands([]);
      });
  }, []);

  useEffect(() => {
    if (!editProductId) return;

    api
      .get(`/products/${editProductId}`)
      .then((res) => {
        const prod = res.data?.data || res.data;
        if (prod) {
          setAddForm({
            name: prod.name || "",
            price: prod.price || "",
            oldprice: prod.oldprice || "",
            quanity: prod.quanity || 0,
            image: prod.image || "",
            desc: prod.description || prod.desc || "",
            specification: prod.specification || "",
          });

          if (prod.image) {
            setLocalImagePreview(prod.image);
          }

          const bVal = prod.brand_name || prod.brand || prod.brandName || "";
          if (bVal && typeof bVal === "object") {
            setBrandInput(bVal.name || bVal.label || "");
          } else {
            setBrandInput(String(bVal));
          }

          if (prod.category_id && categories.length > 0) {
            const matchedCat = categories.find(
              (c) => String(c.id) === String(prod.category_id),
            );
            if (matchedCat) setCategoryInput(matchedCat.name);
          }

          if (Array.isArray(prod.variants)) {
            setVariants(
              prod.variants.map((v) => {
                let sizeVal = v.size || "";
                let colorVal = v.color || "";
                if (Array.isArray(v.values)) {
                  sizeVal = v.values[0] || "";
                  colorVal = v.values[1] || "";
                }
                return {
                  size: sizeVal,
                  color: colorVal,
                  price: String(v.price || prod.price || ""),
                  old_price: String(v.old_price || prod.oldprice || ""),
                  stock: String(v.stock || v.quanity || 0),
                  imageFile: null,
                  localImagePreview: v.image_url || null,
                  subVariants: [],
                };
              }),
            );
          }

          if (Array.isArray(prod.specifications)) {
            setSpecifications(
              prod.specifications.map((s) => ({
                id: s.id || null,
                key: s.key || s.name || "",
                value: s.value || "",
              })),
            );
          }
        }
      })
      .catch((err) => console.error("Lỗi chi tiết sản phẩm:", err));
  }, [editProductId, categories]);

  useEffect(() => {
    let totalStock = 0;
    variants.forEach((v) => {
      totalStock += parseInt(v.stock, 10) || 0;
      if (v.subVariants && v.subVariants.length > 0) {
        v.subVariants.forEach((sub) => {
          totalStock += parseInt(sub.stock, 10) || 0;
        });
      }
    });
    setAddForm((f) => ({ ...f, quanity: totalStock }));
  }, [variants]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setLocalImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setLocalImagePreview(null);
    setAddForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...variants];
      updated[index].imageFile = file;
      updated[index].localImagePreview = URL.createObjectURL(file);
      setVariants(updated);
    }
  };

  const handleRemoveVariantImage = (index) => {
    const updated = [...variants];
    updated[index].imageFile = null;
    updated[index].localImagePreview = null;
    setVariants(updated);
  };

  const handleSubVariantImageChange = (parentIndex, subIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...variants];
      updated[parentIndex].subVariants[subIndex].imageFile = file;
      updated[parentIndex].subVariants[subIndex].localImagePreview =
        URL.createObjectURL(file);
      setVariants(updated);
    }
  };

  const handleRemoveSubVariantImage = (parentIndex, subIndex) => {
    const updated = [...variants];
    updated[parentIndex].subVariants[subIndex].imageFile = null;
    updated[parentIndex].subVariants[subIndex].localImagePreview = null;
    setVariants(updated);
  };

  const handleAddNewVariantRow = () => {
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        price: addForm.price || "",
        old_price: addForm.oldprice || "",
        stock: "0",
        imageFile: null,
        localImagePreview: null,
        subVariants: [],
      },
    ]);
  };

  const handleAddSubVariantRow = (parentIndex) => {
    const updated = [...variants];
    if (!updated[parentIndex].subVariants) {
      updated[parentIndex].subVariants = [];
    }
    updated[parentIndex].subVariants.push({
      color: "",
      stock: "0",
      price: updated[parentIndex].price || addForm.price || "",
      old_price: updated[parentIndex].old_price || addForm.oldprice || "",
      imageFile: null,
      localImagePreview: null,
    });
    setVariants(updated);
  };

  const handleRemoveVariantRow = (indexToRemove) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleRemoveSubVariantRow = (parentIndex, subIndexToRemove) => {
    const updated = [...variants];
    updated[parentIndex].subVariants = updated[parentIndex].subVariants.filter(
      (_, idx) => idx !== subIndexToRemove,
    );
    setVariants(updated);
  };

  const handleUpdateVariantInList = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleUpdateSubVariantInList = (
    parentIndex,
    subIndex,
    field,
    value,
  ) => {
    const updated = [...variants];
    updated[parentIndex].subVariants[subIndex][field] = value;
    setVariants(updated);
  };

  const handleAddNewSpecRow = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (indexToRemove) => {
    setSpecifications(specifications.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateSpecInList = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const resolveCategoryId = async () => {
    const text = categoryInput.trim();
    if (!text) return null;

    const matched = categories.find(
      (c) => c.name.toLowerCase() === text.toLowerCase(),
    );
    if (matched) return matched.id;

    try {
      const res = await api.post("/categories", { name: text });
      const newCategory = res.data?.data || res.data;
      if (newCategory?.id) {
        // Cập nhật ngay vào state để lần sau không tạo trùng nữa
        setCategories((prev) => [...prev, newCategory]);
        return newCategory.id;
      }
      return null;
    } catch (err) {
      // Nếu lỗi do trùng tên (category đã tồn tại ở server nhưng state FE chưa có),
      // fetch lại danh sách rồi tìm lại thay vì báo lỗi luôn
      try {
        const refetch = await api.get("/categories");
        const list = Array.isArray(refetch.data?.data)
          ? refetch.data.data
          : Array.isArray(refetch.data)
            ? refetch.data
            : [];
        setCategories(list);
        const found = list.find(
          (c) => c.name.toLowerCase() === text.toLowerCase(),
        );
        if (found) return found.id;
      } catch (refetchErr) {
        console.error("Lỗi refetch danh mục:", refetchErr);
      }
      console.error("Lỗi tạo danh mục mới:", err);
      return null;
    }
  };

  const resolveBrandName = async () => {
    const text = brandInput.trim();
    if (!text) return null;

    const isExisting = suggestedBrands.some(
      (b) => b.toLowerCase() === text.toLowerCase(),
    );
    if (!isExisting) {
      try {
        await api.post("/brands", { name: text }).catch(() => {});
      } catch (err) {
        console.error("Lỗi gửi thương hiệu mới:", err);
      }
    }
    return text;
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
      console.error("Lỗi upload file:", err);
      return "";
    }
  };

  const handleSaveProduct = async () => {
    if (!addForm.name.trim()) return alert("Vui lòng nhập tên sản phẩm.");
    if (!addForm.price) return alert("Vui lòng nhập giá sản phẩm.");

    const finalCategoryId = await resolveCategoryId();
    if (!finalCategoryId) return alert("Vui lòng nhập Danh mục ngành hàng.");

    const finalBrandName = await resolveBrandName();
    if (!finalBrandName) return alert("Vui lòng nhập Thương hiệu.");

    let uploadedImageUrl = addForm.image;
    if (imageFile) {
      uploadedImageUrl = await uploadImageToServer(imageFile);
      if (!uploadedImageUrl) {
        return alert("Tải ảnh chính lên thiết bị thất bại, vui lòng thử lại.");
      }
    }

    if (!uploadedImageUrl && !editProductId) {
      return alert("Vui lòng chọn hình ảnh sản phẩm chính.");
    }

    const storedUser = localStorage.getItem("user");
    let currentUserId = null;

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        currentUserId = parsed.id || parsed.user_id || parsed.userId;
      } catch (e) {
        if (!isNaN(storedUser)) {
          currentUserId = Number(storedUser);
        }
      }
    }

    const finalVariantsArray = [];
    const finalVariantValuesArray = [];

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const parentSize = v.size ? String(v.size).trim() : "";
      const parentColor = v.color ? String(v.color).trim() : "";

      let vImageUrl =
        v.localImagePreview && !v.imageFile ? v.localImagePreview : "";
      if (v.imageFile) {
        vImageUrl = await uploadImageToServer(v.imageFile);
      }

      finalVariantsArray.push({
        name:
          [parentSize, parentColor].filter(Boolean).join(" - ") || "Mặc định",
        values:
          [parentSize, parentColor].filter(Boolean).length > 0
            ? [parentSize, parentColor]
            : ["Mặc định"],
      });

      finalVariantValuesArray.push({
        variant_combination:
          [parentSize, parentColor].filter(Boolean).length > 0
            ? [parentSize, parentColor]
            : ["Mặc định"],
        price: v.price ? parseFloat(v.price) : parseFloat(addForm.price),
        old_price: v.old_price ? parseFloat(v.old_price) : null,
        stock: parseInt(v.stock, 10) || 0,
        image_url: vImageUrl || null,
      });

      if (v.subVariants && v.subVariants.length > 0) {
        for (let j = 0; j < v.subVariants.length; j++) {
          const sub = v.subVariants[j];
          const subColor = sub.color ? String(sub.color).trim() : "";

          let subImageUrl =
            sub.localImagePreview && !sub.imageFile
              ? sub.localImagePreview
              : "";
          if (sub.imageFile) {
            subImageUrl = await uploadImageToServer(sub.imageFile);
          }

          finalVariantsArray.push({
            name:
              [parentSize, subColor].filter(Boolean).join(" - ") || "Mặc định",
            values:
              [parentSize, subColor].filter(Boolean).length > 0
                ? [parentSize, subColor]
                : ["Mặc định"],
          });

          finalVariantValuesArray.push({
            variant_combination:
              [parentSize, subColor].filter(Boolean).length > 0
                ? [parentSize, subColor]
                : ["Mặc định"],
            price: sub.price
              ? parseFloat(sub.price)
              : parseFloat(v.price || addForm.price),
            old_price: sub.old_price ? parseFloat(sub.old_price) : null,
            stock: parseInt(sub.stock, 10) || 0,
            image_url: subImageUrl || null,
          });
        }
      }
    }

    const payload = {
      name: addForm.name.trim(),
      price: parseFloat(addForm.price),
      oldprice: addForm.oldprice ? parseFloat(addForm.oldprice) : null,
      quanity: parseInt(addForm.quanity, 10) || 0,
      category_id: parseInt(finalCategoryId, 10),
      // 🌟 category_name chỉ dùng để ghi log Excel cho dễ đọc (cột
      // "Danh mục"), KHÔNG gửi lên backend nào dùng tới field này —
      // backend vẫn nhận đúng category_id ở trên như cũ. Lấy đúng tên
      // đã khớp/nhập trong resolveCategoryId() (categoryInput), tránh
      // để Excel fallback về ghi ID số như trước.
      category_name:
        categories.find((c) => Number(c.id) === Number(finalCategoryId))
          ?.name || categoryInput.trim(),
      image: uploadedImageUrl,
      description: addForm.desc.trim(),
      buyturn: 0,
      brand_name: finalBrandName,
      specification: addForm.specification.trim(),
      user_id: currentUserId ? parseInt(currentUserId, 10) : null,
      variants: finalVariantsArray,
      variant_values: finalVariantValuesArray,
      attributes: specifications.map((s) => ({
        name: s.key.trim(),
        value: s.value.trim(),
      })),
    };

    try {
      if (editProductId) {
        await api.put(`/products/${editProductId}`, payload);
        setSuccessModal({
          open: true,
          message: "Cập nhật sản phẩm thành công!",
        });
        // 🌟 Cập nhật cũng ghi lại vào Excel, không chỉ riêng lúc tạo mới
        appendProductAndExportExcel(payload, payload.variant_values);
      } else {
        await api.post("/products", payload);
        setSuccessModal({
          open: true,
          message: "Đăng sản phẩm thành công!",
        });
        // 🌟 Sau khi xuất bản thành công, tự động thêm sản phẩm này vào
        // danh sách tích lũy và tải về file Excel đầy đủ.
        appendProductAndExportExcel(payload, payload.variant_values);
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi lưu sản phẩm:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu sản phẩm.");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header riêng cho phần Đăng sản phẩm trong Admin */}
      <div className="flex items-center justify-between bg-[#111420] p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-base font-black text-white">
            {editProductId ? "Chỉnh sửa sản phẩm" : "Đăng sản phẩm mới"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Điền đầy đủ các thông tin chi tiết dưới đây để đưa sản phẩm lên hệ
            thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 🌟 Chọn 1 file .xlsx duy nhất để ghi trực tiếp vào (không
              tải file mới mỗi lần) — chỉ cần bấm 1 lần */}
          <button
            type="button"
            onClick={handleChooseExcelFile}
            title={
              chosenExcelFile
                ? `Đang ghi vào: ${chosenExcelFile.name}`
                : "Chọn file Excel để ghi trực tiếp (không tải file mới mỗi lần)"
            }
            className={`text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border transition-all ${
              chosenExcelFile
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>
              {chosenExcelFile ? chosenExcelFile.name : "Chọn file Excel"}
            </span>
          </button>

          {/* 🌟 Backup / Khôi phục lịch sử tích lũy sản phẩm (localStorage) */}
          <button
            type="button"
            onClick={handleBackupClick}
            title="Tải file backup lịch sử sản phẩm (.json)"
            className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
          <button
            type="button"
            onClick={() => backupRestoreInputRef.current?.click()}
            title="Khôi phục từ file backup (.json)"
            className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-white/10 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Khôi phục</span>
          </button>
          <input
            type="file"
            accept="application/json"
            ref={backupRestoreInputRef}
            className="hidden"
            onChange={handleRestoreFileSelected}
          />

          <button
            onClick={handleSaveProduct}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>
              {editProductId ? "Cập nhật sản phẩm" : "Lưu & Xuất bản"}
            </span>
          </button>
        </div>
      </div>

      {/* Nội dung chính Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Form thông tin cơ bản */}
          <BasicInfoForm
            addForm={addForm}
            setAddForm={setAddForm}
            localImagePreview={localImagePreview}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            fileInputRef={fileInputRef}
          />

          {/* Form quản lý biến thể */}
          <ProductVariants
            variants={variants}
            handleAddNewVariantRow={handleAddNewVariantRow}
            handleRemoveVariantRow={handleRemoveVariantRow}
            handleUpdateVariantInList={handleUpdateVariantInList}
            handleVariantImageChange={handleVariantImageChange}
            handleRemoveVariantImage={handleRemoveVariantImage}
            handleAddSubVariantRow={handleAddSubVariantRow}
            handleRemoveSubVariantRow={handleRemoveSubVariantRow}
            handleUpdateSubVariantInList={handleUpdateSubVariantInList}
            handleSubVariantImageChange={handleSubVariantImageChange}
            handleRemoveSubVariantImage={handleRemoveSubVariantImage}
          />

          {/* Bảng thông số kỹ thuật */}
          <ProductSpecsTable
            specifications={specifications}
            handleAddNewSpecRow={handleAddNewSpecRow}
            handleRemoveSpecRow={handleRemoveSpecRow}
            handleUpdateSpecInList={handleUpdateSpecInList}
          />
        </div>

        {/* Phân loại & Thương hiệu */}
        <OrganizationForm
          categoryInput={categoryInput}
          setCategoryInput={setCategoryInput}
          showCategoryDropdown={showCategoryDropdown}
          setShowCategoryDropdown={setShowCategoryDropdown}
          categories={categories}
          categoryContainerRef={categoryContainerRef}
          brandInput={brandInput}
          setBrandInput={setBrandInput}
          showBrandDropdown={showBrandDropdown}
          setShowBrandDropdown={setShowBrandDropdown}
          suggestedBrands={suggestedBrands}
          brandContainerRef={brandContainerRef}
          addForm={addForm}
          setAddForm={setAddForm}
        />
      </div>

      {/* 🌟 Modal thông báo thành công — tách riêng, dùng component chung */}
      <SuccessModal
        open={successModal.open}
        message={successModal.message}
        onConfirm={() => {
          setSuccessModal({ open: false, message: "" });
          navigate("/admin/products");
        }}
      />
    </div>
  );
};

export default AddProduct;
