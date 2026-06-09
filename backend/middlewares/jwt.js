const { getUserFromToken } = require("../helpers/TokenHelper");

const requireRoles = (roleRequired) => async (req, res, next) => {
  const user = await getUserFromToken(req, res);

  if (!user) {
    return;
  }
  console.log("user.role =", user.role);
  console.log("typeof user.role =", typeof user.role);
  console.log("roleRequired =", roleRequired);

  if (user.is_locked === 1) {
    return res.status(403).json({
      message: "tài khoản này đã bị khóa",
    });
  }

  if (!roleRequired.includes(user.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền truy cập",
    });
  }

  req.user = user;

  return next();
};

module.exports = {
  requireRoles,
};
