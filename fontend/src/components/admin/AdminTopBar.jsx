import React from "react";
import { Search, Bell, Moon, ChevronDown } from "lucide-react";

const AdminTopBar = ({ title }) => {
  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-2xl font-black tracking-tight text-gray-900">
        {title}
      </h2>

      <div className="flex items-center gap-8">
        <div className="relative hidden xl:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="w-80 bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-3 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl transition-all">
            <Moon className="w-5 h-5" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-gray-100"></div>

        <button className="flex items-center gap-4 group">
          <div className="text-right">
            <p className="text-sm font-black text-gray-900 leading-none">
              Nguyễn Hiếu
            </p>
            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">
              Super Admin
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-transparent group-hover:border-blue-600 transition-all"
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default AdminTopBar;
