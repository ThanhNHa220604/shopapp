import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./i18n";
import "./utils/fixGoogleTranslate";

import Header from "./components/header";
import Footer from "./components/footer";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import News from "./pages/new";
import OrderTracking from "./pages/OrderTracking";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Policies from "./pages/Policies";
import OrderSuccess from "./pages/OrderSuccess";
import Voucher from "./pages/VoucherManager"
import SettingPage from "./pages/Settings"



import GuidePage from "./pages/GuidePage";
import PrivacyPage from "./pages/PrivacyPage";
import ReturnsPage from "./pages/ReturnsPage";
import TermsPage from "./pages/TermsPage";
import WarrantyPage from "./pages/WarrantyPage";


import ImageSearchPage from "./components/search/ImageSearchPage";
import ManagerChat from "./components/ManagerChat/ManagerChat"

// Layout Manager
import ManagerLayout from "./components/ManagerLayout/ManagerLayout";

// Các trang Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminNews from "./pages/Admin/ManageNews";
import AdminBanners from "./pages/Admin/ManageBanners";
import AdminFlashSale from "./pages/Admin/ManageFlashSale";
import AdminUsers from "./pages/Admin/Users";



// Các trang Manager
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import ManagerProducts from "./pages/Manager/Products";
import AddProduct from "./pages/Manager/AddProduct";
import ManagerOrders from "./components/ManagerOrder/OrderTable";
import Deletedproduct from "./components/dashboard/Deletedproducts";
import authService from "./services/auth";
import Setting from "./services/setting";
// ─────────────────────────────────────────────
// Private Route Phân Quyền
// ─────────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const isAuth = authService.isAuthenticated();
  const role = authService.getRole();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────
// Layout Khách Hàng (User)
// ─────────────────────────────────────────────
const Layout = ({ children }) => {
  const location = useLocation();

  const isNoLayoutPage = [
    "/login",
    "/register",
    "/carts",
    "/checkout",
  ].includes(location.pathname);

  const isOrderTrackingPage = /^\/order-tracking\//.test(location.pathname);

  const isBackoffice =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/manager");

  const hideLayout = isNoLayoutPage || isOrderTrackingPage || isBackoffice;

  return (
    <>
      {!hideLayout && <Header />}
      <main className={!hideLayout ? "pt-14" : ""}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
};

// ─────────────────────────────────────────────
// App Component chính
// ─────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/policy" element={<Policies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/guide" element={<GuidePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/search-image" element={<ImageSearchPage />} />

          {/* User Authenticated Routes */}
          <Route
            path="/carts"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <Profile />
              </PrivateRoute>
            }
          />
          {/* 🟢 NHẬN ROUTE DẠNG /profile/:tab */}
          <Route
            path="/profile/:tab"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/order-tracking/:id"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <OrderTracking />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <PrivateRoute allowedRoles={["user", "admin", "manager"]}>
                <OrderSuccess />
              </PrivateRoute>
            }
          />

          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 🔴 CÁC ROUTE CHỈ DÀNH CHO ADMIN                                */}
          {/* ───────────────────────────────────────────────────────────── */}

          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 🟢 CÁC ROUTE DÀNH CHO MANAGER (VÀ ADMIN)                       */}
          {/* ───────────────────────────────────────────────────────────── */}
          <Route
            path="/manager"
            element={
              <PrivateRoute allowedRoles={["manager", "admin"]}>
                <ManagerLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="products" element={<ManagerProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="orders" element={<ManagerOrders />} />
            <Route path="vouchers" element={<Voucher />} />
            <Route path="chats" element={<ManagerChat />} />
            <Route path="deleted-products" element={<Deletedproduct />} />
            <Route path="settings" element={<SettingPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
