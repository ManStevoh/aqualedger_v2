-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: aquaerp_operating
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
-- Current Database: `aquaerp_operating`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `aquaerp_operating` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `aquaerp_operating`;

--
-- Table structure for table `ai_automation_runs`
--

DROP TABLE IF EXISTS `ai_automation_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_automation_runs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('success','partial','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'success',
  `forecasts_computed` int DEFAULT '0',
  `brief_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_time` (`tenant_id`,`created_at` DESC),
  CONSTRAINT `ai_automation_runs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_automation_runs`
--

LOCK TABLES `ai_automation_runs` WRITE;
/*!40000 ALTER TABLE `ai_automation_runs` DISABLE KEYS */;
INSERT INTO `ai_automation_runs` VALUES ('3163b17e-d9f0-467f-a2e4-813b07ed2d01','9cbbec81-9056-452a-907c-c5eefa34d596','success',3,NULL,NULL,'2026-06-27 12:40:08'),('b08baef5-2136-41d2-b3a1-4899189fcd27','18cf6cf5-801c-4f38-b51b-2dc044d709ed','success',3,NULL,NULL,'2026-06-27 12:40:09'),('cca218ba-da87-4ed5-968b-1194399c15e7','40051ba4-1212-4a7e-9298-cb602baf8ec0','success',3,NULL,NULL,'2026-06-27 12:40:08');
/*!40000 ALTER TABLE `ai_automation_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_chat_sessions`
--

DROP TABLE IF EXISTS `ai_chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_chat_sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT 'AquaERP Assistant',
  `messages` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `ai_chat_sessions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_chat_sessions`
--

