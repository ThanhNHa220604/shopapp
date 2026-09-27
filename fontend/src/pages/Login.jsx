import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import authService from "../services/auth";

/* ---------------------------------------------------------
   FadeInUp — scroll/mount reveal wrapper used across Plety.
   Slides content up from translate-y-10/opacity-0 to rest
   over 1000ms, matching the landing page's reveal system.
--------------------------------------------------------- */
const FadeInUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ---------------------------------------------------------
   Plety logo — minimal geometric stroke mark, Untitled-UI-ish
--------------------------------------------------------- */
const PletyLogo = ({ className = "w-7 h-7" }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 3L28 10V22L16 29L4 22V10L16 3Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 3V16M16 16L28 10M16 16L4 10M16 16V29"
      stroke="white"
      strokeWidth="1.5"
      strokeOpacity="0.4"
      strokeLinejoin="round"
    />
  </svg>
);

const inputBase =
  "w-full bg-[#141416] border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30 focus:bg-[#18181B] transition-colors";

const Field = ({ icon: Icon, label, right, children }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {right}
    </div>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      {children}
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(form);

      // auth.js đã lưu role vào localStorage — đọc từ đó
      const role = authService.getRole();

      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "manager":
          navigate("/manager/products");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* ambient background gradient, quiet — the boldness stays on the card */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black via-black to-black" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] -z-10 bg-white/[0.03] blur-[120px] rounded-full" />

      <FadeInUp className="w-full max-w-md">
        {/* Logo + badge */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <PletyLogo />
            <span className="text-lg font-medium tracking-tight">Plety</span>
          </Link>
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-sm">
            ✨ Chào mừng trở lại
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-medium tracking-tight text-center mb-3">
          Đăng nhập với{" "}
          <span className="font-serif italic font-normal">rõ ràng.</span>
        </h1>
        <p className="text-[16px] text-gray-400 text-center max-w-sm mx-auto mb-10">
          Nhập thông tin tài khoản để tiếp tục truy cập không gian làm việc
          của bạn.
        </p>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0C0C0D] border border-white/10 rounded-3xl p-8 space-y-4"
        >
          <Field icon={Mail} label="Email">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ban@congty.com"
              required
              className={inputBase}
            />
          </Field>

          <Field
            icon={Lock}
            label="Mật khẩu"
            right={
              <button
                type="button"
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Quên mật khẩu?
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={inputBase}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </Field>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-200 disabled:opacity-60 text-black text-sm font-medium px-5 py-3 rounded-full transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">Hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#141416] border border-white/10 hover:bg-[#1C1C1E] rounded-xl py-3 text-sm font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#141416] border border-white/10 hover:bg-[#1C1C1E] rounded-xl py-3 text-sm font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
              </svg>
              Facebook
            </button>
          </div>

          <Link
            to="/register"
            className="w-full flex items-center justify-center bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-3 rounded-full border border-white/5 transition-colors"
          >
            Tạo tài khoản mới
          </Link>
        </form>

        <p className="text-center text-xs text-gray-500 mt-8">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Link to="/about" className="text-gray-300 hover:text-white underline underline-offset-2 transition-colors">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link to="/policy" className="text-gray-300 hover:text-white underline underline-offset-2 transition-colors">
            Chính sách bảo mật
          </Link>{" "}
          của Plety.
        </p>
      </FadeInUp>
    </div>
  );
};

export default Login;