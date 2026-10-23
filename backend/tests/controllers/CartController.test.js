// tests/controllers/CartController.test.js
const { insertCart } = require("../../controllers/CartController");
const db = require("../../models");

jest.mock("../../models", () => ({
  carts: { findOne: jest.fn(), create: jest.fn() },
  cart_items: { findOne: jest.fn(), create: jest.fn() },
  FlashSaleProducts: { findOne: jest.fn() },
}));

describe("CartController - Thêm sản phẩm (Data-Driven 100+ Cases)", () => {
  let req, res;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    db.carts.findOne.mockResolvedValue({ id: "uuid-mock-123", user_id: 1 });
  });

  
  const cartInputCases = Array.from({ length: 30 }, (_, index) => ({
    qtyInput: index + 1,
    initialQty: 5,
    expectedFinalQty: 5 + (index + 1),
  }));

  test.each(cartInputCases)(
    "Kiểm thử tự động số lượng giỏ hàng với input qty: $qtyInput",
    async ({ qtyInput, initialQty, expectedFinalQty }) => {
      req = {
        body: { product_id: 1, quantity: qtyInput },
        userId: 1,
      };

      const mockCartItem = { quanity: initialQty, save: jest.fn() };
      db.cart_items.findOne.mockResolvedValue(mockCartItem);

      await insertCart(req, res);

      expect(mockCartItem.quanity).toBe(expectedFinalQty);
      expect(mockCartItem.save).toHaveBeenCalled();
    },
  );
});
