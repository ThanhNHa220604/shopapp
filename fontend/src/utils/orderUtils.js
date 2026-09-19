const OrderStatus = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 5,
  REFUNDED: 6,
  FAILED: 7,
};

/**
 * Parse chuỗi ngày hoặc ISO string một cách an toàn nhất
 */
export const parseDateValue = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    return Number.isNaN(rawDate.getTime()) ? null : rawDate;
  }

  const str = String(rawDate).trim();

  // Xử lý chuỗi định dạng "DD/MM/YYYY" hoặc "DD/MM/YYYY HH:mm:ss"
  if (str.includes("/")) {
    const [datePart, timePart] = str.split(" ");
    const parts = datePart.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      let hours = 0,
        minutes = 0,
        seconds = 0;
      if (timePart) {
        const timeParts = timePart.split(":");
        hours = parseInt(timeParts[0] || 0, 10);
        minutes = parseInt(timeParts[1] || 0, 10);
        seconds = parseInt(timeParts[2] || 0, 10);
      }

      const date = new Date(year, month, day, hours, minutes, seconds);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const parsed = new Date(isNaN(str) ? str : Number(str));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Lấy mốc thời gian của đơn hàng
 */
export const parseRevenueDate = (order) => {
  if (!order) return null;

  const rawDate =
    order.delivered_at ||
    order.deliveredAt ||
    order.completed_at ||
    order.completedAt ||
    order.created_at ||
    order.createdAt ||
    order.updated_at ||
    order.updatedAt ||
    order.date;

  return parseDateValue(rawDate);
};

/**
 * Kiểm tra đơn hàng ĐÃ GIAO / HOÀN THÀNH (Khớp với OrderStatus.DELIVERED = 4)
 */
export const isDeliveredOrder = (order) => {
  if (!order) return false;

  const status = order.status ?? order.order_status ?? order.shipping_status;

  // So sánh dạng Số hoặc Chuỗi
  if (Number(status) === OrderStatus.DELIVERED) return true;

  const st = String(status || "")
    .toLowerCase()
    .trim();
  return (
    st === "4" ||
    st === "delivered" ||
    st === "completed" ||
    st === "đã giao" ||
    st === "da giao" ||
    st === "hoàn thành"
  );
};

/**
 * Lấy số tiền đơn hàng an toàn
 */
export const getOrderAmount = (order) => {
  if (!order) return 0;

  const rawAmount =
    order.total ??
    order.total_amount ??
    order.total_price ??
    order.totalAmount ??
    order.price ??
    order.grand_total ??
    0;

  if (typeof rawAmount === "number") return rawAmount;

  // Xóa ký tự chữ/dấu chấm nếu số tiền trả về dạng string ("1.590.000 đ")
  const cleanNumberStr = String(rawAmount).replace(/[^0-9]/g, "");
  return Number(cleanNumberStr) || 0;
};