LOCK TABLES `ai_chat_sessions` WRITE;
/*!40000 ALTER TABLE `ai_chat_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_insights`
--

DROP TABLE IF EXISTS `ai_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_insights` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `insight_type` enum('business_brief','coldchain_review','inventory_review','operations_review') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_key` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `recommendations` json DEFAULT NULL,
  `metrics` json DEFAULT NULL,
  `model_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'rules_and_statistics_v1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_type_time` (`tenant_id`,`insight_type`,`created_at` DESC),
  CONSTRAINT `ai_insights_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_insights`
--

LOCK TABLES `ai_insights` WRITE;
/*!40000 ALTER TABLE `ai_insights` DISABLE KEYS */;
INSERT INTO `ai_insights` VALUES ('28d78320-3aa3-407b-85ba-9d001e0fd737','18cf6cf5-801c-4f38-b51b-2dc044d709ed','business_brief',NULL,'Weekly operations brief','Demo insight for AquaERP Showcase Tenant: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-27 12:40:09'),('2ec880c3-bdc0-41e0-9f57-396ae3851e6d','40051ba4-1212-4a7e-9298-cb602baf8ec0','business_brief',NULL,'Weekly operations brief','Demo insight for Lamu Sea Ventures: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-27 12:40:08'),('b5903d7d-d050-4697-91ba-8211a78d26ef','9cbbec81-9056-452a-907c-c5eefa34d596','business_brief',NULL,'Weekly operations brief','Demo insight for Coast Fish Cooperative: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `ai_insights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_events`
--

DROP TABLE IF EXISTS `analytics_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` json DEFAULT NULL,
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrer` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `analytics_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_events`
--

LOCK TABLES `analytics_events` WRITE;
/*!40000 ALTER TABLE `analytics_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_invoices`
--

DROP TABLE IF EXISTS `ap_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ap_invoices` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `subtotal` decimal(14,2) NOT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `total_amount` decimal(14,2) NOT NULL,
  `status` enum('draft','approved','paid','void') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `purchase_order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grn_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gl_journal_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_ap_inv` (`tenant_id`,`invoice_number`),
  CONSTRAINT `ap_invoices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_invoices`
--

LOCK TABLES `ap_invoices` WRITE;
/*!40000 ALTER TABLE `ap_invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_tokens`
--

DROP TABLE IF EXISTS `api_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_tokens` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scopes` json DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `api_tokens_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `api_tokens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_tokens`
--

LOCK TABLES `api_tokens` WRITE;
/*!40000 ALTER TABLE `api_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ar_invoices`
--

DROP TABLE IF EXISTS `ar_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ar_invoices` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `subtotal` decimal(14,2) NOT NULL,
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `total_amount` decimal(14,2) NOT NULL,
  `status` enum('draft','sent','paid','overdue','void') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gl_journal_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_ar_inv` (`tenant_id`,`invoice_number`),
  CONSTRAINT `ar_invoices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ar_invoices`
--

LOCK TABLES `ar_invoices` WRITE;
/*!40000 ALTER TABLE `ar_invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `ar_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auction_bids`
--

DROP TABLE IF EXISTS `auction_bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_bids` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `auction_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bidder_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bidder_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bid_amount` decimal(14,2) NOT NULL,
  `is_winning` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auction` (`auction_id`,`created_at`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `auction_bids_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auction_bids`
--

LOCK TABLES `auction_bids` WRITE;
/*!40000 ALTER TABLE `auction_bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `auction_bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_audit_tenant` (`tenant_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('03b6b01c-1f09-487c-9a04-5e7140ced8f6',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:44:53',NULL),('07ada44e-5748-4657-ba64-c1a8d31f46b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:02:51',NULL),('0be943b5-e17a-4057-b1f2-369a2106e98c','4771d81c-81ef-495e-b938-7f4d1d3213d4','admin.action','platform_settings','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"setting\": \"branding\"}','127.0.0.1','seed-script','2026-06-20 16:49:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('0f28145f-082b-46e9-84cd-a47cd8b71448','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:59:52',NULL),('1750c4e0-96e2-4cab-a47d-e3953b92471e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('17ac9186-0e17-47e0-b2aa-b8de2cafaf91','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:49:47',NULL),('19d4f46d-218a-46e9-a284-6593fd17a113',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:00',NULL),('1a0d2317-9e68-4a3d-bbe2-deda6be093e8','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:02:54',NULL),('1a24f00a-6e94-41a1-9d27-facaf2a50560','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:04:04',NULL),('1b05b6d0-16ae-43e5-a4e9-1d8d914bdb44',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:05:00',NULL),('1d173ef0-b419-4a09-b600-13a643466100','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:54',NULL),('1fb51bb9-6219-4b9a-911f-f8e77b3c6665','ea5600c2-5f69-48ed-84c8-01cd0a59db53','user.update','tenant_settings','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-22 14:35:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('208400c8-0a5c-4f15-871d-f93b5fb56f0a','4771d81c-81ef-495e-b938-7f4d1d3213d4','admin.action','platform_module_flags','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"enabled\": \"all\"}','127.0.0.1','seed-script','2026-06-21 15:42:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('2161c97d-d1e0-4344-8911-c30a8cc63c6d',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:50:44',NULL),('23a1d9f2-8331-4b78-8b9c-2966302907eb','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','9cbbec81-9056-452a-907c-c5eefa34d596','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-06-08 12:13:00','9cbbec81-9056-452a-907c-c5eefa34d596'),('28c2e509-6fb9-45c0-b3c3-4afacb8284ce','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:47',NULL),('2cab92a1-0f84-4960-b08b-fb07623d8dec','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:16:41',NULL),('2ed562b3-9adb-40c3-a1b3-9d2fc981d914',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:04',NULL),('3106e6fb-45cf-4e3b-9465-8f5114fcc68d','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:31',NULL),('31e71109-0793-4e9c-9b31-816d8bad7972','5e6081b2-aae7-44a1-82dc-2577da5e884f','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-lamusea@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-06-17 11:10:00','40051ba4-1212-4a7e-9298-cb602baf8ec0'),('345a084f-79e3-4c7e-8ad6-98617959eeb7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:50',NULL),('34c0875b-99e1-4a39-bdbf-59f1689b3b32',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:23',NULL),('39d12abd-5211-4b91-b276-9ff735252505',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:03:48',NULL),('3a3bd62e-1fcc-4ed2-be30-f7ca4b30c2bb',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:17:00',NULL),('3bb29656-01d3-4b63-a380-f083dd1adecc',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:19',NULL),('4056d16a-afb1-4604-b0ee-cd3c004426cd','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:50:30',NULL),('456f0ca5-5a83-44c0-85cf-e935a6252b3a',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:21:40',NULL),('4707dfde-ba6d-499b-84db-187d9944ae32','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:43:46',NULL),('48db875c-409e-4333-95d5-a007fc755a33','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:25',NULL),('4f555a9c-faae-4154-911b-f8f95d278252','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:03:16',NULL),('5044378d-f1e8-481b-8901-18c1931b2673','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','40051ba4-1212-4a7e-9298-cb602baf8ec0','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-06-09 11:06:00','40051ba4-1212-4a7e-9298-cb602baf8ec0'),('51b820cb-1810-4d23-827c-7d64a70acb89',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:02',NULL),('52729f1e-415a-4b10-903f-428641c7769b',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('5c30cc25-0951-46fd-a7e2-c5180ec51ef5','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.logout','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,NULL,NULL,'2026-06-08 08:43:34',NULL),('61fd92e5-907d-4ad6-ab0b-2dc8e52d08d0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:14:49',NULL),('641718d1-872a-4e55-a9ee-bed2818e443f',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:20',NULL),('65698fcc-0dd3-446f-87e8-3616e292cbd4',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:30',NULL),('65dcddb3-1736-4355-94fe-95be68228fc1','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 10:13:55',NULL),('6a4c31c8-be87-4d78-9815-47bef3ff49d2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:15:47',NULL),('7159ff5b-4db6-43a7-93d9-fef56eb3dfef',NULL,'auth.logout','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92',NULL,NULL,NULL,'2026-06-06 08:59:43',NULL),('72d6993f-6ec3-4d50-8bd0-119b6c74821e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:13',NULL),('766bd93b-4c52-407f-b1fa-df6e5e8a5746','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:22',NULL),('78584340-1d94-426a-9a95-a969cfc6d6b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:53:45',NULL),('89cd6038-3641-4475-9896-bbb15b131f1a','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:51:00',NULL),('8e90c974-927e-437e-b6b5-331c3216b69d','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\"}','127.0.0.1','seed-script','2026-06-07 13:20:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('914e9591-3d0f-49ea-8777-feb4e6452c1c',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('97b36173-e566-40b1-8951-091248ac6c40','ea5600c2-5f69-48ed-84c8-01cd0a59db53','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-aquaerp-demo@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-06-15 13:24:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('9840d001-18cd-487e-ad61-8f6a77916e5d','a4be805d-2f00-4777-be82-1bda494d50f1','auth.login','user','a4be805d-2f00-4777-be82-1bda494d50f1','{\"rememberMe\": false}','::1','node','2026-06-11 09:38:48',NULL),('9ba4b484-964b-45d4-9b9a-def887173282',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:24',NULL),('9c7037dd-f900-4fb8-a099-f395cbca14a5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('9f7eacef-1600-437a-918c-0bff8573f57c','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','40051ba4-1212-4a7e-9298-cb602baf8ec0','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\"}','127.0.0.1','seed-script','2026-06-09 11:06:00','40051ba4-1212-4a7e-9298-cb602baf8ec0'),('a048e633-abc8-4802-ae7e-a8276e350455','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:14:03',NULL),('a0d3fe9e-00de-4e16-860d-896ce8034549',NULL,'auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:40',NULL),('a11b9a1a-1a90-49b6-bd69-b240fd914b48','ad6588db-332a-4a22-aa34-aad59f244ed1','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-coastfish@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-06-16 12:17:00','9cbbec81-9056-452a-907c-c5eefa34d596'),('a673e114-6621-4369-a7ee-e093f9c1de2e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:22',NULL),('a76b2d8d-8f4c-4437-943d-a050609b214c','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.broadcast','announcement','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"title\": \"Platform demo loaded\"}','127.0.0.1','seed-script','2026-06-13 15:38:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('b5b0d7a6-4795-4049-b2fe-81d9a85056b2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:59:53',NULL),('b6b7049f-f9e0-4246-b23b-8cdb4a2b1b93','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 09:16:44',NULL),('b8d30a4c-04df-437c-bd82-95d328eafada','5e6081b2-aae7-44a1-82dc-2577da5e884f','user.update','tenant_settings','40051ba4-1212-4a7e-9298-cb602baf8ec0','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-24 12:21:00','40051ba4-1212-4a7e-9298-cb602baf8ec0'),('b8f5a177-ea6a-4a33-9fdc-146ee8785290',NULL,'auth.login','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:52:29',NULL),('bb8fed13-cf3b-4b3b-b13f-f1a0f9a3ab32','ad6588db-332a-4a22-aa34-aad59f244ed1','user.update','tenant_settings','9cbbec81-9056-452a-907c-c5eefa34d596','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-23 13:28:00','9cbbec81-9056-452a-907c-c5eefa34d596'),('bcf94c94-6049-45fa-833f-9002fc18c98d','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.login','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:34:44',NULL),('be5eff73-a5b5-4a7c-a596-d5995b71e77b','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:09',NULL),('bf27ef63-deb3-41b8-a5e7-d510b9f0bcc9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:19:01',NULL),('c3b15858-8b86-4b36-a76d-8d353266f0bf',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:48',NULL),('cb34bc83-de9e-4dcb-8125-db78e214f49d',NULL,'auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:29',NULL),('ce2b637f-37d6-4aee-bdfb-6d93ca292255',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:47:14',NULL),('cf34d672-3619-4463-951a-23c6fa145fe1',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('cfce88b9-cf33-4ebb-a52a-bb515526a272','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:46',NULL),('d58effb8-8aaf-4ed0-93bb-6f5a3d0cb890','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:04:19',NULL),('d69dda0c-dee1-4ed8-bf14-9bbd1bf3f188','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','9cbbec81-9056-452a-907c-c5eefa34d596','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\"}','127.0.0.1','seed-script','2026-06-08 12:13:00','9cbbec81-9056-452a-907c-c5eefa34d596'),('dad5980f-f81e-41bb-b807-9f419d0274b5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:18',NULL),('dbdb9f8e-3e1e-4593-ab7f-f844110f3ec0',NULL,'auth.logout','user','a652b08b-76db-4db2-9413-03376be3b051',NULL,NULL,NULL,'2026-06-08 08:49:48',NULL),('dc3d5363-cfbd-4886-be6b-abdaf07e3548','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:10',NULL),('dc4e54e6-7953-489a-808e-6ce8e55cf2a7','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:00:33',NULL),('dd900aaa-8975-443a-b280-2b1521add9d5','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:46:57',NULL),('e2e072f3-a150-4030-bdbf-3bc617fc8b49','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 09:53:41',NULL),('e451e139-38ac-4fd1-acae-5e297d0e1af9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:04:10',NULL),('e4fb8552-2820-437d-9bd5-9ee5ae56239e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('e59f7298-26ee-4aad-bfa3-e3b55a3c0e05','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:38',NULL),('e6f7c7a6-e36c-4540-921a-4732ffe37c0e','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"admin@aqualedger.co.ke\"}','127.0.0.1','seed-script','2026-06-26 10:07:00',NULL),('e7de1a14-f194-4b5f-9a67-50ed833cd896','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:50:01',NULL),('e886658c-e170-4185-9c9d-cc53057c1773','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:03:09',NULL),('eb6198ce-11d4-4cbe-992c-bf003b2dd5b0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:14:05',NULL),('efed8b87-e5a2-488c-81a6-ef2863feb446',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:17',NULL),('f3ec824c-1a5c-4507-a0f4-f443444f7432','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:44:09',NULL),('f43a3665-5c2b-4b21-b900-c9e8d67ad4d4','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.tenant.provision','tenant','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"note\": \"Demo tenant batch provision\", \"seed\": \"super-admin-platform\"}','127.0.0.1','seed-script','2026-05-30 13:16:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed'),('f9c234a9-ea5d-4ea5-b838-6c50c1cfa7da','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','18cf6cf5-801c-4f38-b51b-2dc044d709ed','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-06-07 13:20:00','18cf6cf5-801c-4f38-b51b-2dc044d709ed');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_reconciliation`
--

DROP TABLE IF EXISTS `bank_reconciliation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_reconciliation` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statement_date` date NOT NULL,
  `opening_balance` decimal(14,2) NOT NULL,
  `closing_balance` decimal(14,2) NOT NULL,
  `status` enum('draft','reconciled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `bank_reconciliation_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_reconciliation`
--

LOCK TABLES `bank_reconciliation` WRITE;
/*!40000 ALTER TABLE `bank_reconciliation` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_reconciliation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bmu`
--

DROP TABLE IF EXISTS `bmu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bmu` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `county` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chairman_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `total_members` int DEFAULT '0',
  `total_boats` int DEFAULT '0',
  `registration_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `chairman_id` (`chairman_id`),
  KEY `idx_code` (`code`),
  KEY `idx_county` (`county`),
  KEY `idx_bmu_tenant` (`tenant_id`),
  CONSTRAINT `bmu_ibfk_1` FOREIGN KEY (`chairman_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bmu`
--

LOCK TABLES `bmu` WRITE;
/*!40000 ALTER TABLE `bmu` DISABLE KEYS */;
INSERT INTO `bmu` VALUES ('4762b5a6-1e72-4d17-92e1-9c4aeadf4a92','9cbbec81-9056-452a-907c-c5eefa34d596','Kwale BMU','coastfish-bmu','Kwale','ad6588db-332a-4a22-aa34-aad59f244ed1','active',40,5,NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('7219d212-1566-4ced-9aac-45c1deb12eb1','18cf6cf5-801c-4f38-b51b-2dc044d709ed','Mombasa BMU','aquaerp-demo-bmu','Mombasa','ea5600c2-5f69-48ed-84c8-01cd0a59db53','active',44,7,NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('9d9d6956-11a3-4c3c-a474-07b424092950','40051ba4-1212-4a7e-9298-cb602baf8ec0','Lamu BMU','lamusea-bmu','Lamu','5e6081b2-aae7-44a1-82dc-2577da5e884f','active',42,6,NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `bmu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boat_crew`
--

DROP TABLE IF EXISTS `boat_crew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boat_crew` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crew_member_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('captain','engineer','deckhand','nets_officer') COLLATE utf8mb4_unicode_ci DEFAULT 'deckhand',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `joined_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_boat_crew` (`boat_id`,`crew_member_id`),
  KEY `idx_boat_id` (`boat_id`),
  KEY `idx_crew_member_id` (`crew_member_id`),
  CONSTRAINT `boat_crew_ibfk_1` FOREIGN KEY (`boat_id`) REFERENCES `boats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `boat_crew_ibfk_2` FOREIGN KEY (`crew_member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boat_crew`
--

LOCK TABLES `boat_crew` WRITE;
/*!40000 ALTER TABLE `boat_crew` DISABLE KEYS */;
/*!40000 ALTER TABLE `boat_crew` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boat_fuel_logs`
--

DROP TABLE IF EXISTS `boat_fuel_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boat_fuel_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liters` decimal(10,2) NOT NULL,
  `cost` decimal(14,2) NOT NULL,
  `logged_at` datetime NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_boat` (`tenant_id`,`boat_id`),
  CONSTRAINT `boat_fuel_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boat_fuel_logs`
--

LOCK TABLES `boat_fuel_logs` WRITE;
/*!40000 ALTER TABLE `boat_fuel_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `boat_fuel_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boat_maintenance`
--

DROP TABLE IF EXISTS `boat_maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boat_maintenance` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maintenance_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cost` decimal(10,2) DEFAULT NULL,
  `maintenance_date` date NOT NULL,
  `completion_date` date DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_boat_id` (`boat_id`),
  KEY `idx_maintenance_date` (`maintenance_date`),
  KEY `idx_maint_tenant` (`tenant_id`),
  CONSTRAINT `boat_maintenance_ibfk_1` FOREIGN KEY (`boat_id`) REFERENCES `boats` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boat_maintenance`
--

LOCK TABLES `boat_maintenance` WRITE;
/*!40000 ALTER TABLE `boat_maintenance` DISABLE KEYS */;
/*!40000 ALTER TABLE `boat_maintenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boats`
--

DROP TABLE IF EXISTS `boats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boats` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('fiber','wooden','steel','aluminum') COLLATE utf8mb4_unicode_ci DEFAULT 'fiber',
  `capacity_kg` int NOT NULL,
  `length_meters` decimal(5,2) DEFAULT NULL,
  `engine_power_hp` int DEFAULT NULL,
  `engine_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year_built` int DEFAULT NULL,
  `gps_enabled` tinyint(1) DEFAULT '0',
  `imei_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','maintenance','decommissioned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `registration_expires_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_registration` (`tenant_id`,`registration_number`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_status` (`status`),
  KEY `idx_boats_tenant` (`tenant_id`),
  CONSTRAINT `boats_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boats`
--

LOCK TABLES `boats` WRITE;
/*!40000 ALTER TABLE `boats` DISABLE KEYS */;
INSERT INTO `boats` VALUES ('84c305e0-64ac-4c57-b4fb-9d97d885a3e4','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','KEN-DEMO-002','Lamu Sea Ventures Vessel','fiber',425,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('badd9eca-b18d-4dc9-a90b-bf30dcc88f65','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','KEN-DEMO-001','Coast Fish Cooperative Vessel','fiber',400,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('ee99b60b-ae32-4a33-9e0b-0218b46348ba','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','KEN-DEMO-003','AquaERP Showcase Tenant Vessel','fiber',450,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `boats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('headquarters','landing_site','cold_storage','market','office','warehouse') COLLATE utf8mb4_unicode_ci DEFAULT 'office',
  `county` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_branch_code` (`tenant_id`,`code`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES ('64072af1-1ad5-4847-aca9-2f27d0a35c0a','9cbbec81-9056-452a-907c-c5eefa34d596','HQ','Coast Fish Cooperative HQ','headquarters',NULL,NULL,'active','2026-06-27 12:40:06','2026-06-27 12:40:06'),('branch-hq-0001','tenant-default-0001','HQ','Headquarters','headquarters',NULL,NULL,'active','2026-06-06 08:45:17','2026-06-06 08:45:17'),('e06c58ff-e74a-4ed3-925e-4e4fdd1dc583','40051ba4-1212-4a7e-9298-cb602baf8ec0','HQ','Lamu Sea Ventures HQ','headquarters',NULL,NULL,'active','2026-06-27 12:40:08','2026-06-27 12:40:08'),('fa56a1de-5a18-4eae-8d4d-6f9372fdf30d','18cf6cf5-801c-4f38-b51b-2dc044d709ed','HQ','AquaERP Showcase Tenant HQ','headquarters',NULL,NULL,'active','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscal_year` year NOT NULL,
  `account_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `period` enum('monthly','quarterly','annual') COLLATE utf8mb4_unicode_ci DEFAULT 'annual',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_budget` (`tenant_id`,`fiscal_year`,`account_id`),
  CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catch_quality_inspections`
--

DROP TABLE IF EXISTS `catch_quality_inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catch_quality_inspections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_site_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inspector_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade_assigned` enum('A','B','C','reject') COLLATE utf8mb4_unicode_ci NOT NULL,
  `freshness_score` tinyint DEFAULT NULL,
  `parasite_check` tinyint(1) DEFAULT '0',
  `temperature_c` decimal(5,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inspected_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_trip` (`tenant_id`,`trip_id`),
  CONSTRAINT `catch_quality_inspections_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catch_quality_inspections`
--

LOCK TABLES `catch_quality_inspections` WRITE;
/*!40000 ALTER TABLE `catch_quality_inspections` DISABLE KEYS */;
/*!40000 ALTER TABLE `catch_quality_inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catch_quotas`
--

DROP TABLE IF EXISTS `catch_quotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catch_quotas` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fishing_zone` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `period_type` enum('monthly','annual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'annual',
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `quota_kg` decimal(14,2) NOT NULL,
  `issuing_authority` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cq_tenant_period` (`tenant_id`,`period_start`,`period_end`),
  KEY `idx_cq_species` (`species_id`),
  CONSTRAINT `catch_quotas_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catch_quotas`
--

LOCK TABLES `catch_quotas` WRITE;
/*!40000 ALTER TABLE `catch_quotas` DISABLE KEYS */;
INSERT INTO `catch_quotas` VALUES ('0b33e8a2-432c-483f-bc0f-3b204fc7e958','40051ba4-1212-4a7e-9298-cb602baf8ec0','Lamu Sea Ventures Annual Quota','836add52-8810-45b5-81a5-25e0656c2e08','Inshore','annual','2026-05-28','2027-05-28',51000.00,'Kenya Fisheries','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('7bc93e10-1a05-4215-8631-61617fe0a432','18cf6cf5-801c-4f38-b51b-2dc044d709ed','AquaERP Showcase Tenant Annual Quota','aa94db67-b750-475b-be26-8a0b6b4f60a9','Inshore','annual','2026-05-28','2027-05-28',52000.00,'Kenya Fisheries','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('81a43119-cdad-48d5-abe4-81107720f35d','9cbbec81-9056-452a-907c-c5eefa34d596','Coast Fish Cooperative Annual Quota','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2','Inshore','annual','2026-05-28','2027-05-28',50000.00,'Kenya Fisheries','active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `catch_quotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catches`
--

DROP TABLE IF EXISTS `catches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catches` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `grade` enum('A','B','C') COLLATE utf8mb4_unicode_ci DEFAULT 'B',
  `unit_price` decimal(8,2) NOT NULL,
  `total_value` decimal(15,2) GENERATED ALWAYS AS ((`quantity_kg` * `unit_price`)) STORED,
  `storage_method` enum('iced','frozen','salted','dried') COLLATE utf8mb4_unicode_ci DEFAULT 'iced',
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_species_id` (`species_id`),
  KEY `idx_catches_trip_created` (`trip_id`,`created_at`),
  KEY `idx_catches_tenant` (`tenant_id`),
  CONSTRAINT `catches_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `catches_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `fish_species` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catches`
--

LOCK TABLES `catches` WRITE;
/*!40000 ALTER TABLE `catches` DISABLE KEYS */;
INSERT INTO `catches` (`id`, `tenant_id`, `trip_id`, `species_id`, `quantity_kg`, `grade`, `unit_price`, `storage_method`, `recorded_by`, `created_at`) VALUES ('032b2128-f1b0-49c1-919c-33eb1cfa6ddf','40051ba4-1212-4a7e-9298-cb602baf8ec0','69a6fe7d-8eec-44ff-8a8e-4818a7abfc25','836add52-8810-45b5-81a5-25e0656c2e08',128.00,'A',325.00,'iced','5e6081b2-aae7-44a1-82dc-2577da5e884f','2026-06-27 12:40:08'),('318d6670-8a36-4857-86c7-8091959ebd8f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2569360b-c775-485c-b8d6-f34bacdc8060','aa94db67-b750-475b-be26-8a0b6b4f60a9',136.00,'A',330.00,'iced','ea5600c2-5f69-48ed-84c8-01cd0a59db53','2026-06-27 12:40:09'),('3e0d0ac0-6184-4955-8450-8274ecd5d7cb','9cbbec81-9056-452a-907c-c5eefa34d596','1746047a-2918-4a91-8a5a-f7fae12cb352','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2',120.00,'A',320.00,'iced','ad6588db-332a-4a22-aa34-aad59f244ed1','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `catches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `climate_alerts`
--

DROP TABLE IF EXISTS `climate_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `climate_alerts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('advisory','warning','weather','environmental') COLLATE utf8mb4_unicode_ci DEFAULT 'weather',
  `severity` enum('low','moderate','high','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'moderate',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `affected_counties` json DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `climate_alerts`
--

LOCK TABLES `climate_alerts` WRITE;
/*!40000 ALTER TABLE `climate_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `climate_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coldchain_alerts`
--

DROP TABLE IF EXISTS `coldchain_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coldchain_alerts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alert_type` enum('temperature','humidity','door','power') COLLATE utf8mb4_unicode_ci DEFAULT 'temperature',
  `severity` enum('info','warning','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'warning',
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reading_value` decimal(8,2) DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_open` (`tenant_id`,`resolved`),
  CONSTRAINT `coldchain_alerts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coldchain_alerts`
--

LOCK TABLES `coldchain_alerts` WRITE;
/*!40000 ALTER TABLE `coldchain_alerts` DISABLE KEYS */;
INSERT INTO `coldchain_alerts` VALUES ('644bfb3d-07e6-4c37-9247-c626432e77d5','40051ba4-1212-4a7e-9298-cb602baf8ec0','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-27 12:40:08'),('7956c9b0-ab5f-40e7-8bb0-8f300c764701','9cbbec81-9056-452a-907c-c5eefa34d596','7c7b339d-ff4d-4bb8-aed1-0350c07638ac','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-27 12:40:07'),('9cab9f5e-8d30-47b3-b9d2-32f26103326c','9cbbec81-9056-452a-907c-c5eefa34d596','7c7b339d-ff4d-4bb8-aed1-0350c07638ac','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-27 12:40:07'),('b41c2206-9da8-4085-9b00-121e2587a086','18cf6cf5-801c-4f38-b51b-2dc044d709ed','d1364028-0c03-4454-8cd4-2f4604e39839','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-27 12:40:09'),('c9b22bb5-5657-4aef-9eb6-062608089b38','40051ba4-1212-4a7e-9298-cb602baf8ec0','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-27 12:40:08'),('cd02f18d-672d-4f25-bb77-0ff6781232a9','18cf6cf5-801c-4f38-b51b-2dc044d709ed','d1364028-0c03-4454-8cd4-2f4604e39839','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-27 12:40:09');
/*!40000 ALTER TABLE `coldchain_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commerce_cart_items`
--

DROP TABLE IF EXISTS `commerce_cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commerce_cart_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cart_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listing_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_kg` decimal(12,3) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `line_total` decimal(14,2) NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  CONSTRAINT `commerce_cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `commerce_carts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commerce_cart_items`
--

LOCK TABLES `commerce_cart_items` WRITE;
/*!40000 ALTER TABLE `commerce_cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `commerce_cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commerce_carts`
--

DROP TABLE IF EXISTS `commerce_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commerce_carts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','converted','abandoned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_cart` (`tenant_id`,`user_id`,`status`),
  CONSTRAINT `commerce_carts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commerce_carts`
--

LOCK TABLES `commerce_carts` WRITE;
/*!40000 ALTER TABLE `commerce_carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `commerce_carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commerce_guest_cart_items`
--

DROP TABLE IF EXISTS `commerce_guest_cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commerce_guest_cart_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cart_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(12,3) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `line_total` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  CONSTRAINT `commerce_guest_cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `commerce_guest_carts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commerce_guest_cart_items`
--

LOCK TABLES `commerce_guest_cart_items` WRITE;
/*!40000 ALTER TABLE `commerce_guest_cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `commerce_guest_cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commerce_guest_carts`
--

DROP TABLE IF EXISTS `commerce_guest_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commerce_guest_carts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','converted','abandoned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_guest_session` (`tenant_id`,`session_token`,`status`),
  CONSTRAINT `commerce_guest_carts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commerce_guest_carts`
--

LOCK TABLES `commerce_guest_carts` WRITE;
/*!40000 ALTER TABLE `commerce_guest_carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `commerce_guest_carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_messages`
--

DROP TABLE IF EXISTS `communication_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','whatsapp','webhook','push','in_app') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'transactional',
  `recipient` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_preview` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `external_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_created` (`tenant_id`,`created_at`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `communication_messages_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_messages`
--

LOCK TABLES `communication_messages` WRITE;
/*!40000 ALTER TABLE `communication_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_templates`
--

DROP TABLE IF EXISTS `communication_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','whatsapp') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_html` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_text` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_key_channel` (`tenant_id`,`template_key`,`channel`),
  CONSTRAINT `communication_templates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_templates`
--

LOCK TABLES `communication_templates` WRITE;
/*!40000 ALTER TABLE `communication_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cooperative_revenue_shares`
--

DROP TABLE IF EXISTS `cooperative_revenue_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cooperative_revenue_shares` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_month` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catch_kg` decimal(12,3) DEFAULT '0.000',
  `revenue_share` decimal(14,2) DEFAULT '0.00',
  `share_pct` decimal(5,2) DEFAULT '0.00',
  `status` enum('draft','approved','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_member_period` (`tenant_id`,`period_month`,`member_user_id`),
  CONSTRAINT `cooperative_revenue_shares_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cooperative_revenue_shares`
--

LOCK TABLES `cooperative_revenue_shares` WRITE;
/*!40000 ALTER TABLE `cooperative_revenue_shares` DISABLE KEYS */;
/*!40000 ALTER TABLE `cooperative_revenue_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(14,2) NOT NULL,
  `min_order_amount` decimal(14,2) DEFAULT '0.00',
  `max_uses` int DEFAULT NULL,
  `uses_count` int DEFAULT '0',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_coupon` (`tenant_id`,`code`),
  CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('0c73d9d7-1014-4958-8134-4df28baaf169','9cbbec81-9056-452a-907c-c5eefa34d596','WELCOME1','percent',5.00,5000.00,NULL,0,'2026-06-27','2026-09-25','active','2026-06-27 12:40:07'),('2460009a-9a92-4a40-8b9a-0c4ea5a21de0','18cf6cf5-801c-4f38-b51b-2dc044d709ed','WELCOME3','percent',5.00,5000.00,NULL,0,'2026-06-27','2026-09-25','active','2026-06-27 12:40:09'),('2bd4be98-7cce-436f-b64f-f8933b298a78','40051ba4-1212-4a7e-9298-cb602baf8ec0','WELCOME2','percent',5.00,5000.00,NULL,0,'2026-06-27','2026-09-25','active','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_scores`
--

DROP TABLE IF EXISTS `credit_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_scores` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int DEFAULT '400',
  `grade` char(1) COLLATE utf8mb4_unicode_ci DEFAULT 'C',
  `payment_history` int DEFAULT '0',
  `default_count` int DEFAULT '0',
  `accounts_opened` int DEFAULT '0',
  `credit_inquiries` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_score` (`score`),
  CONSTRAINT `credit_scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_scores`
--

LOCK TABLES `credit_scores` WRITE;
/*!40000 ALTER TABLE `credit_scores` DISABLE KEYS */;
INSERT INTO `credit_scores` VALUES ('33070231-a0fb-4f24-a646-3b9320d460e9','4771d81c-81ef-495e-b938-7f4d1d3213d4',700,'A',0,0,0,0,'2026-06-06 08:48:44'),('67613b11-13b5-4270-9cba-12805d354fb4','4323337f-4938-4d7a-ad5a-c0c77b5556fc',800,'A',0,0,0,0,'2026-06-27 12:40:13'),('bd98698b-114f-47c8-8f3b-b5489b9e6236','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2',300,'E',0,0,0,0,'2026-06-08 09:28:37');
/*!40000 ALTER TABLE `credit_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_activities`
--

DROP TABLE IF EXISTS `crm_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_activities` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity_type` enum('call','email','meeting','note','whatsapp') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `crm_activities_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_activities`
--

LOCK TABLES `crm_activities` WRITE;
/*!40000 ALTER TABLE `crm_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_campaigns`
--

DROP TABLE IF EXISTS `crm_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_campaigns` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','whatsapp','in_app') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','scheduled','sent','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `crm_campaigns_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_campaigns`
--

LOCK TABLES `crm_campaigns` WRITE;
/*!40000 ALTER TABLE `crm_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_customers`
--

DROP TABLE IF EXISTS `crm_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_customers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `segment` enum('retail','wholesale','export','restaurant','cooperative') COLLATE utf8mb4_unicode_ci DEFAULT 'retail',
  `lifetime_value` decimal(14,2) DEFAULT '0.00',
  `status` enum('active','inactive','prospect') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rfm_segment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_segment` (`tenant_id`,`segment`),
  CONSTRAINT `crm_customers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_customers`
--

LOCK TABLES `crm_customers` WRITE;
/*!40000 ALTER TABLE `crm_customers` DISABLE KEYS */;
INSERT INTO `crm_customers` VALUES ('b2209906-42b5-478c-b49a-f5d674d91852','9cbbec81-9056-452a-907c-c5eefa34d596','554e08ea-02dd-4817-b0e7-24042ace45b4','Kwale Wholesale Ltd','wholesale-coastfish@example.com','+254710000000','wholesale',120000.00,'active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07',NULL),('e4bd6620-2745-44ea-a2f1-ec58aa73bf42','18cf6cf5-801c-4f38-b51b-2dc044d709ed','554e08ea-02dd-4817-b0e7-24042ace45b4','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com','+254710000002','wholesale',130000.00,'active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09',NULL),('ea8b78e1-a483-4261-a8a2-636cae30e044','40051ba4-1212-4a7e-9298-cb602baf8ec0','554e08ea-02dd-4817-b0e7-24042ace45b4','Lamu Wholesale Ltd','wholesale-lamusea@example.com','+254710000001','wholesale',125000.00,'active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08',NULL);
/*!40000 ALTER TABLE `crm_customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_leads`
--

DROP TABLE IF EXISTS `crm_leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_leads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stage` enum('new','contacted','qualified','won','lost') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `estimated_value` decimal(14,2) DEFAULT '0.00',
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_stage` (`tenant_id`,`stage`),
  CONSTRAINT `crm_leads_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_leads`
--

LOCK TABLES `crm_leads` WRITE;
/*!40000 ALTER TABLE `crm_leads` DISABLE KEYS */;
INSERT INTO `crm_leads` VALUES ('238e6d8f-fe1a-4b01-8445-eb161972037d','9cbbec81-9056-452a-907c-c5eefa34d596','Nairobi Hotel Group','leads-coastfish@example.com',NULL,'referral','qualified',85000.00,'ad6588db-332a-4a22-aa34-aad59f244ed1','2026-06-27 12:40:07','2026-06-27 12:40:07'),('5b8e4b48-e57d-42a2-983f-a828d86797f7','18cf6cf5-801c-4f38-b51b-2dc044d709ed','Nairobi Hotel Group','leads-aquaerp-demo@example.com',NULL,'referral','qualified',89000.00,'ea5600c2-5f69-48ed-84c8-01cd0a59db53','2026-06-27 12:40:09','2026-06-27 12:40:09'),('8e0f204b-3d03-4adc-92d0-922dc1e0578b','40051ba4-1212-4a7e-9298-cb602baf8ec0','Nairobi Hotel Group','leads-lamusea@example.com',NULL,'referral','qualified',87000.00,'5e6081b2-aae7-44a1-82dc-2577da5e884f','2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `crm_leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_segment_rules`
--

DROP TABLE IF EXISTS `crm_segment_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_segment_rules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `segment_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rule_type` enum('rfm','order_value','species','manual') COLLATE utf8mb4_unicode_ci DEFAULT 'rfm',
  `criteria` json NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_segment` (`tenant_id`,`segment_key`),
  CONSTRAINT `crm_segment_rules_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_segment_rules`
--

LOCK TABLES `crm_segment_rules` WRITE;
/*!40000 ALTER TABLE `crm_segment_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_segment_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currency_rates`
--

DROP TABLE IF EXISTS `currency_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currency_rates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `quote_currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate` decimal(18,8) NOT NULL,
  `effective_date` date NOT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'manual',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rate` (`tenant_id`,`base_currency`,`quote_currency`,`effective_date`),
  CONSTRAINT `currency_rates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currency_rates`
--

LOCK TABLES `currency_rates` WRITE;
/*!40000 ALTER TABLE `currency_rates` DISABLE KEYS */;
INSERT INTO `currency_rates` VALUES ('fx-eur-01','tenant-default-0001','KES','EUR',0.00710000,'2026-06-06','manual','2026-06-06 08:46:34'),('fx-tzs-01','tenant-default-0001','KES','TZS',19.50000000,'2026-06-06','manual','2026-06-06 08:46:34'),('fx-usd-01','tenant-default-0001','KES','USD',0.00770000,'2026-06-06','manual','2026-06-06 08:46:34');
/*!40000 ALTER TABLE `currency_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','assigned','in_transit','delivered','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `driver_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_address` text COLLATE utf8mb4_unicode_ci,
  `delivery_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `proof_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_tracking` (`tenant_id`,`tracking_code`),
  KEY `idx_status` (`tenant_id`,`status`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES ('f022ac76-3765-430e-b98c-847e49003491','40051ba4-1212-4a7e-9298-cb602baf8ec0','c7e11858-cb81-4c31-8f9a-4043376254ee','TRK-LAMUSEA','in_transit','5e6081b2-aae7-44a1-82dc-2577da5e884f','Lamu landing site','Nairobi City Market, Kenya','2026-06-28 12:40:08',NULL,NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('f46a4afc-802d-46c4-b3dd-28ad4a6b216f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','7dc2a6eb-b690-4f44-b1fa-320bb7f30a29','TRK-AQUAERP-DE','in_transit','ea5600c2-5f69-48ed-84c8-01cd0a59db53','Mombasa landing site','Nairobi City Market, Kenya','2026-06-28 12:40:09',NULL,NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('fc613750-ed6e-4f5c-8801-7beb58599c4f','9cbbec81-9056-452a-907c-c5eefa34d596','dc31743e-b1db-45a3-b4e4-e9c7832f61c5','TRK-COASTFISH','in_transit','ad6588db-332a-4a22-aa34-aad59f244ed1','Kwale landing site','Nairobi City Market, Kenya','2026-06-28 12:40:08',NULL,NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_events`
--

DROP TABLE IF EXISTS `delivery_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_delivery` (`delivery_id`),
  CONSTRAINT `delivery_events_ibfk_1` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_events`
--

LOCK TABLES `delivery_events` WRITE;
/*!40000 ALTER TABLE `delivery_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_slots`
--

DROP TABLE IF EXISTS `delivery_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_slots` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_orders` int DEFAULT '20',
  `booked_count` int DEFAULT '0',
  `cold_chain` tinyint(1) DEFAULT '1',
  `zone_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('open','full','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slot` (`tenant_id`,`slot_date`,`start_time`),
  CONSTRAINT `delivery_slots_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_slots`
--

LOCK TABLES `delivery_slots` WRITE;
/*!40000 ALTER TABLE `delivery_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demand_forecasts`
--

DROP TABLE IF EXISTS `demand_forecasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demand_forecasts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_or_sku` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `forecast_date` date NOT NULL,
  `predicted_kg` decimal(12,3) NOT NULL,
  `confidence_pct` decimal(5,2) DEFAULT '70.00',
  `model_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'moving_avg_v1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_date` (`tenant_id`,`forecast_date`),
  CONSTRAINT `demand_forecasts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demand_forecasts`
--

LOCK TABLES `demand_forecasts` WRITE;
/*!40000 ALTER TABLE `demand_forecasts` DISABLE KEYS */;
/*!40000 ALTER TABLE `demand_forecasts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domain_events`
--

DROP TABLE IF EXISTS `domain_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `domain_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aggregate_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aggregate_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json DEFAULT NULL,
  `status` enum('pending','processed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  KEY `idx_event_type` (`event_type`),
  CONSTRAINT `domain_events_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domain_events`
--

LOCK TABLES `domain_events` WRITE;
/*!40000 ALTER TABLE `domain_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `domain_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `receipt_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `boat_id` (`boat_id`),
  KEY `trip_id` (`trip_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expense_date` (`expense_date`),
  KEY `idx_expenses_tenant` (`tenant_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`boat_id`) REFERENCES `boats` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expenses_ibfk_4` FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES ('257699b8-f67d-4804-b09b-912b6a32b995','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1',NULL,NULL,'fuel','Trip fuel top-up',8500.00,NULL,'approved',NULL,'2026-06-27','2026-06-27 12:40:08','2026-06-27 12:40:08'),('50d135d8-62b1-4781-97e7-bacf517cb36c','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f',NULL,NULL,'fuel','Trip fuel top-up',8600.00,NULL,'approved',NULL,'2026-06-27','2026-06-27 12:40:08','2026-06-27 12:40:08'),('f29f07e1-50bd-4965-885f-8f8af7ac2c03','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53',NULL,NULL,'fuel','Trip fuel top-up',8700.00,NULL,'approved',NULL,'2026-06-27','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_documents`
--

DROP TABLE IF EXISTS `export_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_documents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_type` enum('certificate_of_origin','health_certificate','catch_certificate','customs_declaration','invoice') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuing_authority` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_country` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hs_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','issued','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `payload` json DEFAULT NULL,
  `issued_at` date DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc` (`tenant_id`,`doc_number`),
  CONSTRAINT `export_documents_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_documents`
--

LOCK TABLES `export_documents` WRITE;
/*!40000 ALTER TABLE `export_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `export_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fiscal_periods`
--

DROP TABLE IF EXISTS `fiscal_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiscal_periods` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `status` enum('open','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `closed_at` timestamp NULL DEFAULT NULL,
  `closed_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period` (`tenant_id`,`period_start`,`period_end`),
  CONSTRAINT `fiscal_periods_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiscal_periods`
--

LOCK TABLES `fiscal_periods` WRITE;
/*!40000 ALTER TABLE `fiscal_periods` DISABLE KEYS */;
/*!40000 ALTER TABLE `fiscal_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_auctions`
--

DROP TABLE IF EXISTS `fish_auctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_auctions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `landing_site_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `species_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(12,3) NOT NULL,
  `starting_price` decimal(14,2) NOT NULL,
  `winning_price` decimal(14,2) DEFAULT NULL,
  `buyer_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('scheduled','live','closed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `auction_date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `fish_auctions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_auctions`
--

LOCK TABLES `fish_auctions` WRITE;
/*!40000 ALTER TABLE `fish_auctions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fish_auctions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_listings`
--

DROP TABLE IF EXISTS `fish_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_listings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fish_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `available_quantity_kg` decimal(10,2) NOT NULL,
  `grade` enum('A','B','C') COLLATE utf8mb4_unicode_ci DEFAULT 'B',
  `price_per_kg` decimal(8,2) NOT NULL,
  `landing_site_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_method` enum('iced','frozen','salted','dried') COLLATE utf8mb4_unicode_ci DEFAULT 'iced',
  `expires_at` datetime DEFAULT NULL,
  `status` enum('available','sold_out','expired','delisted') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `landing_site_id` (`landing_site_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_species_id` (`species_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_listings_seller_status` (`seller_id`,`status`),
  KEY `idx_listings_tenant` (`tenant_id`),
  CONSTRAINT `fish_listings_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fish_listings_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `fish_species` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fish_listings_ibfk_3` FOREIGN KEY (`landing_site_id`) REFERENCES `landing_sites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_listings`
--

LOCK TABLES `fish_listings` WRITE;
/*!40000 ALTER TABLE `fish_listings` DISABLE KEYS */;
INSERT INTO `fish_listings` VALUES ('0aba2246-9098-4716-abc4-e9476d594f63','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2','Fresh',80.00,80.00,'A',420.00,'477c76aa-0763-49fe-98ef-cff79b6484d2','iced','2026-07-11 12:40:07','available','2026-06-27 12:40:07','2026-06-27 12:40:07'),('2cb25a91-fdad-45d1-95f4-0ff2457a39ff','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','18f72ae2-41f1-4688-ad53-d6e32035e7b2','Fresh',83.00,83.00,'A',425.00,'5079b383-e486-4cba-900a-b7ff838fd12d','iced','2026-07-11 12:40:08','available','2026-06-27 12:40:08','2026-06-27 12:40:08'),('cd06dad0-50a4-4d92-b4ff-7907f1254337','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','22f7c36c-ff9a-4812-85e7-4854afe6e815','Fresh',86.00,86.00,'A',430.00,'09a4010b-5699-47c3-a3be-379d83c82a2a','iced','2026-07-11 12:40:09','available','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `fish_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_species`
--

DROP TABLE IF EXISTS `fish_species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_species` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scientific_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `average_weight_kg` decimal(5,2) DEFAULT NULL,
  `market_price_per_kg` decimal(8,2) DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_species`
--

LOCK TABLES `fish_species` WRITE;
/*!40000 ALTER TABLE `fish_species` DISABLE KEYS */;
INSERT INTO `fish_species` VALUES ('18f72ae2-41f1-4688-ad53-d6e32035e7b2','40051ba4-1212-4a7e-9298-cb602baf8ec0','lamusea Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:08'),('22f7c36c-ff9a-4812-85e7-4854afe6e815','18cf6cf5-801c-4f38-b51b-2dc044d709ed','aquaerp-demo Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:09'),('61a60b88-6569-4ba9-a5cc-d92779599ec4','9cbbec81-9056-452a-907c-c5eefa34d596','coastfish Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:07'),('62116ea2-bcb6-4099-91e4-0c88b1bc58f7','40051ba4-1212-4a7e-9298-cb602baf8ec0','lamusea Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-27 12:40:08'),('836add52-8810-45b5-81a5-25e0656c2e08','40051ba4-1212-4a7e-9298-cb602baf8ec0','lamusea Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:08'),('8f8e5f48-c9d9-49ba-94f5-4ef87570af34','18cf6cf5-801c-4f38-b51b-2dc044d709ed','aquaerp-demo Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:09'),('aa94db67-b750-475b-be26-8a0b6b4f60a9','18cf6cf5-801c-4f38-b51b-2dc044d709ed','aquaerp-demo Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-27 12:40:09'),('c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2','9cbbec81-9056-452a-907c-c5eefa34d596','coastfish Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-27 12:40:07'),('ea4b4e60-5714-4ef4-ad92-534e0ba69455','9cbbec81-9056-452a-907c-c5eefa34d596','coastfish Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-27 12:40:07'),('sp_001','tenant-default-0001','Tilapia','Oreochromis niloticus',NULL,0.80,350.00,'active','2026-06-06 08:45:16'),('sp_002','tenant-default-0001','Nile Perch','Lates niloticus',NULL,5.00,450.00,'active','2026-06-06 08:45:16'),('sp_003','tenant-default-0001','Catfish','Clarias gariepinus',NULL,1.50,280.00,'active','2026-06-06 08:45:16'),('sp_004','tenant-default-0001','Sardines','Sardinella gibbosa',NULL,0.05,150.00,'active','2026-06-06 08:45:16'),('sp_005','tenant-default-0001','Mackerel','Rastrelliger kanagurta',NULL,0.30,320.00,'active','2026-06-06 08:45:16'),('sp_006','tenant-default-0001','Tuna','Thunnus albacares',NULL,8.00,600.00,'active','2026-06-06 08:45:16'),('sp_007','tenant-default-0001','Squid','Loligo vulgaris',NULL,0.20,500.00,'active','2026-06-06 08:45:16'),('sp_008','tenant-default-0001','Shrimp','Penaeus indicus',NULL,0.01,1200.00,'active','2026-06-06 08:45:16');
/*!40000 ALTER TABLE `fish_species` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fishing_trips`
--

DROP TABLE IF EXISTS `fishing_trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fishing_trips` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `captain_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `landing_site_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_time` datetime NOT NULL,
  `return_time` datetime DEFAULT NULL,
  `fishing_zone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weather_conditions` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sea_state` enum('calm','moderate','rough','very_rough') COLLATE utf8mb4_unicode_ci DEFAULT 'calm',
  `fuel_used_liters` decimal(8,2) DEFAULT '0.00',
  `fuel_cost` decimal(10,2) DEFAULT '0.00',
  `total_catch_kg` decimal(10,2) DEFAULT '0.00',
  `total_revenue` decimal(15,2) DEFAULT '0.00',
  `status` enum('planned','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'planned',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `landing_site_id` (`landing_site_id`),
  KEY `idx_boat_id` (`boat_id`),
  KEY `idx_captain_id` (`captain_id`),
  KEY `idx_departure_time` (`departure_time`),
  KEY `idx_status` (`status`),
  KEY `idx_trips_tenant` (`tenant_id`),
  CONSTRAINT `fishing_trips_ibfk_1` FOREIGN KEY (`boat_id`) REFERENCES `boats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fishing_trips_ibfk_2` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fishing_trips_ibfk_3` FOREIGN KEY (`landing_site_id`) REFERENCES `landing_sites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fishing_trips`
--

LOCK TABLES `fishing_trips` WRITE;
/*!40000 ALTER TABLE `fishing_trips` DISABLE KEYS */;
INSERT INTO `fishing_trips` VALUES ('1746047a-2918-4a91-8a5a-f7fae12cb352','9cbbec81-9056-452a-907c-c5eefa34d596','badd9eca-b18d-4dc9-a90b-bf30dcc88f65','ad6588db-332a-4a22-aa34-aad59f244ed1','477c76aa-0763-49fe-98ef-cff79b6484d2','2026-06-25 15:40:08','2026-06-25 23:40:08','Zone A','Clear','calm',80.00,12000.00,120.00,38400.00,'completed',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('2569360b-c775-485c-b8d6-f34bacdc8060','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ee99b60b-ae32-4a33-9e0b-0218b46348ba','ea5600c2-5f69-48ed-84c8-01cd0a59db53','09a4010b-5699-47c3-a3be-379d83c82a2a','2026-06-23 15:40:09','2026-06-23 23:40:09','Zone A','Clear','calm',80.00,12000.00,136.00,44880.00,'completed',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('69a6fe7d-8eec-44ff-8a8e-4818a7abfc25','40051ba4-1212-4a7e-9298-cb602baf8ec0','84c305e0-64ac-4c57-b4fb-9d97d885a3e4','5e6081b2-aae7-44a1-82dc-2577da5e884f','5079b383-e486-4cba-900a-b7ff838fd12d','2026-06-24 15:40:09','2026-06-24 23:40:09','Zone A','Clear','calm',80.00,12000.00,128.00,41600.00,'completed',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `fishing_trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fishing_zones`
--

DROP TABLE IF EXISTS `fishing_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fishing_zones` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fao_area` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `county` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('open','restricted','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_zone` (`tenant_id`,`code`),
  CONSTRAINT `fishing_zones_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fishing_zones`
--

LOCK TABLES `fishing_zones` WRITE;
/*!40000 ALTER TABLE `fishing_zones` DISABLE KEYS */;
INSERT INTO `fishing_zones` VALUES ('zone-mombasa-01','tenant-default-0001','MBA-DEEP','Mombasa Deep Waters','51','Mombasa','open'),('zone-victoria-01','tenant-default-0001','LV-DUNGA','Lake Victoria Dunga','34','Kisumu','open'),('zone-watamu-01','tenant-default-0001','WAT-REEF','Watamu Reef','51','Kilifi','open');
/*!40000 ALTER TABLE `fishing_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fixed_assets`
--

DROP TABLE IF EXISTS `fixed_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fixed_assets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('vessel','vehicle','equipment','building','other') COLLATE utf8mb4_unicode_ci DEFAULT 'equipment',
  `purchase_date` date NOT NULL,
  `purchase_cost` decimal(14,2) NOT NULL,
  `salvage_value` decimal(14,2) DEFAULT '0.00',
  `useful_life_months` int NOT NULL DEFAULT '60',
  `accumulated_depreciation` decimal(14,2) DEFAULT '0.00',
  `status` enum('active','disposed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_code` (`tenant_id`,`asset_code`),
  CONSTRAINT `fixed_assets_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fixed_assets`
--

LOCK TABLES `fixed_assets` WRITE;
/*!40000 ALTER TABLE `fixed_assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `fixed_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gl_accounts`
--

DROP TABLE IF EXISTS `gl_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gl_accounts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','equity','revenue','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `is_system` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_code` (`tenant_id`,`code`),
  CONSTRAINT `gl_accounts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gl_accounts`
--

LOCK TABLES `gl_accounts` WRITE;
/*!40000 ALTER TABLE `gl_accounts` DISABLE KEYS */;
INSERT INTO `gl_accounts` VALUES ('06f1d639-24f4-471b-b6bb-8050af47fcca','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2300','Accrued Expenses','liability','KES',1,'2026-06-27 12:40:09'),('07a43255-09cf-4d98-b34c-59caec5ed5ce','40051ba4-1212-4a7e-9298-cb602baf8ec0','6100','Depreciation Expense','expense','KES',1,'2026-06-27 12:40:08'),('0960223a-cd33-402b-8a63-ae53f6ead303','9cbbec81-9056-452a-907c-c5eefa34d596','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-27 12:40:07'),('0a834a84-b5f5-4b1e-bf0d-c425561a847f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1100','Accounts Receivable','asset','KES',1,'2026-06-27 12:40:09'),('0cc20426-9150-45fd-a80a-0d0047660c75','9cbbec81-9056-452a-907c-c5eefa34d596','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-27 12:40:07'),('0d5564ea-cd8b-41f2-a2ca-2a670d73bc7c','40051ba4-1212-4a7e-9298-cb602baf8ec0','6900','Miscellaneous Expense','expense','KES',1,'2026-06-27 12:40:08'),('0d59467c-eba0-475b-ab7f-cfd071dc8856','18cf6cf5-801c-4f38-b51b-2dc044d709ed','6900','Miscellaneous Expense','expense','KES',1,'2026-06-27 12:40:09'),('0fb824f3-e75e-4201-a2cc-dc4819ae948a','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-27 12:40:09'),('166c7aa1-9dab-4605-b549-6d5546c46ce6','9cbbec81-9056-452a-907c-c5eefa34d596','4100','Other Operating Income','revenue','KES',1,'2026-06-27 12:40:07'),('166edc34-5f92-477c-81f4-bc44c859138f','40051ba4-1212-4a7e-9298-cb602baf8ec0','1500','Fixed Assets','asset','KES',1,'2026-06-27 12:40:08'),('17fa1260-ca08-4f48-b3cd-5f141ab36e6c','40051ba4-1212-4a7e-9298-cb602baf8ec0','3000','Owner\'s Equity','equity','KES',1,'2026-06-27 12:40:08'),('199040b1-4620-47ad-b6b9-31a022d2d10e','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-27 12:40:09'),('1b54beda-b3aa-4b0d-a1b9-45e30bb59c56','9cbbec81-9056-452a-907c-c5eefa34d596','1510','Accumulated Depreciation','asset','KES',1,'2026-06-27 12:40:07'),('1c9fec47-53f8-41bb-8264-917b08324d22','40051ba4-1212-4a7e-9298-cb602baf8ec0','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-27 12:40:08'),('222e01ce-c246-4f18-8139-d9eda7c22049','40051ba4-1212-4a7e-9298-cb602baf8ec0','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-27 12:40:08'),('23b2a3c6-c55f-4d67-955b-ba328a6cb5cf','40051ba4-1212-4a7e-9298-cb602baf8ec0','1510','Accumulated Depreciation','asset','KES',1,'2026-06-27 12:40:08'),('26556cd9-81e1-4229-ad91-d12140f61967','18cf6cf5-801c-4f38-b51b-2dc044d709ed','6100','Depreciation Expense','expense','KES',1,'2026-06-27 12:40:09'),('268e24e5-60e2-4324-bba3-b12a92f3b14a','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-27 12:40:09'),('2931d3ff-5a57-46e4-bf6c-94a658b11559','40051ba4-1212-4a7e-9298-cb602baf8ec0','5700','Licenses & Compliance','expense','KES',1,'2026-06-27 12:40:08'),('2cf95f4e-afbc-4d7c-9aad-be9ec6070334','9cbbec81-9056-452a-907c-c5eefa34d596','5300','Cold Chain & Storage','expense','KES',1,'2026-06-27 12:40:07'),('2e22eb85-2f8d-4b70-a90a-2277206c414d','9cbbec81-9056-452a-907c-c5eefa34d596','2110','PAYE Payable','liability','KES',1,'2026-06-27 12:40:07'),('2f8571f6-029d-4846-9495-e84615f61e02','40051ba4-1212-4a7e-9298-cb602baf8ec0','1010','Petty Cash','asset','KES',1,'2026-06-27 12:40:08'),('34e81faf-499b-4d92-8786-d99a8da268d0','9cbbec81-9056-452a-907c-c5eefa34d596','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-27 12:40:07'),('3550370c-1a97-4117-95a7-182c47af939d','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-27 12:40:09'),('376184be-1b1f-406f-89ae-8f8b5d38045e','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1500','Fixed Assets','asset','KES',1,'2026-06-27 12:40:09'),('381efe93-81fc-44a7-905e-e847dc06767d','40051ba4-1212-4a7e-9298-cb602baf8ec0','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-27 12:40:08'),('39d4cf76-5732-4ec0-9de8-8455f4c338db','9cbbec81-9056-452a-907c-c5eefa34d596','5400','Logistics & Delivery','expense','KES',1,'2026-06-27 12:40:07'),('40e7e738-d420-4254-b5c1-77e2e63a0b8c','40051ba4-1212-4a7e-9298-cb602baf8ec0','2000','Accounts Payable','liability','KES',1,'2026-06-27 12:40:08'),('4365fafb-7918-45d8-bc03-fb802790fbb7','9cbbec81-9056-452a-907c-c5eefa34d596','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-27 12:40:06'),('4502a860-97b4-4127-81ef-0bac3fae5a67','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5000','Cost of Goods Sold','expense','KES',1,'2026-06-27 12:40:09'),('460251ef-7b58-4f0a-b1c9-ef26211e9852','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-27 12:40:09'),('4abcef4d-6f56-4951-a420-e6bfa23dba85','40051ba4-1212-4a7e-9298-cb602baf8ec0','5300','Cold Chain & Storage','expense','KES',1,'2026-06-27 12:40:08'),('4af2c4d9-5e36-49d2-a5af-0b6dbfb0a36f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5300','Cold Chain & Storage','expense','KES',1,'2026-06-27 12:40:09'),('4b7d8bc3-4299-47ce-a868-34107bd8f2ee','9cbbec81-9056-452a-907c-c5eefa34d596','3000','Owner\'s Equity','equity','KES',1,'2026-06-27 12:40:07'),('4bc65a4a-f736-4f74-89bf-a51f26bcc291','9cbbec81-9056-452a-907c-c5eefa34d596','2100','Salaries Payable','liability','KES',1,'2026-06-27 12:40:07'),('52b89abc-ae59-432a-a575-1c35ff2047a9','40051ba4-1212-4a7e-9298-cb602baf8ec0','4100','Other Operating Income','revenue','KES',1,'2026-06-27 12:40:08'),('5389a714-167d-4010-9f5a-30a360caa0bc','40051ba4-1212-4a7e-9298-cb602baf8ec0','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-27 12:40:08'),('53f3b392-3f8a-423d-b9ef-e1d55079b97f','40051ba4-1212-4a7e-9298-cb602baf8ec0','2200','VAT Payable','liability','KES',1,'2026-06-27 12:40:08'),('55f5020c-d4d3-4632-8d45-acb2909e3c15','9cbbec81-9056-452a-907c-c5eefa34d596','2120','NHIF Payable','liability','KES',1,'2026-06-27 12:40:07'),('5747cfe0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1010','Petty Cash','asset','KES',1,'2026-06-06 08:47:25'),('5755188e-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-06 08:47:25'),('576a29f4-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1300','Prepaid Expenses','asset','KES',1,'2026-06-06 08:47:25'),('57736ae8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-06 08:47:25'),('577b6e75-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1500','Fixed Assets','asset','KES',1,'2026-06-06 08:47:25'),('5788f79f-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1510','Accumulated Depreciation','asset','KES',1,'2026-06-06 08:47:25'),('57969b52-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2100','Salaries Payable','liability','KES',1,'2026-06-06 08:47:25'),('579ff868-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2110','PAYE Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ad9877-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2120','NHIF Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ba1e92-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2200','VAT Payable','liability','KES',1,'2026-06-06 08:47:26'),('57c8d184-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2300','Accrued Expenses','liability','KES',1,'2026-06-06 08:47:26'),('57debf07-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3000','Owner\'s Equity','equity','KES',1,'2026-06-06 08:47:26'),('57f14e09-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3100','Retained Earnings','equity','KES',1,'2026-06-06 08:47:26'),('57f40bd0-3140-4de0-9567-de0a3fcf4109','9cbbec81-9056-452a-907c-c5eefa34d596','1010','Petty Cash','asset','KES',1,'2026-06-27 12:40:06'),('57fa9b77-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-06 08:47:26'),('58084a9a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-06 08:47:26'),('5815d3b8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4100','Other Operating Income','revenue','KES',1,'2026-06-06 08:47:26'),('581f510a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5100','Payroll Expense','expense','KES',1,'2026-06-06 08:47:26'),('582f6ffc-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-06 08:47:26'),('583d1a33-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5300','Cold Chain & Storage','expense','KES',1,'2026-06-06 08:47:26'),('58478155-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5400','Logistics & Delivery','expense','KES',1,'2026-06-06 08:47:26'),('585a04b3-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5500','Marketing & Sales','expense','KES',1,'2026-06-06 08:47:27'),('586cfdc8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5600','Repairs & Maintenance','expense','KES',1,'2026-06-06 08:47:27'),('587f0cf0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5700','Licenses & Compliance','expense','KES',1,'2026-06-06 08:47:27'),('588ccaf6-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6100','Depreciation Expense','expense','KES',1,'2026-06-06 08:47:27'),('58960883-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6200','Bank & Payment Fees','expense','KES',1,'2026-06-06 08:47:27'),('589f610b-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6900','Miscellaneous Expense','expense','KES',1,'2026-06-06 08:47:27'),('5a26944d-f48d-4175-be00-29cb807279ab','40051ba4-1212-4a7e-9298-cb602baf8ec0','5100','Payroll Expense','expense','KES',1,'2026-06-27 12:40:08'),('5faddd2f-e409-46b8-bbe8-17fc3fc8fe29','9cbbec81-9056-452a-907c-c5eefa34d596','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-27 12:40:06'),('6182f146-ca34-4594-bd2a-b7c4ef14a88a','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5500','Marketing & Sales','expense','KES',1,'2026-06-27 12:40:09'),('6bea18aa-74d2-43aa-adb8-52ee1e55b2cc','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2110','PAYE Payable','liability','KES',1,'2026-06-27 12:40:09'),('6c1cd2e2-18a2-49c1-aa7b-f91c88e951e4','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1010','Petty Cash','asset','KES',1,'2026-06-27 12:40:09'),('721dc4ba-1d04-4e9b-8fe2-40885f95d39f','40051ba4-1212-4a7e-9298-cb602baf8ec0','6200','Bank & Payment Fees','expense','KES',1,'2026-06-27 12:40:08'),('7614963f-41bc-46e5-ba9c-ffbba3d5e6f6','18cf6cf5-801c-4f38-b51b-2dc044d709ed','3000','Owner\'s Equity','equity','KES',1,'2026-06-27 12:40:09'),('76ed0f23-8893-4bf5-8032-109185aa7a34','9cbbec81-9056-452a-907c-c5eefa34d596','1100','Accounts Receivable','asset','KES',1,'2026-06-27 12:40:06'),('7809cbd4-fb4e-4380-8fe1-f98804a9c162','9cbbec81-9056-452a-907c-c5eefa34d596','5700','Licenses & Compliance','expense','KES',1,'2026-06-27 12:40:07'),('7c3ef68b-491b-4185-8009-62db1878101b','9cbbec81-9056-452a-907c-c5eefa34d596','6900','Miscellaneous Expense','expense','KES',1,'2026-06-27 12:40:07'),('7ce241c4-3a3b-4820-8271-5c6105d2e314','40051ba4-1212-4a7e-9298-cb602baf8ec0','1300','Prepaid Expenses','asset','KES',1,'2026-06-27 12:40:08'),('7f2e83ba-286c-4c58-af84-2d67d0b5ded1','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2100','Salaries Payable','liability','KES',1,'2026-06-27 12:40:09'),('8227bd16-eb32-422b-9276-6a0c0f0d63be','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5100','Payroll Expense','expense','KES',1,'2026-06-27 12:40:09'),('827c460e-44e0-4666-9291-126a82b55b44','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1510','Accumulated Depreciation','asset','KES',1,'2026-06-27 12:40:09'),('8b9173ad-d846-4a82-8d9c-9f1d213ab33d','9cbbec81-9056-452a-907c-c5eefa34d596','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-27 12:40:07'),('8f93ee5c-bb0b-4647-b1ba-a55287d816d2','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-27 12:40:09'),('9184ca99-71f7-45c4-a897-30d00d5bf555','40051ba4-1212-4a7e-9298-cb602baf8ec0','3100','Retained Earnings','equity','KES',1,'2026-06-27 12:40:08'),('970fbb6f-7ae0-4b41-a8c6-608f13f5d9f4','9cbbec81-9056-452a-907c-c5eefa34d596','1000','Cash on Hand','asset','KES',1,'2026-06-27 12:40:06'),('9a736797-4545-46cc-8557-88fe0c5446e5','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1300','Prepaid Expenses','asset','KES',1,'2026-06-27 12:40:09'),('9c405049-5705-4b4b-b9cc-15a6221cf022','9cbbec81-9056-452a-907c-c5eefa34d596','2200','VAT Payable','liability','KES',1,'2026-06-27 12:40:07'),('a30e320e-c644-4b51-a91d-fd369b31a4e8','9cbbec81-9056-452a-907c-c5eefa34d596','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-27 12:40:07'),('a34660df-537a-40b2-b586-885d501d6575','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5600','Repairs & Maintenance','expense','KES',1,'2026-06-27 12:40:09'),('a566d31b-b5f8-424d-a5ef-a37097ba9608','40051ba4-1212-4a7e-9298-cb602baf8ec0','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-27 12:40:08'),('a592819a-4041-499b-a9c3-66c2d3819bc7','9cbbec81-9056-452a-907c-c5eefa34d596','5600','Repairs & Maintenance','expense','KES',1,'2026-06-27 12:40:07'),('a681b1f7-bf80-48d0-a607-91249877e14c','40051ba4-1212-4a7e-9298-cb602baf8ec0','1000','Cash on Hand','asset','KES',1,'2026-06-27 12:40:08'),('a8080950-9020-4944-9ed7-01900dd3ca1d','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5400','Logistics & Delivery','expense','KES',1,'2026-06-27 12:40:09'),('a8b8e477-855d-4292-aa78-c4274c6ec218','18cf6cf5-801c-4f38-b51b-2dc044d709ed','6200','Bank & Payment Fees','expense','KES',1,'2026-06-27 12:40:09'),('a963184c-d666-41d7-b01e-4288c4527cf1','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-27 12:40:09'),('aa94e54d-930b-4f95-95e3-ecad835ee52e','40051ba4-1212-4a7e-9298-cb602baf8ec0','2100','Salaries Payable','liability','KES',1,'2026-06-27 12:40:08'),('b0a62e6a-170b-4801-83bf-e8319f9dc8f3','9cbbec81-9056-452a-907c-c5eefa34d596','6200','Bank & Payment Fees','expense','KES',1,'2026-06-27 12:40:07'),('b2857c54-3a15-41d4-8186-3f0a62c73869','9cbbec81-9056-452a-907c-c5eefa34d596','3100','Retained Earnings','equity','KES',1,'2026-06-27 12:40:07'),('b7d2d2e3-064f-498e-87f7-bf6e06fec698','40051ba4-1212-4a7e-9298-cb602baf8ec0','2300','Accrued Expenses','liability','KES',1,'2026-06-27 12:40:08'),('bf785bc5-6b63-4131-9743-a0fb23510214','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4100','Other Operating Income','revenue','KES',1,'2026-06-27 12:40:09'),('c100d49c-ed70-4412-aa8c-7fabe0ab078d','40051ba4-1212-4a7e-9298-cb602baf8ec0','5600','Repairs & Maintenance','expense','KES',1,'2026-06-27 12:40:08'),('c1bd865a-ad9f-41c2-9cf7-da9c8f219cd3','40051ba4-1212-4a7e-9298-cb602baf8ec0','1100','Accounts Receivable','asset','KES',1,'2026-06-27 12:40:08'),('c3f2c411-bf85-41a9-809b-dbf626831a57','40051ba4-1212-4a7e-9298-cb602baf8ec0','5500','Marketing & Sales','expense','KES',1,'2026-06-27 12:40:08'),('c5095f18-b661-4fca-aeff-7d2a7d95d64f','9cbbec81-9056-452a-907c-c5eefa34d596','2300','Accrued Expenses','liability','KES',1,'2026-06-27 12:40:07'),('c5545ffc-fca3-4a76-af22-c51985b52f70','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2200','VAT Payable','liability','KES',1,'2026-06-27 12:40:09'),('c7981481-29cf-4b43-94dc-a2a89e6ef0bb','40051ba4-1212-4a7e-9298-cb602baf8ec0','2110','PAYE Payable','liability','KES',1,'2026-06-27 12:40:08'),('dc182e49-6b78-405b-b0cb-e5246d80969c','9cbbec81-9056-452a-907c-c5eefa34d596','2000','Accounts Payable','liability','KES',1,'2026-06-27 12:40:07'),('dc8401db-5cf2-495c-9840-e4b7496066ba','9cbbec81-9056-452a-907c-c5eefa34d596','1300','Prepaid Expenses','asset','KES',1,'2026-06-27 12:40:07'),('e26bc1b3-9f0d-41c9-ab68-63dada9ca405','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5700','Licenses & Compliance','expense','KES',1,'2026-06-27 12:40:09'),('ea54d920-00c7-4fd3-988a-b55b28bfc43d','18cf6cf5-801c-4f38-b51b-2dc044d709ed','3100','Retained Earnings','equity','KES',1,'2026-06-27 12:40:09'),('ebcf3247-7617-4ff0-8261-7e937e294ae9','18cf6cf5-801c-4f38-b51b-2dc044d709ed','1000','Cash on Hand','asset','KES',1,'2026-06-27 12:40:09'),('ec5deb13-959d-4540-a6a2-292a678b84d7','40051ba4-1212-4a7e-9298-cb602baf8ec0','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-27 12:40:08'),('ed893c59-9f7c-4146-9e40-a9d3b44700d9','9cbbec81-9056-452a-907c-c5eefa34d596','6100','Depreciation Expense','expense','KES',1,'2026-06-27 12:40:07'),('ee3d010d-ae7f-4ae6-b618-b14b8c37dbe0','9cbbec81-9056-452a-907c-c5eefa34d596','1500','Fixed Assets','asset','KES',1,'2026-06-27 12:40:07'),('f08b8bfb-6237-4dd6-a107-df36d029f7f6','40051ba4-1212-4a7e-9298-cb602baf8ec0','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-27 12:40:08'),('f46a6a85-e096-4a2b-b8bc-6d4a8a53fa59','40051ba4-1212-4a7e-9298-cb602baf8ec0','5400','Logistics & Delivery','expense','KES',1,'2026-06-27 12:40:08'),('f4a08020-ca3a-455e-8cea-29cfb508390f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2000','Accounts Payable','liability','KES',1,'2026-06-27 12:40:09'),('f52369bb-2176-4bfb-b6f9-3c3af9f87a5d','40051ba4-1212-4a7e-9298-cb602baf8ec0','5000','Cost of Goods Sold','expense','KES',1,'2026-06-27 12:40:08'),('f7d816d6-d6c5-41c7-bbd7-ce2e161f5461','9cbbec81-9056-452a-907c-c5eefa34d596','5100','Payroll Expense','expense','KES',1,'2026-06-27 12:40:07'),('fa459f1b-ef06-4fbe-a695-e41a674b553e','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2120','NHIF Payable','liability','KES',1,'2026-06-27 12:40:09'),('fa64d694-f024-426c-ba0f-5289b5063175','9cbbec81-9056-452a-907c-c5eefa34d596','5000','Cost of Goods Sold','expense','KES',1,'2026-06-27 12:40:07'),('fbb3433c-cb02-4dc9-a43f-de80fe127f02','40051ba4-1212-4a7e-9298-cb602baf8ec0','2120','NHIF Payable','liability','KES',1,'2026-06-27 12:40:08'),('fcc357f0-12fa-417a-9690-c2cb5bdcdea1','9cbbec81-9056-452a-907c-c5eefa34d596','5500','Marketing & Sales','expense','KES',1,'2026-06-27 12:40:07'),('gl-ap-01','tenant-default-0001','2000','Accounts Payable','liability','KES',1,'2026-06-06 08:45:20'),('gl-ar-01','tenant-default-0001','1100','Accounts Receivable','asset','KES',1,'2026-06-06 08:45:20'),('gl-cash-01','tenant-default-0001','1000','Cash on Hand','asset','KES',1,'2026-06-06 08:45:20'),('gl-exp-01','tenant-default-0001','5000','Cost of Goods Sold','expense','KES',1,'2026-06-06 08:45:20'),('gl-inv-01','tenant-default-0001','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-06 08:45:20'),('gl-rev-01','tenant-default-0001','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-06 08:45:20');
/*!40000 ALTER TABLE `gl_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goods_receipts`
--

DROP TABLE IF EXISTS `goods_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goods_receipts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grn_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_date` date NOT NULL,
  `received_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','posted','void') COLLATE utf8mb4_unicode_ci DEFAULT 'posted',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_grn` (`tenant_id`,`grn_number`),
  KEY `purchase_order_id` (`purchase_order_id`),
  CONSTRAINT `goods_receipts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `goods_receipts_ibfk_2` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goods_receipts`
--

LOCK TABLES `goods_receipts` WRITE;
/*!40000 ALTER TABLE `goods_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `goods_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps_telemetry`
--

DROP TABLE IF EXISTS `gps_telemetry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gps_telemetry` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `speed_knots` decimal(6,2) DEFAULT NULL,
  `heading_deg` smallint DEFAULT NULL,
  `accuracy_m` decimal(8,2) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL,
  `source` enum('iot','mobile','import') COLLATE utf8mb4_unicode_ci DEFAULT 'iot',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_boat_time` (`tenant_id`,`boat_id`,`recorded_at` DESC),
  CONSTRAINT `gps_telemetry_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps_telemetry`
--

LOCK TABLES `gps_telemetry` WRITE;
/*!40000 ALTER TABLE `gps_telemetry` DISABLE KEYS */;
INSERT INTO `gps_telemetry` VALUES ('38f5d020-5902-493e-846d-477a693c2ae9','9cbbec81-9056-452a-907c-c5eefa34d596','badd9eca-b18d-4dc9-a90b-bf30dcc88f65',NULL,-4.04000000,39.67000000,8.50,NULL,NULL,'2026-06-27 12:40:08','iot','2026-06-27 12:40:08'),('e4d93a07-580a-4493-bbc0-ddc78e94a202','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ee99b60b-ae32-4a33-9e0b-0218b46348ba',NULL,-4.03800000,39.67200000,8.50,NULL,NULL,'2026-06-27 12:40:09','iot','2026-06-27 12:40:09'),('f8509cf5-15ca-49a9-ace8-d90e3a94e7ba','40051ba4-1212-4a7e-9298-cb602baf8ec0','84c305e0-64ac-4c57-b4fb-9d97d885a3e4',NULL,-4.03900000,39.67100000,8.50,NULL,NULL,'2026-06-27 12:40:08','iot','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `gps_telemetry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_order_lookup`
--

DROP TABLE IF EXISTS `guest_order_lookup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_order_lookup` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lookup_token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`lookup_token`),
  KEY `idx_guest` (`tenant_id`,`guest_email`),
  CONSTRAINT `guest_order_lookup_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_order_lookup`
--

LOCK TABLES `guest_order_lookup` WRITE;
/*!40000 ALTER TABLE `guest_order_lookup` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_order_lookup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `haccp_checklists`
--

DROP TABLE IF EXISTS `haccp_checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `haccp_checklists` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checklist_date` date NOT NULL,
  `inspector_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` json NOT NULL,
  `overall_pass` tinyint(1) DEFAULT '0',
  `corrective_actions` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `haccp_checklists_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `haccp_checklists`
--

LOCK TABLES `haccp_checklists` WRITE;
/*!40000 ALTER TABLE `haccp_checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `haccp_checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_applicants`
--

DROP TABLE IF EXISTS `hr_applicants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_applicants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stage` enum('applied','screening','interview','offer','hired','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'applied',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job` (`tenant_id`,`job_id`),
  CONSTRAINT `hr_applicants_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_applicants`
--

LOCK TABLES `hr_applicants` WRITE;
/*!40000 ALTER TABLE `hr_applicants` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_applicants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_attendance`
--

DROP TABLE IF EXISTS `hr_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_attendance` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `hours_worked` decimal(5,2) DEFAULT NULL,
  `status` enum('present','absent','late','half_day') COLLATE utf8mb4_unicode_ci DEFAULT 'present',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_date` (`employee_id`,`work_date`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_attendance_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hr_attendance_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_attendance`
--

LOCK TABLES `hr_attendance` WRITE;
/*!40000 ALTER TABLE `hr_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_benefit_plans`
--

DROP TABLE IF EXISTS `hr_benefit_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_benefit_plans` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_type` enum('health','pension','life','housing','other') COLLATE utf8mb4_unicode_ci DEFAULT 'health',
  `employer_contribution_pct` decimal(6,2) DEFAULT '0.00',
  `employee_contribution_pct` decimal(6,2) DEFAULT '0.00',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_benefit_plans_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_benefit_plans`
--

LOCK TABLES `hr_benefit_plans` WRITE;
/*!40000 ALTER TABLE `hr_benefit_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_benefit_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_contracts`
--

DROP TABLE IF EXISTS `hr_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_contracts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_type` enum('permanent','contract','casual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `salary` decimal(14,2) DEFAULT NULL,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_contracts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hr_contracts_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_contracts`
--

LOCK TABLES `hr_contracts` WRITE;
/*!40000 ALTER TABLE `hr_contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employee_benefits`
--

DROP TABLE IF EXISTS `hr_employee_benefits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employee_benefits` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolled_at` date NOT NULL,
  `status` enum('active','ended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_plan` (`tenant_id`,`employee_id`,`plan_id`),
  CONSTRAINT `hr_employee_benefits_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employee_benefits`
--

LOCK TABLES `hr_employee_benefits` WRITE;
/*!40000 ALTER TABLE `hr_employee_benefits` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employee_benefits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employees`
--

DROP TABLE IF EXISTS `hr_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employees` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(14,2) DEFAULT NULL,
  `status` enum('active','on_leave','terminated') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_employee_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `org_unit_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_emp_no` (`tenant_id`,`employee_number`),
  CONSTRAINT `hr_employees_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employees`
--

LOCK TABLES `hr_employees` WRITE;
/*!40000 ALTER TABLE `hr_employees` DISABLE KEYS */;
INSERT INTO `hr_employees` VALUES ('0135fdb9-041a-4654-ab98-6f43d3040c16','18cf6cf5-801c-4f38-b51b-2dc044d709ed',NULL,'EMP-3B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-09',32000.00,'active','2026-06-27 12:40:09','2026-06-27 12:40:09',NULL,NULL),('0ad4fc3b-3d21-4646-a912-fc34d99e1017','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','EMP-2','Demo Captain','Operations','Fleet Captain','2025-05-23',45000.00,'active','2026-06-27 12:40:08','2026-06-27 12:40:08',NULL,NULL),('2bdbe405-9b1e-4abc-96e2-d4540b08f160','40051ba4-1212-4a7e-9298-cb602baf8ec0',NULL,'EMP-2B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-09',32000.00,'active','2026-06-27 12:40:08','2026-06-27 12:40:08',NULL,NULL),('ab015d04-a921-4d9f-94d0-5cfd744234db','9cbbec81-9056-452a-907c-c5eefa34d596',NULL,'EMP-1B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-09',32000.00,'active','2026-06-27 12:40:07','2026-06-27 12:40:07',NULL,NULL),('dbc982a6-99be-4a98-922e-07a335d2cd88','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','EMP-3','Demo Captain','Operations','Fleet Captain','2025-05-23',45000.00,'active','2026-06-27 12:40:09','2026-06-27 12:40:09',NULL,NULL),('ee0033c5-be1f-466d-8163-c169facac625','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','EMP-1','Demo Captain','Operations','Fleet Captain','2025-05-23',45000.00,'active','2026-06-27 12:40:07','2026-06-27 12:40:07',NULL,NULL);
/*!40000 ALTER TABLE `hr_employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_job_postings`
--

DROP TABLE IF EXISTS `hr_job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_job_postings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('open','closed','filled') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `posted_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_job_postings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_job_postings`
--

LOCK TABLES `hr_job_postings` WRITE;
/*!40000 ALTER TABLE `hr_job_postings` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_leave_balances`
--

DROP TABLE IF EXISTS `hr_leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_leave_balances` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type` enum('annual','sick','maternity','unpaid','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance_days` decimal(6,2) NOT NULL DEFAULT '0.00',
  `accrued_days` decimal(6,2) NOT NULL DEFAULT '0.00',
  `year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_type_year` (`tenant_id`,`employee_id`,`leave_type`,`year`),
  CONSTRAINT `hr_leave_balances_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_leave_balances`
--

LOCK TABLES `hr_leave_balances` WRITE;
/*!40000 ALTER TABLE `hr_leave_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_leave_requests`
--

DROP TABLE IF EXISTS `hr_leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_leave_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type` enum('annual','sick','maternity','unpaid','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` decimal(5,1) NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_leave_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hr_leave_requests_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_leave_requests`
--

LOCK TABLES `hr_leave_requests` WRITE;
/*!40000 ALTER TABLE `hr_leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_org_units`
--

DROP TABLE IF EXISTS `hr_org_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_org_units` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_org_units_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_org_units`
--

LOCK TABLES `hr_org_units` WRITE;
/*!40000 ALTER TABLE `hr_org_units` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_org_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_payroll_lines`
--

DROP TABLE IF EXISTS `hr_payroll_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_payroll_lines` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payroll_run_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gross_pay` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tax_deduction` decimal(14,2) NOT NULL DEFAULT '0.00',
  `other_deductions` decimal(14,2) NOT NULL DEFAULT '0.00',
  `net_pay` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_run` (`payroll_run_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_payroll_lines_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_payroll_lines`
--

LOCK TABLES `hr_payroll_lines` WRITE;
/*!40000 ALTER TABLE `hr_payroll_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_payroll_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_payroll_runs`
--

DROP TABLE IF EXISTS `hr_payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_payroll_runs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `status` enum('draft','approved','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `total_gross` decimal(14,2) DEFAULT '0.00',
  `total_net` decimal(14,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gl_journal_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_payroll_runs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_payroll_runs`
--

LOCK TABLES `hr_payroll_runs` WRITE;
/*!40000 ALTER TABLE `hr_payroll_runs` DISABLE KEYS */;
INSERT INTO `hr_payroll_runs` VALUES ('2205e07f-30c2-4b87-81c1-bdb64e4a9d4a','40051ba4-1212-4a7e-9298-cb602baf8ec0','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-27 12:40:08',NULL,NULL,NULL),('3cd5b7b5-96c7-4d27-bd2e-29b3d4c8e777','9cbbec81-9056-452a-907c-c5eefa34d596','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-27 12:40:07',NULL,NULL,NULL),('828aefd7-2425-45b6-8feb-5df95630089b','18cf6cf5-801c-4f38-b51b-2dc044d709ed','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-27 12:40:09',NULL,NULL,NULL);
/*!40000 ALTER TABLE `hr_payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_performance_reviews`
--

DROP TABLE IF EXISTS `hr_performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_performance_reviews` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_period` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `goals` text COLLATE utf8mb4_unicode_ci,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','acknowledged') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `reviewed_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `hr_performance_reviews_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hr_performance_reviews_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_performance_reviews`
--

LOCK TABLES `hr_performance_reviews` WRITE;
/*!40000 ALTER TABLE `hr_performance_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_training_records`
--

DROP TABLE IF EXISTS `hr_training_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_training_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `training_type` enum('safety','haccp','equipment','compliance','other') COLLATE utf8mb4_unicode_ci DEFAULT 'safety',
  `completed_at` date DEFAULT NULL,
  `expiry_at` date DEFAULT NULL,
  `certificate_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `hr_training_records_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_training_records`
--

LOCK TABLES `hr_training_records` WRITE;
/*!40000 ALTER TABLE `hr_training_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_training_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance_claims`
--

DROP TABLE IF EXISTS `insurance_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurance_claims` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claim_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `claimed_amount` decimal(14,2) NOT NULL,
  `approved_amount` decimal(14,2) DEFAULT NULL,
  `status` enum('submitted','reviewing','approved','rejected','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_claim_number` (`tenant_id`,`claim_number`),
  KEY `idx_ic_policy` (`policy_id`),
  CONSTRAINT `insurance_claims_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `insurance_claims_ibfk_2` FOREIGN KEY (`policy_id`) REFERENCES `insurance_policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance_claims`
--

LOCK TABLES `insurance_claims` WRITE;
/*!40000 ALTER TABLE `insurance_claims` DISABLE KEYS */;
INSERT INTO `insurance_claims` VALUES ('0e56aca7-d9f6-407b-9518-3dc8a94ff184','9cbbec81-9056-452a-907c-c5eefa34d596','59ce3db7-3ace-419c-94b9-37155afa9fcd','badd9eca-b18d-4dc9-a90b-bf30dcc88f65','CLM-1','2026-05-28','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('67cd0300-176f-4ab6-b879-efd4aa2f8a5c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','29675940-31c0-448c-b3bf-2b95f1b23a5c','ee99b60b-ae32-4a33-9e0b-0218b46348ba','CLM-3','2026-05-28','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('ffd5eb6a-ed6b-4c8f-bfef-a530d2a13c7a','40051ba4-1212-4a7e-9298-cb602baf8ec0','26ca36c1-43b3-48ac-afe3-8df66803ddd5','84c305e0-64ac-4c57-b4fb-9d97d885a3e4','CLM-2','2026-05-28','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `insurance_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance_policies`
--

DROP TABLE IF EXISTS `insurance_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurance_policies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `insurer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_type` enum('hull','liability','cargo','crew','comprehensive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hull',
  `premium_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `coverage_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_policy_number` (`tenant_id`,`policy_number`),
  KEY `idx_ip_tenant_boat` (`tenant_id`,`boat_id`),
  CONSTRAINT `insurance_policies_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance_policies`
--

LOCK TABLES `insurance_policies` WRITE;
/*!40000 ALTER TABLE `insurance_policies` DISABLE KEYS */;
INSERT INTO `insurance_policies` VALUES ('26ca36c1-43b3-48ac-afe3-8df66803ddd5','40051ba4-1212-4a7e-9298-cb602baf8ec0','84c305e0-64ac-4c57-b4fb-9d97d885a3e4','POL-2','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-28','2027-04-28','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('29675940-31c0-448c-b3bf-2b95f1b23a5c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ee99b60b-ae32-4a33-9e0b-0218b46348ba','POL-3','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-28','2027-04-28','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('59ce3db7-3ace-419c-94b9-37155afa9fcd','9cbbec81-9056-452a-907c-c5eefa34d596','badd9eca-b18d-4dc9-a90b-bf30dcc88f65','POL-1','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-28','2027-04-28','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `insurance_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integration_connections`
--

DROP TABLE IF EXISTS `integration_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integration_connections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('mpesa','stripe','sms','whatsapp','iot_coldchain','custom') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` json DEFAULT NULL,
  `status` enum('active','inactive','error') COLLATE utf8mb4_unicode_ci DEFAULT 'inactive',
  `last_sync_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_provider` (`tenant_id`,`provider`),
  CONSTRAINT `integration_connections_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integration_connections`
--

LOCK TABLES `integration_connections` WRITE;
/*!40000 ALTER TABLE `integration_connections` DISABLE KEYS */;
INSERT INTO `integration_connections` VALUES ('104e7fc4-b8e7-406c-a5f3-cc02a60e01e9','18cf6cf5-801c-4f38-b51b-2dc044d709ed','sms','SMS Gateway','{}','inactive',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('2b73aeb0-90d0-4347-85d1-700b14384189','9cbbec81-9056-452a-907c-c5eefa34d596','sms','SMS Gateway','{}','inactive',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('95657092-aef6-4fa0-a7a8-31fbc0a8eaff','40051ba4-1212-4a7e-9298-cb602baf8ec0','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('bdd80d43-c273-4dff-923a-1069e5855f09','18cf6cf5-801c-4f38-b51b-2dc044d709ed','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('d973446a-14a6-4a26-8fcd-8e8d03ef9ad9','40051ba4-1212-4a7e-9298-cb602baf8ec0','sms','SMS Gateway','{}','inactive',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('ebf67237-a0fe-4ec0-9f38-8f4e33a4b1d8','9cbbec81-9056-452a-907c-c5eefa34d596','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `integration_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integration_connectors`
--

DROP TABLE IF EXISTS `integration_connectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integration_connectors` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connector_type` enum('erp','shipping','whatsapp','accounting') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` json DEFAULT NULL,
  `status` enum('active','inactive','error') COLLATE utf8mb4_unicode_ci DEFAULT 'inactive',
  `last_sync_at` timestamp NULL DEFAULT NULL,
  `last_error` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_type` (`tenant_id`,`connector_type`),
  CONSTRAINT `integration_connectors_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integration_connectors`
--

LOCK TABLES `integration_connectors` WRITE;
/*!40000 ALTER TABLE `integration_connectors` DISABLE KEYS */;
/*!40000 ALTER TABLE `integration_connectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_barcode_scans`
--

DROP TABLE IF EXISTS `inventory_barcode_scans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_barcode_scans` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` enum('lookup','receive','transfer','ship') COLLATE utf8mb4_unicode_ci DEFAULT 'lookup',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_barcode` (`tenant_id`,`barcode`),
  CONSTRAINT `inventory_barcode_scans_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_barcode_scans`
--

LOCK TABLES `inventory_barcode_scans` WRITE;
/*!40000 ALTER TABLE `inventory_barcode_scans` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_barcode_scans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_batches`
--

DROP TABLE IF EXISTS `inventory_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_batches` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(12,3) NOT NULL DEFAULT '0.000',
  `reserved_kg` decimal(12,3) NOT NULL DEFAULT '0.000',
  `storage_type` enum('fresh','frozen','dried') COLLATE utf8mb4_unicode_ci DEFAULT 'fresh',
  `expiry_date` date DEFAULT NULL,
  `source_type` enum('catch','purchase','transfer','adjustment') COLLATE utf8mb4_unicode_ci DEFAULT 'catch',
  `source_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','reserved','depleted','spoiled') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_batch` (`tenant_id`,`batch_code`),
  KEY `idx_tenant_sku` (`tenant_id`,`sku`),
  CONSTRAINT `inventory_batches_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_batches`
--

LOCK TABLES `inventory_batches` WRITE;
/*!40000 ALTER TABLE `inventory_batches` DISABLE KEYS */;
INSERT INTO `inventory_batches` VALUES ('2b8cf5f0-9577-4f18-bd89-7849c081c856','40051ba4-1212-4a7e-9298-cb602baf8ec0','SKU-LAMUSEA','Lamu Sea Ventures Batch','18f72ae2-41f1-4688-ad53-d6e32035e7b2','lamusea-batch-1',205.000,0.000,'fresh',NULL,'catch','69a6fe7d-8eec-44ff-8a8e-4818a7abfc25','available','2026-06-27 12:40:08','2026-06-27 12:40:08'),('35a537bd-771e-4134-bac2-93ff5c908b0c','9cbbec81-9056-452a-907c-c5eefa34d596','SKU-COASTFISH','Coast Fish Cooperative Batch','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2','coastfish-batch-1',200.000,0.000,'fresh',NULL,'catch','1746047a-2918-4a91-8a5a-f7fae12cb352','available','2026-06-27 12:40:07','2026-06-27 12:40:07'),('c68db98f-8994-4d1e-a9ec-a3067662b859','18cf6cf5-801c-4f38-b51b-2dc044d709ed','SKU-AQUAERP-DEMO','AquaERP Showcase Tenant Batch','22f7c36c-ff9a-4812-85e7-4854afe6e815','aquaerp-demo-batch-1',210.000,0.000,'fresh',NULL,'catch','2569360b-c775-485c-b8d6-f34bacdc8060','available','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `inventory_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `movement_type` enum('in','out','transfer','adjustment','spoilage') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(12,3) NOT NULL,
  `from_location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_batch` (`tenant_id`,`batch_id`),
  CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_movements`
--

LOCK TABLES `inventory_movements` WRITE;
/*!40000 ALTER TABLE `inventory_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investment_packages`
--

DROP TABLE IF EXISTS `investment_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investment_packages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `min_investment` decimal(15,2) NOT NULL,
  `max_investment` decimal(15,2) DEFAULT NULL,
  `expected_return_rate` decimal(5,2) DEFAULT '12.00',
  `duration_months` int NOT NULL,
  `risk_level` enum('low','medium','high') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `total_pool` decimal(15,2) DEFAULT '0.00',
  `available_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('active','inactive','closed','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investment_packages`
--

LOCK TABLES `investment_packages` WRITE;
/*!40000 ALTER TABLE `investment_packages` DISABLE KEYS */;
/*!40000 ALTER TABLE `investment_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investments`
--

DROP TABLE IF EXISTS `investments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `expected_return` decimal(15,2) DEFAULT NULL,
  `actual_return` decimal(15,2) DEFAULT '0.00',
  `status` enum('active','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_package_id` (`package_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `investments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `investments_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `investment_packages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investments`
--

LOCK TABLES `investments` WRITE;
/*!40000 ALTER TABLE `investments` DISABLE KEYS */;
/*!40000 ALTER TABLE `investments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iot_devices`
--

DROP TABLE IF EXISTS `iot_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iot_devices` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_key_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_type` enum('temperature_probe','humidity_sensor','door_sensor','scale','gps_tracker','gateway','barcode_scanner','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'temperature_probe',
  `external_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zone_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boat_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `status` enum('active','inactive','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_device_key` (`device_key`),
  UNIQUE KEY `uq_tenant_external` (`tenant_id`,`external_id`),
  KEY `idx_tenant_type` (`tenant_id`,`device_type`),
  KEY `idx_tenant_facility` (`tenant_id`,`facility_id`),
  CONSTRAINT `iot_devices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iot_devices`
--

LOCK TABLES `iot_devices` WRITE;
/*!40000 ALTER TABLE `iot_devices` DISABLE KEYS */;
INSERT INTO `iot_devices` VALUES ('04c09df9-d8d7-4667-a77d-11e6c74726c4','9cbbec81-9056-452a-907c-c5eefa34d596','dev_85fdbf3a','7fc08d89f475a3db42b4d0a1b53c6eb8a2039c90e7dcf45a5e8481d5072d1310','Chill probe 1','temperature_probe',NULL,'7c7b339d-ff4d-4bb8-aed1-0350c07638ac','0bb031a6-a637-4780-99e1-7c19c5dcb030',NULL,NULL,'active','2026-06-27 12:40:08','2026-06-27 12:40:08','2026-06-27 12:40:08'),('0cbae2de-3cd2-4b2f-9ff9-00564fd2784a','40051ba4-1212-4a7e-9298-cb602baf8ec0','dev_50e6d900','656f0342bf79dcdc43f2aec4c2fe9923ad33dc7e70121c235399e3285a5773be','Chill probe 1','temperature_probe',NULL,'5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','1b964332-c8b2-4345-811c-6828bf745ad1',NULL,NULL,'active','2026-06-27 12:40:08','2026-06-27 12:40:08','2026-06-27 12:40:08'),('33168f6d-3b23-463e-ae49-6cbc9c28d0b6','18cf6cf5-801c-4f38-b51b-2dc044d709ed','dev_3edfe190','b47f21bba21682d78da9104f08874174fd50dc0acb8e89ba1e6efc6836e1e14f','Chill probe 1','temperature_probe',NULL,'d1364028-0c03-4454-8cd4-2f4604e39839','066809b9-45cb-4a26-9dde-47736a0f1f2c',NULL,NULL,'active','2026-06-27 12:40:09','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `iot_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iot_sensor_events`
--

DROP TABLE IF EXISTS `iot_sensor_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iot_sensor_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zone_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sensor_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `processed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_time` (`tenant_id`,`created_at`),
  CONSTRAINT `iot_sensor_events_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iot_sensor_events`
--

LOCK TABLES `iot_sensor_events` WRITE;
/*!40000 ALTER TABLE `iot_sensor_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `iot_sensor_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','posted','void') COLLATE utf8mb4_unicode_ci DEFAULT 'posted',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_entry` (`tenant_id`,`entry_number`),
  CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
INSERT INTO `journal_entries` VALUES ('013829a9-1fdd-4cf5-8855-e17faf2db213','18cf6cf5-801c-4f38-b51b-2dc044d709ed','JE-DEMO-3','2026-06-27','Demo sales recognition','order',NULL,'posted','ea5600c2-5f69-48ed-84c8-01cd0a59db53','2026-06-27 12:40:09'),('66930af9-7694-42a5-906e-32d53cb56083','40051ba4-1212-4a7e-9298-cb602baf8ec0','JE-DEMO-2','2026-06-27','Demo sales recognition','order',NULL,'posted','5e6081b2-aae7-44a1-82dc-2577da5e884f','2026-06-27 12:40:08'),('6c3659e8-4c9a-45bb-943a-7a2c9b7a6055','9cbbec81-9056-452a-907c-c5eefa34d596','JE-DEMO-1','2026-06-27','Demo sales recognition','order',NULL,'posted','ad6588db-332a-4a22-aa34-aad59f244ed1','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_lines`
--

DROP TABLE IF EXISTS `journal_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_lines` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_entry_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debit` decimal(14,2) DEFAULT '0.00',
  `credit` decimal(14,2) DEFAULT '0.00',
  `memo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `journal_lines_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `journal_lines_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `gl_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_lines`
--

LOCK TABLES `journal_lines` WRITE;
/*!40000 ALTER TABLE `journal_lines` DISABLE KEYS */;
INSERT INTO `journal_lines` VALUES ('0f740a0d-7bf8-4533-9a83-e34d2521d13c','66930af9-7694-42a5-906e-32d53cb56083','381efe93-81fc-44a7-905e-e847dc06767d',0.00,26000.00,'Sales revenue'),('15a0d557-ed2d-4df3-a7c5-02473604629c','013829a9-1fdd-4cf5-8855-e17faf2db213','8f93ee5c-bb0b-4647-b1ba-a55287d816d2',0.00,27000.00,'Sales revenue'),('406c0e37-0e64-4cee-8767-3bdc167599a3','6c3659e8-4c9a-45bb-943a-7a2c9b7a6055','a30e320e-c644-4b51-a91d-fd369b31a4e8',0.00,25000.00,'Sales revenue'),('4effbb6f-ea8a-43da-8557-1e3cbf5a03fc','66930af9-7694-42a5-906e-32d53cb56083','a681b1f7-bf80-48d0-a607-91249877e14c',26000.00,0.00,'Cash receipt'),('a31bca42-65ef-4f2a-a829-bd624bca700d','013829a9-1fdd-4cf5-8855-e17faf2db213','ebcf3247-7617-4ff0-8261-7e937e294ae9',27000.00,0.00,'Cash receipt'),('d1fa2840-190c-48ab-9f80-dbd2f499df87','6c3659e8-4c9a-45bb-943a-7a2c9b7a6055','970fbb6f-7ae0-4b41-a8c6-608f13f5d9f4',25000.00,0.00,'Cash receipt');
/*!40000 ALTER TABLE `journal_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landing_sites`
--

DROP TABLE IF EXISTS `landing_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `landing_sites` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `county` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bmu_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_county` (`county`),
  KEY `idx_bmu_id` (`bmu_id`),
  KEY `idx_landing_tenant` (`tenant_id`),
  CONSTRAINT `fk_landing_sites_bmu` FOREIGN KEY (`bmu_id`) REFERENCES `bmu` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landing_sites`
--

LOCK TABLES `landing_sites` WRITE;
/*!40000 ALTER TABLE `landing_sites` DISABLE KEYS */;
INSERT INTO `landing_sites` VALUES ('09a4010b-5699-47c3-a3be-379d83c82a2a','18cf6cf5-801c-4f38-b51b-2dc044d709ed','Mombasa Landing','aquaerp-demo-lnd','Mombasa',-4.04000000,39.67000000,NULL,'active','2026-06-27 12:40:09','2026-06-27 12:40:09'),('477c76aa-0763-49fe-98ef-cff79b6484d2','9cbbec81-9056-452a-907c-c5eefa34d596','Kwale Landing','coastfish-lnd','Kwale',-4.65000000,39.38000000,NULL,'active','2026-06-27 12:40:07','2026-06-27 12:40:07'),('5079b383-e486-4cba-900a-b7ff838fd12d','40051ba4-1212-4a7e-9298-cb602baf8ec0','Lamu Landing','lamusea-lnd','Lamu',-2.27000000,40.90000000,NULL,'active','2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `landing_sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licenses`
--

DROP TABLE IF EXISTS `licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licenses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_type` enum('fishing','trading','transportation') COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_date` date NOT NULL,
  `expires_date` date NOT NULL,
  `issuing_authority` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','expired','suspended','revoked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_license_type` (`license_type`),
  KEY `idx_expires_date` (`expires_date`),
  KEY `idx_licenses_tenant` (`tenant_id`),
  CONSTRAINT `licenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licenses`
--

LOCK TABLES `licenses` WRITE;
/*!40000 ALTER TABLE `licenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_alerts`
--

DROP TABLE IF EXISTS `login_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_alerts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `location_hint` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_new_device` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`,`created_at`),
  CONSTRAINT `login_alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_alerts`
--

LOCK TABLES `login_alerts` WRITE;
/*!40000 ALTER TABLE `login_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_accounts`
--

DROP TABLE IF EXISTS `loyalty_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_accounts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int DEFAULT '0',
  `tier` enum('bronze','silver','gold','platinum') COLLATE utf8mb4_unicode_ci DEFAULT 'bronze',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer` (`tenant_id`,`customer_id`),
  CONSTRAINT `loyalty_accounts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_accounts`
--

LOCK TABLES `loyalty_accounts` WRITE;
/*!40000 ALTER TABLE `loyalty_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_reviews`
--

DROP TABLE IF EXISTS `marketplace_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_reviews` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listing_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_listing` (`listing_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `marketplace_reviews_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_reviews`
--

LOCK TABLES `marketplace_reviews` WRITE;
/*!40000 ALTER TABLE `marketplace_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_vendors`
--

DROP TABLE IF EXISTS `marketplace_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_vendors` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shop_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT '10.00',
  `status` enum('active','pending','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_user` (`tenant_id`,`user_id`),
  CONSTRAINT `marketplace_vendors_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_vendors`
--

LOCK TABLES `marketplace_vendors` WRITE;
/*!40000 ALTER TABLE `marketplace_vendors` DISABLE KEYS */;
INSERT INTO `marketplace_vendors` VALUES ('0cc6741b-dd0d-4c4e-aaef-df7c9b59341a','9cbbec81-9056-452a-907c-c5eefa34d596','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Coast Fish Cooperative Shared Vendor Shop',12.00,'active','2026-06-27 12:40:07'),('110812b2-1492-442b-b2ed-05c738a01b3d','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','Lamu Sea Ventures Seafood Shop',10.00,'active','2026-06-27 12:40:08'),('864d131c-07e6-459f-a1cd-f7c72b4a851c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','AquaERP Showcase Tenant Shared Vendor Shop',12.00,'active','2026-06-27 12:40:09'),('9247a98f-d5a7-43c2-8387-946efbaa3d87','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','AquaERP Showcase Tenant Seafood Shop',10.00,'active','2026-06-27 12:40:09'),('e47a68ed-8670-490a-86eb-c8830c4c1335','40051ba4-1212-4a7e-9298-cb602baf8ec0','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Lamu Sea Ventures Shared Vendor Shop',12.00,'active','2026-06-27 12:40:08'),('f83a5f71-40ee-4206-bfbe-e0493100e369','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','Coast Fish Cooperative Seafood Shop',10.00,'active','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `marketplace_vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `after_vendor_insert` AFTER INSERT ON `marketplace_vendors` FOR EACH ROW BEGIN
  INSERT INTO suppliers (id, tenant_id, code, name, contact_name, email, phone, country_code, rating, status, notes, created_by)
  SELECT 
    NEW.id,
    NEW.tenant_id,
    CONCAT('VND-', LEFT(NEW.id, 8)),
    NEW.shop_name,
    CONCAT(u.first_name, ' ', u.last_name),
    u.email,
    u.phone,
    'KE',
    5.00,
    CASE WHEN NEW.status = 'active' THEN 'active' ELSE 'inactive' END,
    'Auto-synced from marketplace vendor',
    NULL
  FROM users u
  WHERE u.id = NEW.user_id
  ON DUPLICATE KEY UPDATE
    name = NEW.shop_name,
    status = CASE WHEN NEW.status = 'active' THEN 'active' ELSE 'inactive' END;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `notification_outbox`
--

DROP TABLE IF EXISTS `notification_outbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_outbox` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','whatsapp','push') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `attempts` int DEFAULT '0',
  `last_error` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pending` (`status`,`scheduled_at`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `notification_outbox_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_outbox`
--

LOCK TABLES `notification_outbox` WRITE;
/*!40000 ALTER TABLE `notification_outbox` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_outbox` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_preferences` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel_email` tinyint(1) DEFAULT '1',
  `channel_sms` tinyint(1) DEFAULT '0',
  `channel_push` tinyint(1) DEFAULT '1',
  `channel_whatsapp` tinyint(1) DEFAULT '0',
  `digest` enum('instant','daily','weekly') COLLATE utf8mb4_unicode_ci DEFAULT 'instant',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_tenant` (`user_id`,`tenant_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','push','whatsapp','in_app') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_template` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_tpl` (`tenant_id`,`code`,`channel`),
  CONSTRAINT `notification_templates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
INSERT INTO `notification_templates` VALUES ('tpl-cold-01','tenant-default-0001','temp_alert','in_app','Temperature alert','Zone {{zone}} exceeded threshold: {{temp}}°C',1),('tpl-order-01','tenant-default-0001','order_confirmed','in_app','Order confirmed','Your order {{order_id}} has been confirmed.',1);
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('success','info','warning','error') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_notif_tenant` (`tenant_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('0da94b7d-f28e-48d3-bd82-617d60b59c97','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-27 12:40:09'),('100ff9c7-d277-4ed3-a15f-189c2fcfa8ea','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-27 12:40:08'),('3dde1a60-79c6-476d-b759-380522b783a4','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-27 12:40:09'),('d8bf1a0d-4677-4356-bfdd-524bfe3d81d8','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-27 12:40:08'),('ebe56f10-b2be-43a0-b8b2-8585347d01c6','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-27 12:40:08'),('fcc37499-9c90-4d5e-acd3-675ddfa86ef1','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-27 12:40:08');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_accounts`
--

DROP TABLE IF EXISTS `oauth_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_accounts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('google','microsoft','keycloak') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_user` (`provider`,`provider_user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_accounts`
--

LOCK TABLES `oauth_accounts` WRITE;
/*!40000 ALTER TABLE `oauth_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offline_sync_queue`
--

DROP TABLE IF EXISTS `offline_sync_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offline_sync_queue` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `status` enum('pending','synced','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `client_timestamp` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pending` (`tenant_id`,`user_id`,`status`),
  CONSTRAINT `offline_sync_queue_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offline_sync_queue`
--

LOCK TABLES `offline_sync_queue` WRITE;
/*!40000 ALTER TABLE `offline_sync_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `offline_sync_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listing_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `unit_price` decimal(8,2) NOT NULL,
  `subtotal` decimal(15,2) GENERATED ALWAYS AS ((`quantity_kg` * `unit_price`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  KEY `species_id` (`species_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `fish_listings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`species_id`) REFERENCES `fish_species` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `order_id`, `listing_id`, `species_id`, `quantity_kg`, `unit_price`, `created_at`) VALUES ('46dacc9e-63cc-4809-823e-fd3723980f29','dc31743e-b1db-45a3-b4e4-e9c7832f61c5','0aba2246-9098-4716-abc4-e9476d594f63','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2',25.00,420.00,'2026-06-27 12:40:07'),('c95c0cd7-aead-4011-aff1-b45c2f6d0f9b','7dc2a6eb-b690-4f44-b1fa-320bb7f30a29','cd06dad0-50a4-4d92-b4ff-7907f1254337','22f7c36c-ff9a-4812-85e7-4854afe6e815',25.00,430.00,'2026-06-27 12:40:09'),('e37df51e-3404-4b17-8261-2c2112f8cb72','c7e11858-cb81-4c31-8f9a-4043376254ee','2cb25a91-fdad-45d1-95f4-0ff2457a39ff','18f72ae2-41f1-4688-ad53-d6e32035e7b2',25.00,425.00,'2026-06-27 12:40:08');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_returns`
--

DROP TABLE IF EXISTS `order_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_returns` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `return_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` enum('spoiled','wrong_item','quality','late_delivery','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_detail` text COLLATE utf8mb4_unicode_ci,
  `status` enum('requested','approved','rejected','refunded','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'requested',
  `refund_amount` decimal(14,2) DEFAULT '0.00',
  `requested_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_return_number` (`return_number`),
  KEY `idx_tenant_order` (`tenant_id`,`order_id`),
  CONSTRAINT `order_returns_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_returns`
--

LOCK TABLES `order_returns` WRITE;
/*!40000 ALTER TABLE `order_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(15,2) DEFAULT '0.00',
  `delivery_fee` decimal(15,2) DEFAULT '0.00',
  `tax` decimal(15,2) DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `delivery_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_slot_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_orders_buyer_created` (`buyer_id`,`created_at`),
  KEY `idx_orders_tenant` (`tenant_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('7dc2a6eb-b690-4f44-b1fa-320bb7f30a29','18cf6cf5-801c-4f38-b51b-2dc044d709ed','554e08ea-02dd-4817-b0e7-24042ace45b4','ea5600c2-5f69-48ed-84c8-01cd0a59db53','ORD-DEMO-AQUAERP-DE-3',16000.00,500.00,2560.00,19060.00,'confirmed','paid','Mombasa wholesale depot',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09',NULL,NULL,NULL,NULL,NULL),('c7e11858-cb81-4c31-8f9a-4043376254ee','40051ba4-1212-4a7e-9298-cb602baf8ec0','554e08ea-02dd-4817-b0e7-24042ace45b4','5e6081b2-aae7-44a1-82dc-2577da5e884f','ORD-DEMO-LAMUSEA-2',15500.00,500.00,2480.00,18480.00,'confirmed','paid','Lamu wholesale depot',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08',NULL,NULL,NULL,NULL,NULL),('dc31743e-b1db-45a3-b4e4-e9c7832f61c5','9cbbec81-9056-452a-907c-c5eefa34d596','554e08ea-02dd-4817-b0e7-24042ace45b4','ad6588db-332a-4a22-aa34-aad59f244ed1','ORD-DEMO-COASTFISH-1',15000.00,500.00,2400.00,17900.00,'confirmed','paid','Kwale wholesale depot',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_intents`
--

DROP TABLE IF EXISTS `payment_intents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_intents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` enum('mpesa','stripe','paystack','cash','bank') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `status` enum('pending','processing','succeeded','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `external_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `payment_intents_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_intents`
--

LOCK TABLES `payment_intents` WRITE;
/*!40000 ALTER TABLE `payment_intents` DISABLE KEYS */;
INSERT INTO `payment_intents` VALUES ('0f0f558a-00b9-436b-a454-750de8ade125','18cf6cf5-801c-4f38-b51b-2dc044d709ed',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-aquaerp-demo-2','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 2}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('2a99c5ee-c072-432e-95d9-d14ddbac5448','40051ba4-1212-4a7e-9298-cb602baf8ec0',NULL,'bank',8600.00,'KES','processing','SEED-SA-lamusea-4','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 4}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('496ab72e-58c3-4513-a1ef-bae8210ef0c0','9cbbec81-9056-452a-907c-c5eefa34d596',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-coastfish-2','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 2}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('52ad516b-4c25-421c-8550-be75c68c9d2b','40051ba4-1212-4a7e-9298-cb602baf8ec0',NULL,'stripe',7400.00,'KES','failed','SEED-SA-lamusea-3','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 3}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('5db415cd-c191-4287-9f94-3b7ea3e59ea9','40051ba4-1212-4a7e-9298-cb602baf8ec0','c7e11858-cb81-4c31-8f9a-4043376254ee','mpesa',18480.00,'KES','succeeded','SEED-SA-lamusea-1','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 1}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('93a85f4f-bafb-4d42-8ef6-6c079d27bf6b','18cf6cf5-801c-4f38-b51b-2dc044d709ed',NULL,'stripe',7400.00,'KES','failed','SEED-SA-aquaerp-demo-3','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 3}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('ac736d07-cd80-4edc-adff-0821fb1740b8','9cbbec81-9056-452a-907c-c5eefa34d596',NULL,'stripe',7400.00,'KES','failed','SEED-SA-coastfish-3','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 3}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('b55bfae4-14bd-487a-b2b8-bb9a00bbfe16','40051ba4-1212-4a7e-9298-cb602baf8ec0',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-lamusea-2','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 2}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('be722b12-4293-46c8-a264-fa863e142bae','9cbbec81-9056-452a-907c-c5eefa34d596','dc31743e-b1db-45a3-b4e4-e9c7832f61c5','mpesa',17900.00,'KES','succeeded','SEED-SA-coastfish-1','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 1}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('c9214cc2-895b-48d1-b39d-22079f7c85cd','9cbbec81-9056-452a-907c-c5eefa34d596',NULL,'bank',8600.00,'KES','processing','SEED-SA-coastfish-4','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 4}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('e8d20067-2c82-4fa9-a196-2a806ad589c0','18cf6cf5-801c-4f38-b51b-2dc044d709ed','7dc2a6eb-b690-4f44-b1fa-320bb7f30a29','mpesa',19060.00,'KES','succeeded','SEED-SA-aquaerp-demo-1','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 1}','2026-06-27 12:40:12','2026-06-27 12:40:12'),('ec35f988-d8cc-4298-b46c-17b796d12262','18cf6cf5-801c-4f38-b51b-2dc044d709ed',NULL,'bank',8600.00,'KES','processing','SEED-SA-aquaerp-demo-4','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 4}','2026-06-27 12:40:12','2026-06-27 12:40:12');
/*!40000 ALTER TABLE `payment_intents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_module_flags`
--

DROP TABLE IF EXISTS `platform_module_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_module_flags` (
  `module_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_module_flags`
--

LOCK TABLES `platform_module_flags` WRITE;
/*!40000 ALTER TABLE `platform_module_flags` DISABLE KEYS */;
INSERT INTO `platform_module_flags` VALUES ('accounting',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('ai',1,'2026-06-06 08:48:51','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('analytics',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('coldchain',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('commerce',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('crm',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('fishing',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('hr',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('integrations',1,'2026-06-06 08:48:51','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('inventory',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('logistics',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('notifications',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('platform',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('procurement',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('tenant',1,'2026-06-06 08:48:50','4771d81c-81ef-495e-b938-7f4d1d3213d4');
/*!40000 ALTER TABLE `platform_module_flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_payment_reconcile_runs`
--

DROP TABLE IF EXISTS `platform_payment_reconcile_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_payment_reconcile_runs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trigger_source` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `reconciled` int NOT NULL DEFAULT '0',
  `failed` int NOT NULL DEFAULT '0',
  `matched` int NOT NULL DEFAULT '0',
  `pending_stale` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_payment_reconcile_runs`
--

LOCK TABLES `platform_payment_reconcile_runs` WRITE;
/*!40000 ALTER TABLE `platform_payment_reconcile_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_payment_reconcile_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_settings`
--

DROP TABLE IF EXISTS `platform_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_settings` (
  `setting_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_settings`
--

LOCK TABLES `platform_settings` WRITE;
/*!40000 ALTER TABLE `platform_settings` DISABLE KEYS */;
INSERT INTO `platform_settings` VALUES ('announcement','{\"body\": \"20 demo tenants are loaded with full module data. Super admins can manage tenants, payments, and branding from Admin Hub.\", \"title\": \"AquaERP platform demo\", \"enabled\": false}','2026-06-27 12:40:12','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('branding','{\"app_name\": \"AquaERP Fisheries OS\", \"logo_url\": \"\", \"primary_color\": \"#0d9488\"}','2026-06-27 12:40:12','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('maintenance','{\"enabled\": false, \"message\": \"Scheduled maintenance completed. All systems operational.\"}','2026-06-27 12:40:12','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('recaptcha','{\"enabled\": false, \"siteKey\": \"\", \"version\": \"v3\", \"minScore\": 0.5, \"secretKey\": \"\", \"protectLogin\": true, \"protectRegister\": true, \"hostnameAllowlist\": [], \"protectGuestCheckout\": \"\\\"\\\\\\\"\\\\\\\\\\\\\\\"true\\\\\\\\\\\\\\\"\\\\\\\"\\\"\"}','2026-06-11 09:37:41',NULL),('signup','{\"locked\": false}','2026-06-27 12:40:12','4771d81c-81ef-495e-b938-7f4d1d3213d4');
/*!40000 ALTER TABLE `platform_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_webhook_events`
--

DROP TABLE IF EXISTS `platform_webhook_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_webhook_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('received','processed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'received',
  `payload` json DEFAULT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_provider_time` (`provider`,`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_webhook_events`
--

LOCK TABLES `platform_webhook_events` WRITE;
/*!40000 ALTER TABLE `platform_webhook_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_webhook_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_match_records`
--

DROP TABLE IF EXISTS `procurement_match_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_match_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grn_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ap_invoice_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `po_amount` decimal(14,2) DEFAULT '0.00',
  `received_amount` decimal(14,2) DEFAULT '0.00',
  `invoiced_amount` decimal(14,2) DEFAULT '0.00',
  `variance_amount` decimal(14,2) DEFAULT '0.00',
  `status` enum('pending','matched','variance','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `matched_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_po` (`tenant_id`,`purchase_order_id`),
  CONSTRAINT `procurement_match_records_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_match_records`
--

LOCK TABLES `procurement_match_records` WRITE;
/*!40000 ALTER TABLE `procurement_match_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `procurement_match_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_catalog`
--

DROP TABLE IF EXISTS `product_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_catalog` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  `base_price` decimal(14,2) DEFAULT '0.00',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hs_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Harmonized System for exports',
  `status` enum('active','draft','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_sku` (`tenant_id`,`sku`),
  KEY `idx_product_catalog_vendor` (`vendor_id`),
  CONSTRAINT `product_catalog_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_catalog`
--

LOCK TABLES `product_catalog` WRITE;
/*!40000 ALTER TABLE `product_catalog` DISABLE KEYS */;
INSERT INTO `product_catalog` VALUES ('3f11d6e6-b65c-4665-8579-d85b577545ea','18cf6cf5-801c-4f38-b51b-2dc044d709ed','9247a98f-d5a7-43c2-8387-946efbaa3d87','SKU-AQUAERP-DEMO','AquaERP Showcase Tenant Fresh Fillet','22f7c36c-ff9a-4812-85e7-4854afe6e815','fresh','kg',470.00,NULL,NULL,NULL,'active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('453ceeea-0f2f-4e25-b174-968410d4c7c2','9cbbec81-9056-452a-907c-c5eefa34d596','f83a5f71-40ee-4206-bfbe-e0493100e369','SKU-COASTFISH','Coast Fish Cooperative Fresh Fillet','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2','fresh','kg',450.00,NULL,NULL,NULL,'active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('a2011d9d-7b41-4fe3-b69c-16c24df6a04e','40051ba4-1212-4a7e-9298-cb602baf8ec0','110812b2-1492-442b-b2ed-05c738a01b3d','SKU-LAMUSEA','Lamu Sea Ventures Fresh Fillet','18f72ae2-41f1-4688-ad53-d6e32035e7b2','fresh','kg',460.00,NULL,NULL,NULL,'active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `product_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade` enum('A','B','C') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight_kg` decimal(10,3) DEFAULT NULL,
  `price` decimal(14,2) NOT NULL,
  `stock_kg` decimal(12,3) DEFAULT '0.000',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_variant_sku` (`tenant_id`,`sku`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_lines`
--

DROP TABLE IF EXISTS `purchase_order_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_lines` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  `unit_price` decimal(14,2) NOT NULL,
  `line_total` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  CONSTRAINT `purchase_order_lines_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_lines`
--

LOCK TABLES `purchase_order_lines` WRITE;
/*!40000 ALTER TABLE `purchase_order_lines` DISABLE KEYS */;
INSERT INTO `purchase_order_lines` VALUES ('b4203e96-ee6b-49d5-96f6-b150bfb94e54','c75116f1-1060-4a29-b63e-a00786f82c61','Marine diesel',500.000,'L',120.00,60000.00),('d994c041-9951-40fa-9b72-a8588ec842b4','f108a287-3392-4da9-b27b-a01d59ab2a9f','Marine diesel',500.000,'L',120.00,60000.00),('dc1ebcd5-4967-43da-85e4-835bca3eba86','c231ec46-c747-4efb-b3d7-9593e4217620','Marine diesel',500.000,'L',120.00,60000.00);
/*!40000 ALTER TABLE `purchase_order_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','sent','partial','received','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `subtotal` decimal(14,2) DEFAULT '0.00',
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `total_amount` decimal(14,2) DEFAULT '0.00',
  `expected_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_po` (`tenant_id`,`po_number`),
  KEY `idx_supplier` (`supplier_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES ('c231ec46-c747-4efb-b3d7-9593e4217620','9cbbec81-9056-452a-907c-c5eefa34d596','3b0408d3-7ffc-4dab-8926-83396bda063f','PO-1','sent','KES',45000.00,7200.00,52200.00,'2026-07-04',NULL,'ad6588db-332a-4a22-aa34-aad59f244ed1','2026-06-27 12:40:08','2026-06-27 12:40:08'),('c75116f1-1060-4a29-b63e-a00786f82c61','18cf6cf5-801c-4f38-b51b-2dc044d709ed','188bb9a1-2141-48bc-832c-c311c72db4cd','PO-3','sent','KES',45000.00,7200.00,52200.00,'2026-07-04',NULL,'ea5600c2-5f69-48ed-84c8-01cd0a59db53','2026-06-27 12:40:09','2026-06-27 12:40:09'),('f108a287-3392-4da9-b27b-a01d59ab2a9f','40051ba4-1212-4a7e-9298-cb602baf8ec0','d52d9288-4394-4b3e-9ccd-05c7f4eb6eb7','PO-2','sent','KES',45000.00,7200.00,52200.00,'2026-07-04',NULL,'5e6081b2-aae7-44a1-82dc-2577da5e884f','2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_requests`
--

DROP TABLE IF EXISTS `purchase_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pr_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected','ordered') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `needed_by` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_pr` (`tenant_id`,`pr_number`),
  CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_requests`
--

LOCK TABLES `purchase_requests` WRITE;
/*!40000 ALTER TABLE `purchase_requests` DISABLE KEYS */;
INSERT INTO `purchase_requests` VALUES ('1170d221-8a73-4551-9c89-89d2563facf4','40051ba4-1212-4a7e-9298-cb602baf8ec0','PR-2','5e6081b2-aae7-44a1-82dc-2577da5e884f','Operations','approved','2026-07-11','Fuel and ice for next trip','2026-06-27 12:40:08'),('6c6bc48d-2110-4a3b-9eb6-0cf1aee45b66','18cf6cf5-801c-4f38-b51b-2dc044d709ed','PR-3','ea5600c2-5f69-48ed-84c8-01cd0a59db53','Operations','approved','2026-07-11','Fuel and ice for next trip','2026-06-27 12:40:09'),('7e14d446-7783-491c-a7ff-a9b2ca6d803f','9cbbec81-9056-452a-907c-c5eefa34d596','PR-1','ad6588db-332a-4a22-aa34-aad59f244ed1','Operations','approved','2026-07-11','Fuel and ice for next trip','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `purchase_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_deliveries`
--

DROP TABLE IF EXISTS `report_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_deliveries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `snapshot_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_report_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel` enum('email','sms','whatsapp','webhook','in_app') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `external_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  KEY `snapshot_id` (`snapshot_id`),
  CONSTRAINT `report_deliveries_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_deliveries_ibfk_2` FOREIGN KEY (`snapshot_id`) REFERENCES `report_snapshots` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_deliveries`
--

LOCK TABLES `report_deliveries` WRITE;
/*!40000 ALTER TABLE `report_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_snapshots`
--

DROP TABLE IF EXISTS `report_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_snapshots` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'json',
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `payload` json NOT NULL,
  `file_csv` mediumtext COLLATE utf8mb4_unicode_ci,
  `file_html` mediumtext COLLATE utf8mb4_unicode_ci,
  `share_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `share_expires_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_token` (`share_token`),
  KEY `idx_tenant_type` (`tenant_id`,`report_type`),
  CONSTRAINT `report_snapshots_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_snapshots`
--

LOCK TABLES `report_snapshots` WRITE;
/*!40000 ALTER TABLE `report_snapshots` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfqs`
--

DROP TABLE IF EXISTS `rfqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfqs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rfq_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','closed','awarded','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `closing_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_rfq` (`tenant_id`,`rfq_number`),
  CONSTRAINT `rfqs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfqs`
--

LOCK TABLES `rfqs` WRITE;
/*!40000 ALTER TABLE `rfqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `rfqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_contract_fulfillments`
--

DROP TABLE IF EXISTS `sales_contract_fulfillments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_contract_fulfillments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_kg` decimal(14,2) NOT NULL,
  `fulfilled_at` datetime NOT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_scf_contract` (`contract_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `sales_contract_fulfillments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_contract_fulfillments_ibfk_2` FOREIGN KEY (`contract_id`) REFERENCES `sales_contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_contract_fulfillments`
--

LOCK TABLES `sales_contract_fulfillments` WRITE;
/*!40000 ALTER TABLE `sales_contract_fulfillments` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_contract_fulfillments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_contracts`
--

DROP TABLE IF EXISTS `sales_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_contracts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_per_kg` decimal(12,2) NOT NULL,
  `contracted_kg` decimal(14,2) NOT NULL,
  `delivered_kg` decimal(14,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `status` enum('draft','active','fulfilled','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payment_terms` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contract_number` (`tenant_id`,`contract_number`),
  KEY `idx_sc_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `sales_contracts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_contracts`
--

LOCK TABLES `sales_contracts` WRITE;
/*!40000 ALTER TABLE `sales_contracts` DISABLE KEYS */;
INSERT INTO `sales_contracts` VALUES ('194ae2e0-0f46-4f49-bfc1-12d6650c4abc','9cbbec81-9056-452a-907c-c5eefa34d596','SC-COASTFISH','Kwale Wholesale Ltd','wholesale-coastfish@example.com',NULL,'b2209906-42b5-478c-b49a-f5d674d91852','c4bb79c7-cc2a-4c26-bd2a-2ed3b78887d2',400.00,5000.00,1200.00,'KES','active','2026-06-27','2026-12-24','Net 30',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('1cc8a578-e758-4875-be33-5edb0871b043','18cf6cf5-801c-4f38-b51b-2dc044d709ed','SC-AQUAERP-DEMO','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com',NULL,'e4bd6620-2745-44ea-a2f1-ec58aa73bf42','22f7c36c-ff9a-4812-85e7-4854afe6e815',406.00,5000.00,1300.00,'KES','active','2026-06-27','2026-12-24','Net 30',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('ebbd5be0-5ef0-415a-89e8-f188fbe2531d','40051ba4-1212-4a7e-9298-cb602baf8ec0','SC-LAMUSEA','Lamu Wholesale Ltd','wholesale-lamusea@example.com',NULL,'ea8b78e1-a483-4261-a8a2-636cae30e044','18f72ae2-41f1-4688-ad53-d6e32035e7b2',403.00,5000.00,1250.00,'KES','active','2026-06-27','2026-12-24','Net 30',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `sales_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scale_readings`
--

DROP TABLE IF EXISTS `scale_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scale_readings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight_kg` decimal(12,3) NOT NULL,
  `unit` enum('kg','lb') COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_label` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_at` timestamp NOT NULL,
  `source` enum('iot','manual','import') COLLATE utf8mb4_unicode_ci DEFAULT 'iot',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_time` (`tenant_id`,`recorded_at` DESC),
  CONSTRAINT `scale_readings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scale_readings`
--

LOCK TABLES `scale_readings` WRITE;
/*!40000 ALTER TABLE `scale_readings` DISABLE KEYS */;
/*!40000 ALTER TABLE `scale_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_reports`
--

DROP TABLE IF EXISTS `scheduled_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_reports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('daily','weekly','monthly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipients` json NOT NULL,
  `last_run_at` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `delivery_channels` json DEFAULT NULL COMMENT '["email","sms","webhook"]',
  `phone_recipients` json DEFAULT NULL,
  `export_format` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'csv',
  `period_days` int DEFAULT '30',
  `subject_override` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bcc_recipients` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `scheduled_reports_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_reports`
--

LOCK TABLES `scheduled_reports` WRITE;
/*!40000 ALTER TABLE `scheduled_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduled_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('1460b1ad-0d19-4f86-848a-fa2b8a35ff8d','a4be805d-2f00-4777-be82-1bda494d50f1','ce32d1c0-0e4e-45a9-bf5c-95ca6ff503a5-649f2fb6-e182-41db-9931-7f8b9412aa0d','2026-06-18 12:38:48','::1','node','2026-06-11 09:38:48'),('1687c103-5dc5-40a2-a601-09c2e76d6369','aa64c08b-dbf8-4c0c-9043-950f1abc259b','734d29fa-3026-4b84-8a03-51500eb44866-39d19100-9168-452d-9f49-b1ccc4fe15ab','2026-06-13 12:49:47','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:49:47'),('187e10da-349a-48e3-bc10-446326d2813d','554e08ea-02dd-4817-b0e7-24042ace45b4','a19caa61-9f6e-487d-8b3f-2a9cff5a0265-bab51b8e-a37c-4390-94b1-7dbd02297228','2026-06-15 11:50:01','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:50:01'),('5d7d05f8-7e05-4b54-965c-d8e721e769e5','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2','99a7a590-dd78-49aa-8be8-a9e9b028ba6d-c72bf62b-8ebc-4325-b9d7-fb2da2b72cc4','2026-06-15 12:28:38','::1','curl/8.20.0','2026-06-08 09:28:37'),('5ec0a18b-3df8-40ab-91a3-8e83b8e5308e','554e08ea-02dd-4817-b0e7-24042ace45b4','77011b5e-0834-48ef-8a38-539f53f072f5-4a19fa01-0726-4278-b2c2-5fb37934bbb1','2026-06-13 14:32:08',NULL,NULL,'2026-06-06 11:32:08'),('6a073708-9c0a-4507-89bd-16cf010e6996','4771d81c-81ef-495e-b938-7f4d1d3213d4','93e5e247-75d8-4981-82a1-d91f21bc75b8-f37cf419-562c-4b8e-b543-e82f95d1fe4d','2026-06-18 12:46:58','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:46:57'),('749ab3b3-916a-45a3-a12f-8d65e143039b','554e08ea-02dd-4817-b0e7-24042ace45b4','0f4263b0-9af5-4c62-9239-c56d7bc0123c-32fe630d-fd71-4d28-b97c-4e75022931a2','2026-06-15 12:00:34','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:00:33'),('7900a656-086f-449f-9925-609c424d734b','554e08ea-02dd-4817-b0e7-24042ace45b4','0c835561-d14c-4130-84d4-0c6af0b05ee3-b57ab67f-1d9d-4b10-bf7b-c7c7d9f9935f','2026-06-13 14:32:55','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:54'),('81beca20-730b-4ae2-bbc6-757143b5eb07','aa64c08b-dbf8-4c0c-9043-950f1abc259b','938467ae-d34f-4603-910b-120f5e4ad7e2-ac50748a-3f8a-43b7-a9e9-b7bc22673354','2026-06-13 12:09:50','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:50'),('f6b28472-9b20-4d49-a273-0728ad8cba0e','4771d81c-81ef-495e-b938-7f4d1d3213d4','2209dd39-f544-462c-bf4b-c9a32128c06b-564c8e4f-0eb9-474a-866f-81cc351bc252','2026-06-13 11:51:00','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:51:00'),('fac83e6c-b111-4494-b8af-f00ed7d641b4','c9d59c3d-ede5-4815-9e6d-415ad71f15c5','0af34cc0-d0ad-4a6e-923a-f29ec45ba9a8-378c718f-932a-448a-86c4-d92853c714f2','2026-06-15 12:29:25','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:29:25');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shelf_life_alert_log`
--

DROP TABLE IF EXISTS `shelf_life_alert_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shelf_life_alert_log` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `days_to_expiry` int DEFAULT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'email',
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alerted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_batch` (`tenant_id`,`batch_id`),
  CONSTRAINT `shelf_life_alert_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shelf_life_alert_log`
--

LOCK TABLES `shelf_life_alert_log` WRITE;
/*!40000 ALTER TABLE `shelf_life_alert_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `shelf_life_alert_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfers`
--

DROP TABLE IF EXISTS `stock_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transfers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transfer_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_kg` decimal(12,3) NOT NULL,
  `status` enum('draft','in_transit','received','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transfer` (`tenant_id`,`transfer_number`),
  CONSTRAINT `stock_transfers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfers`
--

LOCK TABLES `stock_transfers` WRITE;
/*!40000 ALTER TABLE `stock_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storage_facilities`
--

DROP TABLE IF EXISTS `storage_facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_facilities` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('cold_room','freezer','ice_plant','warehouse') COLLATE utf8mb4_unicode_ci DEFAULT 'cold_room',
  `capacity_kg` decimal(12,2) NOT NULL,
  `current_stock_kg` decimal(12,2) DEFAULT '0.00',
  `county` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('operational','maintenance','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'operational',
  `temperature_min` decimal(5,2) DEFAULT NULL,
  `temperature_max` decimal(5,2) DEFAULT NULL,
  `current_temperature` decimal(5,2) DEFAULT NULL,
  `daily_rate_per_kg` decimal(8,2) DEFAULT '0.00',
  `manager_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `manager_id` (`manager_id`),
  KEY `idx_code` (`code`),
  KEY `idx_county` (`county`),
  KEY `idx_storage_facility_stock` (`current_stock_kg`),
  KEY `idx_storage_fac_tenant` (`tenant_id`),
  CONSTRAINT `storage_facilities_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_facilities`
--

LOCK TABLES `storage_facilities` WRITE;
/*!40000 ALTER TABLE `storage_facilities` DISABLE KEYS */;
INSERT INTO `storage_facilities` VALUES ('5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','40051ba4-1212-4a7e-9298-cb602baf8ec0','Lamu Sea Ventures Cold Store','lamusea-cold','cold_room',12000.00,5200.00,'Lamu','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('7c7b339d-ff4d-4bb8-aed1-0350c07638ac','9cbbec81-9056-452a-907c-c5eefa34d596','Coast Fish Cooperative Cold Store','coastfish-cold','cold_room',12000.00,5200.00,'Kwale','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('d1364028-0c03-4454-8cd4-2f4604e39839','18cf6cf5-801c-4f38-b51b-2dc044d709ed','AquaERP Showcase Tenant Cold Store','aquaerp-demo-cold','cold_room',12000.00,5200.00,'Mombasa','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `storage_facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storage_records`
--

DROP TABLE IF EXISTS `storage_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `grade` enum('A','B','C') COLLATE utf8mb4_unicode_ci DEFAULT 'B',
  `storage_method` enum('iced','frozen','salted','dried') COLLATE utf8mb4_unicode_ci DEFAULT 'iced',
  `entry_date` datetime NOT NULL,
  `exit_date` datetime DEFAULT NULL,
  `daily_cost` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `status` enum('stored','removed','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'stored',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `species_id` (`species_id`),
  KEY `idx_facility_id` (`facility_id`),
  KEY `idx_storage_rec_tenant` (`tenant_id`),
  CONSTRAINT `storage_records_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `storage_facilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storage_records_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `fish_species` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_records`
--

LOCK TABLES `storage_records` WRITE;
/*!40000 ALTER TABLE `storage_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `storage_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storage_zones`
--

DROP TABLE IF EXISTS `storage_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_zones` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_temp_c` decimal(5,2) NOT NULL,
  `min_temp_c` decimal(5,2) DEFAULT NULL,
  `max_temp_c` decimal(5,2) DEFAULT NULL,
  `capacity_kg` decimal(12,2) DEFAULT NULL,
  `status` enum('active','maintenance','offline') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_facility` (`facility_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `storage_zones_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_zones`
--

LOCK TABLES `storage_zones` WRITE;
/*!40000 ALTER TABLE `storage_zones` DISABLE KEYS */;
INSERT INTO `storage_zones` VALUES ('066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839','18cf6cf5-801c-4f38-b51b-2dc044d709ed','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-27 12:40:09'),('0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac','9cbbec81-9056-452a-907c-c5eefa34d596','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-27 12:40:07'),('1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','40051ba4-1212-4a7e-9298-cb602baf8ec0','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-27 12:40:08'),('33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac','9cbbec81-9056-452a-907c-c5eefa34d596','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-27 12:40:07'),('5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839','18cf6cf5-801c-4f38-b51b-2dc044d709ed','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-27 12:40:09'),('71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839','18cf6cf5-801c-4f38-b51b-2dc044d709ed','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-27 12:40:09'),('84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','40051ba4-1212-4a7e-9298-cb602baf8ec0','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-27 12:40:08'),('86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac','9cbbec81-9056-452a-907c-c5eefa34d596','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-27 12:40:07'),('c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8','40051ba4-1212-4a7e-9298-cb602baf8ec0','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-27 12:40:08');
/*!40000 ALTER TABLE `storage_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storefront_collections`
--

DROP TABLE IF EXISTS `storefront_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storefront_collections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `status` enum('active','hidden') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_slug` (`tenant_id`,`slug`),
  CONSTRAINT `storefront_collections_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storefront_collections`
--

LOCK TABLES `storefront_collections` WRITE;
/*!40000 ALTER TABLE `storefront_collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `storefront_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_scorecards`
--

DROP TABLE IF EXISTS `supplier_scorecards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_scorecards` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_month` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `on_time_pct` decimal(5,2) DEFAULT '0.00',
  `quality_score` decimal(4,2) DEFAULT '0.00',
  `price_score` decimal(4,2) DEFAULT '0.00',
  `overall_score` decimal(4,2) DEFAULT '0.00',
  `grn_count` int DEFAULT '0',
  `computed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_period` (`tenant_id`,`supplier_id`,`period_month`),
  CONSTRAINT `supplier_scorecards_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_scorecards`
--

LOCK TABLES `supplier_scorecards` WRITE;
/*!40000 ALTER TABLE `supplier_scorecards` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_scorecards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT 'KE',
  `rating` decimal(3,2) DEFAULT '0.00',
  `status` enum('active','inactive','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_supplier_code` (`tenant_id`,`code`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES ('0cc6741b-dd0d-4c4e-aaef-df7c9b59341a','9cbbec81-9056-452a-907c-c5eefa34d596','VND-0cc6741b','Coast Fish Cooperative Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('110812b2-1492-442b-b2ed-05c738a01b3d','40051ba4-1212-4a7e-9298-cb602baf8ec0','VND-110812b2','Lamu Sea Ventures Seafood Shop','Demo Owner','owner-lamusea@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('188bb9a1-2141-48bc-832c-c311c72db4cd','18cf6cf5-801c-4f38-b51b-2dc044d709ed','SUP-3','Coastal Ice & Fuel Supplies','Supply Desk','supplier-aquaerp-demo@example.com','+254720000002','KE',4.50,'active',NULL,'ea5600c2-5f69-48ed-84c8-01cd0a59db53','2026-06-27 12:40:09','2026-06-27 12:40:09'),('3b0408d3-7ffc-4dab-8926-83396bda063f','9cbbec81-9056-452a-907c-c5eefa34d596','SUP-1','Coastal Ice & Fuel Supplies','Supply Desk','supplier-coastfish@example.com','+254720000000','KE',4.50,'active',NULL,'ad6588db-332a-4a22-aa34-aad59f244ed1','2026-06-27 12:40:08','2026-06-27 12:40:08'),('864d131c-07e6-459f-a1cd-f7c72b4a851c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','VND-864d131c','AquaERP Showcase Tenant Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('9247a98f-d5a7-43c2-8387-946efbaa3d87','18cf6cf5-801c-4f38-b51b-2dc044d709ed','VND-9247a98f','AquaERP Showcase Tenant Seafood Shop','Demo Owner','owner-aquaerp-demo@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('d52d9288-4394-4b3e-9ccd-05c7f4eb6eb7','40051ba4-1212-4a7e-9298-cb602baf8ec0','SUP-2','Coastal Ice & Fuel Supplies','Supply Desk','supplier-lamusea@example.com','+254720000001','KE',4.50,'active',NULL,'5e6081b2-aae7-44a1-82dc-2577da5e884f','2026-06-27 12:40:08','2026-06-27 12:40:08'),('e47a68ed-8670-490a-86eb-c8830c4c1335','40051ba4-1212-4a7e-9298-cb602baf8ec0','VND-e47a68ed','Lamu Sea Ventures Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('f83a5f71-40ee-4206-bfbe-e0493100e369','9cbbec81-9056-452a-907c-c5eefa34d596','VND-f83a5f71','Coast Fish Cooperative Seafood Shop','Demo Owner','owner-coastfish@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_codes`
--

DROP TABLE IF EXISTS `tax_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_codes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_pct` decimal(6,3) NOT NULL,
  `type` enum('vat','withholding','excise','other') COLLATE utf8mb4_unicode_ci DEFAULT 'vat',
  `country_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT 'KE',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_tax` (`tenant_id`,`code`),
  CONSTRAINT `tax_codes_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_codes`
--

LOCK TABLES `tax_codes` WRITE;
/*!40000 ALTER TABLE `tax_codes` DISABLE KEYS */;
INSERT INTO `tax_codes` VALUES ('tax-vat-16','tenant-default-0001','VAT16','Kenya VAT 16%',16.000,'vat','KE',1);
/*!40000 ALTER TABLE `tax_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_returns`
--

DROP TABLE IF EXISTS `tax_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_returns` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `return_type` enum('vat','paye','withholding','corporate') COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taxable_amount` decimal(14,2) DEFAULT '0.00',
  `tax_amount` decimal(14,2) DEFAULT '0.00',
  `status` enum('draft','filed','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `filed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `tax_returns_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_returns`
--

LOCK TABLES `tax_returns` WRITE;
/*!40000 ALTER TABLE `tax_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `tax_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temperature_readings`
--

DROP TABLE IF EXISTS `temperature_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temperature_readings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zone_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facility_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reading_c` decimal(5,2) NOT NULL,
  `humidity_pct` decimal(5,2) DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source` enum('manual','iot','import') COLLATE utf8mb4_unicode_ci DEFAULT 'manual',
  PRIMARY KEY (`id`),
  KEY `idx_zone_time` (`zone_id`,`recorded_at`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `temperature_readings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temperature_readings`
--

LOCK TABLES `temperature_readings` WRITE;
/*!40000 ALTER TABLE `temperature_readings` DISABLE KEYS */;
INSERT INTO `temperature_readings` VALUES ('00852f25-e12b-44ce-97fe-f9b47d1061aa','40051ba4-1212-4a7e-9298-cb602baf8ec0','84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',1.80,85.00,'2026-06-27 04:40:08','iot'),('0443bf29-0763-4ffa-97e9-ce2ab4ea0c74','9cbbec81-9056-452a-907c-c5eefa34d596','0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-20.70,65.00,'2026-06-27 08:40:07','iot'),('071d6daf-11bf-4f55-b7cc-d762713192c6','18cf6cf5-801c-4f38-b51b-2dc044d709ed','71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839',2.20,85.00,'2026-06-26 20:40:09','iot'),('094ac102-eb3b-4002-ad88-b0dfc0856e6f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839',-41.20,55.00,'2026-06-27 04:40:09','iot'),('13ce6ba2-5bcb-4c47-aead-0819c728fb79','40051ba4-1212-4a7e-9298-cb602baf8ec0','c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-41.40,55.00,'2026-06-27 08:40:08','iot'),('157dfbd2-afa7-4ada-b614-fca42380e771','40051ba4-1212-4a7e-9298-cb602baf8ec0','c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-41.20,55.00,'2026-06-27 04:40:08','iot'),('19e178a5-50eb-4a2d-818c-51a5ba226d19','9cbbec81-9056-452a-907c-c5eefa34d596','0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-20.30,65.00,'2026-06-27 00:40:07','iot'),('1c67e5c5-083a-452f-95ca-d01405a4adb9','40051ba4-1212-4a7e-9298-cb602baf8ec0','84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',2.20,85.00,'2026-06-26 20:40:08','iot'),('1e91c71b-9ae6-45e5-92bf-60436a404b85','40051ba4-1212-4a7e-9298-cb602baf8ec0','1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-20.50,65.00,'2026-06-27 04:40:08','iot'),('2212b05b-d3c2-4b7b-933d-44157683f205','18cf6cf5-801c-4f38-b51b-2dc044d709ed','066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839',-20.70,65.00,'2026-06-27 08:40:09','iot'),('2b2f99be-d0f7-4056-8aa0-83cb37310fcd','40051ba4-1212-4a7e-9298-cb602baf8ec0','c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-41.00,55.00,'2026-06-27 00:40:08','iot'),('2c290b6f-ad83-48fb-8bd5-5b1c7c040d67','9cbbec81-9056-452a-907c-c5eefa34d596','86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',1.40,85.00,'2026-06-27 12:40:07','iot'),('30cf8380-53bc-4563-835a-6c84293f61ee','9cbbec81-9056-452a-907c-c5eefa34d596','0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-20.50,65.00,'2026-06-27 04:40:07','iot'),('3366a1f0-470d-4462-ad3d-e99889b33604','40051ba4-1212-4a7e-9298-cb602baf8ec0','1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-20.10,65.00,'2026-06-26 20:40:08','iot'),('38ba6ce7-e8de-495a-a8b5-e5e851a3548f','9cbbec81-9056-452a-907c-c5eefa34d596','33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-41.20,55.00,'2026-06-27 04:40:07','iot'),('39ccc41c-8620-4c9d-8e22-725807774ab5','9cbbec81-9056-452a-907c-c5eefa34d596','33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-40.80,55.00,'2026-06-26 20:40:07','iot'),('3ab283e5-acac-415e-b890-b2e9e39723a3','9cbbec81-9056-452a-907c-c5eefa34d596','86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',2.00,85.00,'2026-06-27 00:40:07','iot'),('4fd763aa-f2a7-4c27-be1e-e1c25d0d793c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839',-20.90,65.00,'2026-06-27 12:40:09','iot'),('5927951b-ba45-4bc1-9885-475e0a4803e6','9cbbec81-9056-452a-907c-c5eefa34d596','86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',1.60,85.00,'2026-06-27 08:40:07','iot'),('5e11ff95-2303-4d07-a217-57aae54aa3ea','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839',-41.00,55.00,'2026-06-27 00:40:09','iot'),('67e24eea-6640-45b6-8937-5f3ef2e985bd','40051ba4-1212-4a7e-9298-cb602baf8ec0','1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-20.90,65.00,'2026-06-27 12:40:08','iot'),('6c43c4d7-b43a-4fe2-9613-2bded0bcbf4d','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839',-40.80,55.00,'2026-06-26 20:40:09','iot'),('6fb94be6-d775-4451-b258-88bcd3b02693','9cbbec81-9056-452a-907c-c5eefa34d596','86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',2.20,85.00,'2026-06-26 20:40:07','iot'),('7465791d-dbea-4bbc-9366-ec2c618d8e29','18cf6cf5-801c-4f38-b51b-2dc044d709ed','71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839',1.80,85.00,'2026-06-27 04:40:09','iot'),('76317b48-e8d2-4f94-a1c9-466db42129d4','40051ba4-1212-4a7e-9298-cb602baf8ec0','84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',1.60,85.00,'2026-06-27 08:40:08','iot'),('76444386-4c2a-42e6-842f-418aa59b6a39','18cf6cf5-801c-4f38-b51b-2dc044d709ed','066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839',-20.10,65.00,'2026-06-26 20:40:09','iot'),('7c7a5394-0402-4552-9a0a-d9caf4e75a21','9cbbec81-9056-452a-907c-c5eefa34d596','33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-41.60,55.00,'2026-06-27 12:40:07','iot'),('82c6a576-1cee-4c20-848a-66dec61788dc','40051ba4-1212-4a7e-9298-cb602baf8ec0','84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',1.40,85.00,'2026-06-27 12:40:08','iot'),('91c011ca-56f5-409b-9736-c71d6702de50','18cf6cf5-801c-4f38-b51b-2dc044d709ed','71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839',1.60,85.00,'2026-06-27 08:40:09','iot'),('954f05ec-a99b-4d0d-b552-ed496b91e249','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839',-41.60,55.00,'2026-06-27 12:40:09','iot'),('9cb56a48-ef63-4f4b-b34b-e21bd6812ae8','40051ba4-1212-4a7e-9298-cb602baf8ec0','1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-20.70,65.00,'2026-06-27 08:40:08','iot'),('9e01b721-2cdb-4214-822d-2badd42ffbf5','40051ba4-1212-4a7e-9298-cb602baf8ec0','1b964332-c8b2-4345-811c-6828bf745ad1','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-20.30,65.00,'2026-06-27 00:40:08','iot'),('a7c4c259-0cde-418b-8d7c-a80ec26fdd01','40051ba4-1212-4a7e-9298-cb602baf8ec0','c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-41.60,55.00,'2026-06-27 12:40:08','iot'),('ab914a43-e91c-44f7-a317-e53514f2ff7d','9cbbec81-9056-452a-907c-c5eefa34d596','33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-41.40,55.00,'2026-06-27 08:40:07','iot'),('b2fa2728-3cca-4fb4-806f-052fce0f827c','9cbbec81-9056-452a-907c-c5eefa34d596','0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-20.90,65.00,'2026-06-27 12:40:07','iot'),('b3a3d35b-a044-4716-9b1c-e2fb08203ac7','18cf6cf5-801c-4f38-b51b-2dc044d709ed','066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839',-20.50,65.00,'2026-06-27 04:40:09','iot'),('b564ac4c-ef2f-4424-8cd8-88615482c361','9cbbec81-9056-452a-907c-c5eefa34d596','86deef24-396b-4da7-85ac-a44adb722eae','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',1.80,85.00,'2026-06-27 04:40:07','iot'),('b976df4c-f270-4f3c-ac91-96c5c2da8422','40051ba4-1212-4a7e-9298-cb602baf8ec0','84bd73ca-2228-4f68-bffb-35cd90f58804','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',2.00,85.00,'2026-06-27 00:40:08','iot'),('c38ed405-fa92-4205-975d-eca2a28465d3','9cbbec81-9056-452a-907c-c5eefa34d596','0bb031a6-a637-4780-99e1-7c19c5dcb030','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-20.10,65.00,'2026-06-26 20:40:07','iot'),('c9c4a6b6-0a6e-4b1e-bc5f-e9ef9cc5dcf9','18cf6cf5-801c-4f38-b51b-2dc044d709ed','5c38a058-7ecd-44e4-af5b-f5138f55fc5e','d1364028-0c03-4454-8cd4-2f4604e39839',-41.40,55.00,'2026-06-27 08:40:09','iot'),('cfc4ce08-d83c-4c05-a4af-d29ac7c2674e','40051ba4-1212-4a7e-9298-cb602baf8ec0','c040962f-3341-4327-9137-84425c74d98d','5a88d07f-bb4b-4251-9f1f-aecf17e7d2e8',-40.80,55.00,'2026-06-26 20:40:08','iot'),('e04334b0-4ce9-4b07-9594-33a96c7108d1','18cf6cf5-801c-4f38-b51b-2dc044d709ed','71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839',1.40,85.00,'2026-06-27 12:40:09','iot'),('e685e227-4116-4943-a8f2-a13449b19dbc','18cf6cf5-801c-4f38-b51b-2dc044d709ed','066809b9-45cb-4a26-9dde-47736a0f1f2c','d1364028-0c03-4454-8cd4-2f4604e39839',-20.30,65.00,'2026-06-27 00:40:09','iot'),('eda413be-8e67-4a08-838d-222c7c0180bb','18cf6cf5-801c-4f38-b51b-2dc044d709ed','71cc1b07-7166-424d-8930-9c924e2c6418','d1364028-0c03-4454-8cd4-2f4604e39839',2.00,85.00,'2026-06-27 00:40:09','iot'),('f10f4db6-d66d-4e98-b2bd-789c701f0f82','9cbbec81-9056-452a-907c-c5eefa34d596','33ef4d2f-3bb7-4013-93f3-9d17882934e7','7c7b339d-ff4d-4bb8-aed1-0350c07638ac',-41.00,55.00,'2026-06-27 00:40:07','iot');
/*!40000 ALTER TABLE `temperature_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_communication_settings`
--

DROP TABLE IF EXISTS `tenant_communication_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_communication_settings` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reply_to_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_report_emails` json DEFAULT NULL,
  `default_report_phones` json DEFAULT NULL,
  `default_bcc_emails` json DEFAULT NULL,
  `email_footer_html` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `tenant_communication_settings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_communication_settings`
--

LOCK TABLES `tenant_communication_settings` WRITE;
/*!40000 ALTER TABLE `tenant_communication_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_communication_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_custom_domains`
--

DROP TABLE IF EXISTS `tenant_custom_domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_custom_domains` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `primary_domain` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verify_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_domain` (`domain`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `tenant_custom_domains_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_custom_domains`
--

LOCK TABLES `tenant_custom_domains` WRITE;
/*!40000 ALTER TABLE `tenant_custom_domains` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_custom_domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_data_exports`
--

DROP TABLE IF EXISTS `tenant_data_exports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_data_exports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `export_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gdpr',
  `status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `tenant_data_exports_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_data_exports`
--

LOCK TABLES `tenant_data_exports` WRITE;
/*!40000 ALTER TABLE `tenant_data_exports` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_data_exports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_feature_flags`
--

DROP TABLE IF EXISTS `tenant_feature_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_feature_flags` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flag_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`,`flag_key`),
  CONSTRAINT `tenant_feature_flags_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_feature_flags`
--

LOCK TABLES `tenant_feature_flags` WRITE;
/*!40000 ALTER TABLE `tenant_feature_flags` DISABLE KEYS */;
INSERT INTO `tenant_feature_flags` VALUES ('18cf6cf5-801c-4f38-b51b-2dc044d709ed','advanced_analytics',1,'2026-06-27 12:40:09'),('18cf6cf5-801c-4f38-b51b-2dc044d709ed','ai',1,'2026-06-27 12:40:09'),('18cf6cf5-801c-4f38-b51b-2dc044d709ed','marketplace',1,'2026-06-27 12:40:09'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','advanced_analytics',1,'2026-06-27 12:40:08'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','ai',1,'2026-06-27 12:40:08'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','marketplace',1,'2026-06-27 12:40:08'),('9cbbec81-9056-452a-907c-c5eefa34d596','advanced_analytics',1,'2026-06-27 12:40:07'),('9cbbec81-9056-452a-907c-c5eefa34d596','ai',1,'2026-06-27 12:40:07'),('9cbbec81-9056-452a-907c-c5eefa34d596','marketplace',1,'2026-06-27 12:40:07');
/*!40000 ALTER TABLE `tenant_feature_flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_members`
--

DROP TABLE IF EXISTS `tenant_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_members` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('tenant_owner','branch_manager','accountant','procurement_officer','warehouse_staff','fisherman','vendor','delivery_staff','customer','hr_officer','bmu_official') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fisherman',
  `status` enum('active','invited','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `invited_at` timestamp NULL DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_user` (`tenant_id`,`user_id`),
  KEY `branch_id` (`branch_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `tenant_members_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_members_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_members`
--

LOCK TABLES `tenant_members` WRITE;
/*!40000 ALTER TABLE `tenant_members` DISABLE KEYS */;
INSERT INTO `tenant_members` VALUES ('42429ee6-8923-48a1-993f-d5ea7f449d0d','40051ba4-1212-4a7e-9298-cb602baf8ec0','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','e06c58ff-e74a-4ed3-925e-4e4fdd1dc583','vendor','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08','2026-06-27 12:40:08'),('5bffc346-0fcc-4d07-b5ef-1f34868c068f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53','fa56a1de-5a18-4eae-8d4d-6f9372fdf30d','tenant_owner','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09','2026-06-27 12:40:09'),('5d60ac94-8f63-4a02-a54b-87964f27e4f1','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f','e06c58ff-e74a-4ed3-925e-4e4fdd1dc583','tenant_owner','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08','2026-06-27 12:40:08'),('6a60b6ff-f7b7-4640-af4a-64fb11f1e357','9cbbec81-9056-452a-907c-c5eefa34d596','554e08ea-02dd-4817-b0e7-24042ace45b4','64072af1-1ad5-4847-aca9-2f27d0a35c0a','customer','active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07','2026-06-27 12:40:07'),('774a7981-fc63-4d3d-a22b-19e3f88af78f','18cf6cf5-801c-4f38-b51b-2dc044d709ed','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','fa56a1de-5a18-4eae-8d4d-6f9372fdf30d','vendor','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09','2026-06-27 12:40:09'),('90e4cdcf-894f-4983-844e-15960f66573d','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1','64072af1-1ad5-4847-aca9-2f27d0a35c0a','tenant_owner','active',NULL,'2026-06-27 12:40:06','2026-06-27 12:40:06','2026-06-27 12:40:06'),('9d6def61-9014-46bd-a621-c4195b5e3663','40051ba4-1212-4a7e-9298-cb602baf8ec0','554e08ea-02dd-4817-b0e7-24042ace45b4','e06c58ff-e74a-4ed3-925e-4e4fdd1dc583','customer','active',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:08','2026-06-27 12:40:08'),('ab4b6af0-0cbd-4925-b659-11460b43217c','18cf6cf5-801c-4f38-b51b-2dc044d709ed','554e08ea-02dd-4817-b0e7-24042ace45b4','fa56a1de-5a18-4eae-8d4d-6f9372fdf30d','customer','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:09','2026-06-27 12:40:09'),('de4a5e58-3238-4bbc-bac2-116bda476a1e','9cbbec81-9056-452a-907c-c5eefa34d596','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','64072af1-1ad5-4847-aca9-2f27d0a35c0a','vendor','active',NULL,'2026-06-27 12:40:07','2026-06-27 12:40:07','2026-06-27 12:40:07'),('e4d46c3e-2ad5-422a-adf7-a9e28f2eeb83','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4323337f-4938-4d7a-ad5a-c0c77b5556fc',NULL,'tenant_owner','active',NULL,'2026-06-27 12:40:13','2026-06-27 12:40:13','2026-06-27 12:40:13'),('tm-4771d81c-81ef-495e-b938-7f4d1d321','tenant-default-0001','4771d81c-81ef-495e-b938-7f4d1d3213d4',NULL,'tenant_owner','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-554e08ea-02dd-4817-b0e7-24042ace4','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-9c2fcb6b-12f2-44b2-8f42-9f11d7c8f','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-aa64c08b-dbf8-4c0c-9043-950f1abc2','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c7b4bb8e-69d8-4a0a-9251-4daa2f4ff','tenant-default-0001','c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c9d59c3d-ede5-4815-9e6d-415ad71f1','tenant-default-0001','c9d59c3d-ede5-4815-9e6d-415ad71f15c5',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-cb9c667d-d1d9-4f4f-91d0-c60928a78','tenant-default-0001','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39');
/*!40000 ALTER TABLE `tenant_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_module_flags`
--

DROP TABLE IF EXISTS `tenant_module_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_module_flags` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`tenant_id`,`module_id`),
  CONSTRAINT `tenant_module_flags_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_module_flags`
--

LOCK TABLES `tenant_module_flags` WRITE;
/*!40000 ALTER TABLE `tenant_module_flags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_module_flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_onboarding`
--

DROP TABLE IF EXISTS `tenant_onboarding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_onboarding` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step` int DEFAULT '1',
  `completed_steps` json DEFAULT NULL,
  `business_type` enum('fisherman','cooperative','processor','market','exporter','restaurant','logistics') COLLATE utf8mb4_unicode_ci DEFAULT 'fisherman',
  `completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_onboarding`
--

LOCK TABLES `tenant_onboarding` WRITE;
/*!40000 ALTER TABLE `tenant_onboarding` DISABLE KEYS */;
INSERT INTO `tenant_onboarding` VALUES ('18cf6cf5-801c-4f38-b51b-2dc044d709ed',1,'[1, 2, 3]','cooperative','2026-06-27 12:40:09','2026-06-27 12:40:09'),('40051ba4-1212-4a7e-9298-cb602baf8ec0',1,'[1, 2, 3]','fisherman','2026-06-27 12:40:08','2026-06-27 12:40:08'),('9cbbec81-9056-452a-907c-c5eefa34d596',1,'[1, 2, 3]','cooperative','2026-06-27 12:40:07','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `tenant_onboarding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_role_permissions`
--

DROP TABLE IF EXISTS `tenant_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_role_permissions` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'vendor | customer',
  `permissions` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`,`role`),
  CONSTRAINT `tenant_role_permissions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_role_permissions`
--

LOCK TABLES `tenant_role_permissions` WRITE;
/*!40000 ALTER TABLE `tenant_role_permissions` DISABLE KEYS */;
INSERT INTO `tenant_role_permissions` VALUES ('18cf6cf5-801c-4f38-b51b-2dc044d709ed','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:09','2026-06-27 12:40:09'),('18cf6cf5-801c-4f38-b51b-2dc044d709ed','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:09','2026-06-27 12:40:09'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:08','2026-06-27 12:40:08'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:08','2026-06-27 12:40:08'),('9cbbec81-9056-452a-907c-c5eefa34d596','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:07','2026-06-27 12:40:07'),('9cbbec81-9056-452a-907c-c5eefa34d596','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-27 12:40:07','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `tenant_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_sso_config`
--

DROP TABLE IF EXISTS `tenant_sso_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_sso_config` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('saml','oidc','keycloak') COLLATE utf8mb4_unicode_ci DEFAULT 'saml',
  `entity_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sso_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_pem` text COLLATE utf8mb4_unicode_ci,
  `metadata_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `tenant_sso_config_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_sso_config`
--

LOCK TABLES `tenant_sso_config` WRITE;
/*!40000 ALTER TABLE `tenant_sso_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_sso_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_storefront_settings`
--

DROP TABLE IF EXISTS `tenant_storefront_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_storefront_settings` (
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ocean-classic',
  `store_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tagline` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_headline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_subheadline` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_cta_label` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT 'Shop fresh catch',
  `hero_cta_href` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '#products',
  `custom_tokens` json DEFAULT NULL COMMENT 'Override theme tokens',
  `show_traceability` tinyint(1) DEFAULT '1',
  `show_reviews` tinyint(1) DEFAULT '1',
  `show_loyalty` tinyint(1) DEFAULT '1',
  `cookie_banner_text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `privacy_policy_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terms_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_text` text COLLATE utf8mb4_unicode_ci,
  `social_links` json DEFAULT NULL,
  `seo_title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tenant_id`),
  CONSTRAINT `tenant_storefront_settings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_storefront_settings`
--

LOCK TABLES `tenant_storefront_settings` WRITE;
/*!40000 ALTER TABLE `tenant_storefront_settings` DISABLE KEYS */;
INSERT INTO `tenant_storefront_settings` VALUES ('18cf6cf5-801c-4f38-b51b-2dc044d709ed','ocean-classic','AquaERP Showcase Tenant','Fresh catch from Mombasa',NULL,NULL,NULL,'Welcome to AquaERP Showcase Tenant',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-27 12:40:09','2026-06-27 12:40:09'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','ocean-classic','Lamu Sea Ventures','Fresh catch from Lamu',NULL,NULL,NULL,'Welcome to Lamu Sea Ventures',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-27 12:40:08','2026-06-27 12:40:08'),('9cbbec81-9056-452a-907c-c5eefa34d596','ocean-classic','Coast Fish Cooperative','Fresh catch from Kwale',NULL,NULL,NULL,'Welcome to Coast Fish Cooperative',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-27 12:40:07','2026-06-27 12:40:07'),('tenant-default-0001','ocean-classic','AquaERP Fresh Market','From ocean to table — fully traceable seafood',NULL,NULL,NULL,'Fresh catch, delivered with cold-chain care','Browse species landed today. Every kilo traced from boat to your door.','Shop fresh catch','#products',NULL,1,1,1,'We use cookies for cart and analytics. By continuing you accept our privacy policy.',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-06 08:46:42','2026-06-06 08:46:42');
/*!40000 ALTER TABLE `tenant_storefront_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT 'KE',
  `default_currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Africa/Nairobi',
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#0ea5e9',
  `plan` enum('trial','starter','professional','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT 'trial',
  `status` enum('active','suspended','pending','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('18cf6cf5-801c-4f38-b51b-2dc044d709ed','aquaerp-demo','AquaERP Showcase Tenant','AquaERP Showcase Tenant','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','enterprise','active',NULL,'2026-06-27 12:40:09','2026-06-27 12:40:12'),('40051ba4-1212-4a7e-9298-cb602baf8ec0','lamusea','Lamu Sea Ventures','Lamu Sea Ventures','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','trial','pending',NULL,'2026-06-27 12:40:08','2026-06-27 12:40:12'),('9cbbec81-9056-452a-907c-c5eefa34d596','coastfish','Coast Fish Cooperative','Coast Fish Cooperative','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','enterprise','active',NULL,'2026-06-27 12:40:06','2026-06-27 12:40:12');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `traceability_certificates`
--

DROP TABLE IF EXISTS `traceability_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `traceability_certificates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chain_summary` json DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lot` (`tenant_id`,`lot_code`),
  UNIQUE KEY `uk_hash` (`verification_hash`),
  CONSTRAINT `traceability_certificates_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traceability_certificates`
--

LOCK TABLES `traceability_certificates` WRITE;
/*!40000 ALTER TABLE `traceability_certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `traceability_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `traceability_lots`
--

DROP TABLE IF EXISTS `traceability_lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `traceability_lots` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catch_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `species_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vessel_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landing_site` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catch_date` date DEFAULT NULL,
  `grading` enum('A','B','C','reject') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `msc_certified` tinyint(1) DEFAULT '0',
  `fao_area` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_temp_c` decimal(5,2) DEFAULT NULL,
  `status` enum('active','recalled','consumed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_lot` (`tenant_id`,`lot_code`),
  CONSTRAINT `traceability_lots_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traceability_lots`
--

LOCK TABLES `traceability_lots` WRITE;
/*!40000 ALTER TABLE `traceability_lots` DISABLE KEYS */;
INSERT INTO `traceability_lots` VALUES ('56211f17-8293-474d-aa56-c057b9b19a14','40051ba4-1212-4a7e-9298-cb602baf8ec0','LOT-LAMUSEA-001','032b2128-f1b0-49c1-919c-33eb1cfa6ddf','lamusea Tilapia','Lamu Sea Ventures Vessel','Lamu Landing','2026-06-24','A',1,'FAO-51',-22.00,'active','2026-06-27 12:40:08'),('5db041ce-e1d5-4a93-bf9f-893a8c363cb0','18cf6cf5-801c-4f38-b51b-2dc044d709ed','LOT-AQUAERP-DEMO-001','318d6670-8a36-4857-86c7-8091959ebd8f','aquaerp-demo Tilapia','AquaERP Showcase Tenant Vessel','Mombasa Landing','2026-06-23','A',1,'FAO-51',-22.00,'active','2026-06-27 12:40:09'),('fa123b27-d7cb-474f-88d8-a18282888700','9cbbec81-9056-452a-907c-c5eefa34d596','LOT-COASTFISH-001','3e0d0ac0-6184-4955-8450-8274ecd5d7cb','coastfish Nile Perch','Coast Fish Cooperative Vessel','Kwale Landing','2026-06-25','A',1,'FAO-51',-22.00,'active','2026-06-27 12:40:07');
/*!40000 ALTER TABLE `traceability_lots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wallet_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit','withdrawal','transfer','purchase','refund','commission') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `balance_before` decimal(15,2) DEFAULT NULL,
  `balance_after` decimal(15,2) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','failed','reversed') COLLATE utf8mb4_unicode_ci DEFAULT 'completed',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_id` (`wallet_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_transactions_wallet_created` (`wallet_id`,`created_at`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_crew`
--

DROP TABLE IF EXISTS `trip_crew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_crew` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trip_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crew_member_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `crew_member_id` (`crew_member_id`),
  KEY `idx_trip_id` (`trip_id`),
  CONSTRAINT `trip_crew_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trip_crew_ibfk_2` FOREIGN KEY (`crew_member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_crew`
--

LOCK TABLES `trip_crew` WRITE;
/*!40000 ALTER TABLE `trip_crew` DISABLE KEYS */;
/*!40000 ALTER TABLE `trip_crew` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_conversions`
--

DROP TABLE IF EXISTS `unit_conversions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_conversions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `factor` decimal(18,8) NOT NULL,
  `species_category` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conv` (`tenant_id`,`from_unit`,`to_unit`,`species_category`),
  CONSTRAINT `unit_conversions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_conversions`
--

LOCK TABLES `unit_conversions` WRITE;
/*!40000 ALTER TABLE `unit_conversions` DISABLE KEYS */;
INSERT INTO `unit_conversions` VALUES ('uc-kg-g-default','tenant-default-0001','kg','g',1000.00000000,NULL,'2026-06-06 08:46:55'),('uc-kg-lb-default','tenant-default-0001','kg','lb',2.20462000,NULL,'2026-06-06 08:46:55'),('uc-lb-kg-default','tenant-default-0001','lb','kg',0.45359200,NULL,'2026-06-06 08:46:55'),('uc-ton-kg-default','tenant-default-0001','ton','kg',1000.00000000,NULL,'2026-06-06 08:46:55');
/*!40000 ALTER TABLE `unit_conversions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_dashboard_layout`
--

DROP TABLE IF EXISTS `user_dashboard_layout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_dashboard_layout` (
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `widgets` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`tenant_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `user_dashboard_layout_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_dashboard_layout`
--

LOCK TABLES `user_dashboard_layout` WRITE;
/*!40000 ALTER TABLE `user_dashboard_layout` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_dashboard_layout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_mfa`
--

DROP TABLE IF EXISTS `user_mfa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_mfa` (
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret_encrypted` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `backup_codes` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_mfa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_mfa`
--

LOCK TABLES `user_mfa` WRITE;
/*!40000 ALTER TABLE `user_mfa` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_mfa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `county` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin','investor','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `status` enum('active','suspended','pending','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kyc_verified` tinyint(1) DEFAULT '0',
  `email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `notification_preferences` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('4323337f-4938-4d7a-ad5a-c0c77b5556fc','demo@aqualedger.co.ke','$2b$12$UuhLv/oRHQY12ZX.Q7nqgO/PJTfO9L5bUuxr9nYz2rTYnvKtGQO12','Demo','SuperUser',NULL,NULL,'super_admin','active',NULL,1,0,'2026-06-27 12:39:30','2026-06-27 12:39:30',NULL,NULL),('4771d81c-81ef-495e-b938-7f4d1d3213d4','admin@aqualedger.co.ke','$2b$12$swwEUpMxQB6D3921B5XEuuorxXbxuKu8xK.84YlBI7FCYjUK6dqym','Platform','Admin',NULL,NULL,'super_admin','active',NULL,1,0,'2026-06-06 08:48:44','2026-06-11 09:46:57','2026-06-11 09:46:57',NULL),('554e08ea-02dd-4817-b0e7-24042ace45b4','buyer-b2b@demo.aquaerp.local','$2b$12$qBuv.bcxTC6C7TpxGiPcceDbvGd62mjIOA8f0s39jqqmUPdxGm0Cy','B2B','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 09:08:12','2026-06-08 09:14:05','2026-06-08 09:14:05',NULL),('5e6081b2-aae7-44a1-82dc-2577da5e884f','owner-lamusea@demo.aquaerp.local','$2b$12$K.ko.TYvNVdI2cVEiDbvWOETRowZuoqafn3Y6fUcS59mdsdDqEzXi','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-16 12:17:00','2026-06-27 12:40:12',NULL,NULL),('9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','vendor@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Vendor',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-08 08:34:44','2026-06-08 08:34:44',NULL),('a4be805d-2f00-4777-be82-1bda494d50f1','synctest-vendor@test.com','$2b$12$/QECwINL7HKUAPCbYX3Gq.ZSsicdbzr7Afa.eaNmz9zo9Bffa3qLS','SyncTest','VendorContact','+254700000002',NULL,'user','active',NULL,1,0,'2026-05-30 13:24:00','2026-06-11 09:38:48','2026-06-11 09:38:48',NULL),('aa64c08b-dbf8-4c0c-9043-950f1abc259b','buyer@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-06 10:14:03','2026-06-06 10:14:03',NULL),('ad6588db-332a-4a22-aa34-aad59f244ed1','owner-coastfish@demo.aquaerp.local','$2b$12$K.ko.TYvNVdI2cVEiDbvWOETRowZuoqafn3Y6fUcS59mdsdDqEzXi','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-15 13:24:00','2026-06-27 12:40:12',NULL,NULL),('c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75','jane.smith.new99@gmail.com','$2b$12$WTaILh0Z4jFVOqauaWNSzOCvCJrfPWThNRQiDTFdddIsBHo8CwFnO','Jane','Smith',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:24:57','2026-06-08 09:24:57',NULL,NULL),('c9d59c3d-ede5-4815-9e6d-415ad71f15c5','johndoe@gmail.com','$2b$12$YFf1yamaOgg/teRM/6YEieBBtnCgg5ztyg4rGjF5Rm/btdHWIsoWu','John','Doe','254112576616',NULL,'user','active',NULL,0,0,'2026-06-08 09:24:24','2026-06-08 09:29:25','2026-06-08 09:29:25',NULL),('cb9c667d-d1d9-4f4f-91d0-c60928a78ed2','alice.buyer.fresh@test.com','$2b$12$UJdiXxfSMJ/rDzr.KSeA6uLEALSe3v56LxJ10Vx05/mKVg7baLQQO','Alice','Buyer',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:28:37','2026-06-08 09:28:37','2026-06-08 09:28:37',NULL),('ea5600c2-5f69-48ed-84c8-01cd0a59db53','owner-aquaerp-demo@demo.aquaerp.local','$2b$12$K.ko.TYvNVdI2cVEiDbvWOETRowZuoqafn3Y6fUcS59mdsdDqEzXi','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-14 14:31:00','2026-06-27 12:40:12',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_commissions`
--

DROP TABLE IF EXISTS `vendor_commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_commissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_amount` decimal(14,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `commission_amount` decimal(14,2) NOT NULL,
  `status` enum('pending','payable','paid','void') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vendor` (`tenant_id`,`vendor_id`,`status`),
  CONSTRAINT `vendor_commissions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_commissions`
--

LOCK TABLES `vendor_commissions` WRITE;
/*!40000 ALTER TABLE `vendor_commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_payouts`
--

DROP TABLE IF EXISTS `vendor_payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_payouts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payout_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `status` enum('draft','processing','paid','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payout` (`tenant_id`,`payout_number`),
  CONSTRAINT `vendor_payouts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_payouts`
--

LOCK TABLES `vendor_payouts` WRITE;
/*!40000 ALTER TABLE `vendor_payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `status` enum('active','frozen','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_wallets_tenant` (`tenant_id`),
  CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES ('0491bbc3-666e-49ac-a4e2-0e72a138b4fc','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',100000.00,'KES','active','2026-06-06 09:08:12','2026-06-06 09:08:12'),('13ac4631-3a06-41f0-baa1-31aee0047c19','18cf6cf5-801c-4f38-b51b-2dc044d709ed','4323337f-4938-4d7a-ad5a-c0c77b5556fc',100000.00,'KES','active','2026-06-27 12:40:13','2026-06-27 12:40:13'),('23c07088-c94d-4fdf-9170-651154988030','40051ba4-1212-4a7e-9298-cb602baf8ec0','5e6081b2-aae7-44a1-82dc-2577da5e884f',26500.00,'KES','active','2026-06-27 12:40:08','2026-06-27 12:40:08'),('64cf05c3-4839-4b3b-a735-887eb59735f6','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',0.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:46'),('71bcba05-15cd-4843-95a7-26522a4f06ba','','4771d81c-81ef-495e-b938-7f4d1d3213d4',0.00,'KES','active','2026-06-11 08:55:01','2026-06-11 08:55:01'),('8ce537be-3124-4243-9141-34005515fbfc','9cbbec81-9056-452a-907c-c5eefa34d596','ad6588db-332a-4a22-aa34-aad59f244ed1',25000.00,'KES','active','2026-06-27 12:40:08','2026-06-27 12:40:08'),('920df1f2-e3c7-4dd2-9a8c-dda1692a7529','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',100000.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:47'),('d557e8ca-958f-4250-84ff-91b5d17ddfe3','18cf6cf5-801c-4f38-b51b-2dc044d709ed','ea5600c2-5f69-48ed-84c8-01cd0a59db53',28000.00,'KES','active','2026-06-27 12:40:09','2026-06-27 12:40:09');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhook_delivery_log`
--

DROP TABLE IF EXISTS `webhook_delivery_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_delivery_log` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `webhook_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `response_status` int DEFAULT NULL,
  `response_body` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `success` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webhook` (`webhook_id`,`created_at`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `webhook_delivery_log_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_delivery_log`
--

LOCK TABLES `webhook_delivery_log` WRITE;
/*!40000 ALTER TABLE `webhook_delivery_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhook_delivery_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhook_endpoints`
--

DROP TABLE IF EXISTS `webhook_endpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_endpoints` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `events` json NOT NULL,
  `secret_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `webhook_endpoints_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_endpoints`
--

LOCK TABLES `webhook_endpoints` WRITE;
/*!40000 ALTER TABLE `webhook_endpoints` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhook_endpoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wholesale_price_tiers`
--

DROP TABLE IF EXISTS `wholesale_price_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wholesale_price_tiers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_segment` enum('retail','wholesale','export','restaurant','cooperative') COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_quantity_kg` decimal(12,3) DEFAULT '0.000',
  `unit_price` decimal(14,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT 'KES',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tier` (`tenant_id`,`product_id`,`customer_segment`,`min_quantity_kg`),
  CONSTRAINT `wholesale_price_tiers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wholesale_price_tiers`
--

LOCK TABLES `wholesale_price_tiers` WRITE;
/*!40000 ALTER TABLE `wholesale_price_tiers` DISABLE KEYS */;
/*!40000 ALTER TABLE `wholesale_price_tiers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listing_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wish` (`tenant_id`,`user_id`,`listing_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_rules`
--

DROP TABLE IF EXISTS `workflow_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_rules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trigger_event` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conditions` json DEFAULT NULL,
  `actions` json NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `workflow_rules_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_rules`
--

LOCK TABLES `workflow_rules` WRITE;
/*!40000 ALTER TABLE `workflow_rules` DISABLE KEYS */;
INSERT INTO `workflow_rules` VALUES ('wf-cold-01','tenant-default-0001','Cold chain critical alert','coldchain.temperature.critical',NULL,'[{\"type\": \"notification\", \"channel\": \"in_app\"}, {\"type\": \"notification\", \"channel\": \"sms\"}]',1,'2026-06-06 08:46:41'),('wf-order-01','tenant-default-0001','Order confirmed notify buyer','commerce.order.confirmed',NULL,'[{\"type\": \"notification\", \"channel\": \"email\"}]',1,'2026-06-06 08:46:41');
/*!40000 ALTER TABLE `workflow_rules` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-27 12:42:19
