const Sequelize = require("sequelize");
const db = require("../models");
const InsertProduct = require("../dtos/requests/order/InsertOrder");
const UpdateOrder = require("../dtos/requests/order/UpdateOrder");
const Op = Sequelize.Op;
const { OrderStatus } = require("../constants");

async function getOrders(req, res) {
  const { search = "", page = 1, status, user_id } = req.query;

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};

  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [{ note: { [Op.like]: `%${search}%` } }],
    };
  }
  if (status) whereClause.status = status;
  if (user_id) whereClause.user_id = user_id;

  // 👉 ĐÃ ĐỒNG BỘ: Định nghĩa chính xác tên đối tượng được Sequelize nạp từ file hệ thống
  const TargetOrderDetail = db["order-detail"] || db.order_detail;

  const [orders, totalOrders] = await Promise.all([
    db.orders.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: TargetOrderDetail,
          as: "order_detail",
          include: [
            {
              model: db.products, // 👉 ĐÃ SỬA: Gọi thẳng db.products (viết thường, số nhiều) để nhận diện chuẩn cột 'created_at'
              as: "products",
            },
          ],
        },
      ],
    }),
    db.orders.count({ where: whereClause }),
  ]);

  res.status(200).json({
    message: "Lấy danh sách đơn hàng thành công",
    data: orders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / pageSize),
    totalOrders,
  });
}

async function getOrderById(req, res) {
  const { id } = req.params;

  const TargetOrderDetail = db["order-detail"] || db.order_detail;

  const order = await db.orders.findByPk(id, {
    include: [
      {
        model: TargetOrderDetail,
        as: "order_detail",
        include: [
          {
            model: db.products, // 👉 ĐÃ SỬA: Đồng bộ gọi db.products
            as: "products",
            attributes: ["id", "name", "image", "price"],
          },
        ],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  return res.status(200).json({
    message: "Lấy đơn hàng thành công",
    data: order,
  });
}

async function deleteOrder(req, res) {
  const { id } = req.params;
  console.log(OrderStatus.FAILED);

  const [update] = await db.orders.update(
    { status: OrderStatus.FAILED },
    {
      where: { id },
    },
  );

  if (update) {
    return res.status(200).json({
      message: "xóa mềm",
    });
  }
  return res.status(404).json({
    message: "đơn hàng không tồn tại",
  });
}

async function updateOrder(req, res) {
  const { id } = req.params;

  const [updated] = await db.orders.update(req.body, {
    where: { id },
  });

  if (updated) {
    return res.status(200).json({
      message: "Cập nhật đơn hàng thành công",
    });
  }

  return res.status(404).json({
    message: "Đơn hàng không tồn tại",
  });
}

module.exports = {
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
};
