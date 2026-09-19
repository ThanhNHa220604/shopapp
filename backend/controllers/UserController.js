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

  // Kiểm tra tài khoản bị vô hiệu hóa / khóa
  if (user.is_locked === 1) {
    return res
      .status(403)
      .json({ message: "Tài khoản của bạn đã bị vô hiệu hóa" });
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
    attributes: ["id", "name", "email", "phone", "avatar", "role", "is_locked"],
  });

  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  const userData = user.toJSON();

  if (userData.avatar) {
    if (
      !userData.avatar.startsWith("http://") &&
      !userData.avatar.startsWith("https://")
    ) {
      userData.avatar = `http://localhost:5000/api/images/${userData.avatar}`;
    }
  }

  return res.status(200).json({
    message: "Lấy profile thành công",
    data: userData,
  });
}

// Cập nhật thông tin bản thân - USER, MANAGER, ADMIN
export async function updateUser(req, res) {
  const { id } = req.params;
  const body = req.body || {};
  const { name, oldPassword, newPassword } = body;

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

  if (req.file) {
    updateData.avatar = getAvatarURL(req.file.filename);
  } else if (body.avatar !== undefined) {
    updateData.avatar = body.avatar;
  }

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
  const { page = 1, limit = 15, role, status } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (role) where.role = role;

  // MẶC ĐỊNH: Nếu không truyền status="disabled", chỉ lấy các user HOẠT ĐỘNG
  if (status === "disabled") {
    where.is_locked = 1;
  } else {
    where.is_locked = 0; // Thêm dòng này để mặc định loại bỏ user bị vô hiệu hóa
  }

  const { count, rows } = await db.User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
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

// Vô hiệu hóa user (Chuyển sang Soft Delete bằng cờ is_locked) - ADMIN only
export async function deleteUser(req, res) {
  const { id } = req.params;

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  if (req.user.id == id) {
    return res
      .status(400)
      .json({ message: "Không thể vô hiệu hóa tài khoản của chính mình" });
  }

  // Đổi is_locked = 1 để vô hiệu hóa tài khoản thay vì xóa cứng khỏi DB
  await db.User.update({ is_locked: 1 }, { where: { id } });

  return res.status(200).json({ message: "Vô hiệu hóa user thành công" });
}

export async function getDashboardStats(req, res) {
  try {
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

    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    const activeTimeWindow = new Date(Date.now() - 15 * 60 * 1000);
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

      UserModel.count({
        where: {
          created_at: { [Op.gte]: today },
        },
      }).catch((err) => {
        console.error("Lỗi đếm newUsersToday:", err.message);
        return 0;
      }),

      UserModel.count().catch(() => 0),

      UserModel.count({
        where: {
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

// Đổi role hoặc Khôi phục trạng thái vô hiệu hóa user - ADMIN only
export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role, is_locked, isBlocked, status } = req.body;

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  if (req.user.id == id) {
    return res
      .status(400)
      .json({ message: "Không thể thao tác trên tài khoản của chính mình" });
  }

  const updateData = {};

  if (role) {
    if (![UserRole.USER, UserRole.MANAGER, UserRole.ADMIN].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }
    updateData.role = role;
  }

  // Khôi phục hoặc vô hiệu hóa tài khoản tùy theo cờ truyền từ FE
  if (is_locked !== undefined) {
    updateData.is_locked = is_locked;
  } else if (isBlocked !== undefined) {
    updateData.is_locked = isBlocked ? 1 : 0;
  } else if (status === "active") {
    updateData.is_locked = 0;
  } else if (status === "disabled") {
    updateData.is_locked = 1;
  }

  await db.User.update(updateData, { where: { id } });
  const updatedUser = await db.User.findByPk(id);

  return res.status(200).json({
    message: "Cập nhật thông tin thành công",
    data: new ResponseUser(updatedUser),
  });
}
