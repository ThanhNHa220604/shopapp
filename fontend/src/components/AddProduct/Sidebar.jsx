//Rút gọn phần điều hướng danh mục quản trị bên trái.
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, LogOut } from "lucide-react";

const Sidebar = ({ navItems, currentPath }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 shrink-0">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#1B2559]">
            TechManager
          </span>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-gray-400 hover:bg-[#F4F7FE] hover:text-[#1B2559]"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Đăng xuất
      </button>
    </aside>
  );
};

export default Sidebar;