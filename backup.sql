-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: shopapp
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20260427094502-create-user.js'),('20260427095631-create-categories.js'),('20260427100303-create-brands.js'),('20260427100509-create-news.js'),('20260427100733-create-banners.js'),('20260427141251-create-orders.js'),('20260427142052-create-products.js'),('20260427143155-create-order-detail.js'),('20260427144149-create-bannerdetail.js'),('20260427144907-create-newdetail.js'),('20260427145432-create-feedback.js'),('20260505162155-create-product-image.js'),('20260506083455-add_session_to_orders.js'),('20260506084618-create-carts.js'),('20260506084936-create-cart-items.js'),('20260526171612-create-attributes.js'),('20260526172800-create-product-attributes.js'),('20260527095104-create-variants.js'),('20260527095138-create-variant-values.js'),('20260527095205-create-product-variant-values.js'),('20260709035537-create-flash-sales.js'),('20260709035548-create-flash-sale-products.js'),('20260729172253-create-voucher.js'),('20260729172327-create-voucher-product.js'),('20260729172355-create-voucher-usage.js'),('20260729172540-create-voucher-category.js'),('20260730171735-create-user-vouchers.js'),('20260827154128-create-conversations.js'),('20260827154203-create-messages.js'),('20260901032811-add-order-id-to-conversations.js'),('20260917000545-create-settings.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attributes`
--

DROP TABLE IF EXISTS `attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attributes`
--

LOCK TABLES `attributes` WRITE;
/*!40000 ALTER TABLE `attributes` DISABLE KEYS */;
INSERT INTO `attributes` VALUES (2,'Màn hình','2026-09-07 17:39:40','2026-09-07 17:39:40'),(3,'Chip xử lý','2026-09-07 17:39:40','2026-09-07 17:39:40'),(4,'RAM','2026-09-07 17:39:40','2026-09-07 17:39:40'),(5,'Bộ nhớ trong','2026-09-07 17:39:40','2026-09-07 17:39:40'),(6,'Camera sau','2026-09-07 17:39:40','2026-09-07 17:39:40'),(7,'Camera trước','2026-09-07 17:39:40','2026-09-07 17:39:40'),(8,'Pin','2026-09-07 17:39:40','2026-09-07 17:39:40'),(9,'Hệ điều hành','2026-09-07 17:39:40','2026-09-07 17:39:40'),(10,'Dung lượng pin','2026-09-08 15:12:34','2026-09-08 15:12:34'),(11,'Loại','2026-09-09 04:54:24','2026-09-09 04:54:24'),(12,'Kết nối','2026-09-09 04:54:24','2026-09-09 04:54:24'),(13,'Trọng lượng','2026-09-09 04:54:24','2026-09-09 04:54:24'),(14,'Chống nước','2026-09-09 15:00:44','2026-09-09 15:00:44'),(15,'Công suất','2026-09-12 09:26:36','2026-09-12 09:26:36'),(16,'Chống nước/bụi','2026-09-12 09:26:36','2026-09-12 09:26:36'),(17,'Loại switch','2026-09-14 18:22:11','2026-09-14 18:22:11'),(18,'Layout','2026-09-14 18:22:11','2026-09-14 18:22:11'),(19,'Đèn LED','2026-09-14 18:22:11','2026-09-14 18:22:11'),(20,'Độ phân giải','2026-09-14 18:40:50','2026-09-14 18:40:50'),(21,'Tần số quét','2026-09-14 18:40:50','2026-09-14 18:40:50'),(22,'Tấm nền','2026-09-14 18:40:50','2026-09-14 18:40:50'),(23,'Cổng kết nối','2026-09-14 18:40:50','2026-09-14 18:40:50'),(24,'CPU','2026-09-14 23:13:52','2026-09-14 23:13:52'),(25,'Ổ cứng','2026-09-14 23:13:52','2026-09-14 23:13:52'),(26,'Chip','2026-09-14 23:19:42','2026-09-14 23:19:42'),(27,'Cảm biến','2026-09-14 23:19:42','2026-09-14 23:19:42'),(28,'Chuẩn kết nối','2026-09-14 23:24:30','2026-09-14 23:24:30'),(29,'Tốc độ đọc','2026-09-14 23:24:30','2026-09-14 23:24:30'),(30,'Tốc độ ghi','2026-09-14 23:24:30','2026-09-14 23:24:30'),(31,'Bảo hành','2026-09-14 23:24:30','2026-09-14 23:24:30'),(32,'Cổng ra','2026-09-14 23:28:17','2026-09-14 23:28:17'),(33,'Công nghệ','2026-09-14 23:28:17','2026-09-14 23:28:17'),(34,'Số phím','2026-09-14 23:33:34','2026-09-14 23:33:34'),(35,'Switch','2026-09-14 23:33:34','2026-09-14 23:33:34'),(36,'Đèn nền','2026-09-14 23:33:34','2026-09-14 23:33:34'),(37,'Góc xoay','2026-09-15 05:48:20','2026-09-15 05:48:20'),(38,'Lưu trữ','2026-09-15 05:48:20','2026-09-15 05:48:20'),(39,'Quay video','2026-09-15 06:12:22','2026-09-15 06:12:22'),(40,'Thời lượng pin','2026-09-15 06:24:42','2026-09-15 06:24:42'),(41,'Chống ồn','2026-09-15 07:31:00','2026-09-15 07:31:00'),(42,'Động cơ âm thanh','2026-09-15 18:36:06','2026-09-15 18:36:06'),(43,'Công suất RMS','2026-09-15 18:36:06','2026-09-15 18:36:06'),(44,'Chuẩn chống nước/bụi','2026-09-15 18:36:06','2026-09-15 18:36:06');
/*!40000 ALTER TABLE `attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bannerdetails`
--

DROP TABLE IF EXISTS `bannerdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bannerdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `banner_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `banner_id` (`banner_id`),
  CONSTRAINT `bannerdetails_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `bannerdetails_ibfk_2` FOREIGN KEY (`banner_id`) REFERENCES `banners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bannerdetails`
--

