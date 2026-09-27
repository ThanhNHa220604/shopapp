import React, { useState, useEffect } from "react";
import {
  Eye,
  Star,
  Trash2,
  RefreshCw,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ProductFeedback from "../feedback";

const OrderHistory = ({ orders, setOrders, user }) => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(null); // { id, e } | null
  const [errorToast, setErrorToast] = useState("");

  // State quản lý phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const PAGE_SIZE = 5; // Số lượng đơn hàng mỗi trang

  // Gọi API lấy danh sách đơn hàng theo trang
  const fetchOrders = async (currentPage) => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get("/orders", {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          user_id: user?.id,
        },
      });

      // Trường hợp 1: Backend hỗ trợ phân trang chuẩn dạng { data: [...], totalPages: X }
      if (data?.data && Array.isArray(data.data)) {
        setOrders(data.data);
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        } else if (data.totalItems || data.total) {
          const total = data.totalItems || data.total;
          setTotalPages(Math.ceil(total / PAGE_SIZE));
        } else {
          setTotalPages(1);
        }
      }
      // Trường hợp 2: Backend trả về 1 mảng toàn bộ đơn hàng (Phân trang Client-side)
      else if (Array.isArray(data)) {
        const total = data.length;
        setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);

        // Cắt mảng lấy đúng 5 đơn hàng cho trang hiện tại
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const paginatedOrders = data.slice(startIndex, startIndex + PAGE_SIZE);
        setOrders(paginatedOrders);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders(page);
    }
  }, [page, user?.id]);

  useEffect(() => {
    if (!errorToast) return;
    const timer = setTimeout(() => setErrorToast(""), 4000);
    return () => clearTimeout(timer);
  }, [errorToast]);

  // Mã status được xem là "Đã hủy": 5 (đồng bộ với backend RESTOCK_STATUSES)
  const CANCELLED_STATUSES = [5];
  const isCancelledStatus = (s) => CANCELLED_STATUSES.includes(Number(s));

  // Nhãn trạng thái đơn hàng (Đã chuẩn hóa đồng bộ với Manager)
  const statusLabel = (s) =>
    ({
      1: "Chờ xử lý",
      2: "Đã duyệt",
      3: "Đang giao",
      4: "Hoàn thành",
      5: "Đã hủy",
    })[Number(s)] || "Đang xử lý";

  // Màu sắc badge trạng thái
  const statusBg = (s) =>
    ({
      1: "bg-amber-100/80 text-amber-700 border border-amber-200/50", // Chờ xử lý
      2: "bg-indigo-100/80 text-indigo-700 border border-indigo-200/50", // Đã duyệt
      3: "bg-blue-100/80 text-blue-700 border border-blue-200/50", // Đang giao
      4: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50", // Hoàn thành
      5: "bg-rose-100/80 text-rose-700 border border-rose-200/50", // Đã hủy
    })[Number(s)] || "bg-slate-100 text-slate-600";

  // Xem chi tiết đơn hàng
  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setOrderDetail(data?.data || null);
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error);
      setOrderDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
    setReviewProductId(null);
  };

  // Mở modal xác nhận hủy đơn (thay cho window.confirm)
  const handleRequestCancelOrder = (e, orderId) => {
    e.stopPropagation();
    setConfirmCancelOrder(orderId);
  };

  // Thực sự gọi API hủy đơn, chạy khi người dùng bấm "Xác nhận" trong modal
  const handleConfirmCancelOrder = async () => {
    const orderId = confirmCancelOrder;
    if (!orderId) return;

    setConfirmCancelOrder(null);
    setCancelingId(orderId);
    try {
      await api.put(`/orders/${orderId}`, { status: 5 });

      // Cập nhật lại danh sách hiện tại
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status: 5 } : o)),
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 5 }));
      }
      if (orderDetail && orderDetail.id === orderId) {
        setOrderDetail((prev) => ({ ...prev, status: 5 }));
      }
    } catch (error) {
      setErrorToast(
        error.response?.data?.message ||
          "Hủy đơn hàng thất bại. Vui lòng thử lại!",
      );
    } finally {
      setCancelingId(null);
    }
  };

  // Đặt lại đơn hàng
  const handleReorder = (e, order) => {
    e.stopPropagation();
    const reorderItems = (order.order_detail || []).map((detail) => {
      const p = detail.products || {};
      const currentQuantity = Number(detail.quanity || detail.quantity || 1);
      return {
        id: p.id || detail.product_id,
        product_id: detail.product_id || p.id,
        name: p.name || "Sản phẩm",
        image: p.image || "",
        price: Number(detail.price || p.price || 0),
        quanity: currentQuantity,
        quantity: currentQuantity,
        products: p,
        product: p,
      };
    });

    navigate("/checkout", {
      state: {
        items: reorderItems,
        cartItems: reorderItems,
        products: reorderItems,
        buyNow: true,
        isReorder: true,
      },
    });
  };

  // Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Tính danh sách số trang hiển thị dạng rút gọn, linh hoạt theo trang hiện tại.
  // Luôn giữ trang đầu, trang cuối, và 1 trang liền kề mỗi bên trang hiện tại.
  // VD: total=10, current=5  -> 1 ... 4 5 6 ... 10
  //     total=10, current=1  -> 1 2 ... 10
  //     total=10, current=10 -> 1 ... 9 10
  const getPageNumbers = (current, total) => {
    const boundaryCount = 1; // số trang giữ ở đầu/cuối
    const siblingCount = 1; // số trang liền kề mỗi bên trang hiện tại

    const pages = new Set();
    for (let i = 1; i <= boundaryCount; i++) pages.add(i);
    for (let i = total - boundaryCount + 1; i <= total; i++) {
      if (i >= 1) pages.add(i);
    }
    for (let i = current - siblingCount; i <= current + siblingCount; i++) {
      if (i >= 1 && i <= total) pages.add(i);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    let prev = null;
    for (const p of sorted) {
      if (prev !== null) {
        if (p - prev === 2) {
          result.push(prev + 1); // chỉ thiếu đúng 1 trang thì hiện luôn, khỏi cần "..."
        } else if (p - prev > 2) {
          result.push("...");
        }
      }
      result.push(p);
      prev = p;
    }
    return result;
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 mb-8">
        Đơn hàng của bạn
      </h1>

      {loadingOrders ? (
        <div className="text-center text-slate-400 py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          Đang tải danh sách đơn hàng...
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center text-slate-400 py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Danh sách đơn hàng */}
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleViewOrder(order)}
              className="bg-white border border-slate-200/80 p-4 rounded-[20px] block cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500 hover:-translate-y-1 relative group"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("vi-VN")
                    : "—"}
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusBg(
                    order.status,
                  )}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>

              <div className="space-y-2.5 pr-2.5">
                {order.order_detail && order.order_detail.length > 0 ? (
                  order.order_detail.map((detail, index) => {
                    const product = detail.products || {};
                    return (
                      <div key={index} className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-slate-900">
                            {product.name || "Sản phẩm không rõ tên"}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Số lượng:{" "}
                            <span className="text-slate-700 font-bold">
                              {detail.quanity || detail.quantity || 1}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-800">
                            {Number(detail.price || 0).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-[10px] italic">
                    Không tìm thấy thông tin sản phẩm
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tổng thanh toán:
                  </span>
                  <span className="text-sm font-black text-blue-600">
                    {Number(order.total || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex justify-end gap-1.5 flex-wrap">
                {!isCancelledStatus(order.status) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/order-tracking/${order.id}`);
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all relative z-20 flex items-center gap-1.5 border border-emerald-100 active:scale-95"
                  >
                    <Eye className="w-3 h-3" /> Theo dõi đơn hàng
                  </button>
                )}

                {Number(order.status) === 4 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewOrder(order);
                      if (order.order_detail && order.order_detail.length > 0) {
                        setReviewProductId(
                          order.order_detail[0].products?.id ||
                            order.order_detail[0].product_id,
                        );
                      }
                    }}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all relative z-20 flex items-center gap-1.5 border border-amber-100 active:scale-95"
                  >
                    <Star className="w-3 h-3" /> Đánh giá sản phẩm
                  </button>
                )}

                {Number(order.status) === 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRequestCancelOrder(e, order.id)}
                    disabled={cancelingId === order.id}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 relative z-20 flex items-center gap-1.5 border border-rose-100 active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />{" "}
                    {cancelingId === order.id ? "Đang hủy..." : "Hủy đơn hàng"}
                  </button>
                )}

                {/* Đơn đã đặt thành công (có order_detail) là được hỏi shop,
                    bất kể đang ở trạng thái nào (Pending/.../Cancelled) */}
                {order.order_detail && order.order_detail.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const firstDetail = order.order_detail[0];
                      const product = firstDetail.products || {};
                      window.dispatchEvent(
                        new CustomEvent("open-chat", {
                          detail: {
                            order_id: order.id,
                            product_id: product.id || firstDetail.product_id,
                            productName: product.name,
                          },
                        }),
                      );
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all relative z-20 flex items-center gap-1.5 border border-indigo-100 active:scale-95"
                  >
                    <MessageCircle className="w-3 h-3" /> Nhắn tin hỏi shop
                  </button>
                )}

                {(isCancelledStatus(order.status) ||
                  Number(order.status) === 4) && (
                  <button
                    type="button"
                    onClick={(e) => handleReorder(e, order)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all relative z-20 flex items-center gap-1.5 border border-blue-100 active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" /> Đặt lại đơn hàng
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Thanh phân trang (Hiển thị khi tổng số trang > 1) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
              {/* Nút Prev */}
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loadingOrders}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all shadow-sm active:scale-95"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Số trang (dạng rút gọn: 1 2 3 ... 8 9 10) */}
              <div className="flex items-center gap-1.5 px-2">
                {getPageNumbers(page, totalPages).map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loadingOrders}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                        pageNum === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              {/* Nút Next */}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loadingOrders}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-all shadow-sm active:scale-95"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl z-10">
              <div>
                <h2 className="font-black text-slate-800 text-lg">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleDateString(
                        "vi-VN",
                      )
                    : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusBg(
                    selectedOrder.status,
                  )}`}
                >
                  {statusLabel(selectedOrder.status)}
                </span>
                <button
                  onClick={handleCloseDetail}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {loadingDetail ? (
                <div className="text-center text-slate-400 py-8">
                  Đang tải...
                </div>
              ) : !orderDetail ? (
                <div className="text-center text-slate-400 py-8">
                  Không tải được chi tiết đơn hàng.
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                      Sản phẩm
                    </p>
                    <div className="space-y-3">
                      {(orderDetail.order_detail || []).map((detail, i) => {
                        const pId = detail.products?.id || detail.product_id;
                        const isSelectedForReview = reviewProductId === pId;

                        return (
                          <div
                            key={i}
                            className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                {detail.products?.image ? (
                                  <img
                                    src={detail.products.image}
                                    alt={detail.products.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                                  {detail.products?.name || "Sản phẩm"}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                  SL: {detail.quanity || detail.quantity || 1} ×{" "}
                                  {Number(detail.price || 0).toLocaleString(
                                    "vi-VN",
                                  )}
                                  đ
                                </p>
                              </div>
                              <p className="text-sm font-bold text-blue-600 shrink-0">
                                {Number(
                                  (detail.price || 0) *
                                    (detail.quanity || detail.quantity || 1),
                                ).toLocaleString("vi-VN")}
                                đ
                              </p>

                              {Number(orderDetail.status) === 4 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReviewProductId(
                                      isSelectedForReview ? null : pId,
                                    )
                                  }
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                                    isSelectedForReview
                                      ? "bg-slate-200 text-slate-700"
                                      : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95"
                                  }`}
                                >
                                  {isSelectedForReview ? "Đóng" : "Đánh giá"}
                                </button>
                              )}
                            </div>

                            {Number(orderDetail.status) === 4 &&
                              isSelectedForReview && (
                                <div className="mt-2 pt-3 border-t border-slate-200/60 transition-all duration-300">
                                  <ProductFeedback
                                    productId={pId}
                                    currentUserId={user?.id}
                                    token={localStorage.getItem("token")}
                                    hasPurchased={true}
                                    apiUrl="http://localhost:3000/api"
                                  />
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {(orderDetail.address || orderDetail.phone) && (
                    <div className="border-t border-slate-100 pt-3.5">
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2.5">
                        Thông tin giao hàng
                      </p>
                      <div className="space-y-2">
                        {orderDetail.phone && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">
                              Số điện thoại
                            </span>
                            <span className="font-medium text-slate-800">
                              {orderDetail.phone}
                            </span>
                          </div>
                        )}
                        {orderDetail.address && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Địa chỉ</span>
                            <span className="font-medium text-slate-800 text-right max-w-[60%]">
                              {orderDetail.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Tổng cộng</span>
                    <span className="text-lg font-black text-blue-600">
                      {Number(orderDetail.total || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy đơn hàng — thay cho window.confirm */}
      {confirmCancelOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-1.5">
              Hủy đơn hàng?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng #{confirmCancelOrder} không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmCancelOrder(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Không, giữ đơn
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={cancelingId === confirmCancelOrder}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60"
              >
                {cancelingId === confirmCancelOrder
                  ? "Đang hủy..."
                  : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast báo lỗi — thay cho window.alert */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
          <div className="bg-white border border-rose-200 shadow-2xl rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <X className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-sm text-slate-700 flex-1">{errorToast}</p>
            <button
              type="button"
              onClick={() => setErrorToast("")}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
