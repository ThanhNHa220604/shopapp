import React, { useState, useRef } from "react";
import {
  User,
  Edit2,
  X,
  Camera,
  UploadCloud,
  Save,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const AccountSettings = ({ profile, setProfile, user, formatAvatarUrl }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState({ ...profile, avatarPreview: "" });

  // State quản lý hiển thị Modal xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Chỉ hỗ trợ các định dạng file ảnh định dạng PNG, JPG, JPEG!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      avatar: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const mockEvent = { target: { files: [file] } };
      handleFileChange(mockEvent);
    }
  };

  // Mở modal xác nhận trước khi lưu
  const handleOpenConfirmModal = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Hàm lưu dữ liệu thực sự
  const handleSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setSaveMsg("");
    try {
      let updatedAvatar =
        typeof form.avatar === "string" ? form.avatar : user?.avatar || "";

      if (form.avatar instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("images", form.avatar);

        const uploadRes = await api.post("/images/upload", imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const uploadedFiles = uploadRes.data?.files;
        if (uploadedFiles && uploadedFiles.length > 0) {
          updatedAvatar = uploadedFiles[0];
        }
      }

      const updateProfileData = {
        name: form.name,
        phone: form.phone,
        avatar: updatedAvatar,
      };

      const { data } = await api.put(`/users/${user?.id}`, updateProfileData);
      const rawDbAvatar = data?.data?.avatar || updatedAvatar;
      const finalAvatarUrl = formatAvatarUrl(rawDbAvatar);

      const updated = {
        ...user,
        name: form.name,
        phone: form.phone,
        avatar: rawDbAvatar,
      };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userUpdated"));

      setProfile({
        ...profile,
        name: form.name,
        phone: form.phone,
        avatar: finalAvatarUrl,
      });
      setSaveMsg("Lưu thành công!");
      setIsEditing(false);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || "Lưu thất bại, thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({ ...profile, avatarPreview: "" });
    setSaveMsg("");
    setIsEditing(false);
  };

  return (
    <>
      {/* 🌟 Phần Header đã bổ sung mb-8 để tách xa khỏi khối bên dưới */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
          Thông tin tài khoản
        </h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-md shadow-blue-500/20"
          >
            <Edit2 className="w-4 h-4" /> Chỉnh sửa
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-[32px] space-y-6 shadow-sm">
        {!isEditing ? (
          <>
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {profile.name || "—"}
                </p>
                <p className="text-slate-400 text-sm">{profile.email}</p>
              </div>
            </div>
            {[
              { label: "Họ và tên", value: profile.name || "—" },
              { label: "Email", value: profile.email || "—" },
              {
                label: "Số điện thoại",
                value: profile.phone || "Chưa cập nhật",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm text-slate-400 font-medium">
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {row.value}
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">
                Chỉnh sửa thông tin
              </p>
              <button
                onClick={handleCancelEdit}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="block text-sm font-semibold text-slate-700">
                Ảnh đại diện tài khoản
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border-2 border-dashed border-slate-200 relative">
                  {form.avatarPreview ? (
                    <img
                      src={form.avatarPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : form.avatar && typeof form.avatar === "string" ? (
                    <img
                      src={form.avatar}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-7 h-7 text-slate-300" />
                  )}
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer text-center group"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2" />
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                    Bấm hoặc Kéo thả file ảnh tại đây
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Hỗ trợ các định dạng PNG, JPG, JPEG (Tối đa 2MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                Email không thể thay đổi.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0901 234 567"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 transition-colors"
              />
            </div>

            {saveMsg && (
              <p
                className={`text-sm font-medium ${
                  saveMsg.includes("thành công")
                    ? "text-emerald-600"
                    : "text-rose-500"
                }`}
              >
                {saveMsg}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleOpenConfirmModal}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                <Save className="w-4 h-4" />{" "}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL XÁC NHẬN LƯU THÔNG TIN THAY ĐỔI */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Xác nhận thay đổi</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-3">
              <p className="text-sm text-slate-600 font-medium">
                Bạn có chắc chắn muốn cập nhật lại thông tin cá nhân của mình?
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">
                    Họ và tên:
                  </span>
                  <span className="font-bold text-slate-800">
                    {form.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">
                    Số điện thoại:
                  </span>
                  <span className="font-bold text-slate-800">
                    {form.phone || "—"}
                  </span>
                </div>
                {form.avatarPreview && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-500">
                      Ảnh đại diện mới:
                    </span>
                    <span className="text-emerald-600 font-bold">
                      Đã tải lên ảnh mới
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 text-sm transition-colors"
              >
                Xem lại
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSettings;
