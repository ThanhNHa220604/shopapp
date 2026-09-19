import React, { useEffect, useState, useCallback } from "react";
import { RotateCcw, Search, PackageX, Loader2 } from "lucide-react";

const API_BASE = "/api";

const DeletedProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState("");

  const fetchDeletedProducts = useCallback(async (searchValue = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/products/deleted?search=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm đã xóa");
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedProducts();
  }, [fetchDeletedProducts]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDeletedProducts(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchDeletedProducts]);

  // Hàm xử lý Khôi phục sản phẩm
  const handleRestore = async (id) => {
    if (restoringId) return;
    setRestoringId(id);
    try {
      const res = await fetch(`${API_BASE}/products/${id}/restore`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) throw new Error("Khôi phục sản phẩm thất bại");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
            Sản phẩm đã xóa
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sản phẩm ở đây đã bị ẩn khỏi trang bán hàng.
          </p>
        </div>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="w-full bg-[#181a26]/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-900/40 bg-rose-950/20 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Đang tải...
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <PackageX className="w-10 h-10 mb-3 stroke-[1.5]" />
          <p className="text-sm">Không có sản phẩm nào đã bị ẩn</p>
        </div>
      ) : (
        <div className="bg-[#181a26]/80 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 font-black">Sản phẩm</th>
                <th className="px-6 py-3.5 font-black">Danh mục</th>
                <th className="px-6 py-3.5 font-black">Thương hiệu</th>
                <th className="px-6 py-3.5 font-black text-right">Giá</th>
                <th className="px-6 py-3.5 font-black text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isRestoring = restoringId === p.id;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 last:border-0 text-slate-300"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-[#0d0f17] shrink-0"
                        />
                      )}
                      <span className="font-bold text-white">{p.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {p.brand?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      {Number(p.price || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Button Khôi phục dạng pill với chữ và icon */}
                      <button
                        type="button"
                        onClick={() => handleRestore(p.id)}
                        disabled={isRestoring}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 transition ${
                          isRestoring ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        {isRestoring ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        Khôi phục
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeletedProducts;