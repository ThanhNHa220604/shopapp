import React, { useState } from "react";
import { Filter, ChevronDown, Grid, List, Search } from "lucide-react";

const Category = () => {
  const [view, setView] = useState("grid");
  const products = Array(9).fill({
    name: "iPhone 15 Pro Max",
    price: 28990000,
    category: "Smartphones",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop",
    tag: "Bán chạy",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                <Filter className="w-4 h-4" /> Bộ lọc
              </h3>
              <button className="text-[10px] font-bold text-blue-600 uppercase">
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="font-bold text-sm mb-6 flex items-center justify-between">
                  Khoảng giá <ChevronDown className="w-3 h-3" />
                </h4>
                <div className="space-y-4">
                  {["Dưới 10tr", "10tr - 25tr", "Trên 25tr"].map((range) => (
                    <label
                      key={range}
                      className="flex items-center gap-4 text-sm font-medium text-gray-500 cursor-pointer group"
                    >
                      <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-600 transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-sm scale-0 group-has-[:checked]:scale-100 transition-transform"></div>
                      </div>
                      <input type="checkbox" className="hidden" />
                      {range}
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="font-bold text-sm mb-6 flex items-center justify-between">
                  Thương hiệu <ChevronDown className="w-3 h-3" />
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Tìm hãng..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs"
                  />
                </div>
              </section>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-gray-100 gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Smartphones
              </h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                Hiển thị 124 sản phẩm phù hợp
              </p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md ${view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md ${view === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button className="flex-1 md:flex-none flex items-center justify-between gap-4 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-900 transition-all">
                Sắp xếp: Mới nhất <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((p, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-[#f3f4f5] rounded-3xl overflow-hidden mb-6 relative">
                  {p.tag && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider z-10 shadow-sm">
                      {p.tag}
                    </span>
                  )}
                  <img
                    src={p.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <button className="absolute bottom-6 left-6 right-6 bg-white py-4 rounded-2xl font-bold text-xs opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:bg-gray-900 hover:text-white">
                    Thêm vào giỏ hàng
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {p.category}
                  </p>
                  <p className="font-black text-xl pt-2 text-blue-600">
                    {p.price.toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;
