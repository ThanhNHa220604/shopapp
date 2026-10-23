//'1: Pending, 2 : Processing, 3: Shipped, 4: Delivered, 5: Cancelled, 6: Refunded , 7: Failed'
const OrderStatus = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 5,
  REFUNDED: 6,
  FAILED: 7,
  AWAITING_MOMO: 8, // chờ khách trả qua MoMo
  AWAITING_BANK: 9, // chờ tiền chuyển khoản về
};
const QR_EXPIRE_MINUTES = 15;

class CheckoutError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = OrderStatus;