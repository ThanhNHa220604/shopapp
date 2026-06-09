/** npx sequelize-cli init
 mysql -u root -p  chạy sql
npx sequelize-cli model:generate --name User --attributes email:string,password:string,name:string,role:integer,avatar:string,phone:integer,created_at:date,updated_at:date
Run migration: npx sequelize-cli db:migrate
  : chạy cái migration apply vào database

Revert migration:
npx sequelize-cli db:migrate:undo : hoàn tác lại migration


npx sequelize-cli model:generate --name categories --attributes name:string,image:string
npx sequelize-cli model:generate --name brands --attributes name:string,image:string

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
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const db = require("./models");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE,PATCH, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") return res.sendStatus(200); // xử lý preflight
  next();
});

app.get("/", (req, res) => {
  res.send("hello");
});

const Approuter = require("./approuter");
Approuter.approuter(app);

const port = process?.env?.PORT ?? 5000;
app.listen(port, () => {
  console.log(`example app listening on port ${port}`);
});