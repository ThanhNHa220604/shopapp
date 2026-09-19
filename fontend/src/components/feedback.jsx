import React, { useState, useEffect, useCallback } from "react";

const styles = {
  container: {
    width: "100%",
    maxWidth: "100%",
    margin: "24px auto",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "none",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#1e293b",
    boxSizing: "border-box",
  },
  header: {
    fontSize: "22px", // Tăng từ 16px lên 22px
    fontWeight: "700",
    marginBottom: "18px",
    color: "#0f172a",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "12px",
  },
  formContainer: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px", // Tăng padding bên trong form
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "18px", // Tăng từ 14px lên 18px
    fontWeight: "600",
    marginBottom: "14px",
    color: "#334155",
  },
  starSelector: { display: "flex", gap: "8px", marginBottom: "16px" },
  interactiveStar: {
    fontSize: "36px", // Tăng từ 28px lên 36px cho dễ bấm
    cursor: "pointer",
    transition: "transform 0.1s ease, color 0.1s ease",
    userSelect: "none",
  },
  textarea: {
    width: "100%",
    height: "110px", // Tăng chiều cao khung nhập từ 80px lên 110px
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px", // Tăng cỡ chữ nhập từ 13px lên 16px
    lineHeight: "1.6",
    resize: "none",
    boxSizing: "border-box",
    outline: "none",
    marginBottom: "14px",
  },
  /* --- Style upload ảnh --- */
  uploadContainer: {
    marginBottom: "16px",
  },
  uploadLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px", // Tăng kích thước nút upload
    backgroundColor: "#f1f5f9",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px", // Tăng từ 12px lên 14px
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  previewContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  previewWrapper: {
    position: "relative",
    width: "80px", // Tăng ảnh preview từ 60px lên 80px
    height: "80px",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
  },
  removeImgBtn: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "20px", // Tăng từ 16px lên 20px
    height: "20px",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px", // Nút gửi to hơn, dễ tương tác
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px", // Tăng từ 13px lên 15px
    cursor: "pointer",
  },
  reviewList: { display: "flex", flexDirection: "column", gap: "16px" }, // Giãn khoảng cách giữa các card feedback
  reviewCard: {
    padding: "20px", // Tăng padding bên trong card từ 12px lên 20px
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
  /* Header chứa Avatar và Name+Stars nằm ngang */
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px", // Giãn rộng khoảng cách giữa avatar và text
    marginBottom: "14px",
  },
  /* Hộp bọc Tên ở trên, Sao ở dưới xếp theo chiều dọc */
  nameAndStarsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  avatar: {
    width: "56px", // Tăng kích thước ảnh đại diện từ 40px lên 56px
    height: "56px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#e2e8f0",
    border: "1px solid #cbd5e1",
  },
  userName: {
    fontWeight: "700",
    fontSize: "16px", // Tăng từ 13px lên 16px cho tên người mua rõ ràng hơn
    color: "#1e293b",
    lineHeight: "1.2",
  },
  starContainer: {
    color: "#fbbf24",
    fontSize: "15px", // Tăng cỡ sao từ 12px lên 15px
    display: "flex",
    gap: "3px",
  },
  cardContent: {
    fontSize: "16px", // Tăng chữ nội dung đánh giá từ 13px lên 16px (bằng cỡ chữ tiêu chuẩn dễ đọc)
    color: "#334155",
    marginTop: "8px",
    lineHeight: "1.6",
  },
  feedbackImages: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  feedbackImg: {
    width: "110px", // Tăng kích thước ảnh phản hồi của khách từ 80px lên 110px
    height: "110px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  alreadyReviewedBanner: {
    padding: "16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
    color: "#166534",
    fontSize: "15px", // Tăng từ 13px lên 15px
    fontWeight: "600",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

// Địa chỉ backend lưu trữ tài nguyên static ảnh avatar / feedback
const ASSETS_BASE_URL = "http://localhost:3000/uploads";

export default function ProductFeedback({
  productId,
  currentUserId,
  token,
  hasPurchased = false,
  apiUrl = "http://localhost:3000/api",
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra xem user hiện tại đã đánh giá chưa
  const hasUserReviewed = feedbacks.some(
    (item) => String(item.user_id || item.user?.id) === String(currentUserId),
  );

  const fetchProductReviews = useCallback(async () => {
    try {
      let queryUrl = `${apiUrl}/feedbacks?productId=${productId}`;
      const response = await fetch(queryUrl);
      const resData = await response.json();
      if (response.ok) {
        setFeedbacks(resData.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [productId, apiUrl]);

  useEffect(() => {
    fetchProductReviews();
  }, [productId, fetchProductReviews]);

  // Xử lý chọn hình ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Giới hạn tối đa 3 hình ảnh tải lên
    const updatedFiles = [...selectedImages, ...files].slice(0, 3);
    setSelectedImages(updatedFiles);

    const urls = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Hủy ảnh đã chọn
  const handleRemoveImage = (index) => {
    const updatedFiles = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedFiles);

    URL.revokeObjectURL(previewUrls[index]);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);
  };

  // Submit form đánh giá kèm file
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("product_id", Number(productId));
      formData.append("user_id", currentUserId);
      formData.append("star", rating);
      formData.append("content", comment.trim());

      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`${apiUrl}/feedbacks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setComment("");
        setRating(0);
        setSelectedImages([]);
        setPreviewUrls([]);
        fetchProductReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Đánh giá & Phản hồi</h2>

      {/* Banner thông báo đã đánh giá */}
      {hasPurchased && hasUserReviewed && (
        <div style={styles.alreadyReviewedBanner}>
          <span>✓</span> Bạn đã gửi đánh giá cho sản phẩm này rồi!
        </div>
      )}

      {/* Form viết đánh giá */}
      {hasPurchased && !hasUserReviewed && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmitReview}>
            <div style={styles.starSelector}>
              {[1, 2, 3, 4, 5].map((value) => (
                <span
                  key={value}
                  style={{
                    ...styles.interactiveStar,
                    color:
                      value <= (hoverRating || rating) ? "#fbbf24" : "#cbd5e1",
                  }}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <textarea
              style={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập cảm nhận của bạn về chất lượng sản phẩm..."
            />

            {/* Mục upload ảnh sản phẩm */}
            <div style={styles.uploadContainer}>
              <label style={styles.uploadLabel}>
                📷 Thêm hình ảnh sản phẩm
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>

              {previewUrls.length > 0 && (
                <div style={styles.previewContainer}>
                  {previewUrls.map((url, index) => (
                    <div key={url} style={styles.previewWrapper}>
                      <img src={url} alt="preview" style={styles.previewImg} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={styles.removeImgBtn}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div style={styles.reviewList}>
        {feedbacks.length === 0 ? (
          <p
            style={{ fontSize: "15px", color: "#94a3b8", fontStyle: "italic" }}
          >
            Chưa có lượt đánh giá nào.
          </p>
        ) : (
          feedbacks.map((item) => {
            // Giải quyết vấn đề không ra tên người mua hàng:
            // Bọc lót cả hai trường hợp "User" viết hoa (Sequelize mặc định) và "user" viết thường
            const userObj = item.User || item.user || {};

            const reviewerName =
              userObj.name ||
              item.user_name ||
              item.username ||
              "Người dùng hệ thống";

            const avatarFileName = userObj.avatar;

            return (
              <div key={item.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  {/* Avatar: chỉ hiển thị khi thực sự tồn tại */}
                  {avatarFileName &&
                    avatarFileName !== "NULL" &&
                    avatarFileName !== "" && (
                      <img
                        src={`${ASSETS_BASE_URL}/${avatarFileName}`}
                        alt={reviewerName}
                        style={styles.avatar}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}

                  {/* Cụm thông tin: Tên ở dòng trên, Sao ở dòng dưới sát nhau */}
                  <div style={styles.nameAndStarsContainer}>
                    <span style={styles.userName}>{reviewerName}</span>
                    <div style={styles.starContainer}>
                      {"★".repeat(item.star)}
                      {"☆".repeat(5 - item.star)}
                    </div>
                  </div>
                </div>

                {/* Nội dung đánh giá */}
                <div style={styles.cardContent}>{item.content}</div>

                {/* Danh sách hình ảnh phản hồi của sản phẩm */}
                {item.images && item.images.length > 0 && (
                  <div style={styles.feedbackImages}>
                    {item.images.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={
                          imgUrl.startsWith("http")
                            ? imgUrl
                            : `${ASSETS_BASE_URL}/${imgUrl}`
                        }
                        alt={`Sản phẩm đánh giá ${idx}`}
                        style={styles.feedbackImg}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
