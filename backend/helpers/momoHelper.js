const crypto = require("crypto");
const axios = require("axios");

/**
 * Hàm khởi tạo thanh toán MoMo
 * @param {string|number} dbOrderId - ID đơn hàng trong Database của bạn
 * @param {number} amount - Tổng tiền đơn hàng (VNĐ)
 * @param {string} orderInfo - Thông tin mô tả đơn hàng
 */
async function createMomoPayment(dbOrderId, amount, orderInfo) {
  // =========================================================================
  // 🟢 PHƯƠNG ÁN MOCK (Đang bật): Giả lập phản hồi thành công để Test local
  // =========================================================================
  const timestamp = Date.now();
  const requestId = `${dbOrderId}_${timestamp}`;
  const orderId = `${dbOrderId}_${timestamp}`;
  const redirectBase =
    process.env.MOMO_REDIRECT_URL || "http://localhost:3000/order-success";

  console.log(`\n==================================================`);
  console.log(`🚀 [MOCK MOMO] Đang khởi tạo thanh toán giả lập...`);
  console.log(`📦 Mã đơn hàng: ${orderId}`);
  console.log(`💰 Số tiền: ${Number(amount).toLocaleString("vi-VN")} VNĐ`);
  console.log(`==================================================\n`);

  // Trả về dữ liệu chuẩn cấu trúc MoMo API v2 khi giao dịch thành công (resultCode = 0)
  return {
    partnerCode: "MOMO",
    orderId: orderId,
    requestId: requestId,
    amount: Number(amount),
    responseTime: timestamp,
    message: "Thành công.",
    resultCode: 0,
    // Trực tiếp chuyển hướng về trang Order Success của Frontend
    payUrl: `${redirectBase}?orderId=${orderId}&resultCode=0&message=Success`,
    deeplink: "",
    qrCodeUrl: "",
    applink: "",
  };

  /*
  // =========================================================================
  // 🟡 CODE GỌI API THẬT CỦA MOMO (Mở lại khi bạn có Key Sandbox chính chủ)
  // =========================================================================
  const partnerCode = (process.env.MOMO_PARTNER_CODE || "MOMO").trim();
  const accessKey = (process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85").trim();
  const secretKey = (process.env.MOMO_SECRET_KEY || "K9vuB4adeP3mGH2D").trim();
  const endpoint = (
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create"
  ).trim();

  const redirectUrl = (
    process.env.MOMO_REDIRECT_URL || "http://localhost:3000/order-success"
  ).trim();
  const ipnUrl = (
    process.env.MOMO_IPN_URL || "https://webhook.site/test-momo-ipn"
  ).trim();

  const timestamp = Date.now();
  const requestId = `${dbOrderId}_${timestamp}`;
  const orderId = `${dbOrderId}_${timestamp}`;
  const requestType = "captureWallet";
  const extraData = "";
  const amountStr = String(Math.round(Number(amount)));
  const cleanOrderInfo = `Thanh toan don hang DH${dbOrderId}`;

  // 1. Tạo rawSignature (Ghép đúng thứ tự A-Z)
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amountStr}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${cleanOrderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  // 2. Tạo signature dùng băm HMAC-SHA256
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature, "utf8")
    .digest("hex");

  // 3. Request Body
  const requestBody = {
    partnerCode,
    partnerName: "Test Store",
    storeId: "MomoStore",
    requestId,
    amount: Number(amountStr),
    orderId,
    orderInfo: cleanOrderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    lang: "vi",
    signature,
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    });

    if (response.data && response.data.resultCode === 0) {
      return response.data;
    } else {
      console.error("❌ MoMo Rejected:", response.data);
      throw new Error(
        response.data.message || `Lỗi MoMo Code: ${response.data.resultCode}`
      );
    }
  } catch (error) {
    const errData = error.response?.data || error.message;
    throw new Error(
      typeof errData === "object" ? JSON.stringify(errData) : errData
    );
  }
  */
}

module.exports = { createMomoPayment };
