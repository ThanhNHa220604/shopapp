const express = require("express");
const multer = require("multer"); // 👈 Sửa import thành require
const router = express.Router();

const Product = require("./controllers/ProductController");
const Order = require("./controllers/OrderController");
const Category = require("./controllers/CategoryController");
const Brand = require("./controllers/BrandController");
const User = require("./controllers/UserController");
const News = require("./controllers/newController");
const NewsDetail = require("./controllers/newDetailController");
const OrderDetail = require("./controllers/OrderDetailController");
const Banner = require("./controllers/bannerController");
const BannerDetail = require("./controllers/bannerdetailController");
const ImageController = require("./controllers/ImageController");
const ProductImage = require("./controllers/productImageController");
const CartController = require("./controllers/CartController");
const CartItemController = require("./controllers/CartItemController");
const FlashSaleController = require("./controllers/FlashSaleController");
const Feedback = require("./controllers/feedbackController");
const voucherController = require("./controllers/voucherController");
const voucherDetailController = require("./controllers/voucherDetailController");
const SettingController= require("./controllers/Settingcontroller");
const ChatController = require("./controllers/chatController");


const InsertProductRequest = require("./dtos/requests/products/insertProduct");
const UpdateProductRequest = require("./dtos/requests/products/updateProduct");
const UpdateOrderRequest = require("./dtos/requests/order/UpdateOrder");
const InsertOrderRequest = require("./dtos/requests/order/InsertOrder");
const InsertUserRequest = require("./dtos/requests/user/insertUser");
const LoginUserRequest = require("./dtos/requests/user/LoginUserRequest");
const InsertNewsRequest = require("./dtos/requests/news/insertNew");
const UpdateNewsRequest = require("./dtos/requests/news/updateNew");
const InsertNewDetailRequest = require("./dtos/requests/newDetail/insertNewDetail");
const InsertBannerRequest = require("./dtos/requests/banner/insertBanner");
const InsertVoucherRequest = require("./dtos/requests/vouchers/insertVoucherRequest");
const InsertBannerDetailRequest = require("./dtos/requests/bannerdetail/insertBannerDetail");
const InsertProductImageRequest = require("./dtos/requests/product_image/insertProductImage");
const InsertCartRequest = require("./dtos/requests/carts/insertCart");
const InsertCartItemRequest = require("./dtos/requests/cart_items/insertCartItem");

const asyncHandler = require("./middlewares/aysncHandler");
const Upload = require("./middlewares/ImageUpload");
const validateImage = require("./middlewares/validateImage");
const validate = require("./middlewares/validate");
const uploadGoogeImage = require("./middlewares/imageGoogleUpload");
const Maintaince = require("./middlewares/Maintenance");



const {
  InsertFeedbackRequest,
} = require("./dtos/requests/feedback/feedbackRequests");

const { UserRole } = require("./constants");
const { OrderStatus } = require("./constants");
const { requireRoles } = require("./middlewares/jwt");
// Thêm đoạn này bên dưới các dòng require() controller trong approuter.js
console.log("--- KIỂM TRA CONTROLLERS ---");
console.log("Product:", Product);
console.log("Feedback:", Feedback);
console.log("Order:", Order);
console.log("User:", User);
console.log("Voucher:", voucherController);
console.log("----------------------------");

