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
INSERT INTO `ai_automation_runs` VALUES ('01210ab0-9347-4a01-8476-b4d348f164cc','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','success',3,NULL,NULL,'2026-06-11 09:52:48'),('84c5572f-fb09-4280-a734-d748f4fef1aa','057226cd-297c-4e8f-ab7f-82634d122166','success',3,NULL,NULL,'2026-06-11 09:52:49'),('b2e2e195-82c1-4b26-aa63-c1478f9f0c69','29f5d064-5c7a-4505-831e-e6585baef2fe','success',3,NULL,NULL,'2026-06-11 09:52:47');
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
INSERT INTO `ai_insights` VALUES ('180c1605-55ea-4e7a-9ea9-f4063e09d002','057226cd-297c-4e8f-ab7f-82634d122166','business_brief',NULL,'Weekly operations brief','Demo insight for AquaERP Showcase Tenant: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-11 09:52:49'),('574f9027-5a44-4bbe-8ae4-a2ed00fcf4a9','29f5d064-5c7a-4505-831e-e6585baef2fe','business_brief',NULL,'Weekly operations brief','Demo insight for Coast Fish Cooperative: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-11 09:52:47'),('7c1b43f5-aaa3-4b03-840c-fd0f95025a87','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','business_brief',NULL,'Weekly operations brief','Demo insight for Lamu Sea Ventures: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-11 09:52:48');
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
INSERT INTO `audit_logs` VALUES ('03b6b01c-1f09-487c-9a04-5e7140ced8f6',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:44:53',NULL),('07a4a643-d69e-4599-b961-6024bd383ff1','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.broadcast','announcement','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"title\": \"Platform demo loaded\"}','127.0.0.1','seed-script','2026-05-28 15:38:00','057226cd-297c-4e8f-ab7f-82634d122166'),('07ada44e-5748-4657-ba64-c1a8d31f46b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:02:51',NULL),('07b13995-cc14-4a17-848f-7ab1d720683f','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','29f5d064-5c7a-4505-831e-e6585baef2fe','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\"}','127.0.0.1','seed-script','2026-05-23 12:13:00','29f5d064-5c7a-4505-831e-e6585baef2fe'),('0f28145f-082b-46e9-84cd-a47cd8b71448','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:59:52',NULL),('15f52518-6d54-4051-97af-bd804c6f15cd','07f6fe69-0400-422b-9c1a-368f675aa4b1','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-aquaerp-demo@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-05-30 13:24:00','057226cd-297c-4e8f-ab7f-82634d122166'),('1750c4e0-96e2-4cab-a47d-e3953b92471e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('17ac9186-0e17-47e0-b2aa-b8de2cafaf91','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:49:47',NULL),('19d4f46d-218a-46e9-a284-6593fd17a113',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:00',NULL),('1a0d2317-9e68-4a3d-bbe2-deda6be093e8','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:02:54',NULL),('1a24f00a-6e94-41a1-9d27-facaf2a50560','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:04:04',NULL),('1b05b6d0-16ae-43e5-a4e9-1d8d914bdb44',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:05:00',NULL),('1d173ef0-b419-4a09-b600-13a643466100','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:54',NULL),('1d4668fe-8473-4427-8f6b-1530c1b530b6','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\"}','127.0.0.1','seed-script','2026-05-22 13:20:00','057226cd-297c-4e8f-ab7f-82634d122166'),('2161c97d-d1e0-4344-8911-c30a8cc63c6d',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:50:44',NULL),('28c2e509-6fb9-45c0-b3c3-4afacb8284ce','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:47',NULL),('2b8a0c08-b3d1-4618-aa7b-89fc85468449','a22c2f55-b161-4c13-aa70-9aa461fca001','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-lamusea@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-06-01 11:10:00','bfb46d3d-b38c-4564-8d7d-f1206c906eb7'),('2cab92a1-0f84-4960-b08b-fb07623d8dec','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:16:41',NULL),('2ed562b3-9adb-40c3-a1b3-9d2fc981d914',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:04',NULL),('3106e6fb-45cf-4e3b-9465-8f5114fcc68d','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:31',NULL),('345a084f-79e3-4c7e-8ad6-98617959eeb7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:50',NULL),('34c0875b-99e1-4a39-bdbf-59f1689b3b32',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:23',NULL),('39d12abd-5211-4b91-b276-9ff735252505',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:03:48',NULL),('3a3bd62e-1fcc-4ed2-be30-f7ca4b30c2bb',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:17:00',NULL),('3bb29656-01d3-4b63-a380-f083dd1adecc',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:19',NULL),('3c1d6a21-4bdc-4fa2-ba08-fe33f6fc50d1','bdb34e24-9950-46a1-a0da-a609e93208e3','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"owner-coastfish@demo.aquaerp.local\"}','127.0.0.1','seed-script','2026-05-31 12:17:00','29f5d064-5c7a-4505-831e-e6585baef2fe'),('4056d16a-afb1-4604-b0ee-cd3c004426cd','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:50:30',NULL),('456f0ca5-5a83-44c0-85cf-e935a6252b3a',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:21:40',NULL),('4707dfde-ba6d-499b-84db-187d9944ae32','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:43:46',NULL),('48939c13-3ffc-4f60-9635-d04f2cf9e4f5','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-05-24 11:06:00','bfb46d3d-b38c-4564-8d7d-f1206c906eb7'),('48db875c-409e-4333-95d5-a007fc755a33','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:25',NULL),('4cf777fd-a442-4e33-a0c1-4f1f3a7e806b','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-05-22 13:20:00','057226cd-297c-4e8f-ab7f-82634d122166'),('4f555a9c-faae-4154-911b-f8f95d278252','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:03:16',NULL),('51b820cb-1810-4d23-827c-7d64a70acb89',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:02',NULL),('52729f1e-415a-4b10-903f-428641c7769b',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('5c30cc25-0951-46fd-a7e2-c5180ec51ef5','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.logout','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,NULL,NULL,'2026-06-08 08:43:34',NULL),('61fd92e5-907d-4ad6-ab0b-2dc8e52d08d0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:14:49',NULL),('626f895c-95b3-45d4-9aed-79e4f7eb1205','4771d81c-81ef-495e-b938-7f4d1d3213d4','admin.action','platform_module_flags','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"enabled\": \"all\"}','127.0.0.1','seed-script','2026-06-05 15:42:00','057226cd-297c-4e8f-ab7f-82634d122166'),('641718d1-872a-4e55-a9ee-bed2818e443f',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:20',NULL),('65698fcc-0dd3-446f-87e8-3616e292cbd4',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:30',NULL),('65dcddb3-1736-4355-94fe-95be68228fc1','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 10:13:55',NULL),('6a4c31c8-be87-4d78-9815-47bef3ff49d2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:15:47',NULL),('7159ff5b-4db6-43a7-93d9-fef56eb3dfef',NULL,'auth.logout','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92',NULL,NULL,NULL,'2026-06-06 08:59:43',NULL),('72d6993f-6ec3-4d50-8bd0-119b6c74821e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:13',NULL),('766bd93b-4c52-407f-b1fa-df6e5e8a5746','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:22',NULL),('78584340-1d94-426a-9a95-a969cfc6d6b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:53:45',NULL),('89cd6038-3641-4475-9896-bbb15b131f1a','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:51:00',NULL),('914e9591-3d0f-49ea-8777-feb4e6452c1c',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('92c8f53d-c9ef-4783-b83d-8d59a2095fc0','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.tenant.provision','tenant','057226cd-297c-4e8f-ab7f-82634d122166','{\"note\": \"Demo tenant batch provision\", \"seed\": \"super-admin-platform\"}','127.0.0.1','seed-script','2026-05-14 13:16:00','057226cd-297c-4e8f-ab7f-82634d122166'),('9840d001-18cd-487e-ad61-8f6a77916e5d','a4be805d-2f00-4777-be82-1bda494d50f1','auth.login','user','a4be805d-2f00-4777-be82-1bda494d50f1','{\"rememberMe\": false}','::1','node','2026-06-11 09:38:48',NULL),('9ba4b484-964b-45d4-9b9a-def887173282',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:24',NULL),('9c7037dd-f900-4fb8-a099-f395cbca14a5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('9d460ee0-4ad0-4c72-b892-3902715a378f','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"admin@aqualedger.co.ke\"}','127.0.0.1','seed-script','2026-06-10 10:07:00',NULL),('a048e633-abc8-4802-ae7e-a8276e350455','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:14:03',NULL),('a0d3fe9e-00de-4e16-860d-896ce8034549','bdb34e24-9950-46a1-a0da-a609e93208e3','auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:40',NULL),('a673e114-6621-4369-a7ee-e093f9c1de2e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:22',NULL),('ab8a937a-95e3-44d3-9d3e-abc6b512a04e','bdb34e24-9950-46a1-a0da-a609e93208e3','user.update','tenant_settings','29f5d064-5c7a-4505-831e-e6585baef2fe','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-07 13:28:00','29f5d064-5c7a-4505-831e-e6585baef2fe'),('ac55b1a2-f37c-48d2-bdb9-3096511aaa6f','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.end','tenant','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\"}','127.0.0.1','seed-script','2026-05-24 11:06:00','bfb46d3d-b38c-4564-8d7d-f1206c906eb7'),('af973fb3-feb7-4c90-9f17-eb4a5ffbe52c','07f6fe69-0400-422b-9c1a-368f675aa4b1','user.update','tenant_settings','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-06 14:35:00','057226cd-297c-4e8f-ab7f-82634d122166'),('b5b0d7a6-4795-4049-b2fe-81d9a85056b2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:59:53',NULL),('b6b7049f-f9e0-4246-b23b-8cdb4a2b1b93','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 09:16:44',NULL),('b8f5a177-ea6a-4a33-9fdc-146ee8785290',NULL,'auth.login','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:52:29',NULL),('bcf94c94-6049-45fa-833f-9002fc18c98d','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.login','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:34:44',NULL),('be5eff73-a5b5-4a7c-a596-d5995b71e77b','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:09',NULL),('bf27ef63-deb3-41b8-a5e7-d510b9f0bcc9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:19:01',NULL),('c3b15858-8b86-4b36-a76d-8d353266f0bf',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:48',NULL),('cb34bc83-de9e-4dcb-8125-db78e214f49d','bdb34e24-9950-46a1-a0da-a609e93208e3','auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:29',NULL),('ce2b637f-37d6-4aee-bdfb-6d93ca292255',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:47:14',NULL),('cf1fa0ce-2334-4e4b-850e-978ffd51308e','a22c2f55-b161-4c13-aa70-9aa461fca001','user.update','tenant_settings','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','{\"seed\": \"super-admin-platform\", \"field\": \"storefront\"}','127.0.0.1','seed-script','2026-06-08 12:21:00','bfb46d3d-b38c-4564-8d7d-f1206c906eb7'),('cf34d672-3619-4463-951a-23c6fa145fe1',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('cfce88b9-cf33-4ebb-a52a-bb515526a272','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:46',NULL),('d58effb8-8aaf-4ed0-93bb-6f5a3d0cb890','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:04:19',NULL),('dad5980f-f81e-41bb-b807-9f419d0274b5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:18',NULL),('dbdb9f8e-3e1e-4593-ab7f-f844110f3ec0',NULL,'auth.logout','user','a652b08b-76db-4db2-9413-03376be3b051',NULL,NULL,NULL,'2026-06-08 08:49:48',NULL),('dc3d5363-cfbd-4886-be6b-abdaf07e3548','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:10',NULL),('dc4e54e6-7953-489a-808e-6ce8e55cf2a7','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:00:33',NULL),('dd900aaa-8975-443a-b280-2b1521add9d5','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:46:57',NULL),('e2e072f3-a150-4030-bdbf-3bc617fc8b49','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 09:53:41',NULL),('e451e139-38ac-4fd1-acae-5e297d0e1af9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:04:10',NULL),('e4fb8552-2820-437d-9bd5-9ee5ae56239e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('e59f7298-26ee-4aad-bfa3-e3b55a3c0e05','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:38',NULL),('e6e35ccc-bc3f-4d22-ab50-3046bc725cf3','4771d81c-81ef-495e-b938-7f4d1d3213d4','admin.action','platform_settings','057226cd-297c-4e8f-ab7f-82634d122166','{\"seed\": \"super-admin-platform\", \"setting\": \"branding\"}','127.0.0.1','seed-script','2026-06-04 16:49:00','057226cd-297c-4e8f-ab7f-82634d122166'),('e7de1a14-f194-4b5f-9a67-50ed833cd896','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:50:01',NULL),('e886658c-e170-4185-9c9d-cc53057c1773','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:03:09',NULL),('eb6198ce-11d4-4cbe-992c-bf003b2dd5b0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:14:05',NULL),('efed8b87-e5a2-488c-81a6-ef2863feb446',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:17',NULL),('f3ec824c-1a5c-4507-a0f4-f443444f7432','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:44:09',NULL),('f97b115e-1b92-426f-b331-8c0f61969342','4771d81c-81ef-495e-b938-7f4d1d3213d4','platform.impersonate.start','tenant','29f5d064-5c7a-4505-831e-e6585baef2fe','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"impersonatedAs\": \"owner\"}','127.0.0.1','seed-script','2026-05-23 12:13:00','29f5d064-5c7a-4505-831e-e6585baef2fe');
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
INSERT INTO `bmu` VALUES ('41797737-8eb7-489b-b235-adee1ad9f580','29f5d064-5c7a-4505-831e-e6585baef2fe','Kwale BMU','coastfish-bmu','Kwale','bdb34e24-9950-46a1-a0da-a609e93208e3','active',40,5,NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('4c25732d-3b29-410a-9cd2-615d40044d04','057226cd-297c-4e8f-ab7f-82634d122166','Mombasa BMU','aquaerp-demo-bmu','Mombasa','07f6fe69-0400-422b-9c1a-368f675aa4b1','active',44,7,NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('d1e58b07-04a3-46bf-9ab0-dd1896a47bd9','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','Lamu BMU','lamusea-bmu','Lamu','a22c2f55-b161-4c13-aa70-9aa461fca001','active',42,6,NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `boats` VALUES ('7d6e597e-cf63-46a9-a114-72104b52e8b1','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','KEN-DEMO-002','Lamu Sea Ventures Vessel','fiber',425,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('a17c71fa-faf8-4c97-ab69-6893c7a832d6','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','KEN-DEMO-001','Coast Fish Cooperative Vessel','fiber',400,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('dcdc9d9c-48fd-47ce-9cae-3878128ee648','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','KEN-DEMO-003','AquaERP Showcase Tenant Vessel','fiber',450,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `branches` VALUES ('0485530c-bf9e-4525-8935-0fa5bbaba033','057226cd-297c-4e8f-ab7f-82634d122166','HQ','AquaERP Showcase Tenant HQ','headquarters',NULL,NULL,'active','2026-06-11 09:52:48','2026-06-11 09:52:48'),('a2b17273-e7a5-4600-a88d-4ed919459d1b','29f5d064-5c7a-4505-831e-e6585baef2fe','HQ','Coast Fish Cooperative HQ','headquarters',NULL,NULL,'active','2026-06-11 09:52:45','2026-06-11 09:52:45'),('b85ae78d-3444-459a-ab27-fc0660280489','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','HQ','Lamu Sea Ventures HQ','headquarters',NULL,NULL,'active','2026-06-11 09:52:47','2026-06-11 09:52:47'),('branch-hq-0001','tenant-default-0001','HQ','Headquarters','headquarters',NULL,NULL,'active','2026-06-06 08:45:17','2026-06-06 08:45:17');
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
INSERT INTO `catch_quotas` VALUES ('53aad709-22f9-4bec-9b0d-4d6aa0d70ccd','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','Lamu Sea Ventures Annual Quota','8b45f787-22ca-40f4-a898-e5b6daaefa07','Inshore','annual','2026-05-12','2027-05-12',51000.00,'Kenya Fisheries','active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('5fd80012-04ce-4200-9e59-4b9a5aba16fc','29f5d064-5c7a-4505-831e-e6585baef2fe','Coast Fish Cooperative Annual Quota','2bcc6b91-6990-4169-845e-a1cb1e86ee9d','Inshore','annual','2026-05-12','2027-05-12',50000.00,'Kenya Fisheries','active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('c3d7b88d-7c98-4df9-adf7-a2d2ebf7e235','057226cd-297c-4e8f-ab7f-82634d122166','AquaERP Showcase Tenant Annual Quota','dcb72620-8066-4bc1-aed9-39a11c8eef68','Inshore','annual','2026-05-12','2027-05-12',52000.00,'Kenya Fisheries','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `catches` (`id`, `tenant_id`, `trip_id`, `species_id`, `quantity_kg`, `grade`, `unit_price`, `storage_method`, `recorded_by`, `created_at`) VALUES ('298662f0-73f2-4609-8d99-925eccd32221','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1c8172b2-6c8d-4f08-b28c-518c8b8b1d1d','8b45f787-22ca-40f4-a898-e5b6daaefa07',128.00,'A',325.00,'iced','a22c2f55-b161-4c13-aa70-9aa461fca001','2026-06-11 09:52:47'),('5e625188-a09b-46fd-9a0d-a5b9c29f5d61','057226cd-297c-4e8f-ab7f-82634d122166','cf2adad9-1e43-47a7-a3dc-02852e46f4f4','dcb72620-8066-4bc1-aed9-39a11c8eef68',136.00,'A',330.00,'iced','07f6fe69-0400-422b-9c1a-368f675aa4b1','2026-06-11 09:52:48'),('8cd8d9fb-5147-43e0-ba09-0af3af097ac0','29f5d064-5c7a-4505-831e-e6585baef2fe','d381e69e-9a17-4d2b-9133-fb82dbf6b566','2bcc6b91-6990-4169-845e-a1cb1e86ee9d',120.00,'A',320.00,'iced','bdb34e24-9950-46a1-a0da-a609e93208e3','2026-06-11 09:52:46');
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
INSERT INTO `coldchain_alerts` VALUES ('415c8f4e-e4a6-41dc-914e-88d056bb15c5','057226cd-297c-4e8f-ab7f-82634d122166','e5ce21a0-18c1-4b49-a9b6-187039777954','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-11 09:52:48'),('802c41cd-5158-409e-8886-2fc6a56c2274','057226cd-297c-4e8f-ab7f-82634d122166','e5ce21a0-18c1-4b49-a9b6-187039777954','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-11 09:52:48'),('a874687d-0a21-4291-b006-a991281774fc','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','eb927ab4-a6d0-476d-82d7-62d4fd0ac899','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-11 09:52:47'),('b08b15a4-b356-47bf-a589-2aa0079d39b2','29f5d064-5c7a-4505-831e-e6585baef2fe','08bcb292-c367-43e5-8c13-42c2bf9478d7','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-11 09:52:46'),('c04b1f53-dde8-4ca0-bce9-5933e94f99db','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','eb927ab4-a6d0-476d-82d7-62d4fd0ac899','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-11 09:52:47'),('d0f1f4cf-5e24-4dc1-81e7-4246f8eb8b0d','29f5d064-5c7a-4505-831e-e6585baef2fe','08bcb292-c367-43e5-8c13-42c2bf9478d7','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-11 09:52:46');
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
INSERT INTO `coupons` VALUES ('813796bc-0038-4c99-a2f3-da465e2b65df','057226cd-297c-4e8f-ab7f-82634d122166','WELCOME3','percent',5.00,5000.00,NULL,0,'2026-06-11','2026-09-09','active','2026-06-11 09:52:48'),('b8ddf401-a2ef-4cb8-80ea-c3d0c3ba5ee3','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','WELCOME2','percent',5.00,5000.00,NULL,0,'2026-06-11','2026-09-09','active','2026-06-11 09:52:47'),('cd71d6e8-311e-4a7c-a36a-bc462ea8de53','29f5d064-5c7a-4505-831e-e6585baef2fe','WELCOME1','percent',5.00,5000.00,NULL,0,'2026-06-11','2026-09-09','active','2026-06-11 09:52:46');
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
INSERT INTO `credit_scores` VALUES ('33070231-a0fb-4f24-a646-3b9320d460e9','4771d81c-81ef-495e-b938-7f4d1d3213d4',700,'A',0,0,0,0,'2026-06-06 08:48:44'),('bd98698b-114f-47c8-8f3b-b5489b9e6236','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2',300,'E',0,0,0,0,'2026-06-08 09:28:37');
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
INSERT INTO `crm_customers` VALUES ('2d58df42-097b-4a0d-ae29-f865f6bb8b2a','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','554e08ea-02dd-4817-b0e7-24042ace45b4','Lamu Wholesale Ltd','wholesale-lamusea@example.com','+254710000001','wholesale',125000.00,'active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47',NULL),('3abbd001-4c3c-42ca-a054-703a2192fcd7','057226cd-297c-4e8f-ab7f-82634d122166','554e08ea-02dd-4817-b0e7-24042ace45b4','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com','+254710000002','wholesale',130000.00,'active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48',NULL),('f4d84297-f163-455c-9d1a-14f72ada7cf0','29f5d064-5c7a-4505-831e-e6585baef2fe','554e08ea-02dd-4817-b0e7-24042ace45b4','Kwale Wholesale Ltd','wholesale-coastfish@example.com','+254710000000','wholesale',120000.00,'active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46',NULL);
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
INSERT INTO `crm_leads` VALUES ('1f700cf2-6dd9-4f2e-8794-69c729903d77','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','Nairobi Hotel Group','leads-lamusea@example.com',NULL,'referral','qualified',87000.00,'a22c2f55-b161-4c13-aa70-9aa461fca001','2026-06-11 09:52:47','2026-06-11 09:52:47'),('d460ae9b-08ab-4936-bfb0-e18f2c1557ce','29f5d064-5c7a-4505-831e-e6585baef2fe','Nairobi Hotel Group','leads-coastfish@example.com',NULL,'referral','qualified',85000.00,'bdb34e24-9950-46a1-a0da-a609e93208e3','2026-06-11 09:52:46','2026-06-11 09:52:46'),('d6137e29-3b63-4f63-b9e4-b81dd3e4ad22','057226cd-297c-4e8f-ab7f-82634d122166','Nairobi Hotel Group','leads-aquaerp-demo@example.com',NULL,'referral','qualified',89000.00,'07f6fe69-0400-422b-9c1a-368f675aa4b1','2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `deliveries` VALUES ('6b409e5b-f297-4db8-b886-ec747b97bf74','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','da04922e-f5d0-4d3c-89ab-bd6ddb8ec22c','TRK-LAMUSEA','in_transit','a22c2f55-b161-4c13-aa70-9aa461fca001','Lamu landing site','Nairobi City Market, Kenya','2026-06-12 09:52:48',NULL,NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('7568b803-d913-4b80-b7f7-1f4691204598','057226cd-297c-4e8f-ab7f-82634d122166','c6183f30-e589-4a45-933f-699c8376cfc5','TRK-AQUAERP-DE','in_transit','07f6fe69-0400-422b-9c1a-368f675aa4b1','Mombasa landing site','Nairobi City Market, Kenya','2026-06-12 09:52:48',NULL,NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('b50e7a8d-6b16-4804-bc40-a0e17e0aef33','29f5d064-5c7a-4505-831e-e6585baef2fe','d362ae9c-78c9-46c1-af75-ae54ee3b11f8','TRK-COASTFISH','in_transit','bdb34e24-9950-46a1-a0da-a609e93208e3','Kwale landing site','Nairobi City Market, Kenya','2026-06-12 09:52:46',NULL,NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `expenses` VALUES ('3967b1f9-f970-4069-84c3-c38070ddfe41','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001',NULL,NULL,'fuel','Trip fuel top-up',8600.00,NULL,'approved',NULL,'2026-06-11','2026-06-11 09:52:48','2026-06-11 09:52:48'),('a3b04e98-9dce-4184-b43f-fc39cab8a130','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1',NULL,NULL,'fuel','Trip fuel top-up',8700.00,NULL,'approved',NULL,'2026-06-11','2026-06-11 09:52:49','2026-06-11 09:52:49'),('aec586c5-dfb7-42be-b491-5a5155ac9961','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3',NULL,NULL,'fuel','Trip fuel top-up',8500.00,NULL,'approved',NULL,'2026-06-11','2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `fish_listings` VALUES ('2768f54b-488a-42c1-9a87-9fb01e00a32c','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','9834489b-e7b5-41a1-8dc7-5c83916f5b9a','Fresh',83.00,83.00,'A',425.00,'d7a53185-5515-44e9-8313-fed4ffe88bb2','iced','2026-06-25 09:52:47','available','2026-06-11 09:52:47','2026-06-11 09:52:47'),('a9fe0d80-5d33-4aaa-b3ab-9a26b270c145','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','4f459680-7143-45f0-be35-b6628b97a0da','Fresh',86.00,86.00,'A',430.00,'2cf97d10-e4a3-4401-89cd-43e6c0308c6b','iced','2026-06-25 09:52:48','available','2026-06-11 09:52:48','2026-06-11 09:52:48'),('bf86c21e-a14e-4e81-9e87-3c42d5bc2941','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','2bcc6b91-6990-4169-845e-a1cb1e86ee9d','Fresh',80.00,80.00,'A',420.00,'05413ca4-429b-42b8-882c-ee75b25e2ddb','iced','2026-06-25 09:52:46','available','2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `fish_species` VALUES ('18410510-2eab-4d7f-8b8a-b63c60c0da39','057226cd-297c-4e8f-ab7f-82634d122166','aquaerp-demo Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:48'),('2bcc6b91-6990-4169-845e-a1cb1e86ee9d','29f5d064-5c7a-4505-831e-e6585baef2fe','coastfish Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:46'),('4f459680-7143-45f0-be35-b6628b97a0da','057226cd-297c-4e8f-ab7f-82634d122166','aquaerp-demo Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:48'),('6db4079c-31a8-42a1-a07c-57fbd17228ae','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','lamusea Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-11 09:52:47'),('83a75421-b014-45c6-b382-a9b8401ebab3','29f5d064-5c7a-4505-831e-e6585baef2fe','coastfish Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:46'),('8b45f787-22ca-40f4-a898-e5b6daaefa07','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','lamusea Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:47'),('8bae8561-0d4c-4902-81da-49df0919a247','29f5d064-5c7a-4505-831e-e6585baef2fe','coastfish Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-11 09:52:46'),('9834489b-e7b5-41a1-8dc7-5c83916f5b9a','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','lamusea Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-11 09:52:47'),('dcb72620-8066-4bc1-aed9-39a11c8eef68','057226cd-297c-4e8f-ab7f-82634d122166','aquaerp-demo Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-11 09:52:48'),('sp_001','tenant-default-0001','Tilapia','Oreochromis niloticus',NULL,0.80,350.00,'active','2026-06-06 08:45:16'),('sp_002','tenant-default-0001','Nile Perch','Lates niloticus',NULL,5.00,450.00,'active','2026-06-06 08:45:16'),('sp_003','tenant-default-0001','Catfish','Clarias gariepinus',NULL,1.50,280.00,'active','2026-06-06 08:45:16'),('sp_004','tenant-default-0001','Sardines','Sardinella gibbosa',NULL,0.05,150.00,'active','2026-06-06 08:45:16'),('sp_005','tenant-default-0001','Mackerel','Rastrelliger kanagurta',NULL,0.30,320.00,'active','2026-06-06 08:45:16'),('sp_006','tenant-default-0001','Tuna','Thunnus albacares',NULL,8.00,600.00,'active','2026-06-06 08:45:16'),('sp_007','tenant-default-0001','Squid','Loligo vulgaris',NULL,0.20,500.00,'active','2026-06-06 08:45:16'),('sp_008','tenant-default-0001','Shrimp','Penaeus indicus',NULL,0.01,1200.00,'active','2026-06-06 08:45:16');
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
INSERT INTO `fishing_trips` VALUES ('1c8172b2-6c8d-4f08-b28c-518c8b8b1d1d','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','7d6e597e-cf63-46a9-a114-72104b52e8b1','a22c2f55-b161-4c13-aa70-9aa461fca001','d7a53185-5515-44e9-8313-fed4ffe88bb2','2026-06-08 12:52:48','2026-06-08 20:52:48','Zone A','Clear','calm',80.00,12000.00,128.00,41600.00,'completed',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('cf2adad9-1e43-47a7-a3dc-02852e46f4f4','057226cd-297c-4e8f-ab7f-82634d122166','dcdc9d9c-48fd-47ce-9cae-3878128ee648','07f6fe69-0400-422b-9c1a-368f675aa4b1','2cf97d10-e4a3-4401-89cd-43e6c0308c6b','2026-06-07 12:52:49','2026-06-07 20:52:49','Zone A','Clear','calm',80.00,12000.00,136.00,44880.00,'completed',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('d381e69e-9a17-4d2b-9133-fb82dbf6b566','29f5d064-5c7a-4505-831e-e6585baef2fe','a17c71fa-faf8-4c97-ab69-6893c7a832d6','bdb34e24-9950-46a1-a0da-a609e93208e3','05413ca4-429b-42b8-882c-ee75b25e2ddb','2026-06-09 12:52:46','2026-06-09 20:52:46','Zone A','Clear','calm',80.00,12000.00,120.00,38400.00,'completed',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `gl_accounts` VALUES ('00a6be0b-8212-4dcd-914b-2d9723e5ff41','29f5d064-5c7a-4505-831e-e6585baef2fe','5500','Marketing & Sales','expense','KES',1,'2026-06-11 09:52:46'),('00cfa455-0150-4f34-9d3c-6405f1a49fa6','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','6900','Miscellaneous Expense','expense','KES',1,'2026-06-11 09:52:47'),('01d7728d-40fc-494b-a3a8-36d832da418e','29f5d064-5c7a-4505-831e-e6585baef2fe','6900','Miscellaneous Expense','expense','KES',1,'2026-06-11 09:52:46'),('03a1f0e4-c93e-49e4-9525-acc996cd6c53','057226cd-297c-4e8f-ab7f-82634d122166','2110','PAYE Payable','liability','KES',1,'2026-06-11 09:52:48'),('04e16d25-8a77-4cc1-aba0-3b37e68a76db','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','3100','Retained Earnings','equity','KES',1,'2026-06-11 09:52:47'),('0a9fc757-35ac-4e84-9e83-88b7023a250f','057226cd-297c-4e8f-ab7f-82634d122166','2300','Accrued Expenses','liability','KES',1,'2026-06-11 09:52:48'),('0eae5578-b32c-48d9-a25f-c6c38ac6496f','29f5d064-5c7a-4505-831e-e6585baef2fe','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-11 09:52:46'),('0f11127d-3d12-4a0a-938d-49c5f9b0ab5b','29f5d064-5c7a-4505-831e-e6585baef2fe','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-11 09:52:46'),('1d87857b-3a1e-42db-a1bd-3cbbd2800fc9','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2100','Salaries Payable','liability','KES',1,'2026-06-11 09:52:47'),('1fb9046a-a7ec-4b49-a196-f897fa5bd3e6','29f5d064-5c7a-4505-831e-e6585baef2fe','1100','Accounts Receivable','asset','KES',1,'2026-06-11 09:52:46'),('221fe5e4-c7e6-41ec-a2e9-40c626cc2458','29f5d064-5c7a-4505-831e-e6585baef2fe','3000','Owner\'s Equity','equity','KES',1,'2026-06-11 09:52:46'),('23e7f925-6fd9-4c47-b6dd-93d24be5ae1a','057226cd-297c-4e8f-ab7f-82634d122166','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-11 09:52:48'),('2466c71c-9217-4265-a949-04c4139599f0','057226cd-297c-4e8f-ab7f-82634d122166','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-11 09:52:48'),('26663c52-1b2b-4873-b9a3-e8dc0bd759fc','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1000','Cash on Hand','asset','KES',1,'2026-06-11 09:52:47'),('2cf81950-36e5-4347-ba60-c49c734223e9','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1010','Petty Cash','asset','KES',1,'2026-06-11 09:52:47'),('32b372c1-9ac4-4c29-9904-2aaa31254ab0','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2300','Accrued Expenses','liability','KES',1,'2026-06-11 09:52:47'),('38ecc67c-9f4a-40bf-b222-dda32685f064','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1100','Accounts Receivable','asset','KES',1,'2026-06-11 09:52:47'),('3dbb496b-a6ed-4c79-b8fa-80d2f65322ce','057226cd-297c-4e8f-ab7f-82634d122166','6100','Depreciation Expense','expense','KES',1,'2026-06-11 09:52:48'),('3ffd0e40-06fe-42d6-b31b-fc4b8287d789','057226cd-297c-4e8f-ab7f-82634d122166','2200','VAT Payable','liability','KES',1,'2026-06-11 09:52:48'),('416706e7-da9b-4c67-a72f-f9fe50b7c6da','057226cd-297c-4e8f-ab7f-82634d122166','6900','Miscellaneous Expense','expense','KES',1,'2026-06-11 09:52:48'),('41cc7aae-b850-4f67-b714-2fc722eb6fc3','057226cd-297c-4e8f-ab7f-82634d122166','5300','Cold Chain & Storage','expense','KES',1,'2026-06-11 09:52:48'),('44251658-7515-49bf-a9d8-dcf9c54f0724','29f5d064-5c7a-4505-831e-e6585baef2fe','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-11 09:52:46'),('49716c41-c427-4392-9a7b-dfd69ada45dc','29f5d064-5c7a-4505-831e-e6585baef2fe','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-11 09:52:46'),('4b11292f-9170-4bdb-86b3-94b0d4035e82','29f5d064-5c7a-4505-831e-e6585baef2fe','5600','Repairs & Maintenance','expense','KES',1,'2026-06-11 09:52:46'),('4b691ee3-6634-4b84-ac83-78032530df33','29f5d064-5c7a-4505-831e-e6585baef2fe','6200','Bank & Payment Fees','expense','KES',1,'2026-06-11 09:52:46'),('4cd2ec96-e84b-4d72-8814-a114bf6b8795','29f5d064-5c7a-4505-831e-e6585baef2fe','5000','Cost of Goods Sold','expense','KES',1,'2026-06-11 09:52:46'),('4fb4cfc1-4293-4487-857f-e4d4b6c5a730','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','6200','Bank & Payment Fees','expense','KES',1,'2026-06-11 09:52:47'),('50430617-73a8-43d3-b89f-76e9853b1f1d','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-11 09:52:47'),('52fb916f-b8e3-4be5-b145-a6c0e6edc6a2','057226cd-297c-4e8f-ab7f-82634d122166','1010','Petty Cash','asset','KES',1,'2026-06-11 09:52:48'),('5747cfe0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1010','Petty Cash','asset','KES',1,'2026-06-06 08:47:25'),('5755188e-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-06 08:47:25'),('576a29f4-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1300','Prepaid Expenses','asset','KES',1,'2026-06-06 08:47:25'),('57736ae8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-06 08:47:25'),('577b6e75-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1500','Fixed Assets','asset','KES',1,'2026-06-06 08:47:25'),('5788f79f-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1510','Accumulated Depreciation','asset','KES',1,'2026-06-06 08:47:25'),('57969b52-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2100','Salaries Payable','liability','KES',1,'2026-06-06 08:47:25'),('579ff868-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2110','PAYE Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ad9877-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2120','NHIF Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ba1e92-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2200','VAT Payable','liability','KES',1,'2026-06-06 08:47:26'),('57c8d184-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2300','Accrued Expenses','liability','KES',1,'2026-06-06 08:47:26'),('57debf07-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3000','Owner\'s Equity','equity','KES',1,'2026-06-06 08:47:26'),('57f14e09-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3100','Retained Earnings','equity','KES',1,'2026-06-06 08:47:26'),('57fa9b77-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-06 08:47:26'),('58084a9a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-06 08:47:26'),('5815d3b8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4100','Other Operating Income','revenue','KES',1,'2026-06-06 08:47:26'),('581f510a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5100','Payroll Expense','expense','KES',1,'2026-06-06 08:47:26'),('582f6ffc-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-06 08:47:26'),('583d1a33-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5300','Cold Chain & Storage','expense','KES',1,'2026-06-06 08:47:26'),('58478155-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5400','Logistics & Delivery','expense','KES',1,'2026-06-06 08:47:26'),('585a04b3-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5500','Marketing & Sales','expense','KES',1,'2026-06-06 08:47:27'),('586cfdc8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5600','Repairs & Maintenance','expense','KES',1,'2026-06-06 08:47:27'),('587f0cf0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5700','Licenses & Compliance','expense','KES',1,'2026-06-06 08:47:27'),('588ccaf6-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6100','Depreciation Expense','expense','KES',1,'2026-06-06 08:47:27'),('58960883-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6200','Bank & Payment Fees','expense','KES',1,'2026-06-06 08:47:27'),('589f610b-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6900','Miscellaneous Expense','expense','KES',1,'2026-06-06 08:47:27'),('5fef5e1d-a5b7-4cf3-b9d0-dc0ece9b909b','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-11 09:52:47'),('6135c04a-e886-4202-b736-49818387f4d1','057226cd-297c-4e8f-ab7f-82634d122166','3100','Retained Earnings','equity','KES',1,'2026-06-11 09:52:48'),('62ffac91-210c-40c7-a9b3-91639f76791f','057226cd-297c-4e8f-ab7f-82634d122166','5000','Cost of Goods Sold','expense','KES',1,'2026-06-11 09:52:48'),('644fdf3b-a2dc-444b-a368-769f784f7999','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2120','NHIF Payable','liability','KES',1,'2026-06-11 09:52:47'),('646c0c1c-3b8d-4110-8b7f-424a0b275b86','29f5d064-5c7a-4505-831e-e6585baef2fe','5300','Cold Chain & Storage','expense','KES',1,'2026-06-11 09:52:46'),('67b296d7-275f-4bf5-899c-86b305099783','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5300','Cold Chain & Storage','expense','KES',1,'2026-06-11 09:52:47'),('67e27ebb-a33b-4146-a065-9a1c254ee65e','29f5d064-5c7a-4505-831e-e6585baef2fe','5700','Licenses & Compliance','expense','KES',1,'2026-06-11 09:52:46'),('68bf8789-3737-4fe5-a306-3bddecea049a','057226cd-297c-4e8f-ab7f-82634d122166','5100','Payroll Expense','expense','KES',1,'2026-06-11 09:52:48'),('6ccfe0f9-5063-47f4-bd65-30800e4d3a17','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1300','Prepaid Expenses','asset','KES',1,'2026-06-11 09:52:47'),('6ffb2358-6f09-46d6-a6e9-542bccd0d4dd','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5700','Licenses & Compliance','expense','KES',1,'2026-06-11 09:52:47'),('773020ab-caa3-4ca6-a06f-bf7164e6bdfb','057226cd-297c-4e8f-ab7f-82634d122166','1000','Cash on Hand','asset','KES',1,'2026-06-11 09:52:48'),('77564c7a-b5c6-4824-aaf9-a5bc613a576e','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2000','Accounts Payable','liability','KES',1,'2026-06-11 09:52:47'),('7b58549c-be31-4322-90a0-1b07d212fe26','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5400','Logistics & Delivery','expense','KES',1,'2026-06-11 09:52:47'),('7b6fcb87-8c6a-42d2-beb1-dd8fa5401138','057226cd-297c-4e8f-ab7f-82634d122166','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-11 09:52:48'),('7d12fdc4-71a2-45e4-92e9-2b31780eb17c','057226cd-297c-4e8f-ab7f-82634d122166','2000','Accounts Payable','liability','KES',1,'2026-06-11 09:52:48'),('80e5ded6-5a1c-47ad-95b5-2f5df7e3f81a','057226cd-297c-4e8f-ab7f-82634d122166','5500','Marketing & Sales','expense','KES',1,'2026-06-11 09:52:48'),('818417e7-0b34-4cc6-bbbd-76ee5efb2519','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-11 09:52:47'),('84b1c410-c8bf-4e2e-9edc-3fc4fed154e1','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2200','VAT Payable','liability','KES',1,'2026-06-11 09:52:47'),('84bc0b24-f58b-4fd0-9c99-21180172a21e','057226cd-297c-4e8f-ab7f-82634d122166','4100','Other Operating Income','revenue','KES',1,'2026-06-11 09:52:48'),('85338f60-056a-42e3-9c55-4ca46bef1087','29f5d064-5c7a-4505-831e-e6585baef2fe','4100','Other Operating Income','revenue','KES',1,'2026-06-11 09:52:46'),('8d047222-4b1b-44e1-a64c-06dd028069a9','057226cd-297c-4e8f-ab7f-82634d122166','2120','NHIF Payable','liability','KES',1,'2026-06-11 09:52:48'),('8ea1b207-77d2-44c5-a930-caab64534099','057226cd-297c-4e8f-ab7f-82634d122166','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-11 09:52:48'),('91b8b5c3-d36b-4878-aac0-3361185b5f58','29f5d064-5c7a-4505-831e-e6585baef2fe','1500','Fixed Assets','asset','KES',1,'2026-06-11 09:52:46'),('91f4b5e1-de46-47e0-a5ce-d286121c89e7','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5500','Marketing & Sales','expense','KES',1,'2026-06-11 09:52:47'),('92736db4-fdfb-436b-82ac-11deabfb4c5f','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-11 09:52:47'),('9287a87c-2144-4801-b2dc-6de26c25c26b','057226cd-297c-4e8f-ab7f-82634d122166','5400','Logistics & Delivery','expense','KES',1,'2026-06-11 09:52:48'),('96a1a682-f8e4-44cc-8e50-2cfc863d810f','29f5d064-5c7a-4505-831e-e6585baef2fe','5400','Logistics & Delivery','expense','KES',1,'2026-06-11 09:52:46'),('977944d3-1f05-4cc2-b711-ada7a9fec153','057226cd-297c-4e8f-ab7f-82634d122166','3000','Owner\'s Equity','equity','KES',1,'2026-06-11 09:52:48'),('9a25a9fb-b241-40e6-bc14-4508481db62f','057226cd-297c-4e8f-ab7f-82634d122166','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-11 09:52:48'),('a1208d19-0008-4103-ba84-56a6938c7723','057226cd-297c-4e8f-ab7f-82634d122166','6200','Bank & Payment Fees','expense','KES',1,'2026-06-11 09:52:48'),('a1362dd0-9572-447c-99ff-1319d1436b45','057226cd-297c-4e8f-ab7f-82634d122166','2100','Salaries Payable','liability','KES',1,'2026-06-11 09:52:48'),('a25623b0-f61d-49f7-9dc8-594fa1bf8178','057226cd-297c-4e8f-ab7f-82634d122166','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-11 09:52:48'),('aab867de-90db-49fa-ab0d-12313bb6ff90','057226cd-297c-4e8f-ab7f-82634d122166','1100','Accounts Receivable','asset','KES',1,'2026-06-11 09:52:48'),('ac42cb00-ce4d-4add-a03a-05d5d764c8ec','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-11 09:52:47'),('b11721a6-9083-418d-bf1c-c8a885af4a0e','057226cd-297c-4e8f-ab7f-82634d122166','5700','Licenses & Compliance','expense','KES',1,'2026-06-11 09:52:48'),('b39f24eb-2c2a-444e-a83f-edd6ef001aec','29f5d064-5c7a-4505-831e-e6585baef2fe','2120','NHIF Payable','liability','KES',1,'2026-06-11 09:52:46'),('b452bd7c-630e-4675-9c8e-c997e1906bb2','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','6100','Depreciation Expense','expense','KES',1,'2026-06-11 09:52:47'),('b6777678-e639-45c1-9f15-784667140d50','29f5d064-5c7a-4505-831e-e6585baef2fe','2200','VAT Payable','liability','KES',1,'2026-06-11 09:52:46'),('b6b22272-7c06-4166-a3af-2e93b5a00af6','29f5d064-5c7a-4505-831e-e6585baef2fe','2100','Salaries Payable','liability','KES',1,'2026-06-11 09:52:46'),('b7e6c214-5b16-49ba-bafd-17151ce675a5','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','3000','Owner\'s Equity','equity','KES',1,'2026-06-11 09:52:47'),('b98a62ab-f5a8-45b6-bfd4-a7f0ff8e1692','057226cd-297c-4e8f-ab7f-82634d122166','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-11 09:52:48'),('c16274a1-af5a-4d7d-b211-ea371d2556c7','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5600','Repairs & Maintenance','expense','KES',1,'2026-06-11 09:52:47'),('c216e6bc-44ac-435e-8de7-4ac95c83fc67','057226cd-297c-4e8f-ab7f-82634d122166','1300','Prepaid Expenses','asset','KES',1,'2026-06-11 09:52:48'),('c2bc4ac1-caeb-4f37-91e1-945523f88464','29f5d064-5c7a-4505-831e-e6585baef2fe','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-11 09:52:46'),('c2bc81db-d699-4287-88e0-d9720630d5fe','29f5d064-5c7a-4505-831e-e6585baef2fe','1010','Petty Cash','asset','KES',1,'2026-06-11 09:52:45'),('c4542eb1-ead6-46a8-abc0-71425f8c0eb9','29f5d064-5c7a-4505-831e-e6585baef2fe','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-11 09:52:46'),('c938dd71-dd60-458d-9394-d817650520d9','29f5d064-5c7a-4505-831e-e6585baef2fe','5100','Payroll Expense','expense','KES',1,'2026-06-11 09:52:46'),('d0f9f522-bd2a-4ed8-bd6e-dcd5d8d2b444','29f5d064-5c7a-4505-831e-e6585baef2fe','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-11 09:52:46'),('d4ed7af3-2175-40ba-95ee-c4021b74620f','29f5d064-5c7a-4505-831e-e6585baef2fe','2110','PAYE Payable','liability','KES',1,'2026-06-11 09:52:46'),('d5705e66-19c5-4aa8-bfa3-f1356fa15c64','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-11 09:52:47'),('dfffa65d-fc96-4e39-844b-13b1d7a8d094','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5000','Cost of Goods Sold','expense','KES',1,'2026-06-11 09:52:47'),('e46e307b-d020-4839-9b26-49999bdbbcd3','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','5100','Payroll Expense','expense','KES',1,'2026-06-11 09:52:47'),('e7d6ef63-c827-463d-ae97-bfee4c396723','29f5d064-5c7a-4505-831e-e6585baef2fe','3100','Retained Earnings','equity','KES',1,'2026-06-11 09:52:46'),('e85845a6-9af3-4bc6-a61b-9ade78d60e32','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-11 09:52:47'),('e8bf35f5-9422-42ab-951c-375085c8dd51','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1510','Accumulated Depreciation','asset','KES',1,'2026-06-11 09:52:47'),('e9f2a675-3aad-4e09-b30d-e929c270f478','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2110','PAYE Payable','liability','KES',1,'2026-06-11 09:52:47'),('ee626ec2-aebc-4242-9d36-af762334e140','29f5d064-5c7a-4505-831e-e6585baef2fe','1000','Cash on Hand','asset','KES',1,'2026-06-11 09:52:45'),('eeb4acc4-d291-4399-a424-eec20094c721','057226cd-297c-4e8f-ab7f-82634d122166','5600','Repairs & Maintenance','expense','KES',1,'2026-06-11 09:52:48'),('f546088a-6e14-4faa-8b1a-2fdf44e555fa','057226cd-297c-4e8f-ab7f-82634d122166','1510','Accumulated Depreciation','asset','KES',1,'2026-06-11 09:52:48'),('f6a0085d-69df-4b61-9a39-ed859e576be4','29f5d064-5c7a-4505-831e-e6585baef2fe','2300','Accrued Expenses','liability','KES',1,'2026-06-11 09:52:46'),('f8b0d1a5-ec70-4837-9e8f-b8d1a883f5a3','29f5d064-5c7a-4505-831e-e6585baef2fe','1510','Accumulated Depreciation','asset','KES',1,'2026-06-11 09:52:46'),('fa3d5599-b6ab-4bcf-aa80-5f60d5401719','29f5d064-5c7a-4505-831e-e6585baef2fe','2000','Accounts Payable','liability','KES',1,'2026-06-11 09:52:46'),('fa9bb594-8471-44d4-bd64-679b074c94ed','057226cd-297c-4e8f-ab7f-82634d122166','1500','Fixed Assets','asset','KES',1,'2026-06-11 09:52:48'),('fb506c3d-c34c-46ab-abe2-583b2e49c399','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4100','Other Operating Income','revenue','KES',1,'2026-06-11 09:52:47'),('fc978cd5-c1c9-473f-a555-a995074062c5','29f5d064-5c7a-4505-831e-e6585baef2fe','1300','Prepaid Expenses','asset','KES',1,'2026-06-11 09:52:46'),('fe3f7178-e70d-4b32-9545-60e3a152b97b','29f5d064-5c7a-4505-831e-e6585baef2fe','6100','Depreciation Expense','expense','KES',1,'2026-06-11 09:52:46'),('ff052855-a1e0-4fef-9647-064b016b84c7','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','1500','Fixed Assets','asset','KES',1,'2026-06-11 09:52:47'),('gl-ap-01','tenant-default-0001','2000','Accounts Payable','liability','KES',1,'2026-06-06 08:45:20'),('gl-ar-01','tenant-default-0001','1100','Accounts Receivable','asset','KES',1,'2026-06-06 08:45:20'),('gl-cash-01','tenant-default-0001','1000','Cash on Hand','asset','KES',1,'2026-06-06 08:45:20'),('gl-exp-01','tenant-default-0001','5000','Cost of Goods Sold','expense','KES',1,'2026-06-06 08:45:20'),('gl-inv-01','tenant-default-0001','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-06 08:45:20'),('gl-rev-01','tenant-default-0001','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-06 08:45:20');
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
INSERT INTO `goods_receipts` VALUES ('3370b708-c238-4387-a885-14076ba9431f','29f5d064-5c7a-4505-831e-e6585baef2fe','172d0f59-70d0-4bf4-83e1-f7068228329b','GRN-MQ9BZATG','2026-06-11','bdb34e24-9950-46a1-a0da-a609e93208e3','posted','Test programmatic GRN','2026-06-11 10:04:29');
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
INSERT INTO `gps_telemetry` VALUES ('2c2ba153-12ef-4f11-9547-afd0a0148cc4','29f5d064-5c7a-4505-831e-e6585baef2fe','a17c71fa-faf8-4c97-ab69-6893c7a832d6',NULL,-4.04000000,39.67000000,8.50,NULL,NULL,'2026-06-11 09:52:47','iot','2026-06-11 09:52:47'),('646ad403-8072-4abd-8f82-c0961e93c548','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','7d6e597e-cf63-46a9-a114-72104b52e8b1',NULL,-4.03900000,39.67100000,8.50,NULL,NULL,'2026-06-11 09:52:48','iot','2026-06-11 09:52:48'),('e3773237-20bb-4db0-8c5a-850beec69067','057226cd-297c-4e8f-ab7f-82634d122166','dcdc9d9c-48fd-47ce-9cae-3878128ee648',NULL,-4.03800000,39.67200000,8.50,NULL,NULL,'2026-06-11 09:52:48','iot','2026-06-11 09:52:48');
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
INSERT INTO `hr_employees` VALUES ('0ec2d317-0473-4ff8-b19d-b9dd1400f47e','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','EMP-3','Demo Captain','Operations','Fleet Captain','2025-05-07',45000.00,'active','2026-06-11 09:52:48','2026-06-11 09:52:48',NULL,NULL),('0fd36899-2849-4b82-871e-16395ba3ba97','057226cd-297c-4e8f-ab7f-82634d122166',NULL,'EMP-3B','Demo Storekeeper','Cold Chain','Storekeeper','2025-11-23',32000.00,'active','2026-06-11 09:52:48','2026-06-11 09:52:48',NULL,NULL),('13f03cb3-1a34-473e-982e-f9b0229718c3','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','EMP-2','Demo Captain','Operations','Fleet Captain','2025-05-07',45000.00,'active','2026-06-11 09:52:47','2026-06-11 09:52:47',NULL,NULL),('58a1ba2c-7524-414b-bc83-fd67fa0ee16b','29f5d064-5c7a-4505-831e-e6585baef2fe',NULL,'EMP-1B','Demo Storekeeper','Cold Chain','Storekeeper','2025-11-23',32000.00,'active','2026-06-11 09:52:46','2026-06-11 09:52:46',NULL,NULL),('b5176c39-8d59-4cce-8353-c9c8fa364b30','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','EMP-1','Demo Captain','Operations','Fleet Captain','2025-05-07',45000.00,'active','2026-06-11 09:52:46','2026-06-11 09:52:46',NULL,NULL),('fe9136a7-f8d0-42b3-a31e-afb220ad6cf4','bfb46d3d-b38c-4564-8d7d-f1206c906eb7',NULL,'EMP-2B','Demo Storekeeper','Cold Chain','Storekeeper','2025-11-23',32000.00,'active','2026-06-11 09:52:47','2026-06-11 09:52:47',NULL,NULL);
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
INSERT INTO `hr_payroll_runs` VALUES ('47092e4f-c5bf-479d-a0fb-a4ee3bf7cef1','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-11 09:52:47',NULL,NULL,NULL),('c64b80bf-3aac-4ff5-9f6b-d7151d6178f9','057226cd-297c-4e8f-ab7f-82634d122166','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-11 09:52:48',NULL,NULL,NULL),('ee11c362-6b6f-44c3-80c4-f93a9aba240a','29f5d064-5c7a-4505-831e-e6585baef2fe','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-11 09:52:46',NULL,NULL,NULL);
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
INSERT INTO `insurance_claims` VALUES ('00e14857-91af-436c-b1c2-4ddb7a0fbe8a','057226cd-297c-4e8f-ab7f-82634d122166','f89bce55-9388-4151-a4c8-100f69d51dd3','dcdc9d9c-48fd-47ce-9cae-3878128ee648','CLM-3','2026-05-12','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('3dfa6114-362e-4633-9c6f-863cb093f2dd','29f5d064-5c7a-4505-831e-e6585baef2fe','90d0f8dc-2dc3-4ba2-905a-93f3398ef65f','a17c71fa-faf8-4c97-ab69-6893c7a832d6','CLM-1','2026-05-12','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('f408604b-fda1-46ea-bbec-8b0175faa975','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','589e2a0b-b9dc-4587-8264-79a526eef4bb','7d6e597e-cf63-46a9-a114-72104b52e8b1','CLM-2','2026-05-12','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `insurance_policies` VALUES ('589e2a0b-b9dc-4587-8264-79a526eef4bb','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','7d6e597e-cf63-46a9-a114-72104b52e8b1','POL-2','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-12','2027-04-12','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('90d0f8dc-2dc3-4ba2-905a-93f3398ef65f','29f5d064-5c7a-4505-831e-e6585baef2fe','a17c71fa-faf8-4c97-ab69-6893c7a832d6','POL-1','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-12','2027-04-12','active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('f89bce55-9388-4151-a4c8-100f69d51dd3','057226cd-297c-4e8f-ab7f-82634d122166','dcdc9d9c-48fd-47ce-9cae-3878128ee648','POL-3','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-12','2027-04-12','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `integration_connections` VALUES ('2ea200b0-1785-45b5-ad26-3a4b2007c481','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','sms','SMS Gateway','{}','inactive',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('452e8f74-3e95-4602-9fc9-1e646b21eb9a','057226cd-297c-4e8f-ab7f-82634d122166','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('62016241-2b74-4cbd-ac9b-6f2b0a679f0f','29f5d064-5c7a-4505-831e-e6585baef2fe','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('b2856577-3880-47ef-843e-6c26c001e61a','29f5d064-5c7a-4505-831e-e6585baef2fe','sms','SMS Gateway','{}','inactive',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('c9cfd537-3128-4b42-b762-bce0641d8507','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('d7023156-c9de-472a-9690-5a9208799e36','057226cd-297c-4e8f-ab7f-82634d122166','sms','SMS Gateway','{}','inactive',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `inventory_batches` VALUES ('8ee79376-052f-4224-9023-dbfa7a993e8d','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','SKU-LAMUSEA','Lamu Sea Ventures Batch','9834489b-e7b5-41a1-8dc7-5c83916f5b9a','lamusea-batch-1',205.000,0.000,'fresh',NULL,'catch','1c8172b2-6c8d-4f08-b28c-518c8b8b1d1d','available','2026-06-11 09:52:47','2026-06-11 09:52:47'),('b3941c7f-3920-4d28-9d78-d2422a946570','057226cd-297c-4e8f-ab7f-82634d122166','SKU-AQUAERP-DEMO','AquaERP Showcase Tenant Batch','4f459680-7143-45f0-be35-b6628b97a0da','aquaerp-demo-batch-1',210.000,0.000,'fresh',NULL,'catch','cf2adad9-1e43-47a7-a3dc-02852e46f4f4','available','2026-06-11 09:52:48','2026-06-11 09:52:48'),('d9f7f68e-1f08-44b2-8b5e-d30723074d6f','29f5d064-5c7a-4505-831e-e6585baef2fe','SKU-COASTFISH','Coast Fish Cooperative Batch','2bcc6b91-6990-4169-845e-a1cb1e86ee9d','coastfish-batch-1',200.000,0.000,'fresh',NULL,'catch','d381e69e-9a17-4d2b-9133-fb82dbf6b566','available','2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `iot_devices` VALUES ('4a9cfe01-9f5d-447f-b037-5db5be2fc678','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','dev_f7c6be83','ac298354ae795e8c5a2087b5b1ccce706b7b20a943bf2b0c494f63aa1fbce404','Chill probe 1','temperature_probe',NULL,'eb927ab4-a6d0-476d-82d7-62d4fd0ac899','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b',NULL,NULL,'active','2026-06-11 09:52:48','2026-06-11 09:52:48','2026-06-11 09:52:48'),('74a6ac86-27b0-42c7-8d12-8ee373ac7511','29f5d064-5c7a-4505-831e-e6585baef2fe','dev_6e7b0545','ae3bd67d7043ac651af2d42501fd207bc22d942df42be19a41023f017a3e527b','Chill probe 1','temperature_probe',NULL,'08bcb292-c367-43e5-8c13-42c2bf9478d7','bc30c612-e917-4697-ac21-35229124987d',NULL,NULL,'active','2026-06-11 09:52:47','2026-06-11 09:52:47','2026-06-11 09:52:47'),('8cc43d89-a6db-4a2a-815d-a668ca0e2c0d','057226cd-297c-4e8f-ab7f-82634d122166','dev_962d4b70','a190cea9abf2110221c99143cec199bcc6ee83e37b7044b58a578bc9151b0231','Chill probe 1','temperature_probe',NULL,'e5ce21a0-18c1-4b49-a9b6-187039777954','d2abc491-8c0b-47e4-a4aa-15f6613c1845',NULL,NULL,'active','2026-06-11 09:52:48','2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `journal_entries` VALUES ('39c7e555-6ae6-4487-947a-7df37642bac1','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','JE-DEMO-2','2026-06-11','Demo sales recognition','order',NULL,'posted','a22c2f55-b161-4c13-aa70-9aa461fca001','2026-06-11 09:52:47'),('c169e0e4-3d31-408e-b71d-d6967d9c8818','29f5d064-5c7a-4505-831e-e6585baef2fe','JE-DEMO-1','2026-06-11','Demo sales recognition','order',NULL,'posted','bdb34e24-9950-46a1-a0da-a609e93208e3','2026-06-11 09:52:46'),('fe0a89e6-9688-43f1-95e5-305b55ce8cf1','057226cd-297c-4e8f-ab7f-82634d122166','JE-DEMO-3','2026-06-11','Demo sales recognition','order',NULL,'posted','07f6fe69-0400-422b-9c1a-368f675aa4b1','2026-06-11 09:52:48');
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
INSERT INTO `journal_lines` VALUES ('31c3e992-fa75-4d12-91a9-4a768cac81b0','39c7e555-6ae6-4487-947a-7df37642bac1','26663c52-1b2b-4873-b9a3-e8dc0bd759fc',26000.00,0.00,'Cash receipt'),('6b7e6dc8-a472-42e7-8392-ae0662b20c8b','fe0a89e6-9688-43f1-95e5-305b55ce8cf1','a25623b0-f61d-49f7-9dc8-594fa1bf8178',0.00,27000.00,'Sales revenue'),('9f25a521-161c-451b-9ff9-f939c64dccbf','c169e0e4-3d31-408e-b71d-d6967d9c8818','ee626ec2-aebc-4242-9d36-af762334e140',25000.00,0.00,'Cash receipt'),('bfb4d0d8-e097-487b-beee-35da1fabfbc6','c169e0e4-3d31-408e-b71d-d6967d9c8818','c2bc4ac1-caeb-4f37-91e1-945523f88464',0.00,25000.00,'Sales revenue'),('d39f8d1a-6085-4fed-9840-d56fa802a29a','fe0a89e6-9688-43f1-95e5-305b55ce8cf1','773020ab-caa3-4ca6-a06f-bf7164e6bdfb',27000.00,0.00,'Cash receipt'),('e842f569-b6c7-4f82-b980-23cd7bc0c4f5','39c7e555-6ae6-4487-947a-7df37642bac1','d5705e66-19c5-4aa8-bfa3-f1356fa15c64',0.00,26000.00,'Sales revenue');
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
INSERT INTO `landing_sites` VALUES ('05413ca4-429b-42b8-882c-ee75b25e2ddb','29f5d064-5c7a-4505-831e-e6585baef2fe','Kwale Landing','coastfish-lnd','Kwale',-4.65000000,39.38000000,NULL,'active','2026-06-11 09:52:46','2026-06-11 09:52:46'),('2cf97d10-e4a3-4401-89cd-43e6c0308c6b','057226cd-297c-4e8f-ab7f-82634d122166','Mombasa Landing','aquaerp-demo-lnd','Mombasa',-4.04000000,39.67000000,NULL,'active','2026-06-11 09:52:48','2026-06-11 09:52:48'),('d7a53185-5515-44e9-8313-fed4ffe88bb2','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','Lamu Landing','lamusea-lnd','Lamu',-2.27000000,40.90000000,NULL,'active','2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `login_alerts` VALUES ('a984aca3-a2d3-46d8-86bc-8f76130a5165','bdb34e24-9950-46a1-a0da-a609e93208e3','29f5d064-5c7a-4505-831e-e6585baef2fe','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,0,'2026-06-11 09:54:29'),('cbbb7da8-1ee2-4996-a22a-c4dcd99de952','bdb34e24-9950-46a1-a0da-a609e93208e3','29f5d064-5c7a-4505-831e-e6585baef2fe','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',NULL,0,'2026-06-11 09:54:40');
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
INSERT INTO `marketplace_vendors` VALUES ('2c2ccc7f-e600-4b84-a6c1-acd025f744aa','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','Coast Fish Cooperative Seafood Shop',10.00,'active','2026-06-11 09:52:46'),('93c3dccb-a0a7-4757-895c-856dd479243a','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Lamu Sea Ventures Shared Vendor Shop',12.00,'active','2026-06-11 09:52:47'),('9a796dcc-16c0-40c8-85e6-adbe98830b37','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','AquaERP Showcase Tenant Seafood Shop',10.00,'active','2026-06-11 09:52:48'),('d60ceda3-2de5-49b7-959e-8e965d70048c','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','Lamu Sea Ventures Seafood Shop',10.00,'active','2026-06-11 09:52:47'),('d662f28a-b1cb-45de-85d7-680964678ab4','057226cd-297c-4e8f-ab7f-82634d122166','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','AquaERP Showcase Tenant Shared Vendor Shop',12.00,'active','2026-06-11 09:52:48'),('e6f8b604-6c9f-44b8-bd99-811da1918e95','29f5d064-5c7a-4505-831e-e6585baef2fe','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Coast Fish Cooperative Shared Vendor Shop',12.00,'active','2026-06-11 09:52:46');
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
INSERT INTO `notifications` VALUES ('46ff754d-6a6c-4d40-a9a6-2a8006d334be','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-11 09:52:48'),('5536a7a7-b39e-4ae1-86af-e169d0f811c5','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-11 09:52:47'),('5fd279a5-978b-4518-8e49-87ea364143bc','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-11 09:52:47'),('7b44fa02-c950-4d20-b40d-2b565d00d06c','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-11 09:52:48'),('85364030-ba58-44e7-8d58-dbd0e11d089c','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-11 09:52:49'),('c5906565-5da8-46b6-b8fe-7626cabbb2bb','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-11 09:52:49');
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
INSERT INTO `order_items` (`id`, `order_id`, `listing_id`, `species_id`, `quantity_kg`, `unit_price`, `created_at`) VALUES ('89f01537-978a-4f73-bed8-3b33c22254f1','da04922e-f5d0-4d3c-89ab-bd6ddb8ec22c','2768f54b-488a-42c1-9a87-9fb01e00a32c','9834489b-e7b5-41a1-8dc7-5c83916f5b9a',25.00,425.00,'2026-06-11 09:52:47'),('e75527e2-7e20-4a0d-b6b0-a0ca76ce9994','d362ae9c-78c9-46c1-af75-ae54ee3b11f8','bf86c21e-a14e-4e81-9e87-3c42d5bc2941','2bcc6b91-6990-4169-845e-a1cb1e86ee9d',25.00,420.00,'2026-06-11 09:52:46'),('fbf05768-1970-4c8c-9629-5022137c38a7','c6183f30-e589-4a45-933f-699c8376cfc5','a9fe0d80-5d33-4aaa-b3ab-9a26b270c145','4f459680-7143-45f0-be35-b6628b97a0da',25.00,430.00,'2026-06-11 09:52:48');
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
INSERT INTO `orders` VALUES ('c6183f30-e589-4a45-933f-699c8376cfc5','057226cd-297c-4e8f-ab7f-82634d122166','554e08ea-02dd-4817-b0e7-24042ace45b4','07f6fe69-0400-422b-9c1a-368f675aa4b1','ORD-DEMO-AQUAERP-DE-3',16000.00,500.00,2560.00,19060.00,'confirmed','paid','Mombasa wholesale depot',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48',NULL,NULL,NULL,NULL,NULL),('d362ae9c-78c9-46c1-af75-ae54ee3b11f8','29f5d064-5c7a-4505-831e-e6585baef2fe','554e08ea-02dd-4817-b0e7-24042ace45b4','bdb34e24-9950-46a1-a0da-a609e93208e3','ORD-DEMO-COASTFISH-1',15000.00,500.00,2400.00,17900.00,'confirmed','paid','Kwale wholesale depot',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46',NULL,NULL,NULL,NULL,NULL),('da04922e-f5d0-4d3c-89ab-bd6ddb8ec22c','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','554e08ea-02dd-4817-b0e7-24042ace45b4','a22c2f55-b161-4c13-aa70-9aa461fca001','ORD-DEMO-LAMUSEA-2',15500.00,500.00,2480.00,18480.00,'confirmed','paid','Lamu wholesale depot',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47',NULL,NULL,NULL,NULL,NULL);
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
INSERT INTO `payment_intents` VALUES ('0b22df92-ffd9-4601-8ca5-feca5337ecea','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','da04922e-f5d0-4d3c-89ab-bd6ddb8ec22c','mpesa',18480.00,'KES','succeeded','SEED-SA-lamusea-1','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 1}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('0cda6748-a1ba-4332-93e4-f2082017ab42','bfb46d3d-b38c-4564-8d7d-f1206c906eb7',NULL,'stripe',7400.00,'KES','failed','SEED-SA-lamusea-3','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 3}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('2860eda3-c70c-4665-875b-80acfc1ed5fd','29f5d064-5c7a-4505-831e-e6585baef2fe',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-coastfish-2','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 2}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('3fbe303b-208f-4f10-8457-3ef85ebad572','29f5d064-5c7a-4505-831e-e6585baef2fe',NULL,'stripe',7400.00,'KES','failed','SEED-SA-coastfish-3','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 3}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('422efd45-3bb3-4405-96e3-9b48b131a5e0','29f5d064-5c7a-4505-831e-e6585baef2fe',NULL,'bank',8600.00,'KES','processing','SEED-SA-coastfish-4','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 4}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('44d6dadc-a1c3-494c-9a82-80f4ecbd5c4e','bfb46d3d-b38c-4564-8d7d-f1206c906eb7',NULL,'bank',8600.00,'KES','processing','SEED-SA-lamusea-4','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 4}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('5c9ea6b3-0c9b-46e5-821b-18e1239fd4cd','057226cd-297c-4e8f-ab7f-82634d122166',NULL,'bank',8600.00,'KES','processing','SEED-SA-aquaerp-demo-4','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 4}','2026-06-11 09:52:51','2026-06-11 09:52:51'),('6a7e6283-7abe-4093-9786-e57c3bff7335','29f5d064-5c7a-4505-831e-e6585baef2fe','d362ae9c-78c9-46c1-af75-ae54ee3b11f8','mpesa',17900.00,'KES','succeeded','SEED-SA-coastfish-1','{\"seed\": \"super-admin-platform\", \"slug\": \"coastfish\", \"scenario\": 1}','2026-06-11 09:52:51','2026-06-11 09:52:51'),('8ea28bd7-1e5f-469d-b432-abd71a59e642','057226cd-297c-4e8f-ab7f-82634d122166',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-aquaerp-demo-2','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 2}','2026-06-11 09:52:51','2026-06-11 09:52:51'),('93e0d0aa-2a9c-4c62-afaf-887fe3eec12d','bfb46d3d-b38c-4564-8d7d-f1206c906eb7',NULL,'mpesa',6200.00,'KES','pending','SEED-SA-lamusea-2','{\"seed\": \"super-admin-platform\", \"slug\": \"lamusea\", \"scenario\": 2}','2026-06-11 09:52:52','2026-06-11 09:52:52'),('959a28de-7414-43c0-86e6-63d6f95bd52e','057226cd-297c-4e8f-ab7f-82634d122166','c6183f30-e589-4a45-933f-699c8376cfc5','mpesa',19060.00,'KES','succeeded','SEED-SA-aquaerp-demo-1','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 1}','2026-06-11 09:52:51','2026-06-11 09:52:51'),('b9c90d74-1852-4be4-87d7-d967d790f421','057226cd-297c-4e8f-ab7f-82634d122166',NULL,'stripe',7400.00,'KES','failed','SEED-SA-aquaerp-demo-3','{\"seed\": \"super-admin-platform\", \"slug\": \"aquaerp-demo\", \"scenario\": 3}','2026-06-11 09:52:51','2026-06-11 09:52:51');
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
INSERT INTO `platform_settings` VALUES ('announcement','{\"body\": \"20 demo tenants are loaded with full module data. Super admins can manage tenants, payments, and branding from Admin Hub.\", \"title\": \"AquaERP platform demo\", \"enabled\": false}','2026-06-11 09:52:51','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('branding','{\"app_name\": \"AquaERP Fisheries OS\", \"logo_url\": \"\", \"primary_color\": \"#0d9488\"}','2026-06-11 09:52:51','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('maintenance','{\"enabled\": false, \"message\": \"Scheduled maintenance completed. All systems operational.\"}','2026-06-11 09:52:51','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('recaptcha','{\"enabled\": false, \"siteKey\": \"\", \"version\": \"v3\", \"minScore\": 0.5, \"secretKey\": \"\", \"protectLogin\": true, \"protectRegister\": true, \"hostnameAllowlist\": [], \"protectGuestCheckout\": \"\\\"\\\\\\\"\\\\\\\\\\\\\\\"true\\\\\\\\\\\\\\\"\\\\\\\"\\\"\"}','2026-06-11 09:37:41',NULL),('signup','{\"locked\": false}','2026-06-11 09:52:51','4771d81c-81ef-495e-b938-7f4d1d3213d4');
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
INSERT INTO `product_catalog` VALUES ('1f6cf4e0-4f7f-451d-ad24-d7550786532d','057226cd-297c-4e8f-ab7f-82634d122166','9a796dcc-16c0-40c8-85e6-adbe98830b37','SKU-AQUAERP-DEMO','AquaERP Showcase Tenant Fresh Fillet','4f459680-7143-45f0-be35-b6628b97a0da','fresh','kg',470.00,NULL,NULL,NULL,'active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('60237843-160b-49bb-ad0c-a11118c88d85','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','d60ceda3-2de5-49b7-959e-8e965d70048c','SKU-LAMUSEA','Lamu Sea Ventures Fresh Fillet','9834489b-e7b5-41a1-8dc7-5c83916f5b9a','fresh','kg',460.00,NULL,NULL,NULL,'active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('e94c7e7a-b2a1-4eb6-8f83-5e81bc4ef259','29f5d064-5c7a-4505-831e-e6585baef2fe','2c2ccc7f-e600-4b84-a6c1-acd025f744aa','SKU-COASTFISH','Coast Fish Cooperative Fresh Fillet','2bcc6b91-6990-4169-845e-a1cb1e86ee9d','fresh','kg',450.00,NULL,NULL,NULL,'active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `purchase_order_lines` VALUES ('33a18787-0b22-4be8-85ee-e48539831689','172d0f59-70d0-4bf4-83e1-f7068228329b','Marine diesel',500.000,'L',120.00,60000.00),('f12bbb56-f275-41ad-acef-86b67a66b56c','f56c7431-6d12-4317-bd6c-698463614244','Marine diesel',500.000,'L',120.00,60000.00),('f445b78a-1f59-4da7-aad1-8736769d5bd7','0d2a4480-c0f6-483c-9ae4-3656b74c9314','Marine diesel',500.000,'L',120.00,60000.00);
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
INSERT INTO `purchase_orders` VALUES ('0d2a4480-c0f6-483c-9ae4-3656b74c9314','057226cd-297c-4e8f-ab7f-82634d122166','42ce9f90-fd39-40f5-aed7-c7cc736ebe17','PO-3','sent','KES',45000.00,7200.00,52200.00,'2026-06-18',NULL,'07f6fe69-0400-422b-9c1a-368f675aa4b1','2026-06-11 09:52:48','2026-06-11 09:52:48'),('172d0f59-70d0-4bf4-83e1-f7068228329b','29f5d064-5c7a-4505-831e-e6585baef2fe','e8c0259b-11ef-4d91-849a-30b07f75d64c','PO-1','received','KES',45000.00,7200.00,52200.00,'2026-06-18',NULL,'bdb34e24-9950-46a1-a0da-a609e93208e3','2026-06-11 09:52:46','2026-06-11 10:04:29'),('f56c7431-6d12-4317-bd6c-698463614244','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','219b55f9-37f1-4de4-9162-0eac50cd5741','PO-2','sent','KES',45000.00,7200.00,52200.00,'2026-06-18',NULL,'a22c2f55-b161-4c13-aa70-9aa461fca001','2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `purchase_requests` VALUES ('143a0699-f707-4147-9508-f194dde51ae7','29f5d064-5c7a-4505-831e-e6585baef2fe','PR-1','bdb34e24-9950-46a1-a0da-a609e93208e3','Operations','approved','2026-06-25','Fuel and ice for next trip','2026-06-11 09:52:46'),('9a519bd7-f2b2-4fb8-b315-7ef64f18ad10','057226cd-297c-4e8f-ab7f-82634d122166','PR-3','07f6fe69-0400-422b-9c1a-368f675aa4b1','Operations','approved','2026-06-25','Fuel and ice for next trip','2026-06-11 09:52:48'),('fe033a3e-b376-43e2-89f6-782dfc1aaadc','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','PR-2','a22c2f55-b161-4c13-aa70-9aa461fca001','Operations','approved','2026-06-25','Fuel and ice for next trip','2026-06-11 09:52:47');
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
INSERT INTO `sales_contracts` VALUES ('1d3e8422-a3c4-431f-8a84-eee08f419099','29f5d064-5c7a-4505-831e-e6585baef2fe','SC-COASTFISH','Kwale Wholesale Ltd','wholesale-coastfish@example.com',NULL,'f4d84297-f163-455c-9d1a-14f72ada7cf0','2bcc6b91-6990-4169-845e-a1cb1e86ee9d',400.00,5000.00,1200.00,'KES','active','2026-06-11','2026-12-08','Net 30',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('86093dd9-6931-4020-9429-f9caa22551bb','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','SC-LAMUSEA','Lamu Wholesale Ltd','wholesale-lamusea@example.com',NULL,'2d58df42-097b-4a0d-ae29-f865f6bb8b2a','9834489b-e7b5-41a1-8dc7-5c83916f5b9a',403.00,5000.00,1250.00,'KES','active','2026-06-11','2026-12-08','Net 30',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('c09ca500-59b8-4c02-96cc-e01b8272b5ed','057226cd-297c-4e8f-ab7f-82634d122166','SC-AQUAERP-DEMO','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com',NULL,'3abbd001-4c3c-42ca-a054-703a2192fcd7','4f459680-7143-45f0-be35-b6628b97a0da',406.00,5000.00,1300.00,'KES','active','2026-06-11','2026-12-08','Net 30',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48');
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
INSERT INTO `sessions` VALUES ('06dcfb53-65aa-4532-b044-fb6a5629d6a8','bdb34e24-9950-46a1-a0da-a609e93208e3','ce839ea8-a762-458b-a6ca-6b0cc207f952-a8576881-c3af-4d16-8068-3156d43ef30f','2026-06-18 13:09:53',NULL,NULL,'2026-06-11 10:09:52'),('1460b1ad-0d19-4f86-848a-fa2b8a35ff8d','a4be805d-2f00-4777-be82-1bda494d50f1','ce32d1c0-0e4e-45a9-bf5c-95ca6ff503a5-649f2fb6-e182-41db-9931-7f8b9412aa0d','2026-06-18 12:38:48','::1','node','2026-06-11 09:38:48'),('1687c103-5dc5-40a2-a601-09c2e76d6369','aa64c08b-dbf8-4c0c-9043-950f1abc259b','734d29fa-3026-4b84-8a03-51500eb44866-39d19100-9168-452d-9f49-b1ccc4fe15ab','2026-06-13 12:49:47','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:49:47'),('187e10da-349a-48e3-bc10-446326d2813d','554e08ea-02dd-4817-b0e7-24042ace45b4','a19caa61-9f6e-487d-8b3f-2a9cff5a0265-bab51b8e-a37c-4390-94b1-7dbd02297228','2026-06-15 11:50:01','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:50:01'),('4b61184b-80db-4430-8c7c-3f386be8480f','bdb34e24-9950-46a1-a0da-a609e93208e3','40fe0ff7-90fd-4928-80ee-b24ff5a25471-18d37417-4c39-4c56-861c-f078b9559e4a','2026-06-18 13:09:53',NULL,NULL,'2026-06-11 10:09:52'),('50d37d0e-2b3f-4e11-ace5-4aeb9d8ed2cc','bdb34e24-9950-46a1-a0da-a609e93208e3','7498efe1-ff33-4ff7-b381-6064e5226eaa-16ba59d6-4a2c-4a21-8d50-c064adc30c47','2026-06-18 13:09:53',NULL,NULL,'2026-06-11 10:09:52'),('5d7d05f8-7e05-4b54-965c-d8e721e769e5','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2','99a7a590-dd78-49aa-8be8-a9e9b028ba6d-c72bf62b-8ebc-4325-b9d7-fb2da2b72cc4','2026-06-15 12:28:38','::1','curl/8.20.0','2026-06-08 09:28:37'),('5ec0a18b-3df8-40ab-91a3-8e83b8e5308e','554e08ea-02dd-4817-b0e7-24042ace45b4','77011b5e-0834-48ef-8a38-539f53f072f5-4a19fa01-0726-4278-b2c2-5fb37934bbb1','2026-06-13 14:32:08',NULL,NULL,'2026-06-06 11:32:08'),('6a073708-9c0a-4507-89bd-16cf010e6996','4771d81c-81ef-495e-b938-7f4d1d3213d4','93e5e247-75d8-4981-82a1-d91f21bc75b8-f37cf419-562c-4b8e-b543-e82f95d1fe4d','2026-06-18 12:46:58','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:46:57'),('749ab3b3-916a-45a3-a12f-8d65e143039b','554e08ea-02dd-4817-b0e7-24042ace45b4','0f4263b0-9af5-4c62-9239-c56d7bc0123c-32fe630d-fd71-4d28-b97c-4e75022931a2','2026-06-15 12:00:34','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:00:33'),('7900a656-086f-449f-9925-609c424d734b','554e08ea-02dd-4817-b0e7-24042ace45b4','0c835561-d14c-4130-84d4-0c6af0b05ee3-b57ab67f-1d9d-4b10-bf7b-c7c7d9f9935f','2026-06-13 14:32:55','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:54'),('81beca20-730b-4ae2-bbc6-757143b5eb07','aa64c08b-dbf8-4c0c-9043-950f1abc259b','938467ae-d34f-4603-910b-120f5e4ad7e2-ac50748a-3f8a-43b7-a9e9-b7bc22673354','2026-06-13 12:09:50','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:50'),('889473ac-8228-4866-b554-90684ba26f41','bdb34e24-9950-46a1-a0da-a609e93208e3','3305a048-e081-4e28-a81c-7862541165bc-15ebf942-28ee-4c12-b45f-413955596522','2026-06-18 12:54:30','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:29'),('f6b28472-9b20-4d49-a273-0728ad8cba0e','4771d81c-81ef-495e-b938-7f4d1d3213d4','2209dd39-f544-462c-bf4b-c9a32128c06b-564c8e4f-0eb9-474a-866f-81cc351bc252','2026-06-13 11:51:00','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:51:00'),('fac83e6c-b111-4494-b8af-f00ed7d641b4','c9d59c3d-ede5-4815-9e6d-415ad71f15c5','0af34cc0-d0ad-4a6e-923a-f29ec45ba9a8-378c718f-932a-448a-86c4-d92853c714f2','2026-06-15 12:29:25','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:29:25');
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
INSERT INTO `storage_facilities` VALUES ('08bcb292-c367-43e5-8c13-42c2bf9478d7','29f5d064-5c7a-4505-831e-e6585baef2fe','Coast Fish Cooperative Cold Store','coastfish-cold','cold_room',12000.00,5200.00,'Kwale','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('e5ce21a0-18c1-4b49-a9b6-187039777954','057226cd-297c-4e8f-ab7f-82634d122166','AquaERP Showcase Tenant Cold Store','aquaerp-demo-cold','cold_room',12000.00,5200.00,'Mombasa','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('eb927ab4-a6d0-476d-82d7-62d4fd0ac899','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','Lamu Sea Ventures Cold Store','lamusea-cold','cold_room',12000.00,5200.00,'Lamu','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `storage_zones` VALUES ('2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-11 09:52:47'),('4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-11 09:52:47'),('543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954','057226cd-297c-4e8f-ab7f-82634d122166','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-11 09:52:48'),('65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7','29f5d064-5c7a-4505-831e-e6585baef2fe','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-11 09:52:46'),('7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954','057226cd-297c-4e8f-ab7f-82634d122166','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-11 09:52:48'),('a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7','29f5d064-5c7a-4505-831e-e6585baef2fe','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-11 09:52:46'),('bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7','29f5d064-5c7a-4505-831e-e6585baef2fe','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-11 09:52:46'),('d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954','057226cd-297c-4e8f-ab7f-82634d122166','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-11 09:52:48'),('e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-11 09:52:47');
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
INSERT INTO `suppliers` VALUES ('219b55f9-37f1-4de4-9162-0eac50cd5741','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','SUP-2','Coastal Ice & Fuel Supplies','Supply Desk','supplier-lamusea@example.com','+254720000001','KE',4.50,'active',NULL,'a22c2f55-b161-4c13-aa70-9aa461fca001','2026-06-11 09:52:47','2026-06-11 09:52:47'),('2c2ccc7f-e600-4b84-a6c1-acd025f744aa','29f5d064-5c7a-4505-831e-e6585baef2fe','VND-2c2ccc7f','Coast Fish Cooperative Seafood Shop','Demo Owner','owner-coastfish@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('42ce9f90-fd39-40f5-aed7-c7cc736ebe17','057226cd-297c-4e8f-ab7f-82634d122166','SUP-3','Coastal Ice & Fuel Supplies','Supply Desk','supplier-aquaerp-demo@example.com','+254720000002','KE',4.50,'active',NULL,'07f6fe69-0400-422b-9c1a-368f675aa4b1','2026-06-11 09:52:48','2026-06-11 09:52:48'),('93c3dccb-a0a7-4757-895c-856dd479243a','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','VND-93c3dccb','Lamu Sea Ventures Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('9a796dcc-16c0-40c8-85e6-adbe98830b37','057226cd-297c-4e8f-ab7f-82634d122166','VND-9a796dcc','AquaERP Showcase Tenant Seafood Shop','Demo Owner','owner-aquaerp-demo@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('d60ceda3-2de5-49b7-959e-8e965d70048c','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','VND-d60ceda3','Lamu Sea Ventures Seafood Shop','Demo Owner','owner-lamusea@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('d662f28a-b1cb-45de-85d7-680964678ab4','057226cd-297c-4e8f-ab7f-82634d122166','VND-d662f28a','AquaERP Showcase Tenant Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('e6f8b604-6c9f-44b8-bd99-811da1918e95','29f5d064-5c7a-4505-831e-e6585baef2fe','VND-e6f8b604','Coast Fish Cooperative Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('e8c0259b-11ef-4d91-849a-30b07f75d64c','29f5d064-5c7a-4505-831e-e6585baef2fe','SUP-1','Coastal Ice & Fuel Supplies','Supply Desk','supplier-coastfish@example.com','+254720000000','KE',4.50,'active',NULL,'bdb34e24-9950-46a1-a0da-a609e93208e3','2026-06-11 09:52:46','2026-06-11 09:52:46');
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
INSERT INTO `temperature_readings` VALUES ('0f69bc50-e569-435f-9f2d-2c26db5d0f64','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-41.40,55.00,'2026-06-11 05:52:47','iot'),('2a3a510a-d8fe-44b3-b92c-44490a3fd02c','057226cd-297c-4e8f-ab7f-82634d122166','d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954',-20.50,65.00,'2026-06-11 01:52:48','iot'),('2c4f4507-d0f1-45f3-8285-5512176361b1','29f5d064-5c7a-4505-831e-e6585baef2fe','65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7',2.00,85.00,'2026-06-10 21:52:46','iot'),('3acb9217-7ee7-4a16-a695-1fd77a963deb','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',1.60,85.00,'2026-06-11 05:52:47','iot'),('3fbd8739-c396-4598-9426-2d963e4adf96','057226cd-297c-4e8f-ab7f-82634d122166','7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954',-40.80,55.00,'2026-06-10 17:52:48','iot'),('4970826d-f546-4be8-8cd4-640a81699334','29f5d064-5c7a-4505-831e-e6585baef2fe','bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7',-20.90,65.00,'2026-06-11 09:52:46','iot'),('4bff2ed7-944f-4015-b6e7-fca85d39717e','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-41.00,55.00,'2026-06-10 21:52:47','iot'),('4d6f6777-9fd1-4454-b7a6-f392a0a909af','29f5d064-5c7a-4505-831e-e6585baef2fe','bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7',-20.10,65.00,'2026-06-10 17:52:46','iot'),('4de24d35-b977-41a1-8c6e-e9a5671377a2','29f5d064-5c7a-4505-831e-e6585baef2fe','65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7',1.80,85.00,'2026-06-11 01:52:46','iot'),('52e69673-5f2c-4589-b3fd-cee49ef55150','29f5d064-5c7a-4505-831e-e6585baef2fe','a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7',-41.00,55.00,'2026-06-10 21:52:46','iot'),('5ba53045-eb12-49b8-a50c-2fcb655650a2','057226cd-297c-4e8f-ab7f-82634d122166','7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954',-41.20,55.00,'2026-06-11 01:52:48','iot'),('64e0f7f5-d6db-4fb3-8368-20b14756c78a','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-20.90,65.00,'2026-06-11 09:52:47','iot'),('79c8f657-fbf6-463e-8cc7-35d45244fa73','29f5d064-5c7a-4505-831e-e6585baef2fe','a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7',-41.60,55.00,'2026-06-11 09:52:46','iot'),('7aadc6ca-faae-4149-ba60-435ccc20b873','057226cd-297c-4e8f-ab7f-82634d122166','7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954',-41.40,55.00,'2026-06-11 05:52:48','iot'),('7cc06695-6508-4562-8169-01781ec036e1','29f5d064-5c7a-4505-831e-e6585baef2fe','bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7',-20.50,65.00,'2026-06-11 01:52:46','iot'),('7f9b14ed-1f85-49f5-a4a0-8f7a680f3bfe','29f5d064-5c7a-4505-831e-e6585baef2fe','65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7',1.40,85.00,'2026-06-11 09:52:46','iot'),('808aba7e-fcc0-46e7-9ee6-574b51f2660e','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',1.40,85.00,'2026-06-11 09:52:47','iot'),('88495960-5ece-47c9-bb5f-797e7cf589e0','29f5d064-5c7a-4505-831e-e6585baef2fe','bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7',-20.70,65.00,'2026-06-11 05:52:46','iot'),('8ccd87a2-bead-419d-9d4e-d008e15fcb6b','29f5d064-5c7a-4505-831e-e6585baef2fe','a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7',-41.20,55.00,'2026-06-11 01:52:46','iot'),('993f1d7b-cd53-478f-a257-2ce9cf48bcd4','29f5d064-5c7a-4505-831e-e6585baef2fe','a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7',-40.80,55.00,'2026-06-10 17:52:46','iot'),('99dd2bd2-aaf8-460e-9d9e-5c35842bed7c','29f5d064-5c7a-4505-831e-e6585baef2fe','65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7',1.60,85.00,'2026-06-11 05:52:46','iot'),('9ccc5c65-adfc-4f59-8653-15ee0a5089bb','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-20.70,65.00,'2026-06-11 05:52:47','iot'),('9d28d575-6bf0-4cd3-aae3-7315c8b27038','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-20.30,65.00,'2026-06-10 21:52:47','iot'),('a05ef1f6-31d2-48a3-af8a-80e0f89596ed','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-41.60,55.00,'2026-06-11 09:52:47','iot'),('a4127edd-824a-42b6-ad29-85fbdd291429','057226cd-297c-4e8f-ab7f-82634d122166','543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954',2.00,85.00,'2026-06-10 21:52:48','iot'),('aeeb36c3-909a-4f00-aab2-2f8a48ce6ccc','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',2.20,85.00,'2026-06-10 17:52:47','iot'),('b022fe5e-d1d1-4096-a612-1fb0f6a3b0aa','057226cd-297c-4e8f-ab7f-82634d122166','d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954',-20.90,65.00,'2026-06-11 09:52:48','iot'),('b1cdfc39-8521-4aea-bfb1-ec9628d02e1e','057226cd-297c-4e8f-ab7f-82634d122166','543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954',1.60,85.00,'2026-06-11 05:52:48','iot'),('b73de22c-0645-40ee-a5f9-2dd6669dcf8f','057226cd-297c-4e8f-ab7f-82634d122166','543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954',1.40,85.00,'2026-06-11 09:52:48','iot'),('b96cbe31-28b7-4395-bc91-70928220b60b','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-40.80,55.00,'2026-06-10 17:52:47','iot'),('bc0cb34f-3bde-42bb-906a-e6d63d62e397','057226cd-297c-4e8f-ab7f-82634d122166','d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954',-20.10,65.00,'2026-06-10 17:52:48','iot'),('bd45acc0-9e11-4919-8966-d7a8a41793aa','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-20.10,65.00,'2026-06-10 17:52:47','iot'),('c147b09b-2538-4517-9430-1d2d1e34e861','057226cd-297c-4e8f-ab7f-82634d122166','7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954',-41.60,55.00,'2026-06-11 09:52:48','iot'),('c1d2343f-58c4-470d-8d97-7701a2b47871','057226cd-297c-4e8f-ab7f-82634d122166','543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954',1.80,85.00,'2026-06-11 01:52:48','iot'),('c9957582-e640-422b-903d-c259a39ae4ae','057226cd-297c-4e8f-ab7f-82634d122166','d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954',-20.30,65.00,'2026-06-10 21:52:48','iot'),('caf591fd-9d35-44de-b400-79988ca62b14','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','2b5643e7-5f06-4b70-a442-fa733bc4424b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-41.20,55.00,'2026-06-11 01:52:47','iot'),('cb8c55cf-40e2-42fe-b5d3-ffe7c8f043e3','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',1.80,85.00,'2026-06-11 01:52:47','iot'),('cc0863c6-dd7b-430c-a5a3-06543e96cb25','057226cd-297c-4e8f-ab7f-82634d122166','543a07ba-8fae-41d0-bb2d-3834198ae53b','e5ce21a0-18c1-4b49-a9b6-187039777954',2.20,85.00,'2026-06-10 17:52:48','iot'),('cea1d592-7d9d-46bf-bb70-8be3ff9c157f','29f5d064-5c7a-4505-831e-e6585baef2fe','bc30c612-e917-4697-ac21-35229124987d','08bcb292-c367-43e5-8c13-42c2bf9478d7',-20.30,65.00,'2026-06-10 21:52:46','iot'),('cf89f5df-7172-49e1-81fa-6ed3b3452be4','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','4806b28c-f1fa-4b3b-9aa7-897a36cd5a5b','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',-20.50,65.00,'2026-06-11 01:52:47','iot'),('d3deb267-1e6d-42a1-a177-a27ff345a66d','057226cd-297c-4e8f-ab7f-82634d122166','d2abc491-8c0b-47e4-a4aa-15f6613c1845','e5ce21a0-18c1-4b49-a9b6-187039777954',-20.70,65.00,'2026-06-11 05:52:48','iot'),('e2c48053-61a9-4c90-96c6-01452026b27c','057226cd-297c-4e8f-ab7f-82634d122166','7080fcbc-f8f9-46d6-8a2a-08b56fd4cee9','e5ce21a0-18c1-4b49-a9b6-187039777954',-41.00,55.00,'2026-06-10 21:52:48','iot'),('e742b540-ed7f-4b9c-ad8d-bf4a8c938a60','29f5d064-5c7a-4505-831e-e6585baef2fe','65594cdb-4682-4c77-a767-06d1c72c97ef','08bcb292-c367-43e5-8c13-42c2bf9478d7',2.20,85.00,'2026-06-10 17:52:46','iot'),('f2ca59b2-2ccd-4c2a-b863-aef8f88a6bff','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','e50804b7-d577-464e-a88d-0d76660e6253','eb927ab4-a6d0-476d-82d7-62d4fd0ac899',2.00,85.00,'2026-06-10 21:52:47','iot'),('f6c46c8b-ecef-4453-9afd-ab664bc4442b','29f5d064-5c7a-4505-831e-e6585baef2fe','a69e7435-0cf6-4178-a7cd-e4648ee00ec5','08bcb292-c367-43e5-8c13-42c2bf9478d7',-41.40,55.00,'2026-06-11 05:52:46','iot');
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
INSERT INTO `tenant_feature_flags` VALUES ('057226cd-297c-4e8f-ab7f-82634d122166','advanced_analytics',1,'2026-06-11 09:52:48'),('057226cd-297c-4e8f-ab7f-82634d122166','ai',1,'2026-06-11 09:52:48'),('057226cd-297c-4e8f-ab7f-82634d122166','marketplace',1,'2026-06-11 09:52:48'),('29f5d064-5c7a-4505-831e-e6585baef2fe','advanced_analytics',1,'2026-06-11 09:52:46'),('29f5d064-5c7a-4505-831e-e6585baef2fe','ai',1,'2026-06-11 09:52:46'),('29f5d064-5c7a-4505-831e-e6585baef2fe','marketplace',1,'2026-06-11 09:52:46'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','advanced_analytics',1,'2026-06-11 09:52:47'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','ai',1,'2026-06-11 09:52:47'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','marketplace',1,'2026-06-11 09:52:47');
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
INSERT INTO `tenant_members` VALUES ('0010c512-667b-4e9b-902f-044086b8e8ca','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1','0485530c-bf9e-4525-8935-0fa5bbaba033','tenant_owner','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48','2026-06-11 09:52:48'),('04a6a764-9b14-47dc-b757-81e7d0163f5a','057226cd-297c-4e8f-ab7f-82634d122166','554e08ea-02dd-4817-b0e7-24042ace45b4','0485530c-bf9e-4525-8935-0fa5bbaba033','customer','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48','2026-06-11 09:52:48'),('2edbc02d-63d5-4b3f-aef6-747a6be7e573','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3','a2b17273-e7a5-4600-a88d-4ed919459d1b','tenant_owner','active',NULL,'2026-06-11 09:52:45','2026-06-11 09:52:45','2026-06-11 09:52:45'),('38ceb69e-0270-4935-8d38-35504bbce37c','29f5d064-5c7a-4505-831e-e6585baef2fe','554e08ea-02dd-4817-b0e7-24042ace45b4','a2b17273-e7a5-4600-a88d-4ed919459d1b','customer','active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46','2026-06-11 09:52:46'),('4499b781-244f-4e77-ae51-ea06ec33b36d','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','554e08ea-02dd-4817-b0e7-24042ace45b4','b85ae78d-3444-459a-ab27-fc0660280489','customer','active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47','2026-06-11 09:52:47'),('6902798f-54ca-4c39-867d-f6d1ef1c3e53','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','b85ae78d-3444-459a-ab27-fc0660280489','vendor','active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47','2026-06-11 09:52:47'),('73a0b9c0-331f-4aaf-95fd-ba3aa4e606ae','057226cd-297c-4e8f-ab7f-82634d122166','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','0485530c-bf9e-4525-8935-0fa5bbaba033','vendor','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:48','2026-06-11 09:52:48'),('7e2ab008-be37-49a0-8dad-c6db078981bd','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001','b85ae78d-3444-459a-ab27-fc0660280489','tenant_owner','active',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:47','2026-06-11 09:52:47'),('b4049d3f-1b62-4097-8438-ea4e1d505910','29f5d064-5c7a-4505-831e-e6585baef2fe','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','a2b17273-e7a5-4600-a88d-4ed919459d1b','vendor','active',NULL,'2026-06-11 09:52:46','2026-06-11 09:52:46','2026-06-11 09:52:46'),('tm-4771d81c-81ef-495e-b938-7f4d1d321','tenant-default-0001','4771d81c-81ef-495e-b938-7f4d1d3213d4',NULL,'tenant_owner','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-554e08ea-02dd-4817-b0e7-24042ace4','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-9c2fcb6b-12f2-44b2-8f42-9f11d7c8f','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-aa64c08b-dbf8-4c0c-9043-950f1abc2','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c7b4bb8e-69d8-4a0a-9251-4daa2f4ff','tenant-default-0001','c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c9d59c3d-ede5-4815-9e6d-415ad71f1','tenant-default-0001','c9d59c3d-ede5-4815-9e6d-415ad71f15c5',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-cb9c667d-d1d9-4f4f-91d0-c60928a78','tenant-default-0001','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39');
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
INSERT INTO `tenant_onboarding` VALUES ('057226cd-297c-4e8f-ab7f-82634d122166',1,'[1, 2, 3]','cooperative','2026-06-11 09:52:48','2026-06-11 09:52:48'),('29f5d064-5c7a-4505-831e-e6585baef2fe',1,'[1, 2, 3]','cooperative','2026-06-11 09:52:46','2026-06-11 09:52:46'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7',1,'[1, 2, 3]','fisherman','2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `tenant_role_permissions` VALUES ('057226cd-297c-4e8f-ab7f-82634d122166','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:48','2026-06-11 09:52:48'),('057226cd-297c-4e8f-ab7f-82634d122166','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:48','2026-06-11 09:52:48'),('29f5d064-5c7a-4505-831e-e6585baef2fe','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:46','2026-06-11 09:52:46'),('29f5d064-5c7a-4505-831e-e6585baef2fe','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:46','2026-06-11 09:52:46'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:47','2026-06-11 09:52:47'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-11 09:52:47','2026-06-11 09:52:47');
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
INSERT INTO `tenant_storefront_settings` VALUES ('057226cd-297c-4e8f-ab7f-82634d122166','ocean-classic','AquaERP Showcase Tenant','Fresh catch from Mombasa',NULL,NULL,NULL,'Welcome to AquaERP Showcase Tenant',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-11 09:52:48','2026-06-11 09:52:48'),('29f5d064-5c7a-4505-831e-e6585baef2fe','ocean-classic','Coast Fish Cooperative','Fresh catch from Kwale',NULL,NULL,NULL,'Welcome to Coast Fish Cooperative',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-11 09:52:46','2026-06-11 09:52:46'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','ocean-classic','Lamu Sea Ventures','Fresh catch from Lamu',NULL,NULL,NULL,'Welcome to Lamu Sea Ventures',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-11 09:52:47','2026-06-11 09:52:47'),('tenant-default-0001','ocean-classic','AquaERP Fresh Market','From ocean to table — fully traceable seafood',NULL,NULL,NULL,'Fresh catch, delivered with cold-chain care','Browse species landed today. Every kilo traced from boat to your door.','Shop fresh catch','#products',NULL,1,1,1,'We use cookies for cart and analytics. By continuing you accept our privacy policy.',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-06 08:46:42','2026-06-06 08:46:42');
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
INSERT INTO `tenants` VALUES ('057226cd-297c-4e8f-ab7f-82634d122166','aquaerp-demo','AquaERP Showcase Tenant','AquaERP Showcase Tenant','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','enterprise','active',NULL,'2026-06-11 09:52:48','2026-06-11 09:52:51'),('29f5d064-5c7a-4505-831e-e6585baef2fe','coastfish','Coast Fish Cooperative','Coast Fish Cooperative','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','enterprise','active',NULL,'2026-06-11 09:52:45','2026-06-11 09:52:51'),('bfb46d3d-b38c-4564-8d7d-f1206c906eb7','lamusea','Lamu Sea Ventures','Lamu Sea Ventures','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','trial','pending',NULL,'2026-06-11 09:52:47','2026-06-11 09:52:51');
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
INSERT INTO `traceability_lots` VALUES ('04b0c2c6-4b5e-4a3a-8733-8a9f6f607b24','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','LOT-LAMUSEA-001','298662f0-73f2-4609-8d99-925eccd32221','lamusea Tilapia','Lamu Sea Ventures Vessel','Lamu Landing','2026-06-08','A',1,'FAO-51',-22.00,'active','2026-06-11 09:52:47'),('c32a2354-37a5-4c52-b9fe-ab59ab2790ba','29f5d064-5c7a-4505-831e-e6585baef2fe','LOT-COASTFISH-001','8cd8d9fb-5147-43e0-ba09-0af3af097ac0','coastfish Nile Perch','Coast Fish Cooperative Vessel','Kwale Landing','2026-06-09','A',1,'FAO-51',-22.00,'active','2026-06-11 09:52:46'),('cbdbde74-b0ee-40fc-b70b-f544c74da474','057226cd-297c-4e8f-ab7f-82634d122166','LOT-AQUAERP-DEMO-001','5e625188-a09b-46fd-9a0d-a5b9c29f5d61','aquaerp-demo Tilapia','AquaERP Showcase Tenant Vessel','Mombasa Landing','2026-06-07','A',1,'FAO-51',-22.00,'active','2026-06-11 09:52:48');
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
INSERT INTO `users` VALUES ('07f6fe69-0400-422b-9c1a-368f675aa4b1','owner-aquaerp-demo@demo.aquaerp.local','$2b$12$6Amq1e6vzRo05i2RKt7c3OG39mZDVE0LdPbpm25ecxVMleFKO1UcC','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-05-29 14:31:00','2026-06-11 09:52:52',NULL,NULL),('4771d81c-81ef-495e-b938-7f4d1d3213d4','admin@aqualedger.co.ke','$2b$12$swwEUpMxQB6D3921B5XEuuorxXbxuKu8xK.84YlBI7FCYjUK6dqym','Platform','Admin',NULL,NULL,'super_admin','active',NULL,1,0,'2026-06-06 08:48:44','2026-06-11 09:46:57','2026-06-11 09:46:57',NULL),('554e08ea-02dd-4817-b0e7-24042ace45b4','buyer-b2b@demo.aquaerp.local','$2b$12$qBuv.bcxTC6C7TpxGiPcceDbvGd62mjIOA8f0s39jqqmUPdxGm0Cy','B2B','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 09:08:12','2026-06-08 09:14:05','2026-06-08 09:14:05',NULL),('9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','vendor@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Vendor',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-08 08:34:44','2026-06-08 08:34:44',NULL),('a22c2f55-b161-4c13-aa70-9aa461fca001','owner-lamusea@demo.aquaerp.local','$2b$12$6Amq1e6vzRo05i2RKt7c3OG39mZDVE0LdPbpm25ecxVMleFKO1UcC','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-05-31 12:17:00','2026-06-11 09:52:52',NULL,NULL),('a4be805d-2f00-4777-be82-1bda494d50f1','synctest-vendor@test.com','$2b$12$/QECwINL7HKUAPCbYX3Gq.ZSsicdbzr7Afa.eaNmz9zo9Bffa3qLS','SyncTest','VendorContact','+254700000002',NULL,'user','active',NULL,1,0,'2026-05-30 13:24:00','2026-06-11 09:38:48','2026-06-11 09:38:48',NULL),('aa64c08b-dbf8-4c0c-9043-950f1abc259b','buyer@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-06 10:14:03','2026-06-06 10:14:03',NULL),('bdb34e24-9950-46a1-a0da-a609e93208e3','owner-coastfish@demo.aquaerp.local','$2b$12$6Amq1e6vzRo05i2RKt7c3OG39mZDVE0LdPbpm25ecxVMleFKO1UcC','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-05-30 13:24:00','2026-06-11 10:09:52','2026-06-11 10:09:52',NULL),('c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75','jane.smith.new99@gmail.com','$2b$12$WTaILh0Z4jFVOqauaWNSzOCvCJrfPWThNRQiDTFdddIsBHo8CwFnO','Jane','Smith',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:24:57','2026-06-08 09:24:57',NULL,NULL),('c9d59c3d-ede5-4815-9e6d-415ad71f15c5','johndoe@gmail.com','$2b$12$YFf1yamaOgg/teRM/6YEieBBtnCgg5ztyg4rGjF5Rm/btdHWIsoWu','John','Doe','254112576616',NULL,'user','active',NULL,0,0,'2026-06-08 09:24:24','2026-06-08 09:29:25','2026-06-08 09:29:25',NULL),('cb9c667d-d1d9-4f4f-91d0-c60928a78ed2','alice.buyer.fresh@test.com','$2b$12$UJdiXxfSMJ/rDzr.KSeA6uLEALSe3v56LxJ10Vx05/mKVg7baLQQO','Alice','Buyer',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:28:37','2026-06-08 09:28:37','2026-06-08 09:28:37',NULL);
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
INSERT INTO `wallets` VALUES ('0491bbc3-666e-49ac-a4e2-0e72a138b4fc','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',100000.00,'KES','active','2026-06-06 09:08:12','2026-06-06 09:08:12'),('51088406-2d74-4eab-9abf-540a15e25687','057226cd-297c-4e8f-ab7f-82634d122166','07f6fe69-0400-422b-9c1a-368f675aa4b1',28000.00,'KES','active','2026-06-11 09:52:49','2026-06-11 09:52:49'),('64cf05c3-4839-4b3b-a735-887eb59735f6','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',0.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:46'),('71bcba05-15cd-4843-95a7-26522a4f06ba','','4771d81c-81ef-495e-b938-7f4d1d3213d4',0.00,'KES','active','2026-06-11 08:55:01','2026-06-11 08:55:01'),('920df1f2-e3c7-4dd2-9a8c-dda1692a7529','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',100000.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:47'),('c58f63e2-160f-456a-9395-52a758b1a9b5','bfb46d3d-b38c-4564-8d7d-f1206c906eb7','a22c2f55-b161-4c13-aa70-9aa461fca001',26500.00,'KES','active','2026-06-11 09:52:48','2026-06-11 09:52:48'),('facc1463-4a37-494b-8ee6-546f9ef0b091','29f5d064-5c7a-4505-831e-e6585baef2fe','bdb34e24-9950-46a1-a0da-a609e93208e3',25000.00,'KES','active','2026-06-11 09:52:47','2026-06-11 09:52:47');
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

-- Dump completed on 2026-06-11 15:51:44
