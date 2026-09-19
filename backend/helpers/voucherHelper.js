/**
 * Lọc ra các sản phẩm trong giỏ hàng/đơn hàng ĐỦ ĐIỀU KIỆN áp dụng voucher
 */
function getEligibleItems(
  voucher,
  cartItems,
  allowedProductIds = [],
  allowedCategoryIds = [],
) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];

  return cartItems.filter((item) => {
    // 1. Nếu là Voucher do MANAGER (Seller) tạo
    if (voucher.created_by_type === "manager") {
      // Bắt buộc sản phẩm phải thuộc về Manager đó
      const itemUserId = item.user_id || item.products?.user_id;
      if (itemUserId !== voucher.creator_id) return false;

      if (voucher.apply_scope === "all") return true;
      if (voucher.apply_scope === "specific_products") {
        const pId = Number(item.product_id || item.id);
        return allowedProductIds.includes(pId);
      }
    }

    // 2. Nếu là Voucher do ADMIN tạo
    if (voucher.created_by_type === "admin") {
      if (voucher.apply_scope === "all") return true;

      const pId = Number(item.product_id || item.id);
      if (voucher.apply_scope === "specific_products") {
        return allowedProductIds.includes(pId);
      }

      const cId = Number(item.category_id || item.products?.category_id);
      if (voucher.apply_scope === "specific_categories") {
        return allowedCategoryIds.includes(cId);
      }
    }

    return false;
  });
}

/**
 * Validate các điều kiện bắt buộc của Voucher (Thời hạn, Lượt dùng, Đơn hàng tối thiểu)
 */
function validateVoucherRules(voucher, eligibleSubtotal, userUsageCount = 0) {
  const now = new Date();

  if (voucher.is_active === false || voucher.is_active === 0) {
    throw new Error("Mã giảm giá này hiện tại đang tạm khóa");
  }

  if (now < new Date(voucher.start_date)) {
    throw new Error("Mã giảm giá chưa đến thời gian áp dụng");
  }

  if (now > new Date(voucher.end_date)) {
    throw new Error("Mã giảm giá đã hết hạn sử dụng");
  }

  if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
    throw new Error("Mã giảm giá đã hết lượt sử dụng trên hệ thống");
  }

  if (voucher.limit_per_user && userUsageCount >= voucher.limit_per_user) {
    throw new Error(
      `Bạn đã dùng hết lượt cho phép (${voucher.limit_per_user} lần) của mã này`,
    );
  }

  const minOrder = parseFloat(voucher.min_order_value || 0);
  if (eligibleSubtotal < minOrder) {
    throw new Error(
      `Tổng giá trị sản phẩm hợp lệ chưa đạt mức tối thiểu ${minOrder.toLocaleString()}đ`,
    );
  }

  return true;
}

/**
 * Tính toán số tiền giảm giá chính xác
 */
function calculateDiscountAmount(voucher, eligibleSubtotal) {
  let discount = 0;
  const discountVal = parseFloat(voucher.discount_value || 0);

  if (voucher.discount_type === "fixed") {
    discount = discountVal;
  } else if (voucher.discount_type === "percent") {
    discount = (eligibleSubtotal * discountVal) / 100;

    // Kiểm tra trần giảm giá tối đa nếu có
    if (voucher.max_discount_amount) {
      const maxDiscount = parseFloat(voucher.max_discount_amount);
      if (discount > maxDiscount) {
        discount = maxDiscount;
      }
    }
  }

  // Không giảm quá tổng tiền của các sản phẩm hợp lệ
  return Math.min(discount, eligibleSubtotal);
}

module.exports = {
  getEligibleItems,
  validateVoucherRules,
  calculateDiscountAmount,
};
