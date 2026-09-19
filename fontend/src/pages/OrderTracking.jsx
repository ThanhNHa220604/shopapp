import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Lấy ID từ URL và điều hướng[cite: 1]
import axios from "axios"; // Sử dụng axios gọi API[cite: 1]
import L from "leaflet";

// Import CSS của Leaflet để bản đồ hiển thị đúng giao diện
import "leaflet/dist/leaflet.css";

// Fix lỗi hiển thị Marker mặc định của Leaflet trong React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom Icon Xe tải màu cam di chuyển cho Shipper
const shipperIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

// Định nghĩa mã trạng thái đơn hàng[cite: 1]
const ORDER_STATUS = {
  PENDING: 1, // Chờ xử lý[cite: 1]
  PROCESSING: 2, // Đang chuẩn bị hàng[cite: 1]
  SHIPPED: 3, // Đang giao hàng[cite: 1]
  DELIVERED: 4, // Đã giao hàng thành công[cite: 1]
  CANCELLED: 5, // Đã hủy đơn[cite: 1]
  REFUNDED: 6, // Đã hoàn tiền[cite: 1]
  FAILED: 7, // Giao hàng thất bại[cite: 1]
};

const OrderTracking = () => {
  const { id } = useParams(); // Đọc ID đơn hàng từ URL[cite: 1]
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Lưu trữ tọa độ thực tế của Shop, Shipper và Khách hàng
  const [coords, setCoords] = useState({
    start: [21.0285, 105.8542], // Mặc định: Hà Nội nếu không lấy được địa chỉ shop
    shipper: [21.0285, 105.8542],
    end: [21.0285, 105.8542],
  });

  // Hàm chuyển đổi địa chỉ (Text) thành Tọa độ (Lat, Lng) thông qua OpenStreetMap Nominatim
  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: address + ", Vietnam", // Giới hạn tìm kiếm trong phạm vi Việt Nam
            format: "json",
            limit: 1,
          },
        },
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
    } catch (err) {
      console.error("Lỗi lấy tọa độ từ địa chỉ:", err);
    }
    return null;
  };

  // 1. Gọi API lấy thông tin chi tiết đơn hàng[cite: 1]
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); //[cite: 1]

        const response = await axios.get(`/api/orders/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "", //[cite: 1]
          },
        });

        const orderData = response.data.data;
        setOrder(orderData); //[cite: 1]

        // --- XỬ LÝ TỌA ĐỘ VÀ VỊ TRÍ XE Ô TÔ ---
        let startCoords = [21.0285, 105.8542];
        let endCoords = [21.0285, 105.8542];

        // Lấy tọa độ Người Bán (Cửa hàng)
        if (orderData.shop_lat && orderData.shop_lng) {
          startCoords = [orderData.shop_lat, orderData.shop_lng];
        } else if (orderData.shop_address) {
          const shopLoc = await getCoordinatesFromAddress(
            orderData.shop_address,
          );
          if (shopLoc) startCoords = shopLoc;
        }

        // Lấy tọa độ Người Mua (Khách hàng)
        if (orderData.customer_lat && orderData.customer_lng) {
          endCoords = [orderData.customer_lat, orderData.customer_lng];
        } else if (orderData.address) {
          const buyerLoc = await getCoordinatesFromAddress(orderData.address);
          if (buyerLoc) endCoords = buyerLoc;
        }

        // Xác định tọa độ thực tế của xe ô tô (shipper) dựa vào trạng thái đơn hàng
        let shipperCoords = [...startCoords];

        if (orderData.status === ORDER_STATUS.DELIVERED) {
          shipperCoords = [...endCoords];
        } else if (orderData.status === ORDER_STATUS.SHIPPED) {
          if (orderData.shipper_lat && orderData.shipper_lng) {
            shipperCoords = [orderData.shipper_lat, orderData.shipper_lng];
          } else {
            shipperCoords = [
              (startCoords[0] + endCoords[0]) / 2,
              (startCoords[1] + endCoords[1]) / 2,
            ];
          }
        }

        setCoords({
          start: startCoords,
          shipper: shipperCoords,
          end: endCoords,
        });
      } catch (err) {
        const serverMessage =
          err.response?.data?.message ||
          err.message ||
          "Không thể lấy thông tin đơn hàng này"; //[cite: 1]
        setError(serverMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // 2. Khởi tạo bản đồ Google Maps & Tìm đường đi nội địa Việt Nam
  useEffect(() => {
    if (loading || error || !order || !mapContainerRef.current) return;

    // dọn dẹp triệt để bản đồ cũ trước khi tạo bản đồ mới
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // 🟢 KHẮC PHỤC LỖI: Khởi tạo bản đồ kèm setView ngay lập tức để tránh lỗi DOM chưa sẵn sàng
    const map = L.map(mapContainerRef.current).setView(coords.start, 13);
    mapInstanceRef.current = map;

    // Load bản đồ Google Maps tiếng Việt, hiển thị rõ ràng Biển Đông, Hoàng Sa, Trường Sa
    L.tileLayer(
      "https://{s}.google.com/vt/lyrs=m&hl=vi&gl=vn&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Bản đồ Việt Nam (Biển Đông, Hoàng Sa, Trường Sa)",
      },
    ).addTo(map);

    // Ghim các điểm mốc
    L.marker(coords.start, { icon: DefaultIcon })
      .addTo(map)
      .bindPopup("📍 Cửa hàng (Điểm đi)");
    L.marker(coords.end, { icon: DefaultIcon })
      .addTo(map)
      .bindPopup(`🏠 Địa chỉ giao hàng: ${order.address || ""}`);
    L.marker(coords.shipper, { icon: shipperIcon })
      .addTo(map)
      .bindPopup("🚚 Vị trí xe vận chuyển");

    // Hàm vẽ đường thẳng dự phòng (chỉ chạy trong nội địa VN)
    const fallbackStraightLine = () => {
      // Đảm bảo map vẫn tồn tại khi hàm callback này được gọi
      if (!mapInstanceRef.current) return;

      const status = order.status;

      if (status === ORDER_STATUS.DELIVERED) {
        L.polyline([coords.start, coords.end], {
          color: "#95a5a6",
          weight: 5,
          opacity: 0.4,
          dashArray: "5, 10",
        }).addTo(mapInstanceRef.current);
      } else if (status === ORDER_STATUS.SHIPPED) {
        L.polyline([coords.start, coords.shipper], {
          color: "#95a5a6",
          weight: 5,
          opacity: 0.4,
          dashArray: "5, 10",
        }).addTo(mapInstanceRef.current);

        L.polyline([coords.shipper, coords.end], {
          color: "#ea4335",
          weight: 5,
          opacity: 0.9,
          dashArray: "5, 10",
        }).addTo(mapInstanceRef.current);
      } else {
        L.polyline([coords.start, coords.end], {
          color: "#ea4335",
          weight: 5,
          opacity: 0.9,
          dashArray: "5, 10",
        }).addTo(mapInstanceRef.current);
      }

      const bounds = L.polyline([coords.start, coords.end]).getBounds();
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    };

    // Gọi API OSRM tìm tuyến đường bộ thực tế qua các trục đường tại Việt Nam
    const fetchRealRoute = async () => {
      try {
        const startLngLat = `${coords.start[1]},${coords.start[0]}`;
        const shipperLngLat = `${coords.shipper[1]},${coords.shipper[0]}`;
        const endLngLat = `${coords.end[1]},${coords.end[0]}`;

        const routeResponse = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${startLngLat};${shipperLngLat};${endLngLat}?overview=full&geometries=geojson`,
        );

        // Kiểm tra xem map còn tồn tại trong DOM không trước khi vẽ tiếp
        if (!mapInstanceRef.current) return;

        if (
          routeResponse.data &&
          routeResponse.data.routes &&
          routeResponse.data.routes.length > 0
        ) {
          const coordinates = routeResponse.data.routes[0].geometry.coordinates;

          // Chuyển sang định dạng [lat, lng] và lọc nghiêm ngặt CHỈ đi trên đất liền Việt Nam
          const fullRoute = coordinates
            .map((coord) => [coord[1], coord[0]])
            .filter(
              (coord) =>
                coord[0] >= 8.5 &&
                coord[0] <= 23.5 &&
                coord[1] >= 102.1 &&
                coord[1] <= 109.5,
            );

          if (fullRoute.length > 1) {
            let minDistance = Infinity;
            let shipperIndex = 0;

            fullRoute.forEach((point, index) => {
              const dist =
                Math.pow(point[0] - coords.shipper[0], 2) +
                Math.pow(point[1] - coords.shipper[1], 2);
              if (dist < minDistance) {
                minDistance = dist;
                shipperIndex = index;
              }
            });

            const passedPath = fullRoute.slice(0, shipperIndex + 1);
            const remainingPath = fullRoute.slice(shipperIndex);

            // 1. Vẽ đoạn đường ĐÃ QUA (Màu xám mờ - Opacity 0.4)
            if (
              passedPath.length > 1 &&
              order.status !== ORDER_STATUS.PENDING &&
              order.status !== ORDER_STATUS.PROCESSING
            ) {
              L.polyline(passedPath, {
                color: "#95a5a6",
                weight: 5,
                opacity: 0.4,
                lineJoin: "round",
              }).addTo(mapInstanceRef.current);
            }

            // 2. Vẽ đoạn đường CHƯA QUA (Màu đỏ đậm - Opacity 0.9)
            if (
              remainingPath.length > 1 &&
              order.status !== ORDER_STATUS.DELIVERED
            ) {
              L.polyline(remainingPath, {
                color: "#ea4335",
                weight: 6,
                opacity: 0.9,
                lineJoin: "round",
              }).addTo(mapInstanceRef.current);
            }

            // Nếu đơn hàng đã hoàn tất giao, chuyển toàn bộ con đường thành màu xám mờ
            if (order.status === ORDER_STATUS.DELIVERED) {
              L.polyline(fullRoute, {
                color: "#95a5a6",
                weight: 5,
                opacity: 0.4,
                lineJoin: "round",
              }).addTo(mapInstanceRef.current);
            }

            const combinedBounds = L.polyline(fullRoute).getBounds();
            mapInstanceRef.current.fitBounds(combinedBounds, {
              padding: [40, 40],
            });
          } else {
            fallbackStraightLine();
          }
        } else {
          fallbackStraightLine();
        }
      } catch (err) {
        console.error("Lỗi khi kết nối API tìm đường bộ:", err);
        fallbackStraightLine();
      }
    };

    fetchRealRoute();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, error, order, coords]);

  if (loading) {
    return (
      <div style={styles.loading}>
        Đang tính toán hành trình và tải bản đồ Việt Nam...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.error}>
        ⚠️ Lỗi: {error || "Không tìm thấy dữ liệu đơn hàng."}
      </div>
    );
  }

  const currentStatus = order.status;
  const updatedAtFormatted = order.updated_at
    ? new Date(order.updated_at).toLocaleString("vi-VN")
    : ""; //[cite: 1]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value); //[cite: 1]
  };

  const standardSteps = [
    {
      status: ORDER_STATUS.PENDING,
      title: "Đặt hàng thành công",
      desc: "Đơn hàng đã được hệ thống ghi nhận thành công.", //[cite: 1]
    },
    {
      status: ORDER_STATUS.PROCESSING,
      title: "Đang chuẩn bị hàng",
      desc: "Shop đang tiến hành kiểm tra và đóng gói sản phẩm.", //[cite: 1]
    },
    {
      status: ORDER_STATUS.SHIPPED,
      title: "Đang giao hàng",
      desc: "Đơn hàng đã được bàn giao cho đối tác vận chuyển nội địa.",
    },
    {
      status: ORDER_STATUS.DELIVERED,
      title: "Giao hàng thành công",
      desc: "Đơn hàng đã được phát thành công đến người nhận.", //[cite: 1]
    },
  ];

  const isSpecialStatus = [
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
    ORDER_STATUS.FAILED,
  ].includes(currentStatus); //[cite: 1]

  return (
    <div style={styles.container}>
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        style={styles.backButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2980b9";
          e.currentTarget.style.transform = "translateX(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3498db";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Quay lại trang trước</span>
      </button>

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Khối Bản đồ */}
        <div style={styles.mapSidebar}>
          <div style={styles.mapStickyWrapper}>
            <h3 style={styles.sectionTitle}>Bản đồ hành trình giao hàng</h3>
            <div style={styles.mapContainer} ref={mapContainerRef}></div>
            <p
              style={{
                fontSize: "12px",
                color: "#7f8c8d",
                marginTop: "10px",
                marginBottom: 0,
              }}
            >
              * Xe vận tải luôn di chuyển bám sát theo các tuyến đường bộ nội
              địa tại Việt Nam.
            </p>
          </div>
        </div>

        {/* Khối Thông tin */}
        <div style={styles.contentSidebar}>
          {/* Header đơn hàng */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.orderIdTitle}>Mã đơn hàng: #{order.id}</h2>{" "}
              {/*[cite: 1] */}
              <p style={styles.orderDate}>
                Ngày đặt:{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("vi-VN")
                  : "---"}{" "}
                {/*[cite: 1] */}
              </p>
            </div>
            <div style={styles.totalWrapper}>
              <span style={styles.totalLabel}>Tổng thanh toán: </span>
              <span style={styles.totalValue}>
                {formatCurrency(order.total || 0)}
              </span>{" "}
              {/*[cite: 1] */}
            </div>
          </div>

          {/* Banner đặc biệt */}
          {isSpecialStatus && (
            <div
              style={{
                ...styles.specialBanner,
                backgroundColor:
                  currentStatus === ORDER_STATUS.CANCELLED
                    ? "#fdf2f2"
                    : "#f0fdf4",
                borderColor:
                  currentStatus === ORDER_STATUS.CANCELLED
                    ? "#f8b4b4"
                    : "#bbf7d0",
                color:
                  currentStatus === ORDER_STATUS.CANCELLED
                    ? "#c81e1e"
                    : "#15803d",
              }}
            >
              <strong>
                {currentStatus === ORDER_STATUS.CANCELLED &&
                  "❌ Đơn hàng đã bị hủy bỏ lúc: " + updatedAtFormatted}{" "}
                {/*[cite: 1] */}
                {currentStatus === ORDER_STATUS.REFUNDED &&
                  "🔄 Đơn hàng đã được hoàn tiền lúc: " +
                    updatedAtFormatted}{" "}
                {/*[cite: 1] */}
              </strong>
            </div>
          )}

          {/* Tiến trình Timeline */}
          {!isSpecialStatus && (
            <div style={styles.timelineContainer}>
              <h3 style={styles.sectionTitle}>Trạng thái đơn hàng</h3>
              <div style={styles.timeline}>
                {standardSteps.map((step, index) => {
                  const isActive = currentStatus >= step.status; //[cite: 1]
                  const isCurrent = currentStatus === step.status; //[cite: 1]

                  return (
                    <div key={step.status} style={styles.timelineItem}>
                      {index < standardSteps.length - 1 && (
                        <div
                          style={{
                            ...styles.line,
                            backgroundColor:
                              currentStatus > step.status
                                ? "#2ecc71"
                                : "#e0e0e0", //[cite: 1]
                          }}
                        />
                      )}

                      <div
                        style={{
                          ...styles.circle,
                          backgroundColor: isActive ? "#2ecc71" : "#fff", //[cite: 1]
                          borderColor: isActive ? "#2ecc71" : "#ccc", //[cite: 1]
                          color: isActive ? "#fff" : "#ccc", //[cite: 1]
                        }}
                      >
                        {isActive ? "✓" : index + 1} {/*[cite: 1] */}
                      </div>

                      <div style={styles.content}>
                        <h4
                          style={{
                            ...styles.stepTitle,
                            color: isCurrent ? "#2ecc71" : "#2c3e50",
                          }}
                        >
                          {step.title}
                        </h4>
                        <p style={styles.stepDesc}>{step.desc}</p>{" "}
                        {/*[cite: 1] */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chi tiết kiện hàng */}
          <div style={styles.productsContainer}>
            <h3 style={styles.sectionTitle}>Chi tiết kiện hàng</h3>
            <div style={styles.productList}>
              {order.order_detail &&
                order.order_detail.map((item, idx) => {
                  const product = item.products || {}; //[cite: 1]
                  return (
                    <div key={item.id || idx} style={styles.productItem}>
                      <img
                        src={product.image || "https://via.placeholder.com/80"} //[cite: 1]
                        alt={product.name} //[cite: 1]
                        style={styles.productImage}
                      />
                      <div style={styles.productInfo}>
                        <h4 style={styles.productName}>
                          {product.name || "Sản phẩm không tên"}
                        </h4>{" "}
                        {/*[cite: 1] */}
                        <p style={styles.productMeta}>
                          Số lượng: {item.quantity || 1}
                        </p>{" "}
                        {/*[cite: 1] */}
                      </div>
                      <div style={styles.productPrice}>
                        {formatCurrency(item.price || product.price || 0)}
                      </div>{" "}
                      {/*[cite: 1] */}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Địa chỉ giao nhận */}
          <div style={styles.shippingSection}>
            <h3 style={styles.sectionTitle}>Thông tin giao nhận</h3>
            <div style={styles.shippingCard}>
              <p style={styles.shippingText}>
                <strong>Địa chỉ nhận hàng:</strong>{" "}
                {order.address || "Chưa cập nhật địa chỉ"} {/*[cite: 1] */}
              </p>
              <p style={styles.shippingText}>
                <strong>Số điện thoại khách hàng:</strong>{" "}
                {order.phone || "Chưa cập nhật SĐT"} {/*[cite: 1] */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles CSS-in-JS
const styles = {
  container: {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "25px 20px",
    fontFamily: "Segoe UI, -apple-system, sans-serif",
    color: "#2c3e50", //[cite: 1]
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#3498db",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "10px 20px",
    borderRadius: "25px",
    transition: "all 0.2s ease-in-out",
    marginBottom: "25px",
  },
  mainLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    width: "100%",
  },
  mapSidebar: { width: "100%" },
  mapStickyWrapper: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  },
  mapContainer: {
    height: "420px",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  contentSidebar: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  loading: {
    textAlign: "center",
    padding: "100px 20px",
    fontSize: "16px",
    color: "#666",
  }, //[cite: 1]
  error: {
    textAlign: "center",
    padding: "100px 20px",
    color: "#e74c3c",
    fontSize: "16px",
  }, //[cite: 1]
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)", //[cite: 1]
  },
  orderIdTitle: { margin: 0, fontSize: "20px", fontWeight: "700" }, //[cite: 1]
  orderDate: { margin: "5px 0 0 0", fontSize: "14px", color: "#7f8c8d" }, //[cite: 1]
  totalWrapper: { textAlign: "right" }, //[cite: 1]
  totalLabel: { fontSize: "14px", color: "#7f8c8d" }, //[cite: 1]
  totalValue: { fontSize: "24px", fontWeight: "800", color: "#e74c3c" }, //[cite: 1]
  specialBanner: {
    padding: "15px 20px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "14px",
  }, //[cite: 1]
  timelineContainer: {
    backgroundColor: "#fff",
    padding: "25px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)", //[cite: 1]
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: "15px",
    fontWeight: "700",
    borderLeft: "4px solid #3498db",
    paddingLeft: "12px",
  },
  timeline: { display: "flex", flexDirection: "column", paddingLeft: "10px" }, //[cite: 1]
  timelineItem: {
    display: "flex",
    position: "relative",
    paddingBottom: "35px",
  }, //[cite: 1]
  line: {
    position: "absolute",
    left: "16px",
    top: "32px",
    bottom: "-15px",
    width: "2px",
    zIndex: 1,
  }, //[cite: 1]
  circle: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    backgroundColor: "#fff",
    marginRight: "20px",
  },
  content: { paddingTop: "4px" }, //[cite: 1]
  stepTitle: { margin: 0, fontSize: "15px" }, //[cite: 1]
  stepDesc: { margin: "4px 0 0 0", fontSize: "13px", color: "#7f8c8d" }, //[cite: 1]
  productsContainer: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)", //[cite: 1]
  },
  productList: { display: "flex", flexDirection: "column", gap: "15px" }, //[cite: 1]
  productItem: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #f1f2f6",
    paddingBottom: "15px",
    gap: "15px",
  }, //[cite: 1]
  productImage: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "8px",
  }, //[cite: 1]
  productInfo: { flexGrow: 1 }, //[cite: 1]
  productName: { margin: 0, fontSize: "15px", fontWeight: "600" }, //[cite: 1]
  productMeta: { margin: "5px 0 0 0", fontSize: "13px", color: "#7f8c8d" }, //[cite: 1]
  productPrice: { fontSize: "16px", fontWeight: "600" }, //[cite: 1]
  shippingSection: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)", //[cite: 1]
  },
  shippingCard: {
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  }, //[cite: 1]
  shippingText: { margin: "0 0 12px 0", fontSize: "14px", color: "#4a5568" }, //[cite: 1]
};

export default OrderTracking;
