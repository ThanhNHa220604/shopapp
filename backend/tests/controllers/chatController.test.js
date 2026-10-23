// tests/controllers/chatController.test.js
jest.mock("../../models", () => ({}));
const { isParticipant } = require("../../controllers/chatController");

describe("ChatController - Phân quyền tham gia (Data-Driven)", () => {
  const conversationMock = { buyer_id: 100, seller_id: 200 };

  // Sinh tự động danh sách user gồm cả người mua, người bán và 40 user lạ khác nhau
  const participantCases = [
    { desc: "Buyer truy cập", userId: 100, expectedAccess: true },
    { desc: "Seller truy cập", userId: 200, expectedAccess: true },
    ...Array.from({ length: 40 }, (_, index) => ({
      desc: `User lạ ngoài luồng #${index + 1}`,
      userId: 300 + index,
      expectedAccess: false,
    })),
  ];

  test.each(participantCases)(
    "Kiểm tra quyền: $desc",
    ({ userId, expectedAccess }) => {
      const user = { id: userId };
      const result = isParticipant(conversationMock, user);
      expect(result).toBe(expectedAccess);
    },
  );
});
