import { useState, useEffect } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

import api from "../../services/api";
import authService from "../../services/auth";
import { UserAvatar } from "../../components/AdminUser/UserAvatar";
import { UserStats } from "../../components/AdminUser/UserStats";
import { UserActionButtons } from "../../components/AdminUser/UserActionButtons";
import { ConfirmModal } from "../../components/AdminUser/ConfirmModal";

const ROLE_MAP = {
  3: { label: "Super Admin", class: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  2: { label: "Manager", class: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  1: { label: "User", class: "bg-slate-700/50 text-slate-300 border border-slate-600/30" },
};

const ROLE_TABS = [
  { label: "Tất cả khách hàng", value: "" },
  { label: "Quản trị viên", value: "3" },
  { label: "Quản lý", value: "2" },
  { label: "Người dùng", value: "1" },
  { label: "Đã vô hiệu hóa", value: "disabled" },
];

const avatarColors = [
  "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  "bg-teal-500/20 text-teal-400 border border-teal-500/30",
  "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  "bg-pink-500/20 text-pink-400 border border-pink-500/30",
  "bg-green-500/20 text-green-400 border border-green-500/30",
];

const AdminUsers = () => {
  const adminUser = authService.getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("");
  const [currentPage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ newUsersToday: 0, activeUsers: 0 });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm",
    variant: "warning",
    onConfirm: null,
  });

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const showAlert = (title, message, variant = "info") => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "alert",
      variant,
      onConfirm: closeModal,
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, [currentPage, roleTab]);

  const checkIsDisabled = (u) => {
    return Boolean(
      u.isDeleted || u.is_deleted || u.status === "disabled" || u.status === "inactive" || u.status === 0 || u.status === "0" || u.isBlocked === true || u.is_blocked === true || u.is_blocked === 1 || u.is_active === false || u.is_active === 0
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (roleTab === "disabled") params.status = "disabled";
      else if (roleTab) params.role = roleTab;

      const { data } = await api.get("/users", { params });
      setUsers(data?.data || []);
      setTotal(data?.pagination?.total || 0);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get("/users/dashboard-stats");
      setStats({
        newUsersToday: data?.data?.newUsersToday || 0,
        activeUsers: data?.data?.activeUsers || 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDisableUser = (user) => {
    setModalConfig({
      isOpen: true,
      title: "Vô hiệu hóa tài khoản",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${user.name}"?`,
      type: "confirm",
      variant: "danger",
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/users/${user.id}`);
          fetchUsers();
          fetchDashboardStats();
          showAlert("Thành công", "Đã vô hiệu hóa tài khoản!", "info");
        } catch (err) {
          showAlert("Lỗi", err.response?.data?.message || "Không thể vô hiệu hóa tài khoản", "danger");
        }
      },
    });
  };

  const handleEnableUser = (user) => {
    setModalConfig({
      isOpen: true,
      title: "Bỏ vô hiệu hóa tài khoản",
      message: `Bạn có chắc chắn muốn bỏ vô hiệu hóa tài khoản "${user.name}"?`,
      type: "confirm",
      variant: "info",
      onConfirm: async () => {
        closeModal();
        try {
          await api.patch(`/users/${user.id}/role`, { role: user.role, isBlocked: false, status: "active" });
          fetchUsers();
          fetchDashboardStats();
          showAlert("Thành công", "Đã bỏ vô hiệu hóa tài khoản!", "info");
        } catch (err) {
          showAlert("Lỗi", err.response?.data?.message || "Khôi phục tài khoản thất bại", "danger");
        }
      },
    });
  };

  const handleHardDeleteUser = (user) => {
    setModalConfig({
      isOpen: true,
      title: "Xóa vĩnh viễn tài khoản",
      message: `Hành động này KHÔNG THỂ KHÔI PHỤC. Bạn có chắc chắn muốn XÓA HẲN tài khoản "${user.name}"?`,
      type: "confirm",
      variant: "danger",
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/users/${user.id}`, { params: { permanent: true } });
          fetchUsers();
          fetchDashboardStats();
          showAlert("Thành công", "Đã xóa vĩnh viễn tài khoản!", "info");
        } catch (err) {
          showAlert("Lỗi", err.response?.data?.message || "Không thể xóa vĩnh viễn tài khoản", "danger");
        }
      },
    });
  };

  const handleRoleUpgrade = (user) => {
    if (user.role >= 2) {
      showAlert("Thông báo", "Mức tối đa là Manager.", "warning");
      return;
    }
    setModalConfig({
      isOpen: true,
      title: "Xác nhận nâng quyền",
      message: `Bạn có muốn nâng "${user.name}" lên vị trí Manager?`,
      type: "confirm",
      variant: "warning",
      onConfirm: async () => {
        closeModal();
        try {
          await api.patch(`/users/${user.id}/role`, { role: user.role + 1 });
          fetchUsers();
          fetchDashboardStats();
          showAlert("Thành công", "Nâng quyền thành công!", "info");
        } catch (err) {
          showAlert("Lỗi", err.response?.data?.message || "Nâng quyền thất bại", "danger");
        }
      },
    });
  };

  const handleRoleDowngrade = (user) => {
    if (user.role <= 1 || user.role === 3) {
      showAlert("Thông báo", "Không thể hạ quyền tài khoản này.", "warning");
      return;
    }
    setModalConfig({
      isOpen: true,
      title: "Xác nhận hạ quyền",
      message: `Hạ "${user.name}" xuống User?`,
      type: "confirm",
      variant: "warning",
      onConfirm: async () => {
        closeModal();
        try {
          await api.patch(`/users/${user.id}/role`, { role: user.role - 1 });
          fetchUsers();
          fetchDashboardStats();
          showAlert("Thành công", "Hạ quyền thành công!", "info");
        } catch (err) {
          showAlert("Lỗi", err.response?.data?.message || "Hạ quyền thất bại", "danger");
        }
      },
    });
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.phone || "").includes(search)
  );

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Quản lý Khách hàng</h2>
          <p className="text-slate-200 text-sm mt-1">Theo dõi hành vi mua sắm và quản lý quyền lợi khách hàng.</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm khách hàng..."
          className="w-full sm:w-[300px] h-[46px] rounded-2xl border border-white/10 bg-[#181a26] px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all"
        />
      </div>

      <UserStats total={total} newUsersToday={stats.newUsersToday} activeUsers={stats.activeUsers} />

      <div className="bg-[#181a26] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setRoleTab(tab.value);
                  setPage(1);
                }}
                className={`text-sm font-bold pb-2 border-b-2 transition-all whitespace-nowrap ${
                  roleTab === tab.value ? "border-amber-400 text-amber-400" : "border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-extrabold text-slate-300 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-300 uppercase tracking-wider">Thông tin liên hệ</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-300 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-300 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-300 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-300 text-sm">Đang tải dữ liệu...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Không tìm thấy người dùng nào</td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const colorClass = avatarColors[i % avatarColors.length];
                  const roleInfo = ROLE_MAP[user.role] || { label: "User", class: "bg-slate-700/50 text-slate-200 border border-slate-600/30" };
                  const isDisabled = checkIsDisabled(user);

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <UserAvatar user={user} colorClass={colorClass} />
                          <div>
                            <p className="font-bold text-sm text-white">{user.name}</p>
                            <p className="text-slate-300 text-xs mt-0.5">ID: #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-100">{user.email}</p>
                        <p className="text-slate-300 text-xs mt-0.5">{user.phone || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleInfo.class}`}>{roleInfo.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDisabled || roleTab === "disabled" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                          {isDisabled || roleTab === "disabled" ? "Đã vô hiệu hóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <UserActionButtons
                          user={user}
                          adminUser={adminUser}
                          roleTab={roleTab}
                          isDisabled={isDisabled}
                          onEnable={handleEnableUser}
                          onHardDelete={handleHardDeleteUser}
                          onUpgrade={handleRoleUpgrade}
                          onDowngrade={handleRoleDowngrade}
                          onDisable={handleDisableUser}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal modalConfig={modalConfig} closeModal={closeModal} />
    </div>
  );
};

export default AdminUsers;