function approuter(app) {
  // ─────────────────────────────────────────────────────────────────
  // 1. PUBLIC ROUTES (Ai cũng có thể truy cập, KHÔNG cần Token)
  // ─────────────────────────────────────────────────────────────────

  // Auth
  router.post(
    "/users/register",
    validate(InsertUserRequest),
    asyncHandler(User.RegisterUser),
  );
  router.post(
    "/users/login",
    validate(LoginUserRequest),
    asyncHandler(User.Login),
  );

  // Products
  router.get("/products", asyncHandler(Product.getProducts));
  // ⚠️ Route này PHẢI đặt trước "/products/:id", nếu không "manage" sẽ bị
  // hiểu nhầm là :id và bị route công khai bên dưới chặn mất.
  router.get(
    "/products/manage",
    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Product.getMyProducts),
  );
  router.patch("/products/:id/restore", 

    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Product.restoreProduct),
  );

  router.get("/products/deleted", 
    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Product.getDeletedProducts),);
  router.get("/products/:id", asyncHandler(Product.getProductById));

  // News & News Detail
  router.get("/news", asyncHandler(News.getNews));
  router.get("/news/:id", asyncHandler(News.getNewsById));
  router.get("/newsdetails", asyncHandler(NewsDetail.getNewsDetails));
  router.get("/newsdetails/:id", asyncHandler(NewsDetail.getNewsDetailById));

  // Banners & Banner Detail
  router.get("/banners", asyncHandler(Banner.getBanners));
  router.get("/banners/:id", asyncHandler(Banner.getBannerById));
  router.get("/bannerdetails", asyncHandler(BannerDetail.getBannerDetails));
  router.get(
    "/bannerdetails/:id",
    asyncHandler(BannerDetail.getBannerDetailById),
  );

  // Categories & Brands
  router.get("/categories", asyncHandler(Category.getCategories));
  router.get("/categories/:id", asyncHandler(Category.getCategoryById));
  router.get("/brands", asyncHandler(Brand.getBrands));
  router.get("/brands/:id", asyncHandler(Brand.getBrandById));

  // Images public views
  router.get("/images", asyncHandler(ImageController.getAllImages));
  router.get("/images/:filename", asyncHandler(ImageController.viewImage));
  router.get("/product-images", asyncHandler(ProductImage.getProductImages));
  router.get(
    "/product-images/:id",
    asyncHandler(ProductImage.getProductImageById),
  );

  // Feedbacks
  router.get("/feedbacks", asyncHandler(Feedback.getFeedbacks));
  router.get("/feedbacks/:id", asyncHandler(Feedback.getFeedbackById));
  router.post(
    "/feedbacks",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    Upload.array("images", 3),
    validate(InsertFeedbackRequest),
    asyncHandler(Feedback.insertFeedback),
  );
  router.delete(
    "/feedbacks/:id",
    requireRoles([UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]),
    asyncHandler(Feedback.deleteFeedback),
  );

  // ─────────────────────────────────────────────────────────────────
  // 2. PRIVATE ROUTES (Bắt buộc đăng nhập - Yêu cầu phân quyền Roles)
  // ─────────────────────────────────────────────────────────────────

  // --- USER PROFILE & MANAGEMENT ---
  router.get(
    "/users/profile",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(User.getProfile),
  );
  router.put(
    "/users/:id",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(User.updateUser),
  );

  router.get(
    "/users",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.getAllUsers),
  );
  router.get(
    "/users/dashboard-stats",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.getDashboardStats),
  );
  router.patch(
    "/users/:id/role",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.updateUserRole),
  );
  router.delete(
    "/users/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.deleteUser),
  );
  router.get(
    "/users/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.getUserById),
  );

  router.get("/flash-sales", asyncHandler(FlashSaleController.getFlashSales));
  router.get(
    "/flash-sales/:id",
    asyncHandler(FlashSaleController.getFlashSaleById),
  );
  router.post(
    "/flash-sales",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(FlashSaleController.insertFlashSale),
  );
  router.put(
    "/flash-sales/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(FlashSaleController.updateFlashSale),
  );
  router.delete(
    "/flash-sales/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(FlashSaleController.deleteFlashSale),
  );

  // --- CARTS & CART ITEMS ---
  router.get(
    "/carts",
    requireRoles([UserRole.USER]),
    asyncHandler(CartController.getCarts),
  );
  router.get(
    "/carts/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartController.getCartById),
  );
  router.post(
    "/carts",
    requireRoles([UserRole.USER]),
    validate(InsertCartRequest),
    asyncHandler(CartController.insertCart),
  );
  router.delete(
    "/carts/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartController.deleteCart),
  );

  router.post(
    "/carts/checkout",
    
    requireRoles([UserRole.USER]),
    asyncHandler(CartController.checkoutCart),
  );

  // MoMo IPN
  router.post(
    "/momo-ipn",
    asyncHandler(async (req, res) => {
      try {
        const { orderId, resultCode, message } = req.body;
        if (resultCode === 0) {
          const dbOrderId = orderId.replace("DH", "");
          const db = require("../models");
          await db.orders.update({ status: 2 }, { where: { id: dbOrderId } });
        }
        return res.status(204).send();
      } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }),
  );

  router.get(
    "/cart-items",
    requireRoles([UserRole.USER]),
    asyncHandler(CartItemController.getCartItems),
  );
  router.post(
    "/cart-items",
    requireRoles([UserRole.USER]),
    validate(InsertCartItemRequest),
    asyncHandler(CartItemController.addToCart),
  );
  //router.get(
  //  "/cart-items/carts/:cart_id",
  //  requireRoles([UserRole.USER]),
  //  asyncHandler(CartItemController.getCartItembyCartId),
  //);
  router.put(
    "/cart-items/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartItemController.updateCartItem),
  );
  router.delete(
    "/cart-items/:id",
    requireRoles([UserRole.USER]),
    asyncHandler(CartItemController.deleteCartItem),
  );

  // --- ORDERS ---
  router.get(
    "/orders",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Order.getOrders),
  );
  router.get(
    "/orders/:id",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Order.getOrderById),
  );
  router.put(
    "/orders/:id",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    validate(UpdateOrderRequest),
    asyncHandler(Order.updateOrder),
  );
  router.delete(
    "/orders/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(Order.deleteOrder),
  );

  // --- MANAGER ROUTES ---
  router.post(
    "/products",
    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    validateImage,
    validate(InsertProductRequest),
    asyncHandler(Product.insertProduct),
  );
  router.put(
    "/products/:id",
    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    validateImage,
    validate(UpdateProductRequest),
    asyncHandler(Product.updateProduct),
  );
  router.delete(
    "/products/:id",
    requireRoles([UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(Product.deleteProduct),
  );

  router.post(
    "/categories",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validateImage,
    asyncHandler(Category.insertCategory),
  );
  router.put(
    "/categories/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validateImage,
    asyncHandler(Category.updateCategory),
  );
  router.delete(
    "/categories/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(Category.deleteCategory),
  );

  router.post(
    "/brands",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validateImage,
    asyncHandler(Brand.insertBrand),
  );
  router.put(
    "/brands/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validateImage,
    asyncHandler(Brand.updateBrand),
  );
  router.delete(
    "/brands/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(Brand.deleteBrand),
  );

  // --- ADMIN ROUTES ---
  router.post(
    "/news",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    validate(InsertNewsRequest),
    asyncHandler(News.insertNewsArticle),
  );
  router.put(
    "/news/:id",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    validate(UpdateNewsRequest),
    asyncHandler(News.updateNews),
  );
  router.delete(
    "/news/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(News.deleteNews),
  );

  router.post(
    "/newsdetails",
    requireRoles([UserRole.ADMIN]),
    validate(InsertNewDetailRequest),
    asyncHandler(NewsDetail.insertNewsDetail),
  );
  router.put(
    "/newsdetails/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(NewsDetail.updateNewsDetail),
  );
  router.delete(
    "/newsdetails/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(NewsDetail.deleteNewsDetail),
  );

  router.post(
    "/banners",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    validate(InsertBannerRequest),
    asyncHandler(Banner.insertBanner),
  );
  router.put(
    "/banners/:id",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    asyncHandler(Banner.updateBanner),
  );
  router.delete(
    "/banners/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(Banner.deleteBanner),
  );

  router.post(
    "/bannerdetails",
    requireRoles([UserRole.ADMIN]),
    validate(InsertBannerDetailRequest),
    asyncHandler(BannerDetail.insertBannerDetail),
  );
  router.put(
    "/bannerdetails/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BannerDetail.updateBannerDetail),
  );
  router.delete(
    "/bannerdetails/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(BannerDetail.deleteBannerDetail),
  );

  router.post(
    "/images/upload",
    requireRoles([UserRole.USER, UserRole.ADMIN, UserRole.MANAGER]),
    Upload.array("images", 5),
    asyncHandler(ImageController.uploadImages),
  );
  router.post(
    "/images/google/upload",
    requireRoles([UserRole.ADMIN]),
    uploadGoogeImage.array("images", 5),
    asyncHandler(ImageController.uploadImageToGoogleStorage),
  );
  router.post(
    "/product-images",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validate(InsertProductImageRequest),
    asyncHandler(ProductImage.insertProductImage),
  );
  router.delete(
    "/product-images/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(ProductImage.deleteProductImage),
  );

  // =============================================================================
  // VOUCHERS ROUTE
  // =============================================================================

  // 1. PUBLIC ROUTES
  router.post("/vouchers/apply", asyncHandler(voucherController.applyVoucher));
  router.get(
    "/vouchers/applicable-products/:productId",
    asyncHandler(voucherController.getVouchersForProduct),
  );

  // 2. USER ROUTES (Bắt buộc khai báo TRƯỚC route /vouchers/:id)
  router.post(
    "/vouchers/save",
    requireRoles([UserRole.USER]),
    asyncHandler(voucherController.saveVoucher),
  );

  router.get(
    "/vouchers/user-saved",
    requireRoles([UserRole.USER]),
    asyncHandler(voucherController.getUserSavedVouchers),
  );

  // 3. ADMIN & MANAGER MANAGEMENT ROUTES
  router.post(
    "/vouchers",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    validate(InsertVoucherRequest),
    asyncHandler(voucherController.createVoucher),
  );

  router.get(
    "/vouchers",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(voucherController.getVouchers),
  );

  // 4. DYNAMIC ROUTES (:id) - BẮT BUỘC ĐẶT DƯỚI CÙNG
  if (voucherDetailController && voucherDetailController.getVoucherUsages) {
    router.get(
      "/vouchers/:id/usages",
      requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
      asyncHandler(voucherDetailController.getVoucherUsages),
    );
  }

  router.get(
    "/vouchers/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(voucherDetailController.getVoucherById),
  );

  // 🔄 CẬP NHẬT VOUCHER
  router.put(
    "/vouchers/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(voucherController.updateVoucher),
  );

  // 🗑️ XÓA VOUCHER
  router.delete(
    "/vouchers/:id",
    requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
    asyncHandler(voucherController.deleteVoucher),
  );

  //chat router
  router.post(
    "/chat/conversations",
    requireRoles(UserRole.USER),
    asyncHandler(ChatController.startConversation),
  );

  router.get(
    "/chat/conversations",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(ChatController.listConversations),
  );

  router.get(
    "/chat/conversations/:id/messages",
    
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(ChatController.getMessages),
  );

  router.post(
    "/chat/conversations/:id/messages",
    Upload.single("image"),
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(ChatController.sendMessage),
  );


  router.get("/setting", asyncHandler(SettingController.getSettings));
router.put(
  "/setting",
  requireRoles([UserRole.ADMIN, UserRole.MANAGER]),
  asyncHandler(SettingController.updateSettings),
);

  app.use("/api", router);
}

module.exports = { approuter };
