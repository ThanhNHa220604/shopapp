// tests/controllers/OrderController.test.js
const { createOrder } = require("../../controllers/OrderController");
const db = require("../../models");

jest.mock("../../models", () => ({
  sequelize: {
    transaction: jest.fn(() =>
      Promise.resolve({ commit: jest.fn(), rollback: jest.fn() }),
    ),
    query: jest.fn(() => [[], {}]),
  },
  orders: { create: jest.fn() },
  order_detail: { create: jest.fn() },
  carts: { destroy: jest.fn() },
  cart_items: { findAll: jest.fn(() => Promise.resolve([])) },
}));

describe("OrderController - Luồng thanh toán (Data-Driven 30+ Cases)", () => {
  let req, res;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    db.orders.create.mockResolvedValue({ id: 123 });
  });

  // Tự động sinh nhiều ca test kết hợp phương thức thanh toán và số lượng sản phẩm khác nhau
  const methods = ["cod", "bank", "momo"];
  const paymentMethodCases = Array.from({ length: 30 }, (_, index) => ({
    method: methods[index % methods.length],
    quantity: index + 1,
    expectedStatus: 201,
  }));

  test.each(paymentMethodCases)(
    "Thanh toán tự động case #$index: $method với SL $quantity",
    async ({ method, quantity, expectedStatus }) => {
      req = {
        body: {
          items: [{ product_id: 1, quantity: quantity, price: 50000 }],
          payment_method: method,
          shipping_address: "Địa chỉ test",
        },
        userId: 1,
      };

      await createOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    },
  );
});
