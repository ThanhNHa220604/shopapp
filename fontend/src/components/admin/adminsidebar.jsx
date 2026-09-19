import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  Newspaper, Settings, LogOut, ExternalLink 
} from 'lucide-react';

const AdminSidebar = ({ activeTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
    { id: 'products', label: 'Sản phẩm', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'customers', label: 'Khách hàng', icon: Users, path: '/admin/customers' },
    { id: 'news', label: 'Tin tức', icon: Newspaper, path: '/admin/news' },
    { id: 'settings', label: 'Cấu hình', icon: Settings, path: '/admin/settings' },
    { id: 'chats', label: 'Chat', icon: Settings, path: '/admin/chats' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
          TM
        </div>
        <div>
          <h1 className="font-black text-gray-900 leading-none">Admin</h1>
          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Console v2.0</p>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/10' 
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-600'}`} />
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
          <ExternalLink className="w-4 h-4" />
          Xem cửa hàng
        </button>
        <button className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group">
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-sm font-bold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

