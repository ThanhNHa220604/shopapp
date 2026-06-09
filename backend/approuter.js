const express = require("express");
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
const InsertBannerDetailRequest = require("./dtos/requests/bannerdetail/insertBannerDetail");
const InsertProductImageRequest = require("./dtos/requests/product_image/insertProductImage");
const InsertCartRequest = require("./dtos/requests/carts/insertCart");
const InsertCartItemRequest = require("./dtos/requests/cart_items/insertCartItem");
const asyncHandler = require("./middlewares/aysncHandler");
const Upload = require("./middlewares/ImageUpload");
const validateImage = require("./middlewares/validateImage");
const validate = require("./middlewares/validate");
const uploadGoogeImage = require("./middlewares/imageGoogleUpload");

const { UserRole } = require("./constants");
const { OrderStatus } = require("./constants");
const { requireRoles } = require("./middlewares/jwt");

export function approuter(app) {
  // ── AUTH (không cần token) ──
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

  // ── ADMIN routes cụ thể (phải trước /:id) ──
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
  router.get(
    "/users/profile",
    requireRoles([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
    asyncHandler(User.getProfile),
  );
  router.delete(
    "/users/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.deleteUser),
  );

  // ── PARAM routes (để cuối) ──
  router.get(
    "/users/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(User.getUserById),
  );
  router.put(
    "/users/:id",
    requireRoles([UserRole.USER, UserRole.ADMIN]),
    asyncHandler(User.updateUser),
  );
  // PRODUCT ROUTES
  router.get("/products", asyncHandler(Product.getProducts));
  router.get(
    "/products/:id",

    asyncHandler(Product.getProductById),
  );
  router.post(
    "/products",
    requireRoles([UserRole.MANAGER]),
    validateImage,
    validate(InsertProductRequest),
    asyncHandler(Product.insertProduct),
  );
  router.put(
    "/products/:id",
    requireRoles([UserRole.MANAGER]),
    validateImage,
    validate(UpdateProductRequest),
    asyncHandler(Product.updateProduct),
  );
  router.delete(
    "/products/:id",
    requireRoles([UserRole.MANAGER]),
    asyncHandler(Product.deleteProduct),
  );
  //NEW ROUTER
  router.get("/news", asyncHandler(News.getNews));

  router.get("/news/:id", asyncHandler(News.getNewsById));

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

  //BANNER
  router.get("/banners", asyncHandler(Banner.getBanners));

  router.get("/banners/:id", asyncHandler(Banner.getBannerById));

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

  //BANNERDETAIL

  router.get("/bannerdetails", asyncHandler(BannerDetail.getBannerDetails));

  router.get(
    "/bannerdetails/:id",
    asyncHandler(BannerDetail.getBannerDetailById),
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
  //OTHER ROUTES
  router.get("/categories", asyncHandler(Category.getCategories));

  router.get("/categories/:id", asyncHandler(Category.getCategoryById));

  router.post(
    "/categories",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    asyncHandler(Category.insertCategory),
  );

  router.put(
    "/categories/:id",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    asyncHandler(Category.updateCategory),
  );

  router.delete(
    "/categories/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(Category.deleteCategory),
  );

  router.get("/brands", asyncHandler(Brand.getBrands));

  router.get("/brands/:id", asyncHandler(Brand.getBrandById));

  router.post(
    "/brands",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    asyncHandler(Brand.insertBrand),
  );

  router.put(
    "/brands/:id",
    requireRoles([UserRole.ADMIN]),
    validateImage,
    asyncHandler(Brand.updateBrand),
  );

  router.delete(
    "/brands/:id",

    requireRoles([UserRole.ADMIN]),
    asyncHandler(Brand.deleteBrand),
  );

  //Order
  router.get("/orders", asyncHandler(Order.getOrders));

  router.get("/orders/:id", asyncHandler(Order.getOrderById));

  /*router.post(
    "/orders",
    validate(InsertOrderRequest),
    asyncHandler(Order.insertOrder),
  );*/

  router.put(
    "/orders/:id",
    validate(UpdateOrderRequest),
    asyncHandler(Order.updateOrder),
  );

  router.delete(
    "/orders/:id",
    requireRoles([UserRole.ADMIN]),
    asyncHandler(Order.deleteOrder),
  );
  //NEWDETAIL ROUTER
  router.get("/newsdetails", asyncHandler(NewsDetail.getNewsDetails));

  router.get("/newsdetails/:id", asyncHandler(NewsDetail.getNewsDetailById));

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
  router.get("/images", asyncHandler(ImageController.getAllImages));
  router.post(
    "/images/upload",
    Upload.array("images", 5), //max 5 hình ảnh
    asyncHandler(ImageController.uploadImages),
  );
  router.get("/images/:filename", asyncHandler(ImageController.viewImage));
  router.post(
    "/images/google/upload",
    requireRoles([UserRole.ADMIN]),
    uploadGoogeImage.array("images", 5),
    asyncHandler(ImageController.uploadImageToGoogleStorage),
  );

  //PRODUCT_IMAGE
  router.get("/product-images", asyncHandler(ProductImage.getProductImages));

  router.get(
    "/product-images/:id",
    asyncHandler(ProductImage.getProductImageById),
  );

  router.post(
    "/product-images",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    validate(InsertProductImageRequest),
    asyncHandler(ProductImage.insertProductImage),
  );
  router.delete(
    "/product-images/:id",
    requireRoles([UserRole.ADMIN, UserRole.USER]),
    asyncHandler(ProductImage.deleteProductImage),
  );
  //CARTS

  router.get("/carts", asyncHandler(CartController.getCarts));
  router.get("/carts/:id", asyncHandler(CartController.getCartById));
  router.post(
    "/carts/checkout",

    asyncHandler(CartController.checkoutCart),
  );
  router.post(
    "/carts",
    validate(InsertCartRequest),
    asyncHandler(CartController.insertCart),
  );

  router.delete("/carts/:id", asyncHandler(CartController.deleteCart));
  //CARTITEMS
  router.get("/cart-items", asyncHandler(CartItemController.getCartItems));

  router.post(
    "/cart-items",
    requireRoles([UserRole.USER]),
    validate(InsertCartItemRequest),
    asyncHandler(CartItemController.insertCartItem),
  );
  router.get(
    "/cart-items/carts/:cart_id",
    asyncHandler(CartItemController.getCartItembyCartId),
  );
  router.put(
    "/cart-items/:id",
    asyncHandler(CartItemController.updateCartItem),
  );

  router.delete(
    "/cart-items/:id",
    asyncHandler(CartItemController.deleteCartItem),
  );
  app.use("/api", router);
}
