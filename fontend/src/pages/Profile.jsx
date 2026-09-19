import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 🟢 Import useParams và useNavigate
import authService from "../services/auth";
import api from "../services/api";

// Import các component con
import Sidebar from "../components/Profile/Sidebar";
import OrderHistory from "../components/Profile/OrderHistory";
import UserVouchers from "../components/Profile/UserVouchers";
import Wishlist from "../components/Profile/Wishlist";
import AddressList from "../components/Profile/AddressList";
import AccountSettings from "../components/Profile/AccountSettings";

const Profile = () => {
  const user = authService.getUser();
  const { tab } = useParams(); // 🟢 Lấy giá trị tab từ URL (ví dụ: /profile/orders)
  const navigate = useNavigate(); // 🟢 Hook điều hướng URL

  // Danh sách các tab hợp lệ
  const validTabs = ["orders", "vouchers", "wishlist", "address", "account"];

  // Xác định tab active từ URL, nếu URL không trùng tab nào thì mặc định là "orders"
  const active = validTabs.includes(tab) ? tab : "orders";

  // Hàm chuyển tab -> Chuyển hướng URL thay vì dùng useState
  const setActive = (newTab) => {
    navigate(`/profile/${newTab}`);
  };

  const [orders, setOrders] = useState([]);
  const [boughtProducts, setBoughtProducts] = useState([]);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: "",
  });

  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    return `http://localhost:3000/api/images/${avatarPath}`;
  };

  useEffect(() => {
    api
      .get("/users/profile")
      .then(({ data }) => {
        const u = data?.data;
        if (u) {
          const formattedAvatar = formatAvatarUrl(u.avatar);
          setProfile({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            avatar: formattedAvatar,
          });

          const updatedLocalUser = {
            ...user,
            name: u.name || "",
            phone: u.phone || "",
            avatar: u.avatar || "",
          };
          localStorage.setItem("user", JSON.stringify(updatedLocalUser));
          window.dispatchEvent(new Event("userUpdated"));
        }
      })
      .catch(() => {});

    api
      .get("/orders", { params: { user_id: user?.id } })
      .then(({ data }) => {
        const orderList = data?.data || [];
        setOrders(orderList);

        const products = [];
        orderList.forEach((order) => {
          (order.order_detail || []).forEach((detail) => {
            if (
              detail.products &&
              !products.find((p) => p.id === detail.products.id)
            ) {
              products.push(detail.products);
            }
          });
        });
        setBoughtProducts(products);
      })
      .catch(() => setOrders([]));
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-slate-50/60 relative overflow-hidden font-sans text-slate-800">
      {/* 🌟 Vùng trang trí nền hiệu ứng Ambient Blur */}
      <div className="absolute top-10 left-[-5%] w-[40%] aspect-square rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-[-5%] w-[35%] aspect-square rounded-full bg-indigo-200/25 blur-[120px] pointer-events-none" />

      {/* Main Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Sidebar Navigation Container */}
          <aside className="w-full lg:w-80 shrink-0 sticky top-24">
            <Sidebar profile={profile} active={active} setActive={setActive} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)] transition-all duration-300">
              {active === "orders" && (
                <div className="animate-fadeIn">
                  <OrderHistory
                    orders={orders}
                    setOrders={setOrders}
                    user={user}
                  />
                </div>
              )}

              {/* Render danh sách voucher */}
              {active === "vouchers" && (
                <div className="animate-fadeIn">
                  <UserVouchers />
                </div>
              )}

              {active === "wishlist" && (
                <div className="animate-fadeIn">
                  <Wishlist boughtProducts={boughtProducts} />
                </div>
              )}

              {active === "address" && (
                <div className="animate-fadeIn">
                  <AddressList orders={orders} />
                </div>
              )}

              {active === "account" && (
                <div className="animate-fadeIn">
                  <AccountSettings
                    profile={profile}
                    setProfile={setProfile}
                    user={user}
                    formatAvatarUrl={formatAvatarUrl}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
