/* emailjs
 service_esl6hmf: service key
 * template_z5jqzta: template id
 * wwEbio0oluHT-tckv: public key

/** npx sequelize-cli init

docker compose down   chạy sql
npx sequelize-cli model:generate --name User --attributes email:string,password:string,name:string,role:integer,avatar:string,phone:integer,created_at:date,updated_at:date
Run migration: npx sequelize-cli db:migrate
  : chạy cái migration apply vào database

Revert migration:
npx sequelize-cli db:migrate:undo : hoàn tác lại migration


npx sequelize-cli model:generate --name categories --attributes name:string,image:string
npx sequelize-cli model:generate --name brands --attributes name:string,image:string
npx sequelize-cli model:generate --name messages --attributes conversation_id:integer,sender_id:integer,content:text,status:string

npx sequelize-cli model:generate --name FlashSaleProducts --attributes flash_sale_id:integer,product_id:integer,flash_sale_price:decimal,flash_sale_stock:integer,flash_sale_sold:integer
npx sequelize-cli model:generate --name FlashSales --attributes name:string,start_time:date,end_time:date,status:integer

npx sequelize-cli model:generate --name banners --attributes name:string,image:string,status:integer,created_at:date,updated_at:date
npx sequelize-cli model:generate --name orders --attributes user_id:integer,status:integer,note:text,total:integer,created_at:date,updated_at:date
npx sequelize-cli model:generate --name products --attributes name:string,image:string,price:integer,description:string,oldprice:integer,specification:string,buyturn:integer,quanity:integer,brand_id:integer,category_id:integer
npx sequelize-cli model:generate --name order-detail --attributes order_id:integer,product_id:integer,quantity:integer,price:integer
npx sequelize-cli model:generate --name bannerdetail --attributes product_id:integer,banner_id:integer
npx sequelize-cli model:generate --name bannerdetail --attributes product_id:integer,banner_id:integer
npx sequelize-cli db:migrate 
npx sequelize-cli model:generate --name newdetail --attributes product_id:integer,new_id:integer
npx sequelize-cli model:generate --name feedback --attributes product_id:integer,user_id:integer,star:integer,content:text
npx sequelize-cli model:generate --name product_image --attributes product_id:integer,imageurl:text
npx sequelize-cli model:generate --name carts --attributes session_id:string,user_id:integer
npx sequelize-cli model:generate --name cart_items --attributes cart_id:integer,product_id:integer,quanity:integer
npx sequelize-cli model:generate --name variants --attributes name:string
npx sequelize-cli model:generate --name variant_values --attributes variant_id:integer,image:string,value:string
npx sequelize-cli model:generate --name product_variant_values --attributes product_id:integer,price:decimal,old_price:decimal,stock:integer,sku:string
yarn add express
npx sequelize-cli model:generate --name Attributes --attributes name:string
npx sequelize-cli model:generate --name ProductAttributes --attributes product_id:integer,attribute_id:integer,value:text
yarn add dotenv nodemon
yarn add --dev @babel/core @babel/node @babel/preset-env
yarn add multer


SELECT * FROM information_schema.table_constraints
WHERE table_schema = "shopapp" AND table_name = "products";
npx sequelize-cli migration:generate --name add_session_to_orders

ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1 : để xóa ràng buộc khóa ngoại 
npx sequelize-cli db:migrate

ALTER TABLE carts MODIFY session_id VARCHAR(255) NULL, ADD UNIQUE (session_id)
ALTER TABLE carts MODIFY COLUMN user_id INT NULL, ADD UNIQUE (user_id)  nếu lỗi thì nó sẽ thông báo ở sql
ALTER TABLE orders 
 MODIFY COLUMN status INT COMMENT
 '1: Pending, 2 : Processing, 3: Shipped, 4: Delivered, 5: Cancelled, 6: Refunded , 7: Failed'
SHOW FULL COLUMNS FROM orders WHERE Field = 'status';
ALTER TABLE orders 
ADD COLUMN phone VARCHAR(255) -- thêm cột phone vào bảng orders với kiểu dữ liệu varchar
ADD COLUMN address TEXT : khi dùng lệnh này để thêm vào sql thì ko cần thêm ở migration nữa
ALTER TABLE banners
MODIFY COLUMN status INT COMMENT
'0: Inactive, 1: Active, 2: Scheduled, 3: Expired';

ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL UNIQUE  thay đổi trường email trong users cho  phép email có thể null
yarn add jsonwebtoken
ALTER TABLE users ADD COLUMN is_locked TINYINT(1) DEFAULT 0;
UPDATE users SET role =2 WHERE id= ... --update role của user thành admin/user
ALTER TABLE users ADD COLUMN password_changed_at DATETIME; --- thêm cột thời gian thay đổi password
*/

const express = require("express");
const path = require("path");
const http = require("http"); // 👈 Thêm thư viện http
const { Server } = require("socket.io"); // 👈 Thêm socket.io
const { getUserFromSocketToken } = require("./helpers/TokenHelper");

require("dotenv").config({ path: path.join(__dirname, ".env") });
const db = require("./models"); // 👈 Đưa lên trước để io.use()/io.on() dùng được

const app = express();
const server = http.createServer(app); // 👈 Bọc app vào HTTP Server

// Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 📌 Bọc io vào express app để req.app.get("io") trong controller hoạt động
app.set("io", io);

// 📌 Xác thực JWT ngay khi client kết nối socket (bắt buộc, tránh kết nối vô danh)
io.use(async (socket, next) => {
  try {
    const user = await getUserFromSocketToken(socket);
    socket.user = user; // gắn user đã xác thực vào socket, dùng lại bên dưới
    next();
  } catch (error) {
    next(new Error(error.message || "Xác thực thất bại"));
  }
});

// 📌 Xử lý sự kiện Realtime Socket
io.on("connection", (socket) => {
  const user = socket.user;

  // Mỗi user tự join 1 room riêng theo id ngay khi kết nối (không cần đợi
  // mở đúng hội thoại nào). Nhờ đó server có thể báo tin nhắn mới cho họ dù
  // họ đang ở trang bất kỳ trong hệ thống (vd. Manager đang xem trang Sản
  // phẩm vẫn nhận được thông báo có khách nhắn tin) — chứ không chỉ những ai
  // đang mở sẵn đúng phòng "conversation_x".
  socket.join(`user_${user.id}`);

  // Chỉ buyer/seller thực sự của hội thoại mới được join phòng đó,
  // tránh trường hợp người lạ đoán conversationId rồi nghe lén tin nhắn.
  socket.on("join_conversation", async (conversationId, callback) => {
    try {
      const conversation = await db.conversations.findByPk(conversationId);
      if (!conversation) {
        return callback?.({ error: "Không tìm thấy hội thoại" });
      }
      const isParticipant =
        conversation.buyer_id === user.id || conversation.seller_id === user.id;
      if (!isParticipant) {
        return callback?.({
          error: "Bạn không có quyền tham gia hội thoại này",
        });
      }
      socket.join(`conversation_${conversationId}`);
      callback?.({ success: true });
    } catch (error) {
      callback?.({ error: "Lỗi server" });
    }
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, PATCH, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.send("hello");
});

const Approuter = require("./approuter");
Approuter.approuter(app);

const port = process?.env?.BACKEND_PORT ?? 5000;

// ⚠️ Lưu ý: Đổi app.listen thành server.listen
server.listen(port, () => {
  console.log(`Server & Socket.io đang chạy trên port ${port}`);
});