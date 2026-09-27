const db = require("../models");

async function getOrderDetails(req, res) {
  const orderDetails = await db.order_detail.findAll();
  return res.status(200).json({
    message: "Lấy danh sách order detail thành công",
    data: orderDetails,
  });
}

async function getOrderDetailById(req, res) {
  const { id } = req.params;
  const orderDetail = await db.order_detail.findByPk(id, {
    include: [{ model: db.products, as: "products" }],
  });

  if (!orderDetail) {
    return res.status(404).json({ message: "Không tìm thấy order detail" });
  }

  return res.status(200).json({
    message: "Lấy order detail thành công",
    data: orderDetail,
  });
}

module.exports = {
  getOrderDetails,
  getOrderDetailById,
};
