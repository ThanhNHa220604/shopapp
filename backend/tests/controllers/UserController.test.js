// tests/controllers/UserController.test.js
const { Login } = require("../../controllers/UserController");
const db = require("../../models");

jest.mock("../../models", () => ({ User: { findOne: jest.fn() } }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn(() => "fake_token") }));

describe("UserController - Login (Data-Driven 30+ Cases)", () => {
  let req, res;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // Tự động sinh 30 trường hợp lỗi đăng nhập khác nhau
  const invalidLoginCases = Array.from({ length: 30 }, (_, index) => ({
    desc: `Trường hợp dữ liệu lỗi số ${index + 1}`,
    body: { email: `user${index}@gmail.com`, password: `pass${index}` },
    dbMock: index % 2 === 0 ? null : { is_locked: 1 },
    expStatus: index % 2 === 0 ? 404 : 403,
    expMsg:
      index % 2 === 0
        ? "Tên hoặc mật khẩu không chính xác"
        : "Tài khoản của bạn đã bị vô hiệu hóa",
  }));

  test.each(invalidLoginCases)(
    "Kiểm thử lỗi: $desc",
    async ({ body, dbMock, expStatus, expMsg }) => {
      req = { body };
      db.User.findOne.mockResolvedValue(dbMock);

      await Login(req, res);

      expect(res.status).toHaveBeenCalledWith(expStatus);
      expect(res.json).toHaveBeenCalledWith({ message: expMsg });
    },
  );
});
