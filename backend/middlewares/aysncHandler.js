const asyncHandler = (fun) => {
  // 🚨 Thêm đoạn này để phát hiện ngay khi Server khởi chạy hoặc có Request
  if (typeof fun !== "function") {
    console.error(
      "❌ LỖI ROUTE: Hàm truyền vào asyncHandler bị undefined hoặc không phải function!",
    );
    console.error("👉 Giá trị 'fun' nhận được là:", fun);

    // 📍 DÒNG MỚI THÊM: In ra dấu vết vết xe đổ (chỉ rõ tên file & số dòng trong approuter.js)
    console.trace("📍 Vị trí gọi asyncHandler bị lỗi:");
  }

  return async (req, res, next) => {
    try {
      if (typeof fun !== "function") {
        throw new TypeError(
          `Target route handler is not a function (received: ${typeof fun})`,
        );
      }
      await fun(req, res, next);
    } catch (error) {
      console.error("detailed error: ", error);
      console.log("error details: ", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        message: "lỗi",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

module.exports = asyncHandler;
