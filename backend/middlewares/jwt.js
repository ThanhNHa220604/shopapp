const { getUserFromToken } = require("../helpers/TokenHelper");

const requireRoles = (roleRequired) => async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Không thể xác thực người dùng",
      });
    }

    // 🟢 Debug: In toàn bộ thông tin user ra Terminal để kiểm tra cấu trúc
    console.log("=== DEBUG USER IN MIDDLEWARE ===");
    console.log("User Data:", JSON.stringify(user));

    // Lấy tất cả các khả năng lưu trữ vai trò của User
    const currentRole =
      user.role ??
      user.role_id ??
      user.roleId ??
      user.Role?.name ??
      user.Role?.id ??
      user.role_name;

    console.log("Current Role detected:", currentRole);
    console.log("roleRequired:", roleRequired);

    // Kiểm tra tài khoản bị khóa
    if (user.is_locked === 1) {
      return res.status(403).json({
        message: "Tài khoản này đã bị khóa",
      });
    }

    const allowedRoles = Array.isArray(roleRequired)
      ? roleRequired
      : [roleRequired];

    // Bảng quy đổi đa năng
    const roleMapping = {
      1: ["1", "USER", "CUSTOMER"],
      2: ["2", "ADMIN"],
      3: ["3", "MANAGER", "STAFF"],
      USER: ["1", "USER", "CUSTOMER"],
      ADMIN: ["2", "ADMIN"],
      MANAGER: ["3", "MANAGER", "STAFF"],
    };

    const userRoleStr = String(currentRole ?? "")
      .trim()
      .toUpperCase();

    const hasPermission = allowedRoles.some((reqRole) => {
      const reqRoleStr = String(reqRole ?? "")
        .trim()
        .toUpperCase();

      if (userRoleStr === reqRoleStr) return true;

      const mappedList = roleMapping[reqRoleStr] || [];
      return mappedList.includes(userRoleStr);
    });

    if (!hasPermission) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("JWT Middleware Error:", error.message);

    let errorMessage = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn";
    let errorCode = "Unauthorized";

    if (
      error.name === "TokenExpiredError" ||
      error.message.includes("hết hạn")
    ) {
      errorCode = "TokenExpiredError";
      errorMessage = "Phiên đăng nhập của bạn đã hết hạn!";
    }

    return res.status(401).json({
      success: false,
      code: errorCode,
      message: errorMessage,
    });
  }
};

module.exports = {
  requireRoles,
};