LOCK TABLES `bannerdetails` WRITE;
/*!40000 ALTER TABLE `bannerdetails` DISABLE KEYS */;
INSERT INTO `bannerdetails` VALUES (1,3,1,'2026-09-08 07:20:29','2026-09-08 07:20:29'),(2,4,2,'2026-09-09 01:32:00','2026-09-09 01:32:00');
/*!40000 ALTER TABLE `bannerdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Điện thoại Samsung Galaxy A55 5G','1788852025483-a55.jfif',1,'2026-09-08 07:20:29','2026-09-08 07:20:29',NULL,NULL),(2,'iPhone 15 – Thiết kế hiện đại, hiệu năng mạnh mẽ','1788917515855-ip15.jfif',1,'2026-09-09 01:32:00','2026-09-09 01:32:00',NULL,NULL);
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Samsung',NULL,'2026-09-07 17:31:17','2026-09-07 17:31:17'),(2,'Iphone',NULL,'2026-09-08 15:10:49','2026-09-08 15:10:49'),(3,'Apple',NULL,'2026-09-09 01:39:06','2026-09-09 01:39:06'),(4,'Sony',NULL,'2026-09-09 04:53:24','2026-09-09 04:53:24'),(5,'JBL',NULL,'2026-09-12 09:26:35','2026-09-12 09:26:35'),(6,'Loa',NULL,'2026-09-12 09:28:39','2026-09-12 09:28:39'),(7,'Logitech',NULL,'2026-09-14 18:22:10','2026-09-14 18:22:10'),(8,'LG',NULL,'2026-09-14 18:40:49','2026-09-14 18:40:49'),(9,'Dell',NULL,'2026-09-14 23:13:51','2026-09-14 23:13:51'),(10,'AKKO',NULL,'2026-09-14 23:33:33','2026-09-14 23:33:33'),(11,'Ezviz',NULL,'2026-09-15 05:48:19','2026-09-15 05:48:19'),(12,'Canon',NULL,'2026-09-15 06:12:22','2026-09-15 06:12:22');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quanity` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_variant_value_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,NULL,1,'2026-09-07 17:47:05','2026-09-07 17:47:05');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (7,'Smartphone',NULL,'2026-09-07 17:39:36','2026-09-07 17:39:36'),(8,'Laptop',NULL,'2026-09-09 01:39:06','2026-09-09 01:39:06'),(9,'Phụ kiện',NULL,'2026-09-09 04:53:24','2026-09-09 04:53:24'),(10,'Smart Coin',NULL,'2026-09-09 15:00:43','2026-09-09 15:00:43'),(11,'Watch',NULL,'2026-09-09 17:35:59','2026-09-09 17:35:59'),(12,'Tai Nghe',NULL,'2026-09-12 09:37:41','2026-09-12 09:37:41'),(18,'Cpu',NULL,'2026-09-14 23:38:04','2026-09-14 23:38:04'),(20,'Keyboard',NULL,'2026-09-14 23:39:43','2026-09-14 23:39:43'),(21,'Accessories&Keyboard',NULL,'2026-09-14 23:40:29','2026-09-14 23:40:29'),(22,'Accessories&Charger',NULL,'2026-09-14 23:41:30','2026-09-14 23:41:30'),(23,'Tv',NULL,'2026-09-15 00:11:48','2026-09-15 00:11:48'),(24,'SmartHome',NULL,'2026-09-15 05:48:19','2026-09-15 05:48:19'),(25,'Camera',NULL,'2026-09-15 06:12:22','2026-09-15 06:12:22'),(26,'Audio',NULL,'2026-09-15 07:31:00','2026-09-15 07:31:00'),(27,'Speaker',NULL,'2026-09-15 18:32:44','2026-09-15 18:32:44'),(30,'Headphone',NULL,'2026-09-16 07:49:02','2026-09-16 07:49:02');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int DEFAULT NULL,
  `seller_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `last_message` text,
  `last_message_at` datetime DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,1,5,3,'dạ e có mua 1 sản phẩm bên shop mình và nó có 1 chút vấn đề về hàng hóa','2026-09-16 07:02:11',1,'2026-09-08 07:21:23','2026-09-16 07:02:11'),(2,1,6,8,'do sản phẩm bên shop bị sước do quá trình vận chuyển vây bạn muốn hoàn hàng ạ','2026-09-16 07:00:44',14,'2026-09-13 16:35:12','2026-09-16 07:00:44');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `star` int DEFAULT NULL,
  `content` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
INSERT INTO `feedbacks` VALUES (1,3,1,5,'sản phấm đẹp , tốt , đúng với quảng cáo','2026-09-08 07:16:11','2026-09-08 07:16:11','[\"1788851771347-tim.jfif\"]');
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashsaleproducts`
--

DROP TABLE IF EXISTS `flashsaleproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashsaleproducts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flash_sale_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `flash_sale_price` decimal(10,0) DEFAULT NULL,
  `flash_sale_stock` int DEFAULT NULL,
  `flash_sale_sold` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashsaleproducts`
--

LOCK TABLES `flashsaleproducts` WRITE;
/*!40000 ALTER TABLE `flashsaleproducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `flashsaleproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashsales`
--

DROP TABLE IF EXISTS `flashsales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashsales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashsales`
--

LOCK TABLES `flashsales` WRITE;
/*!40000 ALTER TABLE `flashsales` DISABLE KEYS */;
/*!40000 ALTER TABLE `flashsales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `content` text,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,1,'Tôi cần hỏi về sản phẩm \"Điện thoại Samsung Galaxy A55 5G\"','read','2026-09-08 07:21:23','2026-09-08 07:21:43'),(2,1,1,'hi shop ạ','read','2026-09-08 07:21:29','2026-09-08 07:21:43'),(3,1,5,'vâng shop nghe bạn','read','2026-09-08 07:21:50','2026-09-08 07:21:56'),(4,2,1,'Tôi cần hỏi về sản phẩm \"Tai nghe Bluetooth Test Demo\"','read','2026-09-13 16:35:12','2026-09-13 16:35:32'),(5,2,1,'hi shop','read','2026-09-13 16:35:16','2026-09-13 16:35:32'),(6,2,6,'vâng shop xin nghe ạ','read','2026-09-13 16:35:40','2026-09-13 16:35:53'),(7,2,6,'bạn cần hỗ trợ về sản phẩm nào bên shop ạ','read','2026-09-16 05:31:25','2026-09-16 05:31:40'),(8,2,1,'dạ , em có đặt 1 sản phảm bên mình vầ hiện tại e thấy nó đang bị lỗi về  lưng ạ','read','2026-09-16 05:32:13','2026-09-16 05:32:18'),(9,2,6,'vâng ạ , bạn gửi hình ảnh sản phảm bị lỗi cho shop hỗ trợ b nha','read','2026-09-16 06:04:18','2026-09-16 06:04:24'),(10,2,1,'1789541978952-load.jfif','read','2026-09-16 06:59:39','2026-09-16 06:59:57'),(11,2,1,'đây nha shop','read','2026-09-16 07:00:08','2026-09-16 07:00:14'),(12,2,6,'vâng ạ','read','2026-09-16 07:00:20','2026-09-16 07:01:09'),(13,2,6,'do sản phẩm bên shop bị sước do quá trình vận chuyển vây bạn muốn hoàn hàng ạ','read','2026-09-16 07:00:44','2026-09-16 07:01:09'),(14,1,1,'dạ e có mua 1 sản phẩm bên shop mình và nó có 1 chút vấn đề về hàng hóa','sent','2026-09-16 07:02:11','2026-09-16 07:02:11');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newdetails`
--

DROP TABLE IF EXISTS `newdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `new_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `new_id` (`new_id`),
  CONSTRAINT `newdetails_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `newdetails_ibfk_2` FOREIGN KEY (`new_id`) REFERENCES `news` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newdetails`
--

LOCK TABLES `newdetails` WRITE;
/*!40000 ALTER TABLE `newdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `newdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Samsung Galaxy A55 5G – Smartphone thời thượng, hiệu năng mạnh mẽ','Samsung Galaxy A55 5G mang đến thiết kế hiện đại, sang trọng cùng hiệu năng mạnh mẽ, đáp ứng tốt nhu cầu sử dụng hằng ngày, giải trí và chơi game.\n\nSở hữu màn hình Super AMOLED sắc nét, màu sắc sống động cùng tần số quét cao, Galaxy A55 5G cho trải nghiệm xem phim, lướt web và chơi game mượt mà. Điện thoại cũng được trang bị hệ thống camera chất lượng, giúp ghi lại những khoảnh khắc đẹp với hình ảnh rõ nét và chi tiết.\n\nBên cạnh đó, Galaxy A55 5G hỗ trợ kết nối 5G, mang đến tốc độ truy cập Internet nhanh chóng. Thiết bị còn được bảo vệ bởi Samsung Knox Vault, giúp tăng cường khả năng bảo mật và bảo vệ dữ liệu cá nhân của người dùng.\n\nVới thiết kế đẹp, hiệu năng ổn định, camera chất lượng và khả năng bảo mật tốt, Samsung Galaxy A55 5G là một lựa chọn đáng cân nhắc trong phân khúc smartphone tầm trung.','1788879338181-a55.jfif','2026-09-08 14:57:10','2026-09-08 14:57:10'),(2,'iPhone 15 – Thiết kế hiện đại, hiệu năng mạnh mẽ','iPhone 15 mang đến thiết kế hiện đại, sang trọng cùng hiệu năng mạnh mẽ, phù hợp với nhiều nhu cầu sử dụng từ công việc, học tập đến giải trí.\n\nSản phẩm sở hữu màn hình Super Retina XDR cho hình ảnh sắc nét, màu sắc sống động và độ sáng cao. iPhone 15 được trang bị chip A16 Bionic, mang lại khả năng xử lý nhanh chóng và ổn định khi sử dụng các ứng dụng, chụp ảnh, quay video hay chơi game.\n\nHệ thống camera trên iPhone 15 cũng là một điểm nổi bật với camera chính 48MP, cho khả năng chụp ảnh chi tiết và chất lượng tốt trong nhiều điều kiện ánh sáng. Máy đồng thời hỗ trợ Dynamic Island, cổng kết nối USB-C và nhiều tính năng tiện lợi trong hệ sinh thái Apple.\n\nVới thiết kế đẹp, hiệu năng mạnh mẽ, camera chất lượng và nhiều công nghệ hiện đại, iPhone 15 là một lựa chọn đáng cân nhắc dành cho những người dùng muốn sở hữu một chiếc smartphone cao cấp, ổn định và lâu dài.','1788881191668-ip15.jfif','2026-09-08 15:26:32','2026-09-08 15:26:32');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_variant_value_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_detail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,1,3,1,9990000,'2026-09-08 07:07:23','2026-09-08 07:07:23',3),(2,2,3,1,9990000,'2026-09-08 07:14:39','2026-09-08 07:14:39',3),(3,3,5,1,28990000,'2026-09-09 01:40:36','2026-09-09 01:40:36',7),(4,4,4,1,23990000,'2026-09-09 14:25:02','2026-09-09 14:25:02',5),(5,5,4,1,23990000,'2026-09-09 14:26:12','2026-09-09 14:26:12',NULL),(6,6,3,1,8990000,'2026-09-09 14:28:50','2026-09-09 14:28:50',1),(7,7,7,1,10990000,'2026-09-09 16:46:02','2026-09-09 16:46:02',21),(8,8,3,1,9990000,'2026-09-09 16:52:14','2026-09-09 16:52:14',3),(9,9,4,1,12000000,'2026-09-10 14:42:43','2026-09-10 14:42:43',5),(10,10,4,1,12000000,'2026-09-10 14:48:16','2026-09-10 14:48:16',4),(11,11,4,1,23990000,'2026-09-10 14:49:14','2026-09-10 14:49:14',NULL),(12,12,4,1,23990000,'2026-09-10 14:55:06','2026-09-10 14:55:06',NULL),(13,13,8,1,1490000,'2026-09-13 16:21:30','2026-09-13 16:21:30',46),(14,14,8,1,1590000,'2026-09-13 16:23:27','2026-09-13 16:23:27',47);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `note` text,
  `total` int DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'session_direct',4,'Khách: Khanh Tran. ĐC: ha noi, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',9990000,'0378960057','{\"street\":\"ha noi\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"ha noi, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-08 07:07:23','2026-09-08 07:08:20'),(2,1,'session_direct',4,'Khách: Khanh Tran. ĐC: đền trong , xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',3990000,'0378960057','{\"street\":\"đền trong , xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong , xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-08 07:14:39','2026-09-09 14:27:40'),(3,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',28990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 01:40:36','2026-09-09 17:18:29'),(4,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',23990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 14:25:02','2026-09-09 14:30:08'),(5,1,'session_direct',4,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',23990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 14:26:12','2026-09-09 14:26:37'),(6,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',8990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 14:28:50','2026-09-09 14:29:54'),(7,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',5990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 16:46:02','2026-09-09 17:41:38'),(8,1,'session_direct',3,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',9990000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-09 16:52:14','2026-09-09 17:14:38'),(9,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',12000000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-10 14:42:43','2026-09-10 14:43:05'),(10,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',12000000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-10 14:48:16','2026-09-10 14:48:38'),(11,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',12000000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-10 14:49:14','2026-09-15 05:38:33'),(12,1,'session_direct',5,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',12000000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-10 14:55:06','2026-09-10 14:55:31'),(13,1,'session_direct',4,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',1490000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-13 16:21:30','2026-09-13 16:22:01'),(14,1,'session_direct',4,'Khách: Khanh Tran. ĐC: đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định. SĐT: 0378960057',1590000,'0378960057','{\"street\":\"đền trong, xóm trong\",\"ward\":\"Xã Yên Trị\",\"district\":\"Huyện Ý Yên\",\"city\":\"Tỉnh Nam Định\",\"fullAddress\":\"đền trong, xóm trong, Xã Yên Trị, Huyện Ý Yên, Tỉnh Nam Định\"}','2026-09-13 16:23:27','2026-09-13 16:27:30');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_image`
--

DROP TABLE IF EXISTS `product_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_image` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `imageurl` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_image_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_image`
--

LOCK TABLES `product_image` WRITE;
/*!40000 ALTER TABLE `product_image` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variant_values`
--

DROP TABLE IF EXISTS `product_variant_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variant_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `old_price` decimal(10,0) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variant_values`
--

LOCK TABLES `product_variant_values` WRITE;
/*!40000 ALTER TABLE `product_variant_values` DISABLE KEYS */;
INSERT INTO `product_variant_values` VALUES (18,5,28990000,31990000,28,'','2026-09-09 14:23:27','2026-09-09 14:23:27',NULL),(19,5,24990000,27990000,16,'','2026-09-09 14:23:27','2026-09-09 14:23:27',NULL),(29,9,2590000,3090000,2,'13-26','2026-09-12 09:28:40','2026-09-12 09:28:40',NULL),(30,9,2490000,2989996,2,'13','2026-09-12 09:28:40','2026-09-12 09:28:40',NULL),(31,9,2490000,2990000,2,'2-13','2026-09-12 09:28:40','2026-09-12 09:28:40',NULL),(32,4,23990000,25990000,8,'4-5','2026-09-12 09:30:31','2026-09-12 09:30:31',NULL),(33,4,21990000,23990000,19,'1-2','2026-09-12 09:30:31','2026-09-12 09:30:31',NULL),(44,7,9990000,10990000,10,'41mm-Hồng','2026-09-12 13:43:50','2026-09-12 13:43:50','http://localhost:5000/uploads/1789220629418-hong.jpeg'),(45,7,10990000,11990000,19,'45mm-Đen','2026-09-12 13:43:50','2026-09-12 13:43:50','http://localhost:5000/uploads/1789220629433-den.jpg'),(51,3,8990000,10490000,14,'128GB-Đen','2026-09-12 13:50:28','2026-09-12 13:50:28','http://localhost:5000/uploads/1788802777918-Ã¢55den.jfif'),(52,3,8990000,10490000,10,'128GB-Xanh','2026-09-12 13:50:29','2026-09-12 13:50:29','http://localhost:5000/uploads/1788802778351-a55xanh.jfif'),(53,3,9990000,11490000,15,'256GB-Tím','2026-09-12 13:50:29','2026-09-12 13:50:29','http://localhost:5000/uploads/1788802778724-tim.jfif'),(59,12,21990000,23990000,1,'128GB-Đen','2026-09-14 23:08:04','2026-09-14 23:08:04','http://localhost:5000/uploads/1789427284515-ip15xanh.jfif'),(60,13,13990000,15990000,0,'8GB/512GB-Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52','http://localhost:5000/uploads/1789427631781-delb.jfif'),(61,13,15990000,17990000,0,'16GB/512GB-Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52','http://localhost:5000/uploads/1789427631860-delbb.jfif'),(62,13,12989997,14490000,0,'8GB/256GB-Đen','2026-09-14 23:13:52','2026-09-14 23:13:52','http://localhost:5000/uploads/1789427631995-deld.jfif'),(76,15,3690000,4290000,0,'2TB-Đen','2026-09-14 23:38:04','2026-09-14 23:38:04','http://localhost:5000/uploads/1789428270565-ssd.webp'),(77,15,1890000,2290000,0,'1TB-Đen','2026-09-14 23:38:04','2026-09-14 23:38:04','http://localhost:5000/uploads/1789428270483-ssd.webp'),(78,15,1090000,1290000,0,'500GB-Đen','2026-09-14 23:38:04','2026-09-14 23:38:04','http://localhost:5000/uploads/1789428270411-ssd.webp'),(89,14,10990000,11990000,0,'45mm-Đen','2026-09-15 00:10:56','2026-09-15 00:10:56','http://localhost:5000/uploads/1789427982518-appd.jfif'),(90,14,9990000,10990000,0,'41mm-Hồng','2026-09-15 00:10:56','2026-09-15 00:10:56','http://localhost:5000/uploads/1789427982431-apph.jfif'),(91,14,9990000,10990000,0,'41mm-Đen','2026-09-15 00:10:56','2026-09-15 00:10:56','http://localhost:5000/uploads/1789427982356-appd.jfif'),(92,11,6990000,7990000,22,'27inch-Đen','2026-09-15 00:11:48','2026-09-15 00:11:48','http://localhost:5000/uploads/1789411250398-lgul.jfif'),(93,10,3090000,3590000,1,'TKL-Trắng','2026-09-15 00:46:54','2026-09-15 00:46:54','http://localhost:5000/uploads/1789410131298-bptrang.webp'),(94,10,2990000,3490000,0,'TKL-Đen','2026-09-15 00:46:54','2026-09-15 00:46:54','http://localhost:5000/uploads/1789410131218-bpden.jfif'),(99,19,12989998,14990000,4,'Thânmáy(khôngkit)-Đen','2026-09-15 06:15:39','2026-09-15 06:15:39','http://localhost:5000/uploads/1789452742354-mak.jfif'),(100,19,14990000,16990000,2,'Kèmkit15-45mm-Đen','2026-09-15 06:15:39','2026-09-15 06:15:39','http://localhost:5000/uploads/1789452742284-mad.webp'),(114,21,8490000,10989999,2,'27inch-Đen','2026-09-15 07:22:20','2026-09-15 07:22:20','http://localhost:5000/uploads/1789456630225-lg32.jfif'),(115,21,10490000,12990000,3,'32inch-Đen','2026-09-15 07:22:20','2026-09-15 07:22:20','http://localhost:5000/uploads/1789456630262-lg.webp'),(116,20,3190000,3690000,2,'Standard-Hồng','2026-09-15 07:24:15','2026-09-15 07:24:15','http://localhost:5000/uploads/1789453482163-mh.jfif'),(117,20,3190000,3690000,4,'Standard-Trắng','2026-09-15 07:24:15','2026-09-15 07:24:15','http://localhost:5000/uploads/1789453482069-mt.jfif'),(118,20,3190000,3690000,4,'Standard-Đen','2026-09-15 07:24:15','2026-09-15 07:24:15','http://localhost:5000/uploads/1789453481996-md.jfif'),(119,18,890000,1189996,2,'Mặcđịnh-Đen','2026-09-15 07:25:02','2026-09-15 07:25:02','http://localhost:5000/uploads/1789451299889-camd.webp'),(120,18,890000,1189999,2,'Mặcđịnh-Trắng','2026-09-15 07:25:02','2026-09-15 07:25:02','http://localhost:5000/uploads/1789451299818-camtr.jfif'),(121,17,1290000,1590000,4,'SwitchBrown-Trắng','2026-09-15 07:25:12','2026-09-15 07:25:12','http://localhost:5000/uploads/1789428814227-bpptr.jfif'),(122,17,1290000,1590000,4,'SwitchRed-Đen','2026-09-15 07:25:12','2026-09-15 07:25:12','http://localhost:5000/uploads/1789428814171-bppd.jfif'),(123,17,1290000,1590000,0,'SwitchBlue-Trắng','2026-09-15 07:25:12','2026-09-15 07:25:12','http://localhost:5000/uploads/1789428814089-bpptr.jfif'),(135,22,7990000,9490000,13,'Freesize-XanhXám','2026-09-15 07:33:43','2026-09-15 07:33:43','http://localhost:5000/uploads/1789457460478-tnxx.jfif'),(136,22,7990000,9490000,1,'Freesize-Bạc(Silver)','2026-09-15 07:33:43','2026-09-15 07:33:43','http://localhost:5000/uploads/1789457460404-tntr.jfif'),(137,22,7990000,9490000,1,'Freesize-Đen','2026-09-15 07:33:43','2026-09-15 07:33:43','http://localhost:5000/uploads/1789457460336-tnd.webp'),(138,16,350000,450000,0,'Mặcđịnh-Đen','2026-09-15 07:36:50','2026-09-15 07:36:50','http://localhost:5000/uploads/1789428497679-sacd.jfif'),(139,16,350000,450000,0,'Mặcđịnh-Trắng','2026-09-15 07:36:50','2026-09-15 07:36:50','http://localhost:5000/uploads/1789428497756-sactr.jfif'),(161,23,3490000,3990000,1,'Standard-Đỏ','2026-09-15 19:22:07','2026-09-15 19:22:07','http://localhost:5000/uploads/1789497366309-loaxr.jfif'),(162,23,3490000,3990000,1,'Standard-Xanhrêu','2026-09-15 19:22:07','2026-09-15 19:22:07','http://localhost:5000/uploads/1789497366240-loado.jfif'),(163,23,3490000,3990000,1,'Standard-Đen','2026-09-15 19:22:07','2026-09-15 19:22:07','http://localhost:5000/uploads/1789497366181-load.jfif'),(166,8,1490000,1990000,11,'Standard-Đen','2026-09-16 07:50:12','2026-09-16 07:50:12','http://localhost:5000/uploads/1789220725738-demoden.jfif'),(167,8,1590000,2090000,13,'Standard-Trắng','2026-09-16 07:50:12','2026-09-16 07:50:12','http://localhost:5000/uploads/1789220725740-demotr.jfif');
/*!40000 ALTER TABLE `product_variant_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productattributes`
--

DROP TABLE IF EXISTS `productattributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productattributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `attribute_id` int DEFAULT NULL,
  `product_variant_value_id` int DEFAULT NULL,
  `value` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_productattributes_variant_value` (`product_variant_value_id`),
  CONSTRAINT `fk_productattributes_variant_value` FOREIGN KEY (`product_variant_value_id`) REFERENCES `product_variant_values` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productattributes`
--

LOCK TABLES `productattributes` WRITE;
/*!40000 ALTER TABLE `productattributes` DISABLE KEYS */;
INSERT INTO `productattributes` VALUES (1,3,2,NULL,'Super AMOLED 6.6 inch, Full HD+','2026-09-07 17:39:40','2026-09-07 17:39:40'),(2,3,3,NULL,'Exynos 1480','2026-09-07 17:39:40','2026-09-07 17:39:40'),(3,3,4,NULL,'8GB','2026-09-07 17:39:40','2026-09-07 17:39:40'),(4,3,5,NULL,'128GB','2026-09-07 17:39:40','2026-09-07 17:39:40'),(5,3,6,NULL,'50MP + 12MP + 5MP','2026-09-07 17:39:40','2026-09-07 17:39:40'),(6,3,7,NULL,'32MP','2026-09-07 17:39:40','2026-09-07 17:39:40'),(7,3,8,NULL,'5000mAh, sạc nhanh 25W','2026-09-07 17:39:40','2026-09-07 17:39:40'),(8,3,9,NULL,'Android 14, One UI 6.1','2026-09-07 17:39:40','2026-09-07 17:39:40'),(9,4,2,NULL,'Super Retina XDR OLED 6.1 inch','2026-09-08 15:12:34','2026-09-08 15:12:34'),(10,4,3,NULL,'Apple A16 Bionic','2026-09-08 15:12:34','2026-09-08 15:12:34'),(11,4,6,NULL,'48MP + 12MP','2026-09-08 15:12:34','2026-09-08 15:12:34'),(12,4,7,NULL,'12MP','2026-09-08 15:12:34','2026-09-08 15:12:34'),(13,4,10,NULL,'3349 mAh','2026-09-08 15:12:34','2026-09-08 15:12:34'),(14,4,9,NULL,'iOS 17','2026-09-08 15:12:34','2026-09-08 15:12:34'),(15,5,2,NULL,'Liquid Retina 13.6 inch','2026-09-09 01:39:06','2026-09-09 01:39:06'),(16,5,3,NULL,'Apple M2 8-core CPU','2026-09-09 01:39:06','2026-09-09 01:39:06'),(17,5,4,NULL,'8GB','2026-09-09 01:39:06','2026-09-09 01:39:06'),(18,5,10,NULL,'Lên đến 18 giờ','2026-09-09 01:39:06','2026-09-09 01:39:06'),(23,7,2,NULL,'Retina LTPO OLED','2026-09-09 15:00:44','2026-09-09 15:00:44'),(24,7,3,NULL,'Apple S9 SiP','2026-09-09 15:00:44','2026-09-09 15:00:44'),(25,7,8,NULL,'18 giờ sử dụng','2026-09-09 15:00:44','2026-09-09 15:00:44'),(26,7,14,NULL,'50m (WR50)','2026-09-09 15:00:44','2026-09-09 15:00:44'),(27,8,11,NULL,'Tai nghe không dây, chụp tai','2026-09-12 08:57:39','2026-09-12 08:57:39'),(28,8,12,NULL,'Bluetooth 5.3','2026-09-12 08:57:39','2026-09-12 08:57:39'),(29,8,8,NULL,'20 giờ sử dụng liên tục','2026-09-12 08:57:39','2026-09-12 08:57:39'),(30,8,14,NULL,'IPX5','2026-09-12 08:57:39','2026-09-12 08:57:39'),(31,9,15,NULL,'30W','2026-09-12 09:26:36','2026-09-12 09:26:36'),(32,9,16,NULL,'IP67','2026-09-12 09:26:36','2026-09-12 09:26:36'),(33,9,8,NULL,'12 giờ sử dụng','2026-09-12 09:26:36','2026-09-12 09:26:36'),(34,9,12,NULL,'Bluetooth 5.1, PartyBoost','2026-09-12 09:26:36','2026-09-12 09:26:36'),(35,10,17,NULL,'GX Blue Clicky (tháo rời được)','2026-09-14 18:22:11','2026-09-14 18:22:11'),(36,10,12,NULL,'USB-C có thể tháo rời','2026-09-14 18:22:11','2026-09-14 18:22:11'),(37,10,18,NULL,'TKL (Tenkeyless), 87 phím','2026-09-14 18:22:11','2026-09-14 18:22:11'),(38,10,19,NULL,'RGB LIGHTSYNC, 16.8 triệu màu','2026-09-14 18:22:11','2026-09-14 18:22:11'),(39,11,20,NULL,'QHD 2560 x 1440','2026-09-14 18:40:50','2026-09-14 18:40:50'),(40,11,21,NULL,'165Hz','2026-09-14 18:40:50','2026-09-14 18:40:50'),(41,11,22,NULL,'IPS (Nano IPS)','2026-09-14 18:40:50','2026-09-14 18:40:50'),(42,11,23,NULL,'HDMI 2.0 x2, DisplayPort 1.4','2026-09-14 18:40:50','2026-09-14 18:40:50'),(43,12,2,NULL,'6.1 inch Super Retina XDR OLED','2026-09-14 23:08:04','2026-09-14 23:08:04'),(44,12,3,NULL,'Apple A16 Bionic','2026-09-14 23:08:04','2026-09-14 23:08:04'),(45,12,6,NULL,'48MP + 12MP','2026-09-14 23:08:04','2026-09-14 23:08:04'),(46,12,8,NULL,'Lên đến 20 giờ xem video','2026-09-14 23:08:04','2026-09-14 23:08:04'),(47,13,24,NULL,'Intel Core i5-1235U','2026-09-14 23:13:52','2026-09-14 23:13:52'),(48,13,4,NULL,'8GB DDR4','2026-09-14 23:13:52','2026-09-14 23:13:52'),(49,13,25,NULL,'SSD 512GB NVMe','2026-09-14 23:13:52','2026-09-14 23:13:52'),(50,13,2,NULL,'15.6 inch FHD','2026-09-14 23:13:52','2026-09-14 23:13:52'),(51,14,26,NULL,'Apple S9 SiP','2026-09-14 23:19:42','2026-09-14 23:19:42'),(52,14,2,NULL,'Luôn hiển thị, Retina','2026-09-14 23:19:42','2026-09-14 23:19:42'),(53,14,27,NULL,'Nhịp tim, oxy máu, điện tâm đồ','2026-09-14 23:19:42','2026-09-14 23:19:42'),(54,14,8,NULL,'Lên đến 18 giờ','2026-09-14 23:19:42','2026-09-14 23:19:42'),(55,15,28,NULL,'NVMe M.2 PCIe Gen 3','2026-09-14 23:24:30','2026-09-14 23:24:30'),(56,15,29,NULL,'3500 MB/s','2026-09-14 23:24:30','2026-09-14 23:24:30'),(57,15,30,NULL,'3300 MB/s','2026-09-14 23:24:30','2026-09-14 23:24:30'),(58,15,31,NULL,'5 năm','2026-09-14 23:24:30','2026-09-14 23:24:30'),(59,16,15,NULL,'25W','2026-09-14 23:28:17','2026-09-14 23:28:17'),(60,16,32,NULL,'USB Type-C','2026-09-14 23:28:17','2026-09-14 23:28:17'),(61,16,33,NULL,'Sạc nhanh PD/PPS','2026-09-14 23:28:17','2026-09-14 23:28:17'),(62,16,13,NULL,'45g','2026-09-14 23:28:17','2026-09-14 23:28:17'),(63,17,34,NULL,'68 phím (Layout 65%)','2026-09-14 23:33:34','2026-09-14 23:33:34'),(64,17,12,NULL,'Bluetooth/2.4GHz/Type-C','2026-09-14 23:33:34','2026-09-14 23:33:34'),(65,17,35,NULL,'Hotswap','2026-09-14 23:33:34','2026-09-14 23:33:34'),(66,17,36,NULL,'LED RGB','2026-09-14 23:33:34','2026-09-14 23:33:34'),(67,18,20,NULL,'1080p Full HD','2026-09-15 05:48:20','2026-09-15 05:48:20'),(68,18,37,NULL,'360 độ ngang, 90 độ dọc','2026-09-15 05:48:20','2026-09-15 05:48:20'),(69,18,12,NULL,'Wifi 2.4GHz','2026-09-15 05:48:20','2026-09-15 05:48:20'),(70,18,38,NULL,'Thẻ nhớ / Cloud','2026-09-15 05:48:20','2026-09-15 05:48:20'),(71,19,27,NULL,'APS-C 24.1MP','2026-09-15 06:12:22','2026-09-15 06:12:22'),(72,19,39,NULL,'4K 24fps','2026-09-15 06:12:22','2026-09-15 06:12:22'),(73,19,2,NULL,'Lật xoay cảm ứng 3 inch','2026-09-15 06:12:22','2026-09-15 06:12:22'),(74,19,12,NULL,'Wifi, Bluetooth','2026-09-15 06:12:22','2026-09-15 06:12:22'),(75,20,13,NULL,'< 63 gram','2026-09-15 06:24:42','2026-09-15 06:24:42'),(76,20,27,NULL,'HERO 25K','2026-09-15 06:24:42','2026-09-15 06:24:42'),(77,20,12,NULL,'Không dây LIGHTSPEED / Dây sạc USB','2026-09-15 06:24:42','2026-09-15 06:24:42'),(78,20,40,NULL,'Lên đến 70 giờ','2026-09-15 06:24:42','2026-09-15 06:24:42'),(79,21,20,NULL,'QHD (2560 x 1440)','2026-09-15 07:17:10','2026-09-15 07:17:10'),(80,21,22,NULL,'Nano IPS','2026-09-15 07:17:10','2026-09-15 07:17:10'),(81,21,21,NULL,'165Hz (Up to 180Hz)','2026-09-15 07:17:10','2026-09-15 07:17:10'),(82,22,12,NULL,'Bluetooth 5.2 / LDAC / 3.5mm','2026-09-15 07:31:00','2026-09-15 07:31:00'),(83,22,41,NULL,'ANC chủ động đa micro','2026-09-15 07:31:00','2026-09-15 07:31:00'),(84,22,40,NULL,'30 giờ (bật ANC)','2026-09-15 07:31:00','2026-09-15 07:31:00'),(85,22,13,NULL,'250 gram','2026-09-15 07:31:00','2026-09-15 07:31:00'),(86,23,42,NULL,'1 x Woofer 52x90mm, 1 x Tweeter 20mm','2026-09-15 18:36:06','2026-09-15 18:36:06'),(87,23,43,NULL,'40W','2026-09-15 18:36:06','2026-09-15 18:36:06'),(88,23,28,NULL,'Bluetooth 5.1','2026-09-15 18:36:06','2026-09-15 18:36:06'),(89,23,44,NULL,'IP67','2026-09-15 18:36:06','2026-09-15 18:36:06'),(90,23,10,NULL,'7500 mAh (Thời gian sạc ~4 giờ)','2026-09-15 18:36:06','2026-09-15 18:36:06');
/*!40000 ALTER TABLE `productattributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` int DEFAULT NULL,
  `description` text,
  `oldprice` int DEFAULT NULL,
  `specification` text,
  `buyturn` int DEFAULT NULL,
  `quanity` int DEFAULT NULL,
  `brand_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,'Điện thoại Samsung Galaxy A55 5G','http://localhost:5000/uploads/1788802777221-a55.jfif',8990000,'Samsung Galaxy A55 5G sở hữu thiết kế khung viền kim loại cao cấp, hiệu năng mạnh mẽ với chip Exynos 1480, hỗ trợ kết nối 5G tốc độ cao, camera chụp đêm sắc nét.',10490000,'RAM 8GB, ROM 128GB, màn hình Super AMOLED 6.6 inch, pin 5000mAh, camera chính 50MP',2,39,1,7,'2026-09-07 17:39:40','2026-09-12 13:50:28',5,0),(4,'iPhone 15 128GB','http://localhost:5000/uploads/1788880353721-ip15.jfif',23990000,'iPhone 15 mang thiết kế viền cong bo tròn tinh tế, khung nhôm cao cấp, mặt lưng kính mờ chống bám vân tay. Trang bị chip A16 Bionic cho hiệu năng mượt mà, camera chính 48MP cho ảnh chụp sắc nét ngay cả trong điều kiện thiếu sáng. Máy hỗ trợ Dynamic Island hiển thị thông báo trực quan, thời lượng pin sử dụng cả ngày dài.',21990000,'Chip A16 Bionic mạnh mẽ, tiết kiệm pin,Camera kép 48MP, quay video 4K Dolby Vision,Cổng sạc USB-C, tương thích phụ kiện đa dạng,Màn hình Super Retina XDR 6.1 inch, độ sáng cao',0,28,2,7,'2026-09-08 15:12:33','2026-09-15 05:38:33',5,1),(5,'MacBook Air M2 13 inch','http://localhost:5000/uploads/1788917946418-m2.jfif',24990000,'MacBook Air M2 mang thiết kế mỏng nhẹ đột phá, hoàn toàn không cần quạt tản nhiệt nhờ hiệu năng tối ưu của chip M2 8 nhân CPU. Màn hình Liquid Retina sắc nét, dải màu rộng, phù hợp cho công việc văn phòng, thiết kế đồ họa nhẹ và giải trí đa phương tiện. Thời lượng pin ấn tượng giúp làm việc cả ngày dài không lo sạc.',27990000,'Chip Apple M2 hiệu năng vượt trội, siêu tiết kiệm pin\nThiết kế mỏng nhẹ chỉ 1.24kg, không quạt tản nhiệt\nMàn hình Liquid Retina 13.6 inch, độ sáng 500 nits\nPin sử dụng lên đến 18 giờ liên tục',0,44,3,8,'2026-09-09 01:39:06','2026-09-09 16:23:01',6,1),(7,'Đồng hồ thông minh Apple Watch Series 9','http://localhost:5000/uploads/1788966043824-9.jfif',9990000,'Apple Watch Series 9 trang bị chip S9 SiP mạnh mẽ, hỗ trợ tính năng Double Tap điều khiển bằng cử chỉ tiện lợi. Màn hình sáng gấp đôi thế hệ trước, dễ nhìn dưới ánh nắng gắt. Đầy đủ cảm biến sức khỏe: đo nhịp tim, oxy máu, điện tâm đồ, theo dõi giấc ngủ chi tiết.',10990000,'Chip S9 mới, xử lý nhanh hơn 30%\nĐo nồng độ oxy trong máu, điện tâm đồ ECG\nMàn hình Retina luôn sáng, độ sáng 2000 nits\nChống nước 50m, phù hợp bơi lội',0,29,3,11,'2026-09-09 15:00:44','2026-09-09 17:35:59',6,0),(8,'Tai nghe Bluetooth Test Demo','http://localhost:5000/uploads/1789203459054-demo.jpg',1490000,'Sản phẩm test dùng để kiểm tra việc hiển thị biến thể (size, màu sắc, ảnh riêng) sau khi sửa lỗi hệ thống. Không phải sản phẩm thật.',1990000,'Kết nối Bluetooth 5.3 ổn định\nPin sử dụng 20 giờ liên tục\nChống nước chuẩn IPX5',2,24,4,26,'2026-09-12 08:57:39','2026-09-16 07:50:12',6,0),(9,'Loa Bluetooth JBL Flip 6','http://localhost:5000/uploads/1789205195761-jbl.jfif',2490000,'JBL Flip 6 mang thiết kế nhỏ gọn, chống nước chống bụi hoàn toàn theo chuẩn IP67, có thể mang theo đi biển, đi phượt thoải mái. Chất âm mạnh mẽ đặc trưng của JBL với driver loa mới cho âm bass sâu và rõ ràng hơn thế hệ trước. Hỗ trợ kết nối PartyBoost để ghép nhiều loa JBL cùng lúc, tăng trải nghiệm âm thanh không gian.',2990000,'Chống nước và bụi chuẩn IP67\nÂm bass mạnh mẽ, âm thanh Pro Sound\nPin sử dụng liên tục 12 giờ\nKết nối PartyBoost với nhiều loa khác',0,6,6,9,'2026-09-12 09:26:36','2026-09-12 13:51:41',6,1),(10,'Bàn phím cơ Logitech G Pro X','http://localhost:5000/uploads/1789410131137-bp.jfif',2990000,'Logitech G Pro X là bàn phím cơ dành cho game thủ chuyên nghiệp, cho phép hoán đổi switch dễ dàng mà không cần hàn mạch. Thiết kế TKL (Tenkeyless) nhỏ gọn giúp tối ưu không gian di chuyển chuột, phù hợp cho thi đấu eSports. Khung nhôm nguyên khối chắc chắn, đèn LED RGB có thể tùy chỉnh qua phần mềm G HUB.',3490000,'Switch có thể tháo rời, tùy chỉnh theo sở thích\nThiết kế TKL nhỏ gọn, tiết kiệm không gian\nĐèn LED RGB 16.8 triệu màu\nKết nối USB-C tháo rời tiện lợi',0,1,7,21,'2026-09-14 18:22:11','2026-09-15 00:46:53',5,0),(11,'Màn hình LG UltraGear 27 inch','http://localhost:5000/uploads/1789411250042-lgul.jfif',6990000,'Màn hình LG UltraGear 27GP850 là lựa chọn lý tưởng cho game thủ, kết hợp độ phân giải QHD sắc nét với tần số quét cao 165Hz mang lại trải nghiệm mượt mà, ít bóng mờ khi chơi các tựa game hành động nhanh. Tấm nền IPS cho màu sắc chuẩn xác, góc nhìn rộng, phù hợp cả chơi game lẫn làm việc đồ họa.',7990000,'Tần số quét 165Hz, giảm hiện tượng bóng mờ\nĐộ phân giải QHD 2560x1440 sắc nét\nTấm nền IPS, góc nhìn rộng 178 độ\nHỗ trợ AMD FreeSync Premium',0,22,8,23,'2026-09-14 18:40:50','2026-09-15 00:11:48',5,0),(12,'iPhone 15','http://localhost:5000/uploads/1789427284441-ip15.jfif',21990000,'iPhone 15 mang thiết kế viền cong bo tròn tinh tế, hiệu năng mạnh mẽ nhờ chip A16 Bionic. Camera chính 48MP cho ảnh chụp sắc nét ngay cả trong điều kiện thiếu sáng. Máy hỗ trợ Dynamic Island hiển thị thông báo trực quan, thời lượng pin sử dụng cả ngày dài.',23990000,'Chip A16 Bionic mạnh mẽ, xử lý mượt mà\nCamera chính 48MP, quay video 4K Dolby Vision\nDynamic Island hiển thị thông báo trực quan\nKhung viền nhôm cao cấp, mặt lưng kính mờ chống bám vân tay',0,1,3,7,'2026-09-14 23:08:04','2026-09-14 23:08:04',5,0),(13,'Laptop Dell Inspiron 15 3520','http://localhost:5000/uploads/1789427631696-del.jfif',13990000,'Laptop Dell Inspiron 15 phù hợp cho học tập, văn phòng và giải trí nhẹ nhàng. Thiết kế mỏng gọn, hiệu năng ổn định với chip Intel thế hệ mới, đáp ứng tốt các tác vụ văn phòng, lướt web, xem phim hàng ngày.',15990000,'CPU Intel Core i5 thế hệ mới, xử lý nhanh\nRAM 8GB, SSD 512GB tốc độ cao\nThiết kế mỏng nhẹ, phù hợp học tập & văn phòng\nThời lượng pin sử dụng cả ngày dài',0,0,9,8,'2026-09-14 23:13:52','2026-09-14 23:13:52',5,0),(14,'Apple Watch Series 8','http://localhost:5000/uploads/1789427982235-app8.webp',9990000,'Apple Watch Series 9 trang bị chip S9 SiP mạnh mẽ, hỗ trợ tính năng Double Tap điều khiển bằng cử chỉ tiện lợi. Màn hình sáng gấp đôi thế hệ trước, dễ nhìn dưới ánh nắng gắt. Đầy đủ cảm biến sức khỏe: đo nhịp tim, oxy máu, điện tâm đồ, theo dõi giấc ngủ chi tiết.',10989999,'Chip S9 mới, xử lý nhanh hơn 30%\nĐo nồng độ oxy trong máu, điện tâm đồ\nMàn hình sáng gấp đôi thế hệ trước\nTheo dõi giấc ngủ chi tiết',0,0,3,11,'2026-09-14 23:19:42','2026-09-15 00:10:56',5,0),(15,'Ổ cứng SSD Samsung 970 EVO Plus','http://localhost:5000/uploads/1789428270334-ssÄ.jfif',1890000,'Ổ cứng SSD Samsung 970 EVO Plus mang lại tốc độ đọc/ghi vượt trội nhờ chuẩn NVMe, giúp khởi động máy và mở ứng dụng nhanh chóng. Dung lượng đa dạng đáp ứng tốt nhu cầu lưu trữ dữ liệu, cài đặt game, phần mềm nặng.',2290000,'Tốc độ đọc/ghi cực nhanh chuẩn NVMe\nDung lượng lớn, thoải mái lưu trữ\nĐộ bền cao, tản nhiệt tốt\nTương thích PC và Laptop hỗ trợ khe M.2',0,0,1,18,'2026-09-14 23:24:30','2026-09-14 23:38:04',5,0),(16,'Sạc nhanh Samsung 25W','http://localhost:5000/uploads/1789428497504-sac.jfif',350000,'Củ sạc nhanh Samsung 25W giúp rút ngắn đáng kể thời gian sạc pin so với sạc thường, tương thích tốt với nhiều dòng điện thoại Samsung và Android khác. Thiết kế nhỏ gọn, tích hợp chip an toàn chống sốc điện và quá nhiệt.',450000,'Công suất 25W, sạc nhanh gấp đôi sạc thường\nTương thích nhiều dòng điện thoại Android\nThiết kế nhỏ gọn, dễ mang theo\nAn toàn với chip chống sốc điện, quá nhiệt',0,0,1,22,'2026-09-14 23:28:17','2026-09-15 07:36:50',5,0),(17,'Bàn phím cơ AKKO 3068B Plus','http://localhost:5000/uploads/1789428814016-bpp.jfif',1290000,'Bàn phím cơ AKKO 3068B Plus kích thước 65% nhỏ gọn, hỗ trợ hotswap switch dễ dàng thay đổi theo sở thích gõ phím. Kết nối linh hoạt đa thiết bị qua Bluetooth, 2.4GHz hoặc dây Type-C, phù hợp cho cả gaming và làm việc.',1590000,'Layout 65% nhỏ gọn, 68 phím\nKết nối 3 chế độ: Bluetooth/2.4GHz/Type-C\nSwitch hotswap, dễ tùy biến\nĐèn nền LED RGB đẹp mắt',0,8,10,21,'2026-09-14 23:33:34','2026-09-15 07:25:12',5,0),(18,'Camera giám sát Ezviz C6N','http://localhost:5000/uploads/1789451299734-cam.jfif',890000,'Camera giám sát Ezviz C6N hỗ trợ xoay 360 độ giúp quan sát toàn diện không gian, tích hợp đàm thoại 2 chiều và phát hiện chuyển động thông minh. Người dùng có thể xem trực tiếp hình ảnh camera qua điện thoại mọi lúc mọi nơi.',1190000,'Xoay 360 độ, quan sát toàn diện\nĐàm thoại 2 chiều, phát hiện chuyển động\nXem trực tiếp qua điện thoại mọi lúc\nHồng ngoại quan sát ban đêm rõ nét',0,4,11,24,'2026-09-15 05:48:20','2026-09-15 07:25:02',5,0),(19,'Máy ảnh Canon EOS M50 Mark II','http://localhost:5000/uploads/1789452742217-Ã¢m.webp',14990000,'Canon EOS M50 Mark II là lựa chọn phổ biến cho người mới bắt đầu chụp ảnh và làm vlog, với cảm biến APS-C 24.1MP cho ảnh sắc nét, hỗ trợ quay 4K và live stream trực tiếp lên YouTube. Màn hình lật xoay linh hoạt, tiện lợi khi tự quay.',16990000,'Cảm biến APS-C 24.1MP, ảnh sắc nét\nQuay video 4K, live stream trực tiếp\nMàn hình lật xoay tiện chụp selfie/vlog\nLấy nét tự động nhanh, chính xác',0,6,12,25,'2026-09-15 06:12:22','2026-09-15 06:15:39',5,0),(20,'Chuột Không Dây Logistics Gaming Logitech G Pro X Superlight','http://localhost:5000/uploads/1789453481953-m.jfif',3190000,'Chuột gaming Logitech G Pro X Superlight sở hữu thiết kế tối giản, siêu nhẹ tối ưu cho các game thủ eSports chuyên nghiệp. Trang bị cảm biến HERO 25K hàng đầu cùng công nghệ kết nối LIGHTSPEED giúp mọi thao tác vuốt, di chuột chính xác tuyệt đối.',3690000,'Trọng lượng siêu nhẹ dưới 63 gram\n\nCảm biến HERO 25K siêu chính xác\n\nKết nối không dây LIGHTSPEED độ độ trễ cực thấp\n\nThời lượng pin lên đến 70 giờ sử dụng liên tục',0,10,7,21,'2026-09-15 06:24:42','2026-09-15 07:24:15',5,0),(21,'Màn Hình Gaming LG UltraGear 27GP850-B 27 inch QHD Nano IPS','http://localhost:5000/uploads/1789456630146-lgd.jfif',8490000,'Màn hình LG UltraGear 27GP850-B cung cấp trải nghiệm chơi game sống động nhờ công nghệ Nano IPS tái tạo màu sắc chuẩn xác. Tần số quét cao kết hợp tốc độ phản hồi 1ms giúp loại bỏ hoàn toàn hiện tượng xé hình, hiện tượng bóng ma trong các tựa game tốc độ cao.',10990000,'Độ phân giải QHD (2560x1440) tấm nền Nano IPS sắc nét\n\nTần số quét 165Hz (Overclock 180Hz)\n\nThời gian phản hồi 1ms (GtG) cực nhanh\n\nTương thích NVIDIA G-Sync và AMD FreeSync Premium',0,5,8,23,'2026-09-15 07:17:10','2026-09-15 07:22:20',5,0),(22,'Tai Nghe Chống Ồn Bluetooth Sony WH-1000XM5','http://localhost:5000/uploads/1789457460216-tn.jfif',7990000,'Sony WH-1000XM5 đỉnh cao công nghệ chống ồn chủ động (ANC) giúp bạn tận hưởng âm nhạc trọn vẹn ở bất kỳ không gian nào. Thiết kế sang trọng, tối giản, micro đàm thoại rõ nét cùng tính năng thông minh Speak-to-Chat tự dừng nhạc khi bạn cất lời.',9490000,'Công nghệ chống ồn hàng đầu Auto NC Optimizer\n\nBộ xử lý V1 và HD QN1 cho âm thanh chân thực\n\nThời lượng pin lên tới 30 giờ, hỗ trợ sạc nhanh\n\nThiết kế đệm tai êm ái, cách âm vượt trội',0,15,4,26,'2026-09-15 07:31:00','2026-09-15 07:33:43',5,0),(23,'Loa Bluetooth Portable JBL Charge 5','http://localhost:5000/uploads/1789497366113-download.jfif',3490000,'Loa Bluetooth JBL Charge 5 sở hữu thiết kế hình trụ thể thao, năng động với dải âm trung - cao rõ nét cùng màng loa thụ động kép giúp tối ưu âm bass. Thiết kế chống nước/bụi đạt chuẩn IP67 cho phép bạn thoải mái mang theo trong các chuyến du lịch, tiệc bể bơi hay dã ngoại ngoài trời mà không lo hỏng hóc.',3990000,'Công nghệ âm thanh JBL Original Pro Sound sống động, âm bass trầm sâu\n\nChuẩn kháng nước và bụi IP67 bảo vệ tối đa\n\nThời lượng pin lên đến 20 giờ chơi nhạc liên tục\n\nTích hợp tính năng sạc dự phòng (Powerbank) cho thiết bị di động\n\nKết nối nhiều loa cùng lúc qua tính năng PartyBoost',0,3,5,27,'2026-09-15 18:36:06','2026-09-15 19:22:07',6,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `theme` varchar(255) DEFAULT NULL,
  `accent_color` varchar(255) DEFAULT NULL,
  `language` varchar(255) DEFAULT NULL,
  `sidebar_collapsed` tinyint(1) DEFAULT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `hotline` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `maintenance_mode` tinyint(1) DEFAULT NULL,
  `shipping_fee` int DEFAULT NULL,
  `free_shipping_threshold` int DEFAULT NULL,
  `order_sound_enabled` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'dark','violet','en',NULL,'',NULL,NULL,0,0,0,NULL,'2026-09-17 01:08:21','2026-09-19 05:54:29');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vouchers`
--

DROP TABLE IF EXISTS `user_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `voucher_id` int DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vouchers`
--

LOCK TABLES `user_vouchers` WRITE;
/*!40000 ALTER TABLE `user_vouchers` DISABLE KEYS */;
INSERT INTO `user_vouchers` VALUES (1,1,1,0,'2026-09-08 07:11:41','2026-09-08 07:11:41');
/*!40000 ALTER TABLE `user_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` int DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` int DEFAULT NULL,
  `is_locked` int DEFAULT '0',
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'thk22042006@gmail.com','Khanh123','khánh ht',1,'1788974370111-nha.jpg',NULL,0,NULL,'2026-09-07 16:26:57','2026-09-13 16:23:27'),(2,'user1@gmail.com','Khanh123','Nguyễn Văn A',1,NULL,NULL,0,NULL,NULL,NULL),(3,'user2@gmail.com','Khanh123','Trần Thị B',1,NULL,NULL,0,NULL,NULL,NULL),(4,'user3@gmail.com','Khanh123','Lê Văn C',2,NULL,NULL,0,NULL,NULL,'2026-09-15 01:16:01'),(5,'staff1@gmail.com','Khanh123','Trần Hữu Khánh',2,'http://localhost:5000/api/images/1788852154369-memem.png',NULL,0,NULL,NULL,'2026-09-08 14:43:12'),(6,'admin1@gmail.com','Khanh123','Thanh Nha',3,'1788852363123-nha.jpg',NULL,0,NULL,NULL,'2026-09-08 07:26:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variant_values`
--

DROP TABLE IF EXISTS `variant_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variant_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variant_values`
--

LOCK TABLES `variant_values` WRITE;
/*!40000 ALTER TABLE `variant_values` DISABLE KEYS */;
INSERT INTO `variant_values` VALUES (1,1,NULL,'128GB','2026-09-07 17:39:40','2026-09-07 17:39:40'),(2,1,NULL,'Đen','2026-09-07 17:39:40','2026-09-07 17:39:40'),(3,2,NULL,'128GB','2026-09-07 17:39:40','2026-09-07 17:39:40'),(4,2,NULL,'Xanh','2026-09-07 17:39:40','2026-09-07 17:39:40'),(5,3,NULL,'256GB','2026-09-07 17:39:40','2026-09-07 17:39:40'),(6,3,NULL,'Tím','2026-09-07 17:39:41','2026-09-07 17:39:41'),(7,4,NULL,'256GB','2026-09-08 15:12:34','2026-09-08 15:12:34'),(8,4,NULL,'Xanh','2026-09-08 15:12:34','2026-09-08 15:12:34'),(9,5,NULL,'256GB','2026-09-09 01:39:06','2026-09-09 01:39:06'),(10,5,NULL,'Xám','2026-09-09 01:39:06','2026-09-09 01:39:06'),(11,6,NULL,'512GB','2026-09-09 01:39:07','2026-09-09 01:39:07'),(12,6,NULL,'Bạc','2026-09-09 01:39:07','2026-09-09 01:39:07'),(13,7,NULL,'Standard','2026-09-09 04:54:24','2026-09-09 04:54:24'),(14,7,NULL,'Đen','2026-09-09 04:54:24','2026-09-09 04:54:24'),(15,8,NULL,'Standard','2026-09-09 04:54:24','2026-09-09 04:54:24'),(16,8,NULL,'Bạc','2026-09-09 04:54:24','2026-09-09 04:54:24'),(17,9,NULL,'41mm','2026-09-09 15:00:44','2026-09-09 15:00:44'),(18,9,NULL,'Hồng','2026-09-09 15:00:44','2026-09-09 15:00:44'),(19,10,NULL,'45mm','2026-09-09 15:00:44','2026-09-09 15:00:44'),(20,10,NULL,'Đen','2026-09-09 15:00:44','2026-09-09 15:00:44'),(21,11,NULL,'Standard','2026-09-12 08:57:39','2026-09-12 08:57:39'),(22,11,NULL,'Trắng','2026-09-12 08:57:39','2026-09-12 08:57:39'),(23,12,NULL,'Standard','2026-09-12 09:26:36','2026-09-12 09:26:36'),(24,12,NULL,'Xanh Dương','2026-09-12 09:26:36','2026-09-12 09:26:36'),(25,13,NULL,'Standard','2026-09-12 09:26:36','2026-09-12 09:26:36'),(26,13,NULL,'Đỏ','2026-09-12 09:26:36','2026-09-12 09:26:36'),(27,14,NULL,'TKL','2026-09-14 18:22:11','2026-09-14 18:22:11'),(28,14,NULL,'Đen','2026-09-14 18:22:11','2026-09-14 18:22:11'),(29,15,NULL,'TKL','2026-09-14 18:22:11','2026-09-14 18:22:11'),(30,15,NULL,'Trắng','2026-09-14 18:22:11','2026-09-14 18:22:11'),(31,16,NULL,'27 inch','2026-09-14 18:40:50','2026-09-14 18:40:50'),(32,16,NULL,'Đen','2026-09-14 18:40:50','2026-09-14 18:40:50'),(33,17,NULL,'8GB/512GB','2026-09-14 23:13:52','2026-09-14 23:13:52'),(34,17,NULL,'Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52'),(35,18,NULL,'16GB/512GB','2026-09-14 23:13:52','2026-09-14 23:13:52'),(36,18,NULL,'Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52'),(37,19,NULL,'8GB/256GB','2026-09-14 23:13:52','2026-09-14 23:13:52'),(38,19,NULL,'Đen','2026-09-14 23:13:52','2026-09-14 23:13:52'),(39,20,NULL,'41mm','2026-09-14 23:19:42','2026-09-14 23:19:42'),(40,20,NULL,'Đen','2026-09-14 23:19:42','2026-09-14 23:19:42'),(41,21,NULL,'500GB','2026-09-14 23:24:30','2026-09-14 23:24:30'),(42,21,NULL,'Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(43,22,NULL,'1TB','2026-09-14 23:24:30','2026-09-14 23:24:30'),(44,22,NULL,'Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(45,23,NULL,'2TB','2026-09-14 23:24:30','2026-09-14 23:24:30'),(46,23,NULL,'Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(47,24,NULL,'Mặc định','2026-09-14 23:28:17','2026-09-14 23:28:17'),(48,24,NULL,'Đen','2026-09-14 23:28:17','2026-09-14 23:28:17'),(49,25,NULL,'Mặc định','2026-09-14 23:28:18','2026-09-14 23:28:18'),(50,25,NULL,'Trắng','2026-09-14 23:28:18','2026-09-14 23:28:18'),(51,26,NULL,'Switch Blue','2026-09-14 23:33:34','2026-09-14 23:33:34'),(52,26,NULL,'Trắng','2026-09-14 23:33:34','2026-09-14 23:33:34'),(53,27,NULL,'Switch Red','2026-09-14 23:33:34','2026-09-14 23:33:34'),(54,27,NULL,'Đen','2026-09-14 23:33:34','2026-09-14 23:33:34'),(55,28,NULL,'Switch Brown','2026-09-14 23:33:34','2026-09-14 23:33:34'),(56,28,NULL,'Trắng','2026-09-14 23:33:34','2026-09-14 23:33:34'),(57,29,NULL,'Kèm kit 15-45mm','2026-09-15 06:12:22','2026-09-15 06:12:22'),(58,29,NULL,'Đen','2026-09-15 06:12:22','2026-09-15 06:12:22'),(59,30,NULL,'Thân máy (không kit)','2026-09-15 06:12:22','2026-09-15 06:12:22'),(60,30,NULL,'Đen','2026-09-15 06:12:22','2026-09-15 06:12:22'),(61,31,NULL,'Standard','2026-09-15 06:24:42','2026-09-15 06:24:42'),(62,31,NULL,'Hồng','2026-09-15 06:24:42','2026-09-15 06:24:42'),(63,32,NULL,'32 inch','2026-09-15 07:17:10','2026-09-15 07:17:10'),(64,32,NULL,'Đen','2026-09-15 07:17:10','2026-09-15 07:17:10'),(65,33,NULL,'Freesize','2026-09-15 07:31:00','2026-09-15 07:31:00'),(66,33,NULL,'Đen','2026-09-15 07:31:00','2026-09-15 07:31:00'),(67,34,NULL,'Freesize','2026-09-15 07:31:00','2026-09-15 07:31:00'),(68,34,NULL,'Bạc (Silver)','2026-09-15 07:31:00','2026-09-15 07:31:00'),(69,35,NULL,'Freesize','2026-09-15 07:31:00','2026-09-15 07:31:00'),(70,35,NULL,'Xanh Xám','2026-09-15 07:31:00','2026-09-15 07:31:00'),(71,36,NULL,'Standard','2026-09-15 18:36:06','2026-09-15 18:36:06'),(72,36,NULL,'Xanh rêu','2026-09-15 18:36:06','2026-09-15 18:36:06');
/*!40000 ALTER TABLE `variant_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (1,'128GB - Đen','2026-09-07 17:39:40','2026-09-07 17:39:40'),(2,'128GB - Xanh','2026-09-07 17:39:40','2026-09-07 17:39:40'),(3,'256GB - Tím','2026-09-07 17:39:40','2026-09-07 17:39:40'),(4,'256GB - Xanh','2026-09-08 15:12:34','2026-09-08 15:12:34'),(5,'256GB - Xám','2026-09-09 01:39:06','2026-09-09 01:39:06'),(6,'512GB - Bạc','2026-09-09 01:39:06','2026-09-09 01:39:06'),(7,'Standard - Đen','2026-09-09 04:54:24','2026-09-09 04:54:24'),(8,'Standard - Bạc','2026-09-09 04:54:24','2026-09-09 04:54:24'),(9,'41mm - Hồng','2026-09-09 15:00:44','2026-09-09 15:00:44'),(10,'45mm - Đen','2026-09-09 15:00:44','2026-09-09 15:00:44'),(11,'Standard - Trắng','2026-09-12 08:57:39','2026-09-12 08:57:39'),(12,'Standard - Xanh Dương','2026-09-12 09:26:36','2026-09-12 09:26:36'),(13,'Standard - Đỏ','2026-09-12 09:26:36','2026-09-12 09:26:36'),(14,'TKL - Đen','2026-09-14 18:22:11','2026-09-14 18:22:11'),(15,'TKL - Trắng','2026-09-14 18:22:11','2026-09-14 18:22:11'),(16,'27 inch - Đen','2026-09-14 18:40:50','2026-09-14 18:40:50'),(17,'8GB/512GB - Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52'),(18,'16GB/512GB - Bạc','2026-09-14 23:13:52','2026-09-14 23:13:52'),(19,'8GB/256GB - Đen','2026-09-14 23:13:52','2026-09-14 23:13:52'),(20,'41mm - Đen','2026-09-14 23:19:42','2026-09-14 23:19:42'),(21,'500GB - Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(22,'1TB - Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(23,'2TB - Đen','2026-09-14 23:24:30','2026-09-14 23:24:30'),(24,'Mặc định - Đen','2026-09-14 23:28:17','2026-09-14 23:28:17'),(25,'Mặc định - Trắng','2026-09-14 23:28:18','2026-09-14 23:28:18'),(26,'Switch Blue - Trắng','2026-09-14 23:33:34','2026-09-14 23:33:34'),(27,'Switch Red - Đen','2026-09-14 23:33:34','2026-09-14 23:33:34'),(28,'Switch Brown - Trắng','2026-09-14 23:33:34','2026-09-14 23:33:34'),(29,'Kèm kit 15-45mm - Đen','2026-09-15 06:12:22','2026-09-15 06:12:22'),(30,'Thân máy (không kit) - Đen','2026-09-15 06:12:22','2026-09-15 06:12:22'),(31,'Standard - Hồng','2026-09-15 06:24:42','2026-09-15 06:24:42'),(32,'32 inch - Đen','2026-09-15 07:17:10','2026-09-15 07:17:10'),(33,'Freesize - Đen','2026-09-15 07:31:00','2026-09-15 07:31:00'),(34,'Freesize - Bạc (Silver)','2026-09-15 07:31:00','2026-09-15 07:31:00'),(35,'Freesize - Xanh Xám','2026-09-15 07:31:00','2026-09-15 07:31:00'),(36,'Standard - Xanh rêu','2026-09-15 18:36:06','2026-09-15 18:36:06');
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchercategories`
--

DROP TABLE IF EXISTS `vouchercategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchercategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voucher_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchercategories`
--

LOCK TABLES `vouchercategories` WRITE;
/*!40000 ALTER TABLE `vouchercategories` DISABLE KEYS */;
/*!40000 ALTER TABLE `vouchercategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucherproducts`
--

DROP TABLE IF EXISTS `voucherproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucherproducts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voucher_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucherproducts`
--

LOCK TABLES `voucherproducts` WRITE;
/*!40000 ALTER TABLE `voucherproducts` DISABLE KEYS */;
INSERT INTO `voucherproducts` VALUES (3,1,3,'2026-09-08 07:13:02','2026-09-08 07:13:02');
/*!40000 ALTER TABLE `voucherproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_value` decimal(10,0) DEFAULT NULL,
  `max_discount_amount` decimal(10,0) DEFAULT NULL,
  `min_order_value` decimal(10,0) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  `limit_per_user` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_by_type` varchar(255) DEFAULT NULL,
  `creator_id` int DEFAULT NULL,
  `apply_scope` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,'SIEUSALEMUAHE','SIÊU SALE SẢN PHẨM MỚI','fixed',5000000,5000000,1,1,1,1,'2026-09-08 07:08:00','2026-09-08 15:09:00','manager',5,'specific_products',1,'2026-09-08 07:09:43','2026-09-08 07:14:39');
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucherusages`
--

DROP TABLE IF EXISTS `voucherusages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucherusages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `voucher_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucherusages`
--

LOCK TABLES `voucherusages` WRITE;
/*!40000 ALTER TABLE `voucherusages` DISABLE KEYS */;
INSERT INTO `voucherusages` VALUES (1,1,1,2,NULL,'2026-09-08 07:14:39','2026-09-08 07:14:39'),(2,2,1,7,NULL,'2026-09-09 16:46:02','2026-09-09 16:46:02');
/*!40000 ALTER TABLE `voucherusages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-19  9:56:25
