const { applyVoucher } = require("../../controllers/voucherController");
const db = require("../../models");
const { validateVoucherRules } = require("../../helpers/voucherHelper");

jest.mock("../../models", () => ({
  vouchers: { findOne: jest.fn() },
  voucher_usages: { count: jest.fn() },
}));

describe("VoucherController - Áp dụng mã (Boundary Tests)", () => {
  let req, res;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  const mockCart = (price) => [
    { product_id: 1, applied_price: price, quanity: 1 },
  ];

  const voucherRulesCases = [
    {
      desc: "Tổng đơn 99k (Nhỏ hơn Min 100k)",
      cart: mockCart(99000),
      voucherData: { min_order_value: 100000 },
      expError: "chưa đạt mức tối thiểu",
    },
    {
      desc: "Voucher áp dụng cho sản phẩm X, nhưng giỏ hàng mua Y",
      cart: [{ product_id: 99 }],
      voucherData: {
        apply_scope: "specific_products",
        voucherProducts: [{ product_id: 1 }],
      },
      expError: "không áp dụng",
    },
    {
      desc: "Vượt quá lượt sử dụng tối đa của User",
      cart: mockCart(200000),
      usageCount: 5,
      voucherData: { limit_per_user: 5 },
      expError: "đã dùng hết lượt cho phép",
    },
  ];

  test.each(voucherRulesCases)(
    "Ràng buộc Voucher: $desc",
    async ({ cart, voucherData, usageCount = 0, expError }) => {
      req = { body: { code: "TEST", cartItems: cart }, userId: 1 };

      db.vouchers.findOne.mockResolvedValue({
        id: 1,
        ...voucherData,
        toJSON: () => ({ ...voucherData }),
      });
      db.voucher_usages.count.mockResolvedValue(usageCount);

      await applyVoucher(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining(expError) }),
      );
    },
  );
});
