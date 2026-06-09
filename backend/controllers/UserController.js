const db = require("../models");
const ResponseUser = require("../dtos/respone/user/responeuser");
const { UserRole } = require("../constants");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { getAvatarURL } = require("../helpers/imageHelper");
const { Op } = require("sequelize");

// ── USER ──────────────────────────────────────────────────────────────────────

export async function RegisterUser(req, res) {
  const { email, phone, password, name, avatar } = req.body;

  if (!email && !phone) {
    return res
      .status(400)
      .json({ message: "Cần cung cấp email hoặc số điện thoại" });
  }

  const condition = {};
  if (email) condition.email = email;
  if (phone) condition.phone = phone;

  const existingUser = await db.User.findOne({ where: condition });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "Email hoặc số điện thoại đã tồn tại" });
  }

  const user = await db.User.create({
    email,
    phone,
    password,
    name,
    avatar,
    role: UserRole.USER,
  });

  return res.status(200).json({
    message: "Đăng ký user thành công",
    data: new ResponseUser(user),
  });
}

export async function Login(req, res) {
  const { email, phone, password } = req.body;

  if (!email && !phone) {
    return res
      .status(400)
      .json({ message: "Cần cung cấp email hoặc số điện thoại" });
  }

  const condition = {};
  if (email) condition.email = email;
  if (phone) condition.phone = phone;

  const user = await db.User.findOne({ where: condition });
  if (!user) {
    return res
      .status(404)
      .json({ message: "Tên hoặc mật khẩu không chính xác" });
  }

  const passwordValid = password === user.password;
  if (!passwordValid) {
    return res.status(401).json({ message: "Mật khẩu không chính xác" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION },
  );

  return res.status(200).json({
    message: "Đăng nhập thành công",
    data: { user: new ResponseUser(user), token },
  });
}

// Xem profile bản thân - USER, MANAGER, ADMIN
export async function getProfile(req, res) {
  const user = await db.User.findByPk(req.user.id, {
    attributes: ["id", "name", "email", "phone", "avatar"],
  });

  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  return res.status(200).json({
    message: "Lấy profile thành công",
    data: user,
  });
}

// Cập nhật thông tin bản thân - USER, MANAGER, ADMIN
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, avatar, oldPassword, newPassword } = req.body;

  if (req.user.id != id) {
    return res
      .status(403)
      .json({ message: "Không được phép cập nhật thông tin của người khác" });
  }

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = getAvatarURL(avatar);

  if (oldPassword || newPassword) {
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập password cũ và password mới" });
    }
    if (oldPassword !== user.password) {
      return res.status(400).json({ message: "Password cũ không đúng" });
    }
    updateData.password = newPassword;
  }

  await db.User.update(updateData, { where: { id } });
  const updatedUser = await db.User.findByPk(id);

  return res.status(200).json({
    message: "Cập nhật user thành công",
    data: new ResponseUser(updatedUser),
  });
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// Lấy danh sách tất cả user - ADMIN only
export async function getAllUsers(req, res) {
  const { page = 1, limit = 15, role } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (role) where.role = role;

  const { count, rows } = await db.User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    // 👉 ĐÃ SỬA: Thay "createdAt" thành "created_at" để khớp chuẩn snake_case mới
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách user thành công",
    data: rows.map((u) => new ResponseUser(u)),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
}

// Lấy chi tiết 1 user - ADMIN only
export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await db.User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  return res.status(200).json({
    message: "Lấy user thành công",
    data: new ResponseUser(user),
  });
}

// Xóa user - ADMIN only
export async function deleteUser(req, res) {
  const { id } = req.params;

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  if (req.user.id == id) {
    return res
      .status(400)
      .json({ message: "Không thể xóa tài khoản của chính mình" });
  }

  await db.User.destroy({ where: { id } });

  return res.status(200).json({ message: "Xóa user thành công" });
}

export async function getDashboardStats(req, res) {
  try {
    // 1. Lấy mốc 00:00:00 ngày hôm nay theo giờ Việt Nam hệ thống (Tránh lệch múi giờ)
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    // 2. Lấy ngày đầu tiên của tháng hiện tại
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    // 3. Định nghĩa cửa sổ User đang hoạt động (ví dụ: tương tác trong vòng 15 phút qua)
    const activeTimeWindow = new Date(Date.now() - 15 * 60 * 1000);

    // Xác định chính xác đối tượng Model User tránh bị undefined
    const UserModel = db.User || db.users;

    const [
      totalProducts,
      totalOrders,
      newUsersToday,
      totalUsers,
      activeUsersToday,
      revenue,
    ] = await Promise.all([
      db.products.count().catch(() => 0),
      db.orders.count().catch(() => 0),

      // Đếm số user mới hôm nay
      UserModel.count({
        where: {
          // Nếu bảng users dưới DB dùng chữ hoa thì đổi thành 'createdAt', dùng gạch dưới thì giữ nguyên 'created_at'
          created_at: { [Op.gte]: today },
        },
      }).catch((err) => {
        console.error("Lỗi đếm newUsersToday:", err.message);
        return 0;
      }),

      UserModel.count().catch(() => 0),

      // Đếm số user đang hoạt động
      UserModel.count({
        where: {
          // Nếu bảng users dưới DB dùng chữ hoa thì đổi thành 'updatedAt', dùng gạch dưới thì giữ nguyên 'updated_at'
          updated_at: { [Op.gte]: activeTimeWindow },
          is_locked: 0,
        },
      }).catch((err) => {
        console.error("Lỗi đếm activeUsersToday:", err.message);
        return 0;
      }),

      db.orders
        .sum("total", {
          where: {
            created_at: { [Op.gte]: firstDayOfMonth },
          },
        })
        .catch(() => 0),
    ]);

    return res.status(200).json({
      message: "Lấy thống kê thành công",
      data: {
        totalProducts,
        totalOrders,
        newUsersToday,
        totalUsers,
        activeUsersToday,
        revenue: revenue || 0,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ", error: error.message });
  }
}

// Đổi role user - ADMIN only
export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (![UserRole.USER, UserRole.MANAGER, UserRole.ADMIN].includes(role)) {
    return res.status(400).json({ message: "Role không hợp lệ" });
  }

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  if (req.user.id == id) {
    return res
      .status(400)
      .json({ message: "Không thể đổi role của chính mình" });
  }

  await db.User.update({ role }, { where: { id } });
  const updatedUser = await db.User.findByPk(id);

  return res.status(200).json({
    message: "Cập nhật role thành công",
    data: new ResponseUser(updatedUser),
  });
}
