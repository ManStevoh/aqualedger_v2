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
INSERT INTO `ai_automation_runs` VALUES ('28fa8bde-2fff-432c-803b-347b09a2172c','11f852eb-f735-4923-9fa4-538582e42160','success',3,NULL,NULL,'2026-06-28 20:02:39'),('4131c782-461d-45ec-babd-a817ec61d4aa','b21fe9c1-79b2-490e-a254-87df2e52b4d9','success',3,NULL,NULL,'2026-06-28 20:02:38'),('ced15ae8-574e-418c-8dcd-0092453648c0','12495be8-694e-4b73-b391-62f36e6c42e2','success',3,NULL,NULL,'2026-06-28 20:02:40');
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
INSERT INTO `ai_insights` VALUES ('98a4ed05-917e-43d1-9666-7f61f9cf37ad','12495be8-694e-4b73-b391-62f36e6c42e2','business_brief',NULL,'Weekly operations brief','Demo insight for AquaERP Showcase Tenant: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-28 20:02:39'),('ccdd8a28-c9d8-441c-949b-52be9d1b48a1','11f852eb-f735-4923-9fa4-538582e42160','business_brief',NULL,'Weekly operations brief','Demo insight for Lamu Sea Ventures: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-28 20:02:39'),('db30002c-ac76-4ba8-9454-83188fb036e9','b21fe9c1-79b2-490e-a254-87df2e52b4d9','business_brief',NULL,'Weekly operations brief','Demo insight for Coast Fish Cooperative: catch and cold-chain metrics are within target.','[\"Schedule next trip within 48h\", \"Review zone A temperature logs\"]','{\"trips\": 1, \"orders\": 1, \"coldchain_alerts\": 1}','rules_and_statistics_v1','2026-06-28 20:02:38');
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
INSERT INTO `audit_logs` VALUES ('03b6b01c-1f09-487c-9a04-5e7140ced8f6',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:44:53',NULL),('07ada44e-5748-4657-ba64-c1a8d31f46b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:02:51',NULL),('0f28145f-082b-46e9-84cd-a47cd8b71448','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:59:52',NULL),('1750c4e0-96e2-4cab-a47d-e3953b92471e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('17ac9186-0e17-47e0-b2aa-b8de2cafaf91','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:49:47',NULL),('19d4f46d-218a-46e9-a284-6593fd17a113',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:00',NULL),('1a0d2317-9e68-4a3d-bbe2-deda6be093e8','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:02:54',NULL),('1a24f00a-6e94-41a1-9d27-facaf2a50560','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:04:04',NULL),('1b05b6d0-16ae-43e5-a4e9-1d8d914bdb44',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:05:00',NULL),('1d173ef0-b419-4a09-b600-13a643466100','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:54',NULL),('2161c97d-d1e0-4344-8911-c30a8cc63c6d',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:50:44',NULL),('28c2e509-6fb9-45c0-b3c3-4afacb8284ce','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:47',NULL),('2cab92a1-0f84-4960-b08b-fb07623d8dec','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:16:41',NULL),('2ed562b3-9adb-40c3-a1b3-9d2fc981d914',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:04',NULL),('3106e6fb-45cf-4e3b-9465-8f5114fcc68d','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:31',NULL),('345a084f-79e3-4c7e-8ad6-98617959eeb7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:09:50',NULL),('34c0875b-99e1-4a39-bdbf-59f1689b3b32',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:23',NULL),('39d12abd-5211-4b91-b276-9ff735252505',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:03:48',NULL),('3a3bd62e-1fcc-4ed2-be30-f7ca4b30c2bb',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:17:00',NULL),('3bb29656-01d3-4b63-a380-f083dd1adecc',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:19',NULL),('4056d16a-afb1-4604-b0ee-cd3c004426cd','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:50:30',NULL),('456f0ca5-5a83-44c0-85cf-e935a6252b3a',NULL,'auth.login','user','8f141814-cdc3-4b44-b9a1-6a55466d1829','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:21:40',NULL),('4707dfde-ba6d-499b-84db-187d9944ae32','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:43:46',NULL),('48db875c-409e-4333-95d5-a007fc755a33','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:25',NULL),('4f555a9c-faae-4154-911b-f8f95d278252','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:03:16',NULL),('51b820cb-1810-4d23-827c-7d64a70acb89',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:02',NULL),('52729f1e-415a-4b10-903f-428641c7769b',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('5c30cc25-0951-46fd-a7e2-c5180ec51ef5','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.logout','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,NULL,NULL,'2026-06-08 08:43:34',NULL),('619cc45a-7f2b-4647-b6a2-3cfaa349978b','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"admin@aqualedger.co.ke\"}','127.0.0.1','seed-script','2026-06-27 10:07:00',NULL),('61fd92e5-907d-4ad6-ab0b-2dc8e52d08d0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:14:49',NULL),('641718d1-872a-4e55-a9ee-bed2818e443f',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:20',NULL),('65698fcc-0dd3-446f-87e8-3616e292cbd4',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:30',NULL),('65dcddb3-1736-4355-94fe-95be68228fc1','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 10:13:55',NULL),('6a4c31c8-be87-4d78-9815-47bef3ff49d2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:15:47',NULL),('7159ff5b-4db6-43a7-93d9-fef56eb3dfef',NULL,'auth.logout','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92',NULL,NULL,NULL,'2026-06-06 08:59:43',NULL),('72d6993f-6ec3-4d50-8bd0-119b6c74821e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 10:03:13',NULL),('766bd93b-4c52-407f-b1fa-df6e5e8a5746','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 11:32:22',NULL),('78584340-1d94-426a-9a95-a969cfc6d6b7','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:53:45',NULL),('89cd6038-3641-4475-9896-bbb15b131f1a','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:51:00',NULL),('914e9591-3d0f-49ea-8777-feb4e6452c1c',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:22',NULL),('9840d001-18cd-487e-ad61-8f6a77916e5d','a4be805d-2f00-4777-be82-1bda494d50f1','auth.login','user','a4be805d-2f00-4777-be82-1bda494d50f1','{\"rememberMe\": false}','::1','node','2026-06-11 09:38:48',NULL),('9ba4b484-964b-45d4-9b9a-def887173282',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:24',NULL),('9c7037dd-f900-4fb8-a099-f395cbca14a5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('a048e633-abc8-4802-ae7e-a8276e350455','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:14:03',NULL),('a0d3fe9e-00de-4e16-860d-896ce8034549',NULL,'auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:40',NULL),('a673e114-6621-4369-a7ee-e093f9c1de2e','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:22',NULL),('b5b0d7a6-4795-4049-b2fe-81d9a85056b2',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:59:53',NULL),('b6b7049f-f9e0-4246-b23b-8cdb4a2b1b93','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 09:16:44',NULL),('b8f5a177-ea6a-4a33-9fdc-146ee8785290',NULL,'auth.login','user','078037fa-4cf8-46ab-b5cd-52e1deb6aa92','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 08:52:29',NULL),('bcf94c94-6049-45fa-833f-9002fc18c98d','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','auth.login','user','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:34:44',NULL),('be5eff73-a5b5-4a7c-a596-d5995b71e77b','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:09',NULL),('bf27ef63-deb3-41b8-a5e7-d510b9f0bcc9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:19:01',NULL),('c3b15858-8b86-4b36-a76d-8d353266f0bf',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:48',NULL),('cb34bc83-de9e-4dcb-8125-db78e214f49d',NULL,'auth.login','user','bdb34e24-9950-46a1-a0da-a609e93208e3','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:54:29',NULL),('ce2b637f-37d6-4aee-bdfb-6d93ca292255',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 08:47:14',NULL),('cf34d672-3619-4463-951a-23c6fa145fe1',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:01',NULL),('cfce88b9-cf33-4ebb-a52a-bb515526a272','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 11:32:46',NULL),('d58effb8-8aaf-4ed0-93bb-6f5a3d0cb890','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:04:19',NULL),('dad5980f-f81e-41bb-b807-9f419d0274b5',NULL,'auth.login','user','2dc8d6eb-1679-425c-80d1-8ee428e13664','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:45:18',NULL),('dbdb9f8e-3e1e-4593-ab7f-f844110f3ec0',NULL,'auth.logout','user','a652b08b-76db-4db2-9413-03376be3b051',NULL,NULL,NULL,'2026-06-08 08:49:48',NULL),('dc3d5363-cfbd-4886-be6b-abdaf07e3548','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.login','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 09:50:10',NULL),('dc4e54e6-7953-489a-808e-6ce8e55cf2a7','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:00:33',NULL),('dd900aaa-8975-443a-b280-2b1521add9d5','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','user','4771d81c-81ef-495e-b938-7f4d1d3213d4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-11 09:46:57',NULL),('e2e072f3-a150-4030-bdbf-3bc617fc8b49','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-06 09:53:41',NULL),('e451e139-38ac-4fd1-acae-5e297d0e1af9','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-06 10:04:10',NULL),('e4fb8552-2820-437d-9bd5-9ee5ae56239e',NULL,'auth.login','user','977fec5e-4e68-4110-a44a-4242f3954e77','{\"rememberMe\": false}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36','2026-06-11 08:47:03',NULL),('e59f7298-26ee-4aad-bfa3-e3b55a3c0e05','aa64c08b-dbf8-4c0c-9043-950f1abc259b','auth.logout','user','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,NULL,NULL,'2026-06-06 09:09:38',NULL),('e6f7c7a6-e36c-4540-921a-4732ffe37c0e','4771d81c-81ef-495e-b938-7f4d1d3213d4','auth.login','session',NULL,'{\"seed\": \"super-admin-platform\", \"email\": \"admin@aqualedger.co.ke\"}','127.0.0.1','seed-script','2026-06-26 10:07:00',NULL),('e7de1a14-f194-4b5f-9a67-50ed833cd896','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:50:01',NULL),('e886658c-e170-4185-9c9d-cc53057c1773','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 08:03:09',NULL),('eb6198ce-11d4-4cbe-992c-bf003b2dd5b0','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.login','user','554e08ea-02dd-4817-b0e7-24042ace45b4','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:14:05',NULL),('efed8b87-e5a2-488c-81a6-ef2863feb446',NULL,'auth.login','user','a652b08b-76db-4db2-9413-03376be3b051','{\"rememberMe\": false}','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','2026-06-08 09:09:17',NULL),('f3ec824c-1a5c-4507-a0f4-f443444f7432','554e08ea-02dd-4817-b0e7-24042ace45b4','auth.logout','user','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,NULL,NULL,'2026-06-08 08:44:09',NULL);
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
INSERT INTO `bmu` VALUES ('1ab16b27-8bab-46f1-94f9-08fe988c7243','b21fe9c1-79b2-490e-a254-87df2e52b4d9','Kwale BMU','coastfish-bmu','Kwale','83ab655f-845d-4ec5-ac83-904b755c1a16','active',40,5,NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('51951d96-16d5-4fd6-ad6e-5e54f0751cb0','12495be8-694e-4b73-b391-62f36e6c42e2','Mombasa BMU','aquaerp-demo-bmu','Mombasa','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','active',44,7,NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('bfeb3a1c-0e89-4edc-b809-b6e3b473a7f5','11f852eb-f735-4923-9fa4-538582e42160','Lamu BMU','lamusea-bmu','Lamu','c45658ae-e152-4f0a-89cd-c8318545b516','active',42,6,NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `boat_crew` VALUES ('03cea574-6ff2-4d14-b33f-bea7cef4a437','8439ffd3-cba3-46ad-b939-376a05a31c41','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('0bb8657d-784d-4eef-a1e0-c4e6367155da','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('1fd4369a-5021-49af-89c1-331c7dde501a','47ef4c68-3ee3-4870-9046-2ea5ac7184df','a8925060-2a3a-4829-a50f-3530a67d147b','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('24a1ecb6-19d5-4133-b0ce-2c4e2e651b27','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('56b13231-059e-4ccf-ac18-39ded76c6510','2092182a-b03e-43c1-9df0-42929ea3818c','02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('675168b1-a9f4-44b0-a739-db8d15f2691d','8439ffd3-cba3-46ad-b939-376a05a31c41','02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('8f2ac076-70af-4eca-988d-e477c9ec1685','8439ffd3-cba3-46ad-b939-376a05a31c41','77b36613-6a88-46c2-9ea8-8a0edaf28dfa','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('ae3d2db2-0b5e-4e67-8fe2-e61d4483e50c','8439ffd3-cba3-46ad-b939-376a05a31c41','a8925060-2a3a-4829-a50f-3530a67d147b','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('aec4c7f8-07e7-45a4-b4b6-2b7e12a38608','47ef4c68-3ee3-4870-9046-2ea5ac7184df','02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('de512406-a1d7-4f0c-891a-663cc1b5d44e','2092182a-b03e-43c1-9df0-42929ea3818c','a8925060-2a3a-4829-a50f-3530a67d147b','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('e2b9aaf1-3de7-49a1-8572-fe773207fb96','47ef4c68-3ee3-4870-9046-2ea5ac7184df','77b36613-6a88-46c2-9ea8-8a0edaf28dfa','deckhand','active','2026-06-28','2026-06-28 20:02:40'),('f049f5b4-6dad-4b8b-99b9-9d2959357cd9','2092182a-b03e-43c1-9df0-42929ea3818c','77b36613-6a88-46c2-9ea8-8a0edaf28dfa','deckhand','active','2026-06-28','2026-06-28 20:02:40');
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
INSERT INTO `boats` VALUES ('0949445a-9e95-4a3d-aa10-11ba374a0dfb','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','KEN-DEMO-002','Lamu Sea Ventures Vessel','fiber',425,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('208268ef-f228-4e66-9222-0f003acd2f1b','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','KEN-DEMO-001','Coast Fish Cooperative Vessel','fiber',400,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('2092182a-b03e-43c1-9df0-42929ea3818c','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','KEN-MB-002','Mombasa Wave','fiber',600,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('47ef4c68-3ee3-4870-9046-2ea5ac7184df','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','KEN-MB-004','Likoni Express','wooden',450,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('8439ffd3-cba3-46ad-b939-376a05a31c41','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','KEN-MB-003','Nyali Explorer','fiber',800,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('84d88956-cb9b-4069-945c-b3b057d32cf8','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','KEN-DEMO-003','AquaERP Showcase Tenant Vessel','fiber',450,NULL,NULL,NULL,NULL,1,NULL,'active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `branches` VALUES ('27a9307a-a420-4a61-9451-34b2c0064968','b21fe9c1-79b2-490e-a254-87df2e52b4d9','HQ','Coast Fish Cooperative HQ','headquarters',NULL,NULL,'active','2026-06-28 20:02:37','2026-06-28 20:02:37'),('642f1048-b22a-4828-a17a-e86ad5123ceb','11f852eb-f735-4923-9fa4-538582e42160','HQ','Lamu Sea Ventures HQ','headquarters',NULL,NULL,'active','2026-06-28 20:02:38','2026-06-28 20:02:38'),('65dc10a3-fde3-4318-ba99-e96fe2aeeebe','12495be8-694e-4b73-b391-62f36e6c42e2','HQ','AquaERP Showcase Tenant HQ','headquarters',NULL,NULL,'active','2026-06-28 20:02:39','2026-06-28 20:02:39'),('branch-hq-0001','tenant-default-0001','HQ','Headquarters','headquarters',NULL,NULL,'active','2026-06-06 08:45:17','2026-06-06 08:45:17');
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
INSERT INTO `catch_quotas` VALUES ('11f7fece-6591-4514-8e2d-061a3585297c','12495be8-694e-4b73-b391-62f36e6c42e2','AquaERP Showcase Tenant Annual Quota','83ce2051-281a-41de-8ee5-050626d2ca3c','Inshore','annual','2026-05-29','2027-05-29',52000.00,'Kenya Fisheries','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('b17782c3-3afb-4302-ae2c-dcb0a90c42d4','11f852eb-f735-4923-9fa4-538582e42160','Lamu Sea Ventures Annual Quota','6c308128-0d27-4015-b80a-107cf297394c','Inshore','annual','2026-05-29','2027-05-29',51000.00,'Kenya Fisheries','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('f2bde570-3d44-4e6e-b6c6-8d0098a552e5','b21fe9c1-79b2-490e-a254-87df2e52b4d9','Coast Fish Cooperative Annual Quota','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e','Inshore','annual','2026-05-29','2027-05-29',50000.00,'Kenya Fisheries','active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `catches` (`id`, `tenant_id`, `trip_id`, `species_id`, `quantity_kg`, `grade`, `unit_price`, `storage_method`, `recorded_by`, `created_at`) VALUES ('00e8f0b6-db84-4018-9362-777386338a49','12495be8-694e-4b73-b391-62f36e6c42e2','f9f5b446-fb9e-4728-acb8-bcc41d2ed14a','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',171.00,'A',502.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-05 04:53:00'),('042816c6-1ad6-4249-b4da-b6504c1f1744','12495be8-694e-4b73-b391-62f36e6c42e2','6bfbf775-cc80-4bd2-9f80-9dcddb6a926c','ca801c62-4773-41aa-b017-c98eec91def1',228.00,'A',456.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-02 05:55:00'),('06085147-4f0c-4205-adec-94f9d872e16e','12495be8-694e-4b73-b391-62f36e6c42e2','8cca9730-9474-4482-a3ea-d2cb09530ef9','ca801c62-4773-41aa-b017-c98eec91def1',156.00,'B',358.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-14 06:12:00'),('0f02d623-45ff-4a0a-a9b9-a6643a63c1e3','12495be8-694e-4b73-b391-62f36e6c42e2','bd7f85db-d072-4c3d-9c19-b44ff9badb78','83ce2051-281a-41de-8ee5-050626d2ca3c',182.00,'A',476.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-30 05:03:00'),('0fc90e11-77d1-4cfc-88b6-9dc48b6d0cd3','12495be8-694e-4b73-b391-62f36e6c42e2','0e092d08-32d6-45e8-8286-f9a9b6482e4e','83ce2051-281a-41de-8ee5-050626d2ca3c',98.00,'B',360.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-26 05:12:00'),('11bdbf0b-943d-40f8-b64b-ac64dd114ae0','12495be8-694e-4b73-b391-62f36e6c42e2','53af7c65-f9f8-4290-9a1e-c65c4884283b','83ce2051-281a-41de-8ee5-050626d2ca3c',175.00,'B',399.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-17 06:37:00'),('1388bbcc-e2e8-482b-bca6-9ff183544868','12495be8-694e-4b73-b391-62f36e6c42e2','e413ab7d-82d8-47b1-bf9e-714f13bba4e5','ca801c62-4773-41aa-b017-c98eec91def1',178.00,'B',352.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-07-09 05:43:00'),('14195afb-9727-4733-bf4b-b6dc68e2708c','12495be8-694e-4b73-b391-62f36e6c42e2','db4c25ed-b1ae-497a-b155-aba22f64754c','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',211.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-05 06:27:00'),('1436e0ed-d515-4ecf-8949-8004a788c7ea','12495be8-694e-4b73-b391-62f36e6c42e2','95c8b053-eb68-4601-8f93-c2fb88021915','83ce2051-281a-41de-8ee5-050626d2ca3c',95.00,'A',467.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-07 05:31:00'),('14487ba8-bf98-4632-bba6-89abaaceac4e','12495be8-694e-4b73-b391-62f36e6c42e2','cf7ef06d-e23d-487a-b485-18e0ee56e704','ca801c62-4773-41aa-b017-c98eec91def1',150.00,'A',468.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-13 04:05:00'),('14d4b6e9-920b-4bfa-b7c6-10daf21a0ca6','12495be8-694e-4b73-b391-62f36e6c42e2','aa6f2e2f-2300-4e1d-ad71-0b4601b32d73','83ce2051-281a-41de-8ee5-050626d2ca3c',99.00,'B',390.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-02-22 06:22:00'),('180ac8a2-6c85-4fbb-b277-54016fad9974','12495be8-694e-4b73-b391-62f36e6c42e2','027e35e9-1918-46d6-a295-523212cb7215','ca801c62-4773-41aa-b017-c98eec91def1',97.00,'A',465.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-25 04:15:00'),('1b54021e-c955-419b-a205-ec8d2722a8fe','12495be8-694e-4b73-b391-62f36e6c42e2','1c899346-a11a-4ca5-840b-803f9119367b','ca801c62-4773-41aa-b017-c98eec91def1',148.00,'B',388.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-02-10 05:58:00'),('1d2d32af-2163-4473-84ff-0b8efb8ff88e','12495be8-694e-4b73-b391-62f36e6c42e2','474fbd94-710d-43c5-9e33-f4adb3d489a4','ca801c62-4773-41aa-b017-c98eec91def1',226.00,'A',459.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-08-20 06:00:00'),('1d31dc25-34b5-444b-971a-dff04ee19209','12495be8-694e-4b73-b391-62f36e6c42e2','42649a78-6940-42ec-836e-6ec0ac3725e0','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',182.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-27 05:27:00'),('1f4d1935-465e-4e6e-82e0-b134726dc90e','12495be8-694e-4b73-b391-62f36e6c42e2','9927890e-9cd8-48e7-828d-5640608d6482','83ce2051-281a-41de-8ee5-050626d2ca3c',197.00,'B',378.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-12-12 06:20:00'),('22659f63-b33b-4b9a-9f25-8f3bbf32f145','b21fe9c1-79b2-490e-a254-87df2e52b4d9','b2c57a57-4228-417d-9a2d-0123ab9571c2','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e',120.00,'A',320.00,'iced','83ab655f-845d-4ec5-ac83-904b755c1a16','2026-06-28 20:02:37'),('23743cfd-80d2-45c2-91dc-89d7f190d702','12495be8-694e-4b73-b391-62f36e6c42e2','f9f5b446-fb9e-4728-acb8-bcc41d2ed14a','83ce2051-281a-41de-8ee5-050626d2ca3c',105.00,'B',352.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-05 04:53:00'),('240f42d6-3929-4f03-b5e9-0b3bf8625b40','12495be8-694e-4b73-b391-62f36e6c42e2','70a778af-b1a5-44c4-9a3f-0af5c3fed02c','83ce2051-281a-41de-8ee5-050626d2ca3c',171.00,'B',393.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-03-12 06:01:00'),('29ca68b9-986e-4a4e-94c5-c338037ecf72','12495be8-694e-4b73-b391-62f36e6c42e2','8cca9730-9474-4482-a3ea-d2cb09530ef9','83ce2051-281a-41de-8ee5-050626d2ca3c',195.00,'A',458.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-14 06:12:00'),('2a3e14f4-fee2-4acd-998c-9ebc9bbe45a0','12495be8-694e-4b73-b391-62f36e6c42e2','fc3437b3-ba98-4f3c-9a6d-98cbfae7276e','83ce2051-281a-41de-8ee5-050626d2ca3c',80.00,'B',384.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-17 04:46:00'),('2d09e73e-67b2-4180-8819-e4f71b40526d','12495be8-694e-4b73-b391-62f36e6c42e2','0be55937-fddd-4b09-a8de-b6792cb26ac7','83ce2051-281a-41de-8ee5-050626d2ca3c',208.00,'B',387.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-04 06:56:00'),('313b672c-1584-4268-8fd1-adc09917e910','12495be8-694e-4b73-b391-62f36e6c42e2','d7fc2b0b-23fd-41d1-8bd9-9f0941585afc','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',193.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-18 04:31:00'),('31852fab-dd34-429d-8ee1-8c316c37ed6b','12495be8-694e-4b73-b391-62f36e6c42e2','be4c4e25-e17f-4d1a-b3af-53e7bc07cccd','ca801c62-4773-41aa-b017-c98eec91def1',195.00,'B',361.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-01 05:38:00'),('3b56632e-5bf8-4b58-811f-12f27ec02654','12495be8-694e-4b73-b391-62f36e6c42e2','69112471-9d8a-4103-bbad-bcd421342571','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',181.00,'A',451.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-03 05:29:00'),('42e8c690-20c3-4c1e-94ae-d640acd2f7d7','12495be8-694e-4b73-b391-62f36e6c42e2','17102a62-1150-401f-bd24-1554e2d5e2b7','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',85.00,'A',472.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-06 06:42:00'),('466bcfd9-b8af-4626-835e-9667ccb1f24a','12495be8-694e-4b73-b391-62f36e6c42e2','e838f1c7-fcd3-430c-833a-dc42e7925a3c','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',104.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-04-23 05:11:00'),('4839def9-ecef-41a2-af21-04c59e88bafc','12495be8-694e-4b73-b391-62f36e6c42e2','d2aebdc7-629e-4abb-8e18-3675ccac22d7','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',172.00,'A',505.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-05-23 06:10:00'),('4940b9a9-4c09-480b-accf-c114658ee48e','12495be8-694e-4b73-b391-62f36e6c42e2','37a9981c-7809-4d1f-aaf6-29fe96adf2ae','83ce2051-281a-41de-8ee5-050626d2ca3c',90.00,'A',503.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-05-11 05:30:00'),('4a026cae-a647-4082-a684-78fcccc66453','12495be8-694e-4b73-b391-62f36e6c42e2','2a5e0d23-0195-4898-a0ba-d7a24d0e807f','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',137.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-11-12 06:29:00'),('4c19f7b0-b4e0-4ca4-95bc-363cec1cfad9','12495be8-694e-4b73-b391-62f36e6c42e2','4f791afb-8f41-43fc-877b-f836c6ef2ad2','ca801c62-4773-41aa-b017-c98eec91def1',130.00,'B',370.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-25 04:09:00'),('4d1d005e-9945-4e14-bc25-9abda370c159','12495be8-694e-4b73-b391-62f36e6c42e2','58cba3b3-254b-4b36-85b2-9c7478db85fe','83ce2051-281a-41de-8ee5-050626d2ca3c',120.00,'B',358.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-06-10 05:05:00'),('4e08873f-389e-4d7a-b82c-3def952757d9','12495be8-694e-4b73-b391-62f36e6c42e2','9d761809-fdd7-451f-b2a4-8715105b76c5','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',148.00,'A',466.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-01 06:28:00'),('505e1a0d-2616-44ef-b636-c5e6c03836fc','12495be8-694e-4b73-b391-62f36e6c42e2','6b0483fc-d6f7-49cf-9492-aea1c9b4bafe','83ce2051-281a-41de-8ee5-050626d2ca3c',163.00,'B',363.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-13 04:49:00'),('51e73c46-8155-4488-880d-2d1a86243ac1','12495be8-694e-4b73-b391-62f36e6c42e2','d57878b4-5198-4cc6-a673-d9cfdd813304','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',207.00,'A',481.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-30 06:06:00'),('54d9810c-48df-4f0b-ac51-00ed17934024','12495be8-694e-4b73-b391-62f36e6c42e2','95c8b053-eb68-4601-8f93-c2fb88021915','ca801c62-4773-41aa-b017-c98eec91def1',229.00,'B',367.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-07 05:31:00'),('5bf86145-d307-4b3d-8763-1e1974196c7f','12495be8-694e-4b73-b391-62f36e6c42e2','bb9f7726-6e8a-4d27-b47e-4fddf8df1f9c','ca801c62-4773-41aa-b017-c98eec91def1',220.00,'A',462.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-09-07 04:54:00'),('5cc11a16-7944-446a-8332-d55d84e3a13d','12495be8-694e-4b73-b391-62f36e6c42e2','42649a78-6940-42ec-836e-6ec0ac3725e0','83ce2051-281a-41de-8ee5-050626d2ca3c',107.00,'A',455.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-27 05:27:00'),('5cd991cf-2548-476f-9c83-231d34615282','12495be8-694e-4b73-b391-62f36e6c42e2','bd7f85db-d072-4c3d-9c19-b44ff9badb78','ca801c62-4773-41aa-b017-c98eec91def1',150.00,'B',376.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-30 05:03:00'),('5e5327c6-1272-4c47-84dc-bc9a5e271c7b','12495be8-694e-4b73-b391-62f36e6c42e2','aa6f2e2f-2300-4e1d-ad71-0b4601b32d73','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',111.00,'A',490.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-02-22 06:22:00'),('5f441bc3-6508-4c79-a3ed-79c8d383feb9','12495be8-694e-4b73-b391-62f36e6c42e2','0e092d08-32d6-45e8-8286-f9a9b6482e4e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',135.00,'A',460.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-26 05:12:00'),('626d495a-bd24-4b46-af62-50e82650ee14','12495be8-694e-4b73-b391-62f36e6c42e2','345dcabb-b2e9-49d7-9666-dad088718460','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',181.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-29 04:24:00'),('63f651c0-5260-4695-b806-bc74dbc37b1d','12495be8-694e-4b73-b391-62f36e6c42e2','0be55937-fddd-4b09-a8de-b6792cb26ac7','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',113.00,'A',487.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-04 06:56:00'),('66998acf-96a5-4449-a95f-4b55f79d7243','12495be8-694e-4b73-b391-62f36e6c42e2','4f791afb-8f41-43fc-877b-f836c6ef2ad2','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',110.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-25 04:09:00'),('676c659f-30a7-45ea-9b81-1965666fd557','12495be8-694e-4b73-b391-62f36e6c42e2','d7fc2b0b-23fd-41d1-8bd9-9f0941585afc','83ce2051-281a-41de-8ee5-050626d2ca3c',121.00,'A',494.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-18 04:31:00'),('6791b4f6-ec35-4dd2-81a0-af183bead315','12495be8-694e-4b73-b391-62f36e6c42e2','2decd515-813b-4504-9e5d-479b0ef579f2','83ce2051-281a-41de-8ee5-050626d2ca3c',93.00,'B',357.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-08-08 05:28:00'),('688221e7-3ad6-4dd0-8e85-cd493dfc3c07','12495be8-694e-4b73-b391-62f36e6c42e2','e838f1c7-fcd3-430c-833a-dc42e7925a3c','ca801c62-4773-41aa-b017-c98eec91def1',162.00,'B',350.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-04-23 05:11:00'),('6a1e1705-3bbb-4b29-87f1-0a34dadacf8b','12495be8-694e-4b73-b391-62f36e6c42e2','d57a0bf0-5c40-4e1a-8f0f-d0bdfd459cf5','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',138.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-18 06:16:00'),('6bedcd1b-667c-4237-8b57-7af7e572cf1b','12495be8-694e-4b73-b391-62f36e6c42e2','d2aebdc7-629e-4abb-8e18-3675ccac22d7','83ce2051-281a-41de-8ee5-050626d2ca3c',130.00,'B',355.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-05-23 06:10:00'),('6c1a67d0-3a78-4550-a7c7-00387511b322','12495be8-694e-4b73-b391-62f36e6c42e2','fd36b2bb-d33c-4b4e-82f0-77b1ac987cc2','ca801c62-4773-41aa-b017-c98eec91def1',171.00,'A',495.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-03-24 05:00:00'),('7687a2a3-2719-4765-ac62-9d84acbed13b','12495be8-694e-4b73-b391-62f36e6c42e2','be4c4e25-e17f-4d1a-b3af-53e7bc07cccd','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',98.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-01 05:38:00'),('7719b5f7-effe-4647-806a-840f600ae798','12495be8-694e-4b73-b391-62f36e6c42e2','31cf98d4-963f-4299-b454-0edada810801','83ce2051-281a-41de-8ee5-050626d2ca3c',163.00,'A',491.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-28 04:00:00'),('7944592c-13e8-4b22-af69-13b24a8ae179','12495be8-694e-4b73-b391-62f36e6c42e2','de441f7a-2740-41d9-bf9a-e8934599ab06','ca801c62-4773-41aa-b017-c98eec91def1',213.00,'A',477.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-06 06:53:00'),('7a528ac1-6993-4a35-b758-41151ba63e3a','12495be8-694e-4b73-b391-62f36e6c42e2','d57a0bf0-5c40-4e1a-8f0f-d0bdfd459cf5','83ce2051-281a-41de-8ee5-050626d2ca3c',109.00,'A',479.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-18 06:16:00'),('7b27bdab-9c14-4792-a6da-0df8f6c7a41c','12495be8-694e-4b73-b391-62f36e6c42e2','17102a62-1150-401f-bd24-1554e2d5e2b7','83ce2051-281a-41de-8ee5-050626d2ca3c',119.00,'B',372.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-06 06:42:00'),('7b524427-0b2b-4cf4-812f-f48944dd7e41','12495be8-694e-4b73-b391-62f36e6c42e2','31cf98d4-963f-4299-b454-0edada810801','ca801c62-4773-41aa-b017-c98eec91def1',127.00,'B',391.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-28 04:00:00'),('7bf1f2cf-508b-47bf-a0ac-1af2e4466630','12495be8-694e-4b73-b391-62f36e6c42e2','ccca3b04-3b4e-4f89-9205-ff1963a11517','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',184.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-05 04:21:00'),('80ce5f43-8791-4cfe-902b-e9b7f80845ee','12495be8-694e-4b73-b391-62f36e6c42e2','64cb84dd-9ef5-4417-8fbd-fe9939ededc8','ca801c62-4773-41aa-b017-c98eec91def1',120.00,'B',359.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-16 05:16:00'),('8226d2b4-0f5d-4dbf-b965-6212844630f3','12495be8-694e-4b73-b391-62f36e6c42e2','345dcabb-b2e9-49d7-9666-dad088718460','83ce2051-281a-41de-8ee5-050626d2ca3c',170.00,'A',506.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-29 04:24:00'),('85c044ca-0233-4515-b5d1-e306189b9295','12495be8-694e-4b73-b391-62f36e6c42e2','e413ab7d-82d8-47b1-bf9e-714f13bba4e5','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',204.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-07-09 05:43:00'),('86fddafb-5711-4b0c-bedb-7bd2dcdfe5bc','12495be8-694e-4b73-b391-62f36e6c42e2','64cb84dd-9ef5-4417-8fbd-fe9939ededc8','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',100.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-16 05:16:00'),('895b3acf-1007-4f64-adbe-90f219f5d782','12495be8-694e-4b73-b391-62f36e6c42e2','1c899346-a11a-4ca5-840b-803f9119367b','83ce2051-281a-41de-8ee5-050626d2ca3c',222.00,'A',488.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-02-10 05:58:00'),('8b568b76-27e5-44ba-80a8-29519cb08c7a','12495be8-694e-4b73-b391-62f36e6c42e2','95c8b053-eb68-4601-8f93-c2fb88021915','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',83.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-07 05:31:00'),('8d4af389-8821-4b38-bb51-57815ca7c419','12495be8-694e-4b73-b391-62f36e6c42e2','54e42309-08de-49f3-9bb1-0b7737912670','ca801c62-4773-41aa-b017-c98eec91def1',152.00,'A',489.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-16 06:00:00'),('90e35af5-48b8-4797-aa21-2d03d6237380','12495be8-694e-4b73-b391-62f36e6c42e2','4f791afb-8f41-43fc-877b-f836c6ef2ad2','83ce2051-281a-41de-8ee5-050626d2ca3c',158.00,'A',470.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-25 04:09:00'),('966dcc1d-b5ce-47eb-8fb0-6aa97023be2a','12495be8-694e-4b73-b391-62f36e6c42e2','2a5e0d23-0195-4898-a0ba-d7a24d0e807f','83ce2051-281a-41de-8ee5-050626d2ca3c',201.00,'A',473.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-11-12 06:29:00'),('9a756704-b6a7-4e30-ba59-b283f34bd18a','12495be8-694e-4b73-b391-62f36e6c42e2','58cba3b3-254b-4b36-85b2-9c7478db85fe','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',158.00,'A',508.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-06-10 05:05:00'),('9c4b671d-f6fb-45b2-91bb-a8969252f17c','12495be8-694e-4b73-b391-62f36e6c42e2','0b314891-a244-46b7-8bf7-1d45d73a5308','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',142.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-09-19 06:44:00'),('9c77897d-6bfb-458e-abfa-f410c58fd4e5','12495be8-694e-4b73-b391-62f36e6c42e2','d57a0bf0-5c40-4e1a-8f0f-d0bdfd459cf5','ca801c62-4773-41aa-b017-c98eec91def1',117.00,'B',379.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-18 06:16:00'),('9e9c27af-d8a5-4f43-884f-a92572c8bd43','12495be8-694e-4b73-b391-62f36e6c42e2','1c849d11-5819-4af7-b2c5-72c5c0a439c6','ca801c62-4773-41aa-b017-c98eec91def1',187.00,'A',492.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-06 05:28:00'),('9f982f76-c637-458a-85ce-0a2147cb9bcb','12495be8-694e-4b73-b391-62f36e6c42e2','8cca9730-9474-4482-a3ea-d2cb09530ef9','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',192.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-08-14 06:12:00'),('a0769abd-6da6-4b11-b2ef-2da545a5adfd','12495be8-694e-4b73-b391-62f36e6c42e2','345dcabb-b2e9-49d7-9666-dad088718460','ca801c62-4773-41aa-b017-c98eec91def1',169.00,'B',356.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-29 04:24:00'),('a233742d-ee50-4fae-9cb9-2c13a8c0e032','12495be8-694e-4b73-b391-62f36e6c42e2','9927890e-9cd8-48e7-828d-5640608d6482','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',123.00,'A',478.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-12-12 06:20:00'),('a2eff410-6174-4644-bd76-428c3f25987c','12495be8-694e-4b73-b391-62f36e6c42e2','e8c1e447-2eaf-49f9-b4a7-6898442bd261','ca801c62-4773-41aa-b017-c98eec91def1',137.00,'A',504.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-05-17 04:22:00'),('a39760c6-ae25-4966-b9ca-01de945a30b6','12495be8-694e-4b73-b391-62f36e6c42e2','37a9981c-7809-4d1f-aaf6-29fe96adf2ae','ca801c62-4773-41aa-b017-c98eec91def1',126.00,'B',353.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-05-11 05:30:00'),('a534e71d-f9e0-44cb-b555-9b9ec51b36e6','12495be8-694e-4b73-b391-62f36e6c42e2','ccca3b04-3b4e-4f89-9205-ff1963a11517','ca801c62-4773-41aa-b017-c98eec91def1',222.00,'B',397.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-05 04:21:00'),('a8b0ba55-5d43-46ff-bda6-e72b24fc14e7','12495be8-694e-4b73-b391-62f36e6c42e2','1c899346-a11a-4ca5-840b-803f9119367b','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',112.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-02-10 05:58:00'),('a8b72a2d-0a94-41a8-9a1a-0106b741b9df','12495be8-694e-4b73-b391-62f36e6c42e2','53af7c65-f9f8-4290-9a1e-c65c4884283b','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',131.00,'A',499.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-17 06:37:00'),('a8f7b009-c350-42d0-b1ac-521fa13ea129','12495be8-694e-4b73-b391-62f36e6c42e2','97b07402-3fa0-4257-8974-6793af17d063','83ce2051-281a-41de-8ee5-050626d2ca3c',192.00,'B',396.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-30 06:53:00'),('aadd2336-b481-402a-8c4c-51f4be6b9a23','12495be8-694e-4b73-b391-62f36e6c42e2','cd0ab451-5ac8-407a-bf10-d53a6180797c','ca801c62-4773-41aa-b017-c98eec91def1',228.00,'A',471.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-31 06:48:00'),('ab67ef2f-8a25-4b47-901c-cc5889e5db19','12495be8-694e-4b73-b391-62f36e6c42e2','45eb5a6f-d3c6-4421-ad9c-514797b4ec85','83ce2051-281a-41de-8ee5-050626d2ca3c',102.00,'B',369.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-19 04:59:00'),('ac757fe8-1573-434f-8375-c4b1be795fe0','12495be8-694e-4b73-b391-62f36e6c42e2','2decd515-813b-4504-9e5d-479b0ef579f2','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',222.00,'A',457.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-08-08 05:28:00'),('ac788153-b642-448e-8df1-d4ea48bd92f2','11f852eb-f735-4923-9fa4-538582e42160','f6b82e23-dad6-4bd1-8392-db3e596b8b29','6c308128-0d27-4015-b80a-107cf297394c',128.00,'A',325.00,'iced','c45658ae-e152-4f0a-89cd-c8318545b516','2026-06-28 20:02:38'),('adde85ee-6a86-4ddb-8ee3-cee15726b89f','12495be8-694e-4b73-b391-62f36e6c42e2','1810e2a0-1abc-4689-a891-53c18b1014be','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',205.00,'A',475.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-11-24 06:31:00'),('af4e06b4-a678-48f9-8d60-ff9db01f2181','12495be8-694e-4b73-b391-62f36e6c42e2','d57878b4-5198-4cc6-a673-d9cfdd813304','83ce2051-281a-41de-8ee5-050626d2ca3c',115.00,'B',381.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-12-30 06:06:00'),('b043ae9e-37eb-4445-870a-9636b489a42c','12495be8-694e-4b73-b391-62f36e6c42e2','d0f8e751-2720-4a0e-a60d-38887902a07e','83ce2051-281a-41de-8ee5-050626d2ca3c',134.00,'B',354.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-07-21 04:59:00'),('bb6ea490-f6ba-4e2b-b1e4-6de951b9b944','12495be8-694e-4b73-b391-62f36e6c42e2','0b314891-a244-46b7-8bf7-1d45d73a5308','ca801c62-4773-41aa-b017-c98eec91def1',147.00,'B',364.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-09-19 06:44:00'),('bc1dd6c3-dc96-4be2-84d5-03db0b6441d9','12495be8-694e-4b73-b391-62f36e6c42e2','0e30cf34-9514-471a-83aa-2a04edb2fa63','ca801c62-4773-41aa-b017-c98eec91def1',161.00,'A',501.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-29 06:05:00'),('be2c33d2-9b9e-4b3a-b238-0f69e38595ac','12495be8-694e-4b73-b391-62f36e6c42e2','42649a78-6940-42ec-836e-6ec0ac3725e0','ca801c62-4773-41aa-b017-c98eec91def1',165.00,'B',355.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-27 05:27:00'),('c00c955b-22c4-499c-bf1b-8b4eebd9d939','12495be8-694e-4b73-b391-62f36e6c42e2','8939fb4c-c751-4eae-9292-06bf270aed8d','ca801c62-4773-41aa-b017-c98eec91def1',134.00,'A',474.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-18 04:35:00'),('c408de9a-4dc6-436e-a8e7-857f6de95110','12495be8-694e-4b73-b391-62f36e6c42e2','97b07402-3fa0-4257-8974-6793af17d063','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',139.00,'A',496.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-30 06:53:00'),('c45f8125-0764-4a13-b4e4-339e16f08638','12495be8-694e-4b73-b391-62f36e6c42e2','673b5b7b-b656-4cbf-8ca2-c0bacbdc8384','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',171.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-01-23 06:13:00'),('c4f44c3f-b2c3-4528-819c-c35d844d38c3','12495be8-694e-4b73-b391-62f36e6c42e2','db4c25ed-b1ae-497a-b155-aba22f64754c','ca801c62-4773-41aa-b017-c98eec91def1',221.00,'B',382.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-05 06:27:00'),('c5068b38-a8b6-47fb-a726-14f531020279','12495be8-694e-4b73-b391-62f36e6c42e2','fc3437b3-ba98-4f3c-9a6d-98cbfae7276e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',138.00,'A',484.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-17 04:46:00'),('c5627198-191b-4580-9f25-8994b484d0ae','12495be8-694e-4b73-b391-62f36e6c42e2','522ca390-89c9-4d4e-8251-1afc041ff958','ca801c62-4773-41aa-b017-c98eec91def1',228.00,'A',480.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-12-24 06:11:00'),('cab3aeda-d267-4858-855a-e4eda725d9b0','12495be8-694e-4b73-b391-62f36e6c42e2','45eb5a6f-d3c6-4421-ad9c-514797b4ec85','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',186.00,'A',469.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-10-19 04:59:00'),('cac98775-31e6-48dd-9148-63f510d53f40','12495be8-694e-4b73-b391-62f36e6c42e2','db4c25ed-b1ae-497a-b155-aba22f64754c','83ce2051-281a-41de-8ee5-050626d2ca3c',195.00,'A',482.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-05 06:27:00'),('cb81972b-247a-4684-95cf-cece2dccbe8e','12495be8-694e-4b73-b391-62f36e6c42e2','9d761809-fdd7-451f-b2a4-8715105b76c5','83ce2051-281a-41de-8ee5-050626d2ca3c',161.00,'B',366.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-10-01 06:28:00'),('cc2c5f77-0314-4f79-ada9-1e9276ec02be','12495be8-694e-4b73-b391-62f36e6c42e2','69112471-9d8a-4103-bbad-bcd421342571','83ce2051-281a-41de-8ee5-050626d2ca3c',87.00,'B',351.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-03 05:29:00'),('cc8ff32b-32c9-46bc-951c-489ec6c054e1','12495be8-694e-4b73-b391-62f36e6c42e2','f08e86f7-f184-4c96-a281-f82a30ab5b17','ca801c62-4773-41aa-b017-c98eec91def1',212.00,'A',483.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-01-11 05:50:00'),('cd57272c-606c-438e-9bd2-90327034e191','12495be8-694e-4b73-b391-62f36e6c42e2','e413ab7d-82d8-47b1-bf9e-714f13bba4e5','83ce2051-281a-41de-8ee5-050626d2ca3c',182.00,'A',452.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-07-09 05:43:00'),('d3216e41-bdb5-4a38-8c79-17c5c2dbb1b1','12495be8-694e-4b73-b391-62f36e6c42e2','dbf2ff78-2ff8-4c26-91bd-452f273e64df','ca801c62-4773-41aa-b017-c98eec91def1',178.00,'A',507.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-04 04:02:00'),('d351a502-1729-4ea6-91bd-cd2f67ab2a26','12495be8-694e-4b73-b391-62f36e6c42e2','6b0483fc-d6f7-49cf-9492-aea1c9b4bafe','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',117.00,'A',463.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-13 04:49:00'),('d55ae7c6-732a-41f5-b5f9-d23eed71414e','12495be8-694e-4b73-b391-62f36e6c42e2','088cad5e-d09e-4276-84a0-87147c7bb3e1','83ce2051-281a-41de-8ee5-050626d2ca3c',136.00,'A',330.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:39'),('d682796c-b697-440a-8fc0-22c10fca49f0','12495be8-694e-4b73-b391-62f36e6c42e2','d7fc2b0b-23fd-41d1-8bd9-9f0941585afc','ca801c62-4773-41aa-b017-c98eec91def1',228.00,'B',394.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-03-18 04:31:00'),('d9b23a73-63a9-4607-80dd-9d89aa5c9f77','12495be8-694e-4b73-b391-62f36e6c42e2','673b5b7b-b656-4cbf-8ca2-c0bacbdc8384','83ce2051-281a-41de-8ee5-050626d2ca3c',223.00,'A',485.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-01-23 06:13:00'),('da536e3e-0ab7-475e-b59b-b5fc60105a3d','12495be8-694e-4b73-b391-62f36e6c42e2','0b314891-a244-46b7-8bf7-1d45d73a5308','83ce2051-281a-41de-8ee5-050626d2ca3c',159.00,'A',464.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-09-19 06:44:00'),('dadf593d-89dd-469f-9d46-056d6471d26c','12495be8-694e-4b73-b391-62f36e6c42e2','2a5e0d23-0195-4898-a0ba-d7a24d0e807f','ca801c62-4773-41aa-b017-c98eec91def1',176.00,'B',373.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-11-12 06:29:00'),('de563b43-938a-4745-85fd-8dfddfd43352','12495be8-694e-4b73-b391-62f36e6c42e2','673b5b7b-b656-4cbf-8ca2-c0bacbdc8384','ca801c62-4773-41aa-b017-c98eec91def1',107.00,'B',385.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-01-23 06:13:00'),('e1a30964-e4e3-4f66-b7ef-92000efded45','12495be8-694e-4b73-b391-62f36e6c42e2','ccca3b04-3b4e-4f89-9205-ff1963a11517','83ce2051-281a-41de-8ee5-050626d2ca3c',92.00,'A',497.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-04-05 04:21:00'),('e438968b-7bfd-4d6d-8541-5ca41a6aa8b3','12495be8-694e-4b73-b391-62f36e6c42e2','d4146e12-c7ae-42ad-8c1c-dbfaeeda36ff','ca801c62-4773-41aa-b017-c98eec91def1',171.00,'A',510.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-06-22 05:31:00'),('e48e1752-0b75-4b74-b6d2-bc3b3fc350f5','12495be8-694e-4b73-b391-62f36e6c42e2','d0f8e751-2720-4a0e-a60d-38887902a07e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',201.00,'A',454.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-07-21 04:59:00'),('ea5088dc-988a-4987-850b-af2f0cf795b1','12495be8-694e-4b73-b391-62f36e6c42e2','31cf98d4-963f-4299-b454-0edada810801','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',176.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-02-28 04:00:00'),('eb50544b-ed6e-46d7-85ca-e19e9d69fe9b','12495be8-694e-4b73-b391-62f36e6c42e2','64cb84dd-9ef5-4417-8fbd-fe9939ededc8','83ce2051-281a-41de-8ee5-050626d2ca3c',187.00,'A',509.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-16 05:16:00'),('ed959ed4-4c33-471c-acda-3954770138ec','12495be8-694e-4b73-b391-62f36e6c42e2','de613ed5-9c99-463f-a80e-fcb120bdc5d0','ca801c62-4773-41aa-b017-c98eec91def1',183.00,'A',453.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-07-15 06:00:00'),('efa76fd7-f4c7-4bf6-b416-3bced45dfaf0','12495be8-694e-4b73-b391-62f36e6c42e2','e838f1c7-fcd3-430c-833a-dc42e7925a3c','83ce2051-281a-41de-8ee5-050626d2ca3c',113.00,'A',500.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-04-23 05:11:00'),('f0595168-5637-4fa3-a74f-686512c319ca','12495be8-694e-4b73-b391-62f36e6c42e2','fcb90d39-0499-48a0-b980-5a4ccc688195','ca801c62-4773-41aa-b017-c98eec91def1',81.00,'A',486.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-01-29 04:38:00'),('f4673950-00fe-491f-9c67-c1b0266511cc','12495be8-694e-4b73-b391-62f36e6c42e2','1810e2a0-1abc-4689-a891-53c18b1014be','83ce2051-281a-41de-8ee5-050626d2ca3c',119.00,'B',375.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-11-24 06:31:00'),('f4eb6a1d-c859-42f7-ac4c-eac59feace48','12495be8-694e-4b73-b391-62f36e6c42e2','bd7f85db-d072-4c3d-9c19-b44ff9badb78','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',139.00,'C',250.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2025-11-30 05:03:00'),('f83e761a-a192-4918-9ae0-abfabc0d1cb7','12495be8-694e-4b73-b391-62f36e6c42e2','37a9981c-7809-4d1f-aaf6-29fe96adf2ae','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',136.00,'C',250.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-05-11 05:30:00'),('f9c80012-ac67-44ef-ae8c-3a42bb059ba5','12495be8-694e-4b73-b391-62f36e6c42e2','9293d973-6ef2-4757-a713-91b0460320a6','ca801c62-4773-41aa-b017-c98eec91def1',183.00,'A',498.00,'iced','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','2026-04-11 05:47:00'),('fb928c45-f738-4444-9348-e91d17017414','12495be8-694e-4b73-b391-62f36e6c42e2','be4c4e25-e17f-4d1a-b3af-53e7bc07cccd','83ce2051-281a-41de-8ee5-050626d2ca3c',133.00,'A',461.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2025-09-01 05:38:00'),('ffd79d13-10fe-4b94-8dae-a5a9f02052b9','12495be8-694e-4b73-b391-62f36e6c42e2','70a778af-b1a5-44c4-9a3f-0af5c3fed02c','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',111.00,'A',493.00,'iced','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-03-12 06:01:00');
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
INSERT INTO `coldchain_alerts` VALUES ('17ff8abf-7d64-46f0-9d8a-b8b51ef2c824','b21fe9c1-79b2-490e-a254-87df2e52b4d9','992f1b20-33a9-476d-a5b8-3d2d950f2e12','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-28 20:02:37'),('19803edd-702a-4a87-a02f-b59ebea363aa','11f852eb-f735-4923-9fa4-538582e42160','e26641a5-1474-45ff-92fc-05eec74b34ec','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-28 20:02:38'),('bf16d2c1-cf09-4513-9b13-ad7ff6ae484d','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','temperature','critical','Ultra-low Tuna Vault exceeded critical limit of -35°C',-32.80,0,'2026-06-28 20:02:39'),('c48254e1-4258-4c56-ae8a-a6fa1e2a216b','b21fe9c1-79b2-490e-a254-87df2e52b4d9','992f1b20-33a9-476d-a5b8-3d2d950f2e12','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-28 20:02:37'),('cb766c0b-ac7c-4251-9453-12a8e02de77d','11f852eb-f735-4923-9fa4-538582e42160','e26641a5-1474-45ff-92fc-05eec74b34ec','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-28 20:02:38'),('eccf2211-d648-44f8-a05e-8be979bdea04','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','temperature','warning','Freezer Room temperature briefly above target',-17.50,1,'2026-06-28 20:02:39');
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
INSERT INTO `coupons` VALUES ('1b825c19-532c-404a-be41-a98e03c5fabe','b21fe9c1-79b2-490e-a254-87df2e52b4d9','WELCOME1','percent',5.00,5000.00,NULL,0,'2026-06-28','2026-09-26','active','2026-06-28 20:02:37'),('1d7b33e5-4105-4a0b-ae27-5f5a177eb859','12495be8-694e-4b73-b391-62f36e6c42e2','WELCOME3','percent',5.00,5000.00,NULL,0,'2026-06-28','2026-09-26','active','2026-06-28 20:02:39'),('facb5172-7dae-41cb-a742-212757e2fecb','11f852eb-f735-4923-9fa4-538582e42160','WELCOME2','percent',5.00,5000.00,NULL,0,'2026-06-28','2026-09-26','active','2026-06-28 20:02:38');
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
INSERT INTO `crm_customers` VALUES ('0414db15-f344-4d04-bedb-060610541f57','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com','+254710000002','wholesale',130000.00,'active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39',NULL),('15b89fa5-a5da-4507-bc0b-8ed271e9cbec','b21fe9c1-79b2-490e-a254-87df2e52b4d9','554e08ea-02dd-4817-b0e7-24042ace45b4','Kwale Wholesale Ltd','wholesale-coastfish@example.com','+254710000000','wholesale',120000.00,'active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37',NULL),('9bc8b3fc-2206-474e-a8d2-5a18314e0ffd','11f852eb-f735-4923-9fa4-538582e42160','554e08ea-02dd-4817-b0e7-24042ace45b4','Lamu Wholesale Ltd','wholesale-lamusea@example.com','+254710000001','wholesale',125000.00,'active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38',NULL);
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
INSERT INTO `crm_leads` VALUES ('326d339f-1385-4d6e-b52d-322b814feed0','b21fe9c1-79b2-490e-a254-87df2e52b4d9','Nairobi Hotel Group','leads-coastfish@example.com',NULL,'referral','qualified',85000.00,'83ab655f-845d-4ec5-ac83-904b755c1a16','2026-06-28 20:02:37','2026-06-28 20:02:37'),('6de269de-1ceb-4cb4-88ca-19a2129afc49','12495be8-694e-4b73-b391-62f36e6c42e2','Nairobi Hotel Group','leads-aquaerp-demo@example.com',NULL,'referral','qualified',89000.00,'de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:39','2026-06-28 20:02:39'),('7f6a193a-e727-4d5a-9e2b-f305772204f1','11f852eb-f735-4923-9fa4-538582e42160','Nairobi Hotel Group','leads-lamusea@example.com',NULL,'referral','qualified',87000.00,'c45658ae-e152-4f0a-89cd-c8318545b516','2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `deliveries` VALUES ('0565ceaa-b3fe-4371-8333-e2819f5bec69','12495be8-694e-4b73-b391-62f36e6c42e2','45cee3d1-0ec7-4be8-b503-f320aa3a967c','TRK-SC-23','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2026-01-15 14:46:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('0afa8237-3030-4762-b384-b835b9bb8278','12495be8-694e-4b73-b391-62f36e6c42e2','467fe734-c897-4b90-b8c9-28462ad056da','TRK-SC-27','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2026-02-16 12:38:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('121e82ce-ec00-45e9-bf23-b1e78e2854cc','12495be8-694e-4b73-b391-62f36e6c42e2','d8148df7-effa-454c-8551-9039e33a4c28','TRK-SC-1','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-07-23 10:00:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('138c4fea-4e60-4822-a8b6-5f0cb6e6f4b1','12495be8-694e-4b73-b391-62f36e6c42e2','08fdd020-1d8f-402c-a3bd-de09ce7973cf','TRK-SC-16','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2025-11-20 13:15:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('17c3c80b-86a2-4d48-a5da-09d1ecdea0f4','12495be8-694e-4b73-b391-62f36e6c42e2','cdc46416-c5cb-4e9b-82b7-8c3c99fed5cd','TRK-SC-8','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2025-09-17 11:31:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('1ad7b622-fbcb-4e25-b17a-cc3655ed02d0','12495be8-694e-4b73-b391-62f36e6c42e2','88bcf2a8-9060-4252-952f-500c347065d4','TRK-SC-22','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-01-07 13:33:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('1e080e2f-1712-4342-b287-d842e5dc199a','12495be8-694e-4b73-b391-62f36e6c42e2','ed0b480d-95c3-4ee9-891c-c550cf5329a0','TRK-SC-14','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2025-11-04 11:49:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('23f27900-0692-4b10-b777-6a75794b4089','12495be8-694e-4b73-b391-62f36e6c42e2','70aba1c8-b1c5-4a56-8fa1-5b64b2c23cdc','TRK-SC-11','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2025-10-11 14:10:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('2a9e9739-484d-4ce2-a997-e9ce73aa4240','12495be8-694e-4b73-b391-62f36e6c42e2','21725d48-1928-4fda-b656-584bfc0711e2','TRK-SC-12','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2025-10-19 15:23:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('3525c185-a63d-48e6-95f9-9a70f2eca52d','12495be8-694e-4b73-b391-62f36e6c42e2','f1b79c0c-b5fc-4201-befe-ec6bab2571b5','TRK-SC-28','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2026-02-24 13:51:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('38d8077f-4d36-4bd7-8892-02983037999c','12495be8-694e-4b73-b391-62f36e6c42e2','a98ccda9-efbb-4b44-9f60-0d883f463d31','TRK-SC-17','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-11-28 14:28:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('399df9c3-d353-4b4f-996c-7a92c52ebd13','12495be8-694e-4b73-b391-62f36e6c42e2','866a1000-8754-456a-b4fb-d624cc72aebd','TRK-SC-25','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2026-01-31 10:12:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('3da0e93b-126f-42ec-ba82-99f404e77d3b','12495be8-694e-4b73-b391-62f36e6c42e2','8224ccd1-86cb-46df-8de0-1c5ef0443f69','TRK-SC-39','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2026-05-23 12:14:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('539d64fa-c3e1-4cb9-847e-5e6fd49bb90b','11f852eb-f735-4923-9fa4-538582e42160','c0baf4d7-9281-44f5-b43a-7f4bd14fd7f1','TRK-LAMUSEA','in_transit','c45658ae-e152-4f0a-89cd-c8318545b516','Lamu landing site','Nairobi City Market, Kenya','2026-06-29 20:02:39',NULL,NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('587689a3-f6b6-4519-a640-73a3ea599ad3','12495be8-694e-4b73-b391-62f36e6c42e2','c1441989-1d31-4931-93e0-bf86b7b51f40','TRK-SC-35','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2026-04-21 14:22:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('5f7218c2-d734-4f82-93ec-c090fe016b72','12495be8-694e-4b73-b391-62f36e6c42e2','53d0a6e8-262e-4f98-87f0-4110d8b499ac','TRK-SC-40','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2026-05-31 13:27:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('61c89deb-2eb6-403a-a661-a48b94303e95','12495be8-694e-4b73-b391-62f36e6c42e2','e22c51a7-edec-4ea5-8a1d-43951cce93e1','TRK-SC-19','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2025-12-14 10:54:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('6e08df76-ea84-4fcc-bc30-0e0c97925371','12495be8-694e-4b73-b391-62f36e6c42e2','93ef9732-df9c-4506-8123-0eb009f381de','TRK-SC-15','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2025-11-12 12:02:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('6f96c2a8-4dc4-41be-98ce-b64955ae5bb5','12495be8-694e-4b73-b391-62f36e6c42e2','85d58e26-defd-4107-8223-3128ff7c3f06','TRK-SC-3','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2025-08-08 12:26:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('73481ca3-acbb-4dd7-a73b-765eaae03d50','12495be8-694e-4b73-b391-62f36e6c42e2','329d24c7-e21b-4a08-87bd-8fa3b2ff86e8','TRK-SC-21','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-12-30 12:20:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('811a61df-d179-40f3-8a06-a16d564e2877','12495be8-694e-4b73-b391-62f36e6c42e2','2ec95e3a-4b39-422c-bc8a-d45a0ad412f7','TRK-SC-9','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-09-25 12:44:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('82192b06-0c59-4e96-88ac-26ff2442787b','12495be8-694e-4b73-b391-62f36e6c42e2','a687ae8e-815d-4517-b6fb-ff31a20f97af','TRK-SC-13','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-10-27 10:36:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('8fe37e73-b555-4147-a0ae-d6f97369457c','12495be8-694e-4b73-b391-62f36e6c42e2','137e55d3-2de5-4b8a-9731-56900c0ead42','TRK-SC-5','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2025-08-24 14:52:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('9089deaa-029b-4438-a5f3-272b6fa1cc8e','12495be8-694e-4b73-b391-62f36e6c42e2','bf67919f-708e-48bc-94c6-283142279863','TRK-SC-30','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-03-12 15:17:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('94cdf831-b016-43f4-a1c5-b6d1d25e784b','12495be8-694e-4b73-b391-62f36e6c42e2','c905964e-7765-4b5a-ab07-2e4d42897a8f','TRK-SC-24','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2026-01-23 15:59:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('9528090d-ad17-4e10-9024-35c3de6d50d8','12495be8-694e-4b73-b391-62f36e6c42e2','a9d0d703-e5f0-4f5a-a103-1e913f8f7916','TRK-SC-20','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2025-12-22 11:07:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('9c61a098-ab08-43df-8d97-530e7dc2e527','12495be8-694e-4b73-b391-62f36e6c42e2','3f600209-c81f-4bc8-b23e-7323f8caa8dc','TRK-SC-32','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2026-03-28 11:43:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('9ff97355-19f2-4506-b884-ed5ae3db5994','12495be8-694e-4b73-b391-62f36e6c42e2','1cd47d96-56f6-4222-8434-f157fa1d4aeb','TRK-SC-2','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2025-07-31 11:13:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('a97e1715-6534-4b98-b0ea-7d41c263db7d','12495be8-694e-4b73-b391-62f36e6c42e2','2692bdd0-6ecc-4cdd-a8f8-07ef16c600c9','TRK-SC-26','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-02-08 11:25:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('adb3e653-9515-420e-9923-2593eed6a75b','12495be8-694e-4b73-b391-62f36e6c42e2','c784600f-a636-49b5-be58-06bab818115b','TRK-SC-29','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2026-03-04 14:04:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('af576070-c3f1-4bc9-8872-d715e0744fde','12495be8-694e-4b73-b391-62f36e6c42e2','fe2c9b7b-03f8-4b58-a5b8-27b6c10682e7','TRK-SC-31','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2026-03-20 10:30:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('af77a1f5-4d19-4eea-899b-9381bfa00255','12495be8-694e-4b73-b391-62f36e6c42e2','17971560-4541-41e4-8062-d1b19ba9b3ce','TRK-SC-4','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2025-08-16 13:39:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('b081d30e-cd40-404a-92d2-c4d573421f63','12495be8-694e-4b73-b391-62f36e6c42e2','8b364c9f-8939-4bf7-85ac-a2b3708109a0','TRK-SC-34','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-04-13 13:09:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('b40c7218-6881-494c-9fe8-2766d2b862d2','12495be8-694e-4b73-b391-62f36e6c42e2','5f1ed953-a4e4-4540-8659-2536b6f2be78','TRK-SC-18','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2025-12-06 15:41:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('be271798-ab6b-4cda-ba88-aae8c7e05125','b21fe9c1-79b2-490e-a254-87df2e52b4d9','b064fbd1-1978-4716-9554-4ca6d813c5c3','TRK-COASTFISH','in_transit','83ab655f-845d-4ec5-ac83-904b755c1a16','Kwale landing site','Nairobi City Market, Kenya','2026-06-29 20:02:38',NULL,NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('c185f46b-38de-43d6-a00b-0609a78152f7','12495be8-694e-4b73-b391-62f36e6c42e2','3460110d-1e5a-4a39-8d28-31c87484957f','TRK-SC-33','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2026-04-05 12:56:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('c51cdd44-4839-4c6a-b3af-2ceceb675722','12495be8-694e-4b73-b391-62f36e6c42e2','4bc85dba-0158-4ae9-b886-39fd7f86c5b5','TRK-SC-6','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2025-09-01 15:05:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('c6c88cb9-0e17-46cd-a8f8-b269970b8afb','12495be8-694e-4b73-b391-62f36e6c42e2','6fbd2c28-335c-4642-b442-47b86fbc1f91','TRK-SC-7','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 3, Mombasa','2025-09-09 10:18:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('ca39ed7c-e88f-42dd-9f8f-706698384fe4','12495be8-694e-4b73-b391-62f36e6c42e2','3edfc383-c943-447a-8d5f-cf3e64407979','TRK-SC-36','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 0, Mombasa','2026-04-29 15:35:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('d288b354-37bc-4011-859f-3da5b8733717','12495be8-694e-4b73-b391-62f36e6c42e2','423825cb-6f13-4efa-a194-fa8a22904d2a','TRK-AQUAERP-DE','in_transit','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa landing site','Nairobi City Market, Kenya','2026-06-29 20:02:39',NULL,NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('d31c61e5-b03c-4784-9e32-79f609b5027e','12495be8-694e-4b73-b391-62f36e6c42e2','8b1465ef-6a40-41ab-b54c-0ff71da74cec','TRK-SC-10','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2025-10-03 13:57:00',NULL,NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('d78c48c3-9a6a-4c61-ba4a-935af205c524','12495be8-694e-4b73-b391-62f36e6c42e2','b322f451-f412-4aa1-8983-c2314e097a3b','TRK-SC-41','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2026-06-08 14:40:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('d9ddadbb-7cd8-414f-bdc8-fa5efe09cece','12495be8-694e-4b73-b391-62f36e6c42e2','bf864f06-c983-448e-8d4e-ca2f2698a6d9','TRK-SC-38','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-05-15 11:01:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43'),('ef33de6f-c0a2-438b-9248-12645759801d','12495be8-694e-4b73-b391-62f36e6c42e2','9a727e96-cbfd-4ad9-845c-9bfcb2deb79f','TRK-SC-42','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 2, Mombasa','2026-06-16 15:53:00',NULL,NULL,'2026-06-28 20:02:44','2026-06-28 20:02:44'),('f45990dc-7f8f-4299-8184-44830a340119','12495be8-694e-4b73-b391-62f36e6c42e2','f9907338-fed0-4d6e-a85c-2b5fa33fed22','TRK-SC-37','delivered','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Mombasa Landing Site','Depot Station 1, Mombasa','2026-05-07 10:48:00',NULL,NULL,'2026-06-28 20:02:43','2026-06-28 20:02:43');
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
INSERT INTO `expenses` VALUES ('000bc572-1ecf-4f30-bcd7-f21f70ec6d62','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'ice','Crushed ice block purchase for catch preservation',8375.00,NULL,'approved',NULL,'2026-02-07','2026-06-28 20:02:44','2026-06-28 20:02:44'),('01c39e48-7f1a-4852-9536-b6f993a3b3f9','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'salary','Crew day-payout wage share',8954.00,NULL,'approved',NULL,'2025-08-15','2026-06-28 20:02:44','2026-06-28 20:02:44'),('2132972d-1212-4817-8124-c0bff5d52b1a','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'fuel','Marine fuel refill for boat trip',16385.00,NULL,'approved',NULL,'2025-07-13','2026-06-28 20:02:44','2026-06-28 20:02:44'),('281d3b8d-0b06-4b02-97c9-5de6fe55437b','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'fuel','Marine fuel refill for boat trip',14355.00,NULL,'approved',NULL,'2026-01-27','2026-06-28 20:02:44','2026-06-28 20:02:44'),('2b06e18d-8dff-43fe-aa72-4c817e18f09b','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'misc','Harbor berthing and logistics fees',7266.00,NULL,'approved',NULL,'2025-10-31','2026-06-28 20:02:44','2026-06-28 20:02:44'),('31ac8708-1bca-41b6-a8fb-0b386668d613','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'salary','Crew day-payout wage share',4510.00,NULL,'approved',NULL,'2025-10-20','2026-06-28 20:02:44','2026-06-28 20:02:44'),('37787cee-8e29-4c32-8a0f-0f49a30f9393','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'licenses','BMU licensing and safety inspection',4932.00,NULL,'approved',NULL,'2026-05-28','2026-06-28 20:02:44','2026-06-28 20:02:44'),('43b26b52-d618-40ee-97f3-5e3200508c40','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516',NULL,NULL,'fuel','Trip fuel top-up',8600.00,NULL,'approved',NULL,'2026-06-28','2026-06-28 20:02:39','2026-06-28 20:02:39'),('4e3e01ac-e2de-4dba-b0ce-0a0579569ad7','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'salary','Crew day-payout wage share',5034.00,NULL,'approved',NULL,'2026-03-01','2026-06-28 20:02:44','2026-06-28 20:02:44'),('6079b539-30aa-4146-8c46-a8905f3b28a8','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'salary','Crew day-payout wage share',14035.00,NULL,'approved',NULL,'2026-05-06','2026-06-28 20:02:44','2026-06-28 20:02:44'),('61863680-d550-4e6d-a55d-4bb1bf3d3f5d','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16',NULL,NULL,'fuel','Trip fuel top-up',8500.00,NULL,'approved',NULL,'2026-06-28','2026-06-28 20:02:38','2026-06-28 20:02:38'),('67a9d2cc-35aa-4ffa-994f-195e968fe349','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'maintenance','Engine repair and oil change',12117.00,NULL,'approved',NULL,'2025-10-09','2026-06-28 20:02:44','2026-06-28 20:02:44'),('8065e373-b6df-4883-97c7-11ee14e65313','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'maintenance','Engine repair and oil change',10311.00,NULL,'approved',NULL,'2026-02-18','2026-06-28 20:02:44','2026-06-28 20:02:44'),('88b1b7fb-10a8-44ab-9109-a420ee6db315','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'licenses','BMU licensing and safety inspection',15131.00,NULL,'approved',NULL,'2026-01-16','2026-06-28 20:02:44','2026-06-28 20:02:44'),('9041e978-9649-4eec-8676-5754c3f9f113','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'ice','Crushed ice block purchase for catch preservation',16245.00,NULL,'approved',NULL,'2026-04-14','2026-06-28 20:02:44','2026-06-28 20:02:44'),('94684bdb-6aaf-4174-965e-22f4c548958f','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'salary','Crew day-payout wage share',14402.00,NULL,'approved',NULL,'2025-12-25','2026-06-28 20:02:44','2026-06-28 20:02:44'),('996b6533-70b1-4c1f-b553-bbb863c875aa','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'ice','Crushed ice block purchase for catch preservation',13075.00,NULL,'approved',NULL,'2025-09-28','2026-06-28 20:02:44','2026-06-28 20:02:44'),('a5765e02-d905-43fd-b9f0-2b5fa9ab1830','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'licenses','BMU licensing and safety inspection',11669.00,NULL,'approved',NULL,'2026-03-23','2026-06-28 20:02:44','2026-06-28 20:02:44'),('aad2a242-2edb-4a41-aedb-58ea39013647','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9',NULL,NULL,'fuel','Trip fuel top-up',8700.00,NULL,'approved',NULL,'2026-06-28','2026-06-28 20:02:40','2026-06-28 20:02:40'),('b43ec0c9-a5df-4453-ad14-bacf91287393','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'fuel','Marine fuel refill for boat trip',17236.00,NULL,'approved',NULL,'2026-06-08','2026-06-28 20:02:44','2026-06-28 20:02:44'),('b5448f7b-41ee-4cdc-ba41-1773c132c477','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'ice','Crushed ice block purchase for catch preservation',10553.00,NULL,'approved',NULL,'2025-07-24','2026-06-28 20:02:44','2026-06-28 20:02:44'),('bcaec6ce-0228-4fb4-ba13-19dfd153cb7f','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,'licenses','BMU licensing and safety inspection',9552.00,NULL,'approved',NULL,'2025-11-11','2026-06-28 20:02:44','2026-06-28 20:02:44'),('bf24ab82-cc5d-49a2-8e48-9f2ab6843f6a','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'fuel','Marine fuel refill for boat trip',4208.00,NULL,'approved',NULL,'2025-09-17','2026-06-28 20:02:44','2026-06-28 20:02:44'),('c08dd092-ff03-484f-8742-6304f27edeeb','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'maintenance','Engine repair and oil change',16049.00,NULL,'approved',NULL,'2025-08-04','2026-06-28 20:02:44','2026-06-28 20:02:44'),('c429635f-070d-46de-8252-2d903bacea85','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'misc','Harbor berthing and logistics fees',10603.00,NULL,'approved',NULL,'2026-01-05','2026-06-28 20:02:44','2026-06-28 20:02:44'),('c7012cea-e554-4033-add2-9684f2c2e1fe','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'fuel','Marine fuel refill for boat trip',4070.00,NULL,'approved',NULL,'2026-04-03','2026-06-28 20:02:44','2026-06-28 20:02:44'),('d466fa64-9ab9-4b4f-aee4-d978585a1e26','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'ice','Crushed ice block purchase for catch preservation',7505.00,NULL,'approved',NULL,'2025-12-03','2026-06-28 20:02:44','2026-06-28 20:02:44'),('e38d0fc5-80ef-4ea1-8132-fb674dd856ef','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'misc','Harbor berthing and logistics fees',4369.00,NULL,'approved',NULL,'2026-05-17','2026-06-28 20:02:44','2026-06-28 20:02:44'),('e9c66fb6-7a16-4052-9ae5-bfc7708186b9','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'maintenance','Engine repair and oil change',12058.00,NULL,'approved',NULL,'2025-12-14','2026-06-28 20:02:44','2026-06-28 20:02:44'),('eb6f20ed-0d62-4745-9800-a07a3a83981b','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','8439ffd3-cba3-46ad-b939-376a05a31c41',NULL,'licenses','BMU licensing and safety inspection',17530.00,NULL,'approved',NULL,'2025-09-06','2026-06-28 20:02:44','2026-06-28 20:02:44'),('eecbd0ab-321a-492e-af78-5bdde64da2ea','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'maintenance','Engine repair and oil change',15037.00,NULL,'approved',NULL,'2026-04-25','2026-06-28 20:02:44','2026-06-28 20:02:44'),('f2572c55-7700-477d-9a17-e1578250cd14','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','47ef4c68-3ee3-4870-9046-2ea5ac7184df',NULL,'misc','Harbor berthing and logistics fees',8736.00,NULL,'approved',NULL,'2026-03-12','2026-06-28 20:02:44','2026-06-28 20:02:44'),('f6d3d740-decd-486d-bb75-ee3a930d2a94','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'fuel','Marine fuel refill for boat trip',13798.00,NULL,'approved',NULL,'2025-11-22','2026-06-28 20:02:44','2026-06-28 20:02:44'),('fb4987e8-a81c-4e4a-b62a-1c0a328ea743','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2092182a-b03e-43c1-9df0-42929ea3818c',NULL,'misc','Harbor berthing and logistics fees',15546.00,NULL,'approved',NULL,'2025-08-26','2026-06-28 20:02:44','2026-06-28 20:02:44');
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
INSERT INTO `fish_listings` VALUES ('02fe3bdd-f399-40bd-92f7-2901857fa7b5','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','Whole Red Snapper',200.00,200.00,'A',520.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('18c5fd4b-edc2-454f-b8ef-a90748e14bb5','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ca801c62-4773-41aa-b017-c98eec91def1','Premium Nile Perch Fillet',200.00,200.00,'A',480.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('3e0154d1-af4a-4725-86bd-d46fd09f05ec','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','Jumbo Tiger Prawns',200.00,200.00,'A',950.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('714e6a65-7234-4580-9472-43bd36d0a915','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','8b103f48-5204-469b-abe2-564f180c98c0','Fresh',83.00,83.00,'A',425.00,'f059f52b-3eb1-4588-85fb-ccd0298a8f75','iced','2026-07-12 20:02:38','available','2026-06-28 20:02:38','2026-06-28 20:02:38'),('80b78c1e-7844-4366-825f-d44a640acffd','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','83ce2051-281a-41de-8ee5-050626d2ca3c','Yellowfin Tuna Steaks',200.00,200.00,'A',680.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('826a4d88-d58e-4885-9c5c-bb9060bcef5e','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','83ce2051-281a-41de-8ee5-050626d2ca3c','Mombasa Rock Lobster',200.00,200.00,'A',1400.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('abda8da2-9c4d-4797-9708-a13cf41179bc','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','Fresh Lake Victoria Tilapia',200.00,200.00,'A',360.00,'f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','iced','2026-07-12 20:02:48','available','2026-06-28 20:02:48','2026-06-28 20:02:48'),('d9b2bb96-bd93-44c2-a968-ccbcaa7c537d','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e','Fresh',80.00,80.00,'A',420.00,'bffb581b-839e-4a74-a7dd-06f6a5ab58be','iced','2026-07-12 20:02:37','available','2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `fish_species` VALUES ('429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e','b21fe9c1-79b2-490e-a254-87df2e52b4d9','coastfish Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:37'),('614b9b95-1aba-4a7c-9c3a-02a5cd3ff841','b21fe9c1-79b2-490e-a254-87df2e52b4d9','coastfish Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-28 20:02:37'),('6c308128-0d27-4015-b80a-107cf297394c','11f852eb-f735-4923-9fa4-538582e42160','lamusea Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:38'),('83ce2051-281a-41de-8ee5-050626d2ca3c','12495be8-694e-4b73-b391-62f36e6c42e2','aquaerp-demo Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-28 20:02:39'),('8b103f48-5204-469b-abe2-564f180c98c0','11f852eb-f735-4923-9fa4-538582e42160','lamusea Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:38'),('9be4b9bf-f6e6-4930-b67c-919b4f1c7866','12495be8-694e-4b73-b391-62f36e6c42e2','aquaerp-demo Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:39'),('af5e6b3a-efb6-4c18-842f-beee03ecf7d3','b21fe9c1-79b2-490e-a254-87df2e52b4d9','coastfish Tilapia','Oreochromis niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:37'),('ca801c62-4773-41aa-b017-c98eec91def1','12495be8-694e-4b73-b391-62f36e6c42e2','aquaerp-demo Nile Perch','Lates niloticus',NULL,NULL,NULL,'active','2026-06-28 20:02:39'),('e4fa3ac4-c7d0-4ccd-9e0c-8e2b7ae82714','11f852eb-f735-4923-9fa4-538582e42160','lamusea Tuna','Thunnus albacares',NULL,NULL,NULL,'active','2026-06-28 20:02:38'),('sp_001','tenant-default-0001','Tilapia','Oreochromis niloticus',NULL,0.80,350.00,'active','2026-06-06 08:45:16'),('sp_002','tenant-default-0001','Nile Perch','Lates niloticus',NULL,5.00,450.00,'active','2026-06-06 08:45:16'),('sp_003','tenant-default-0001','Catfish','Clarias gariepinus',NULL,1.50,280.00,'active','2026-06-06 08:45:16'),('sp_004','tenant-default-0001','Sardines','Sardinella gibbosa',NULL,0.05,150.00,'active','2026-06-06 08:45:16'),('sp_005','tenant-default-0001','Mackerel','Rastrelliger kanagurta',NULL,0.30,320.00,'active','2026-06-06 08:45:16'),('sp_006','tenant-default-0001','Tuna','Thunnus albacares',NULL,8.00,600.00,'active','2026-06-06 08:45:16'),('sp_007','tenant-default-0001','Squid','Loligo vulgaris',NULL,0.20,500.00,'active','2026-06-06 08:45:16'),('sp_008','tenant-default-0001','Shrimp','Penaeus indicus',NULL,0.01,1200.00,'active','2026-06-06 08:45:16');
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
INSERT INTO `fishing_trips` VALUES ('027e35e9-1918-46d6-a295-523212cb7215','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-09-25 04:15:00','2025-09-25 14:15:00','Inshore','Sunny','calm',101.00,10287.00,97.00,45105.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('088cad5e-d09e-4276-84a0-87147c7bb3e1','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-24 23:02:40','2026-06-25 07:02:40','Zone A','Clear','calm',80.00,12000.00,136.00,44880.00,'completed',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('0b314891-a244-46b7-8bf7-1d45d73a5308','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-09-19 06:44:00','2025-09-19 14:44:00','Deep Sea','Light Rain','rough',120.00,11660.00,448.00,162784.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('0be55937-fddd-4b09-a8de-b6792cb26ac7','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-02-04 06:56:00','2026-02-04 15:56:00','Zone B','Partly Cloudy','moderate',141.00,14152.00,321.00,135527.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('0e092d08-32d6-45e8-8286-f9a9b6482e4e','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-08-26 05:12:00','2025-08-26 11:12:00','Deep Sea','Light Rain','moderate',65.00,12324.00,233.00,97380.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('0e30cf34-9514-471a-83aa-2a04edb2fa63','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-04-29 06:05:00','2026-04-29 15:05:00','Inshore','Sunny','calm',53.00,8682.00,161.00,80661.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('17102a62-1150-401f-bd24-1554e2d5e2b7','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-11-06 06:42:00','2025-11-06 14:42:00','Deep Sea','Light Rain','moderate',83.00,12726.00,204.00,84388.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:41'),('1810e2a0-1abc-4689-a891-53c18b1014be','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-11-24 06:31:00','2025-11-24 13:31:00','Zone B','Partly Cloudy','moderate',142.00,13401.00,324.00,142000.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('1c849d11-5819-4af7-b2c5-72c5c0a439c6','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-03-06 05:28:00','2026-03-06 12:28:00','Deep Sea','Light Rain','calm',142.00,14540.00,187.00,92004.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('1c899346-a11a-4ca5-840b-803f9119367b','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-02-10 05:58:00','2026-02-10 14:58:00','Deep Sea','Light Rain','rough',100.00,7741.00,482.00,193760.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('2a5e0d23-0195-4898-a0ba-d7a24d0e807f','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-11-12 06:29:00','2025-11-12 12:29:00','Inshore','Sunny','rough',138.00,13641.00,514.00,194971.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('2decd515-813b-4504-9e5d-479b0ef579f2','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-08-08 05:28:00','2025-08-08 12:28:00','Inshore','Sunny','moderate',67.00,12666.00,315.00,134655.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('31cf98d4-963f-4299-b454-0edada810801','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-02-28 04:00:00','2026-02-28 14:00:00','Zone B','Partly Cloudy','rough',107.00,12599.00,466.00,173690.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('345dcabb-b2e9-49d7-9666-dad088718460','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-05-29 04:24:00','2026-05-29 11:24:00','Zone A','Clear','rough',61.00,8599.00,520.00,191434.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('37a9981c-7809-4d1f-aaf6-29fe96adf2ae','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-05-11 05:30:00','2026-05-11 15:30:00','Zone B','Partly Cloudy','rough',59.00,9416.00,352.00,123748.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('42649a78-6940-42ec-836e-6ec0ac3725e0','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-07-27 05:27:00','2025-07-27 14:27:00','Zone B','Partly Cloudy','rough',85.00,11792.00,454.00,152760.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('45eb5a6f-d3c6-4421-ad9c-514797b4ec85','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-19 04:59:00','2025-10-19 11:59:00','Inshore','Sunny','moderate',123.00,8227.00,288.00,124872.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('474fbd94-710d-43c5-9e33-f4adb3d489a4','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-08-20 06:00:00','2025-08-20 13:00:00','Zone B','Partly Cloudy','calm',126.00,9814.00,226.00,103734.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('4f791afb-8f41-43fc-877b-f836c6ef2ad2','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-25 04:09:00','2025-10-25 14:09:00','Zone A','Clear','rough',117.00,8534.00,398.00,149860.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('522ca390-89c9-4d4e-8251-1afc041ff958','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-12-24 06:11:00','2025-12-24 14:11:00','Deep Sea','Light Rain','calm',116.00,14965.00,228.00,109440.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('53af7c65-f9f8-4290-9a1e-c65c4884283b','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-04-17 06:37:00','2026-04-17 13:37:00','Zone B','Partly Cloudy','moderate',113.00,7698.00,306.00,135194.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('54e42309-08de-49f3-9bb1-0b7737912670','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-02-16 06:00:00','2026-02-16 14:00:00','Inshore','Sunny','calm',137.00,14541.00,152.00,74328.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('58cba3b3-254b-4b36-85b2-9c7478db85fe','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-10 05:05:00','2026-06-10 14:05:00','Deep Sea','Light Rain','moderate',134.00,12917.00,278.00,123224.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('64cb84dd-9ef5-4417-8fbd-fe9939ededc8','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-16 05:16:00','2026-06-16 12:16:00','Inshore','Sunny','rough',116.00,9309.00,407.00,163263.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('673b5b7b-b656-4cbf-8ca2-c0bacbdc8384','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-01-23 06:13:00','2026-01-23 16:13:00','Inshore','Sunny','rough',61.00,8003.00,501.00,192100.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('69112471-9d8a-4103-bbad-bcd421342571','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-07-03 05:29:00','2025-07-03 12:29:00','Zone B','Partly Cloudy','moderate',143.00,7873.00,268.00,112168.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('6b0483fc-d6f7-49cf-9492-aea1c9b4bafe','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-09-13 04:49:00','2025-09-13 10:49:00','Zone B','Partly Cloudy','moderate',137.00,9342.00,280.00,113340.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('6bfbf775-cc80-4bd2-9f80-9dcddb6a926c','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-08-02 05:55:00','2025-08-02 11:55:00','Deep Sea','Light Rain','calm',118.00,12664.00,228.00,103968.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('6f3d8919-41c8-4d4d-a105-ddc7c8ca04e9','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-14 23:02:40',NULL,'Deep Sea','Partly Cloudy','moderate',0.00,0.00,0.00,0.00,'ongoing',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('70a778af-b1a5-44c4-9a3f-0af5c3fed02c','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-03-12 06:01:00','2026-03-12 14:01:00','Inshore','Sunny','moderate',124.00,7952.00,282.00,121926.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('7f03ec44-bf46-44db-9555-2b0655cbba1c','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-21 23:02:40',NULL,'Zone B','Partly Cloudy','moderate',0.00,0.00,0.00,0.00,'ongoing',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('8939fb4c-c751-4eae-9292-06bf270aed8d','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-11-18 04:35:00','2025-11-18 14:35:00','Zone A','Clear','calm',94.00,13377.00,134.00,63516.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('8cca9730-9474-4482-a3ea-d2cb09530ef9','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-08-14 06:12:00','2025-08-14 13:12:00','Zone A','Clear','rough',68.00,11193.00,543.00,193158.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('9293d973-6ef2-4757-a713-91b0460320a6','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-04-11 05:47:00','2026-04-11 14:47:00','Zone A','Clear','calm',119.00,14126.00,183.00,91134.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('95c8b053-eb68-4601-8f93-c2fb88021915','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-07 05:31:00','2025-10-07 15:31:00','Zone B','Partly Cloudy','rough',121.00,12309.00,407.00,149158.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('97b07402-3fa0-4257-8974-6793af17d063','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-03-30 06:53:00','2026-03-30 14:53:00','Deep Sea','Light Rain','moderate',108.00,10580.00,331.00,144976.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('9927890e-9cd8-48e7-828d-5640608d6482','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-12-12 06:20:00','2025-12-12 14:20:00','Zone A','Clear','moderate',69.00,11561.00,320.00,133260.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('9d761809-fdd7-451f-b2a4-8715105b76c5','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-01 06:28:00','2025-10-01 12:28:00','Zone A','Clear','moderate',130.00,12171.00,309.00,127894.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('aa6f2e2f-2300-4e1d-ad71-0b4601b32d73','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-02-22 06:22:00','2026-02-22 16:22:00','Zone A','Clear','moderate',135.00,14627.00,210.00,93000.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('b2c57a57-4228-417d-9a2d-0123ab9571c2','b21fe9c1-79b2-490e-a254-87df2e52b4d9','208268ef-f228-4e66-9222-0f003acd2f1b','83ab655f-845d-4ec5-ac83-904b755c1a16','bffb581b-839e-4a74-a7dd-06f6a5ab58be','2026-06-26 23:02:38','2026-06-27 07:02:38','Zone A','Clear','calm',80.00,12000.00,120.00,38400.00,'completed',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('bb9f7726-6e8a-4d27-b47e-4fddf8df1f9c','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-09-07 04:54:00','2025-09-07 13:54:00','Zone A','Clear','calm',92.00,8362.00,220.00,101640.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('bd7f85db-d072-4c3d-9c19-b44ff9badb78','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-11-30 05:03:00','2025-11-30 15:03:00','Deep Sea','Light Rain','rough',78.00,9278.00,471.00,177782.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('be4c4e25-e17f-4d1a-b3af-53e7bc07cccd','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-09-01 05:38:00','2025-09-01 15:38:00','Inshore','Sunny','rough',52.00,10405.00,426.00,156208.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('ccca3b04-3b4e-4f89-9205-ff1963a11517','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-04-05 04:21:00','2026-04-05 11:21:00','Inshore','Sunny','rough',58.00,11990.00,498.00,179858.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('cd0ab451-5ac8-407a-bf10-d53a6180797c','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-31 06:48:00','2025-10-31 15:48:00','Zone B','Partly Cloudy','calm',115.00,12514.00,228.00,107388.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('cf7ef06d-e23d-487a-b485-18e0ee56e704','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-10-13 04:05:00','2025-10-13 13:05:00','Deep Sea','Light Rain','calm',127.00,12839.00,150.00,70200.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('d0f8e751-2720-4a0e-a60d-38887902a07e','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-07-21 04:59:00','2025-07-21 10:59:00','Zone A','Clear','moderate',57.00,8916.00,335.00,138690.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('d2aebdc7-629e-4abb-8e18-3675ccac22d7','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-05-23 06:10:00','2026-05-23 14:10:00','Inshore','Sunny','moderate',100.00,11173.00,302.00,133010.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('d4146e12-c7ae-42ad-8c1c-dbfaeeda36ff','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-22 05:31:00','2026-06-22 15:31:00','Zone A','Clear','calm',80.00,8772.00,171.00,87210.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('d57878b4-5198-4cc6-a673-d9cfdd813304','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-12-30 06:06:00','2025-12-30 15:06:00','Inshore','Sunny','moderate',102.00,9366.00,322.00,143382.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('d57a0bf0-5c40-4e1a-8f0f-d0bdfd459cf5','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-12-18 06:16:00','2025-12-18 15:16:00','Zone B','Partly Cloudy','rough',139.00,7501.00,364.00,131054.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('d7fc2b0b-23fd-41d1-8bd9-9f0941585afc','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-03-18 04:31:00','2026-03-18 13:31:00','Zone A','Clear','rough',122.00,10756.00,542.00,197856.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('db4c25ed-b1ae-497a-b155-aba22f64754c','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-01-05 06:27:00','2026-01-05 16:27:00','Zone A','Clear','rough',51.00,10755.00,627.00,231162.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('dbf2ff78-2ff8-4c26-91bd-452f273e64df','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-06-04 04:02:00','2026-06-04 12:02:00','Zone B','Partly Cloudy','calm',71.00,13840.00,178.00,90246.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('de441f7a-2740-41d9-bf9a-e8934599ab06','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-12-06 06:53:00','2025-12-06 16:53:00','Inshore','Sunny','calm',65.00,8821.00,213.00,101601.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('de613ed5-9c99-463f-a80e-fcb120bdc5d0','12495be8-694e-4b73-b391-62f36e6c42e2','8439ffd3-cba3-46ad-b939-376a05a31c41','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-07-15 06:00:00','2025-07-15 16:00:00','Inshore','Sunny','calm',102.00,11615.00,183.00,82899.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('e413ab7d-82d8-47b1-bf9e-714f13bba4e5','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2025-07-09 05:43:00','2025-07-09 13:43:00','Deep Sea','Light Rain','rough',88.00,9136.00,564.00,195920.00,'completed',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40'),('e838f1c7-fcd3-430c-833a-dc42e7925a3c','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-04-23 05:11:00','2026-04-23 11:11:00','Deep Sea','Light Rain','rough',82.00,8506.00,379.00,139200.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:42'),('e8c1e447-2eaf-49f9-b4a7-6898442bd261','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-05-17 04:22:00','2026-05-17 12:22:00','Deep Sea','Light Rain','calm',115.00,14287.00,137.00,69048.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('f08e86f7-f184-4c96-a281-f82a30ab5b17','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-01-11 05:50:00','2026-01-11 14:50:00','Zone B','Partly Cloudy','calm',112.00,14381.00,212.00,102396.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('f6b82e23-dad6-4bd1-8392-db3e596b8b29','11f852eb-f735-4923-9fa4-538582e42160','0949445a-9e95-4a3d-aa10-11ba374a0dfb','c45658ae-e152-4f0a-89cd-c8318545b516','f059f52b-3eb1-4588-85fb-ccd0298a8f75','2026-06-25 23:02:39','2026-06-26 07:02:39','Zone A','Clear','calm',80.00,12000.00,128.00,41600.00,'completed',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('f9f5b446-fb9e-4728-acb8-bcc41d2ed14a','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-05-05 04:53:00','2026-05-05 13:53:00','Zone A','Clear','moderate',86.00,9501.00,276.00,122802.00,'completed',NULL,'2026-06-28 20:02:42','2026-06-28 20:02:42'),('fc3437b3-ba98-4f3c-9a6d-98cbfae7276e','12495be8-694e-4b73-b391-62f36e6c42e2','2092182a-b03e-43c1-9df0-42929ea3818c','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-01-17 04:46:00','2026-01-17 14:46:00','Deep Sea','Light Rain','moderate',50.00,11314.00,218.00,97512.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('fcb90d39-0499-48a0-b980-5a4ccc688195','12495be8-694e-4b73-b391-62f36e6c42e2','47ef4c68-3ee3-4870-9046-2ea5ac7184df','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-01-29 04:38:00','2026-01-29 11:38:00','Zone A','Clear','calm',96.00,11523.00,81.00,39366.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41'),('fd36b2bb-d33c-4b4e-82f0-77b1ac987cc2','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','2026-03-24 05:00:00','2026-03-24 11:00:00','Zone B','Partly Cloudy','calm',87.00,11974.00,171.00,84645.00,'completed',NULL,'2026-06-28 20:02:41','2026-06-28 20:02:41');
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
INSERT INTO `gl_accounts` VALUES ('00bf5381-0108-45f3-8d63-4efc72dd5229','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2100','Salaries Payable','liability','KES',1,'2026-06-28 20:02:37'),('020e03b5-6366-41fa-9765-b13eda750674','11f852eb-f735-4923-9fa4-538582e42160','6100','Depreciation Expense','expense','KES',1,'2026-06-28 20:02:38'),('0327e4af-4b8e-45e6-bd07-70e949ab2913','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-28 20:02:37'),('04ad9b00-1782-43ef-9ec2-773d35b10832','12495be8-694e-4b73-b391-62f36e6c42e2','1100','Accounts Receivable','asset','KES',1,'2026-06-28 20:02:39'),('0af5d653-deba-41ad-9977-6424a32ec8ee','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2110','PAYE Payable','liability','KES',1,'2026-06-28 20:02:37'),('0b8d0fa8-11cd-4042-b3a2-5544c40cdeb5','12495be8-694e-4b73-b391-62f36e6c42e2','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-28 20:02:39'),('10ab3b8c-a5ae-4712-b9cb-1d1ccb3258a6','11f852eb-f735-4923-9fa4-538582e42160','6200','Bank & Payment Fees','expense','KES',1,'2026-06-28 20:02:38'),('11622641-ff88-474a-9053-fcd790bd7c28','11f852eb-f735-4923-9fa4-538582e42160','2200','VAT Payable','liability','KES',1,'2026-06-28 20:02:38'),('148d2cff-5cd1-4464-b67f-2b17d9c4ddef','b21fe9c1-79b2-490e-a254-87df2e52b4d9','6900','Miscellaneous Expense','expense','KES',1,'2026-06-28 20:02:37'),('168d1cea-2f91-4cfa-823e-233e5d770a73','12495be8-694e-4b73-b391-62f36e6c42e2','1500','Fixed Assets','asset','KES',1,'2026-06-28 20:02:39'),('170c7140-fde7-4b12-916c-689dea32108f','12495be8-694e-4b73-b391-62f36e6c42e2','1010','Petty Cash','asset','KES',1,'2026-06-28 20:02:39'),('18d4c5c4-f9b3-4385-b98f-4a9c495601db','11f852eb-f735-4923-9fa4-538582e42160','1300','Prepaid Expenses','asset','KES',1,'2026-06-28 20:02:38'),('1ac000d7-2f10-4523-bb98-32461c7a22b8','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5700','Licenses & Compliance','expense','KES',1,'2026-06-28 20:02:37'),('1bb479b1-5cca-4af6-8d2d-6582e77f1c27','11f852eb-f735-4923-9fa4-538582e42160','2000','Accounts Payable','liability','KES',1,'2026-06-28 20:02:38'),('212fb488-31b3-40e9-9334-33cb656bc363','12495be8-694e-4b73-b391-62f36e6c42e2','1510','Accumulated Depreciation','asset','KES',1,'2026-06-28 20:02:39'),('25c9505f-cbe7-40d2-8f99-ee58a8dcba73','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5400','Logistics & Delivery','expense','KES',1,'2026-06-28 20:02:37'),('29121033-28de-4f61-b6de-81ac648663fa','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3100','Retained Earnings','equity','KES',1,'2026-06-28 20:02:37'),('2b24dc04-76d5-49fb-bbda-53f96cb3ea72','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5600','Repairs & Maintenance','expense','KES',1,'2026-06-28 20:02:37'),('334fe0aa-6166-4353-8bc7-890333758a4f','12495be8-694e-4b73-b391-62f36e6c42e2','2110','PAYE Payable','liability','KES',1,'2026-06-28 20:02:39'),('3644c6d3-2ed0-48d3-a482-a6600de541af','11f852eb-f735-4923-9fa4-538582e42160','2120','NHIF Payable','liability','KES',1,'2026-06-28 20:02:38'),('38109dda-2d30-4bab-a400-2c87c10d1368','12495be8-694e-4b73-b391-62f36e6c42e2','4100','Other Operating Income','revenue','KES',1,'2026-06-28 20:02:39'),('385a2eb4-12a1-4c26-a6b9-4f72805419aa','12495be8-694e-4b73-b391-62f36e6c42e2','5600','Repairs & Maintenance','expense','KES',1,'2026-06-28 20:02:39'),('3ba2ff3a-eb2b-4453-a5cd-87c79140bbb6','11f852eb-f735-4923-9fa4-538582e42160','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-28 20:02:38'),('3bd26aa0-5191-442b-9083-a3872c4b881d','12495be8-694e-4b73-b391-62f36e6c42e2','5300','Cold Chain & Storage','expense','KES',1,'2026-06-28 20:02:39'),('3c892c2a-0dd7-4034-ab9b-b1fa2c293b94','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-28 20:02:37'),('3ea47e64-0322-4557-99d7-63b52d32aa4e','12495be8-694e-4b73-b391-62f36e6c42e2','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-28 20:02:39'),('4412f125-8086-43f3-a60a-9a8c0c5ddc3f','12495be8-694e-4b73-b391-62f36e6c42e2','5400','Logistics & Delivery','expense','KES',1,'2026-06-28 20:02:39'),('47c65c6d-eb84-463e-9ffb-82174258ab52','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1010','Petty Cash','asset','KES',1,'2026-06-28 20:02:37'),('4aef8313-0e44-479a-a8a2-326c77d0f1fb','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1500','Fixed Assets','asset','KES',1,'2026-06-28 20:02:37'),('4b3eaff0-edbc-453d-b8ec-b80311e43cf1','b21fe9c1-79b2-490e-a254-87df2e52b4d9','6200','Bank & Payment Fees','expense','KES',1,'2026-06-28 20:02:37'),('4c5bae9d-bb7e-4a67-ac3b-554ede6aae2c','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1510','Accumulated Depreciation','asset','KES',1,'2026-06-28 20:02:37'),('4cdb376d-c7b0-46a1-9cee-b34bf521b46a','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1100','Accounts Receivable','asset','KES',1,'2026-06-28 20:02:37'),('55d3daff-814c-4add-88a1-110fcb960759','12495be8-694e-4b73-b391-62f36e6c42e2','5000','Cost of Goods Sold','expense','KES',1,'2026-06-28 20:02:39'),('5610892b-bf14-4a71-8c0d-102ea838f55b','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2000','Accounts Payable','liability','KES',1,'2026-06-28 20:02:37'),('5747cfe0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1010','Petty Cash','asset','KES',1,'2026-06-06 08:47:25'),('5755188e-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-06 08:47:25'),('576a29f4-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1300','Prepaid Expenses','asset','KES',1,'2026-06-06 08:47:25'),('57736ae8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-06 08:47:25'),('577b6e75-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1500','Fixed Assets','asset','KES',1,'2026-06-06 08:47:25'),('5788f79f-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','1510','Accumulated Depreciation','asset','KES',1,'2026-06-06 08:47:25'),('57969b52-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2100','Salaries Payable','liability','KES',1,'2026-06-06 08:47:25'),('579ff868-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2110','PAYE Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ad9877-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2120','NHIF Payable','liability','KES',1,'2026-06-06 08:47:25'),('57ba1e92-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2200','VAT Payable','liability','KES',1,'2026-06-06 08:47:26'),('57c8d184-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','2300','Accrued Expenses','liability','KES',1,'2026-06-06 08:47:26'),('57debf07-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3000','Owner\'s Equity','equity','KES',1,'2026-06-06 08:47:26'),('57f14e09-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','3100','Retained Earnings','equity','KES',1,'2026-06-06 08:47:26'),('57fa9b77-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-06 08:47:26'),('58084a9a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-06 08:47:26'),('5815d3b8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','4100','Other Operating Income','revenue','KES',1,'2026-06-06 08:47:26'),('581f510a-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5100','Payroll Expense','expense','KES',1,'2026-06-06 08:47:26'),('582f6ffc-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-06 08:47:26'),('583d1a33-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5300','Cold Chain & Storage','expense','KES',1,'2026-06-06 08:47:26'),('58478155-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5400','Logistics & Delivery','expense','KES',1,'2026-06-06 08:47:26'),('585a04b3-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5500','Marketing & Sales','expense','KES',1,'2026-06-06 08:47:27'),('586cfdc8-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5600','Repairs & Maintenance','expense','KES',1,'2026-06-06 08:47:27'),('587f0cf0-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','5700','Licenses & Compliance','expense','KES',1,'2026-06-06 08:47:27'),('588ccaf6-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6100','Depreciation Expense','expense','KES',1,'2026-06-06 08:47:27'),('58960883-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6200','Bank & Payment Fees','expense','KES',1,'2026-06-06 08:47:27'),('589f610b-6184-11f1-b99d-468b8c368d7b','tenant-default-0001','6900','Miscellaneous Expense','expense','KES',1,'2026-06-06 08:47:27'),('59cd103c-5921-40d9-886f-88076d06a7c9','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2120','NHIF Payable','liability','KES',1,'2026-06-28 20:02:37'),('600fddf6-e859-4acd-b968-25c1a7590cd8','11f852eb-f735-4923-9fa4-538582e42160','5300','Cold Chain & Storage','expense','KES',1,'2026-06-28 20:02:38'),('619103fb-a4c7-465d-88df-b0923a0fb443','11f852eb-f735-4923-9fa4-538582e42160','5700','Licenses & Compliance','expense','KES',1,'2026-06-28 20:02:38'),('65117627-4581-4a9d-afd0-d4295db5e08f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-28 20:02:37'),('65812f9b-3d9b-4ce8-860d-a225abb925fe','11f852eb-f735-4923-9fa4-538582e42160','2300','Accrued Expenses','liability','KES',1,'2026-06-28 20:02:38'),('65a8185f-0635-48d0-a0ae-129b0816378f','11f852eb-f735-4923-9fa4-538582e42160','5500','Marketing & Sales','expense','KES',1,'2026-06-28 20:02:38'),('67b39ff3-4b18-4521-ad42-0dd5ba15d127','12495be8-694e-4b73-b391-62f36e6c42e2','2000','Accounts Payable','liability','KES',1,'2026-06-28 20:02:39'),('696be58c-7f7f-43a8-bb6c-1bae8a64a4ba','11f852eb-f735-4923-9fa4-538582e42160','6900','Miscellaneous Expense','expense','KES',1,'2026-06-28 20:02:38'),('6b25abf5-d6d9-4b50-bd61-df4168cdecdd','12495be8-694e-4b73-b391-62f36e6c42e2','5100','Payroll Expense','expense','KES',1,'2026-06-28 20:02:39'),('6b9bc274-90f8-4499-94f3-1a586f0f42af','11f852eb-f735-4923-9fa4-538582e42160','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-28 20:02:38'),('6e0f9d83-0f64-4ced-a2ce-593fb1a284cd','11f852eb-f735-4923-9fa4-538582e42160','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-28 20:02:38'),('72666c46-9cd9-4366-b104-1f458fed433d','11f852eb-f735-4923-9fa4-538582e42160','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-28 20:02:38'),('78d0692a-2c82-491c-8661-c99ea8753f8e','11f852eb-f735-4923-9fa4-538582e42160','3100','Retained Earnings','equity','KES',1,'2026-06-28 20:02:38'),('7a5b475b-3d37-4a5e-a3b2-14fc570dc3a1','12495be8-694e-4b73-b391-62f36e6c42e2','2300','Accrued Expenses','liability','KES',1,'2026-06-28 20:02:39'),('7ecfa30e-98a6-4403-963a-45fc23c3dbb2','11f852eb-f735-4923-9fa4-538582e42160','2100','Salaries Payable','liability','KES',1,'2026-06-28 20:02:38'),('8732213e-9bb7-4756-9894-1f6642f6b620','12495be8-694e-4b73-b391-62f36e6c42e2','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-28 20:02:39'),('885b72f6-bce9-438d-851e-ee386bf16127','12495be8-694e-4b73-b391-62f36e6c42e2','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-28 20:02:39'),('8ca97c35-2cf9-4f8d-93e2-49756b18cbdf','12495be8-694e-4b73-b391-62f36e6c42e2','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-28 20:02:39'),('8e023c1d-8d90-4604-95e7-e309b3793312','11f852eb-f735-4923-9fa4-538582e42160','1000','Cash on Hand','asset','KES',1,'2026-06-28 20:02:38'),('8ee7e370-b0c0-412b-936e-f586bea30bb7','11f852eb-f735-4923-9fa4-538582e42160','2110','PAYE Payable','liability','KES',1,'2026-06-28 20:02:38'),('9184c324-ccb0-4d6c-9a52-3db0c1f18853','11f852eb-f735-4923-9fa4-538582e42160','1010','Petty Cash','asset','KES',1,'2026-06-28 20:02:38'),('9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7','12495be8-694e-4b73-b391-62f36e6c42e2','1000','Cash on Hand','asset','KES',1,'2026-06-28 20:02:39'),('9c1e45ec-8f0d-4ffe-a5a4-047c2cd4d66f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5300','Cold Chain & Storage','expense','KES',1,'2026-06-28 20:02:37'),('9d15b907-10c6-40b7-963a-ab68512a16eb','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3000','Owner\'s Equity','equity','KES',1,'2026-06-28 20:02:37'),('a1fba1f7-c374-4a6a-a52f-3c6e102be436','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-28 20:02:37'),('a9313ec8-989f-4847-be0f-e70bbb3971ee','12495be8-694e-4b73-b391-62f36e6c42e2','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-28 20:02:39'),('ad251388-db09-4c3f-96d6-772f94c8aec7','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5500','Marketing & Sales','expense','KES',1,'2026-06-28 20:02:37'),('ae14f3e7-cd44-44ae-bcb3-6acdc2401be0','11f852eb-f735-4923-9fa4-538582e42160','5400','Logistics & Delivery','expense','KES',1,'2026-06-28 20:02:38'),('ae47c343-c5c7-43e9-b905-ae947a109788','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2200','VAT Payable','liability','KES',1,'2026-06-28 20:02:37'),('ae51bb4f-ee46-46e1-a63f-57608b6c0843','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1300','Prepaid Expenses','asset','KES',1,'2026-06-28 20:02:37'),('b0ae99e6-34a9-4de9-8a3c-5bd543c96381','11f852eb-f735-4923-9fa4-538582e42160','5600','Repairs & Maintenance','expense','KES',1,'2026-06-28 20:02:38'),('b2ff2225-b159-4404-b09b-e0cb95982b78','12495be8-694e-4b73-b391-62f36e6c42e2','3100','Retained Earnings','equity','KES',1,'2026-06-28 20:02:39'),('b3ded6ed-cb0c-478c-beca-58313c99911b','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5000','Cost of Goods Sold','expense','KES',1,'2026-06-28 20:02:37'),('b6bd1306-e32b-45e8-94ad-c826c7552a96','11f852eb-f735-4923-9fa4-538582e42160','1510','Accumulated Depreciation','asset','KES',1,'2026-06-28 20:02:38'),('b860c65c-fca8-475e-9f6f-a6bb01d181c3','12495be8-694e-4b73-b391-62f36e6c42e2','3000','Owner\'s Equity','equity','KES',1,'2026-06-28 20:02:39'),('b8f79c26-85fe-4ded-934b-8e354aa259ba','b21fe9c1-79b2-490e-a254-87df2e52b4d9','6100','Depreciation Expense','expense','KES',1,'2026-06-28 20:02:37'),('be2b6377-1924-4973-a63d-27051ddf03bd','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4100','Other Operating Income','revenue','KES',1,'2026-06-28 20:02:37'),('c0e7abda-b8d1-4985-862a-5385f27903cf','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1000','Cash on Hand','asset','KES',1,'2026-06-28 20:02:37'),('c46a2b0a-b4ae-4f08-ac55-046fed6efed1','11f852eb-f735-4923-9fa4-538582e42160','4100','Other Operating Income','revenue','KES',1,'2026-06-28 20:02:38'),('d2ec220c-387e-4d04-951c-91a49b2c7a6e','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1400','M-Pesa / Mobile Money Clearing','asset','KES',1,'2026-06-28 20:02:37'),('d33d6d7a-5352-46ea-930a-0618427b58a5','12495be8-694e-4b73-b391-62f36e6c42e2','5700','Licenses & Compliance','expense','KES',1,'2026-06-28 20:02:39'),('d5e695b9-75a7-4b64-a6d8-95d46eb06b0f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-28 20:02:37'),('d9814932-6c60-4284-94ba-dce98344a70c','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-28 20:02:37'),('dcd99c6d-ef76-43d1-9da6-251d232158ef','12495be8-694e-4b73-b391-62f36e6c42e2','6200','Bank & Payment Fees','expense','KES',1,'2026-06-28 20:02:39'),('de33ff37-65e0-4522-a67a-56ae14939a91','12495be8-694e-4b73-b391-62f36e6c42e2','4020','Marketplace Commission Income','revenue','KES',1,'2026-06-28 20:02:39'),('df349744-967c-4579-88ea-75631910a7c9','11f852eb-f735-4923-9fa4-538582e42160','1500','Fixed Assets','asset','KES',1,'2026-06-28 20:02:38'),('e1cbc2f3-05b9-43d9-ab1e-e5d4162e635d','12495be8-694e-4b73-b391-62f36e6c42e2','6100','Depreciation Expense','expense','KES',1,'2026-06-28 20:02:39'),('e68df44b-0530-41d8-b5a1-5b4b7cf2f90f','11f852eb-f735-4923-9fa4-538582e42160','1100','Accounts Receivable','asset','KES',1,'2026-06-28 20:02:38'),('e879f08e-69d0-48d3-bb4e-67bdd55e583c','12495be8-694e-4b73-b391-62f36e6c42e2','1300','Prepaid Expenses','asset','KES',1,'2026-06-28 20:02:39'),('ec52a844-f54d-4d17-97fb-fed47a2e6a6c','12495be8-694e-4b73-b391-62f36e6c42e2','6900','Miscellaneous Expense','expense','KES',1,'2026-06-28 20:02:39'),('eeb9803a-308e-4052-b5f6-4ff9b975de4e','12495be8-694e-4b73-b391-62f36e6c42e2','2120','NHIF Payable','liability','KES',1,'2026-06-28 20:02:39'),('efa89242-645e-49eb-9583-7f127ea4b6a7','11f852eb-f735-4923-9fa4-538582e42160','4010','Sales Revenue — Processed Products','revenue','KES',1,'2026-06-28 20:02:38'),('f20878df-f648-476d-931c-041a39ded5ee','12495be8-694e-4b73-b391-62f36e6c42e2','2200','VAT Payable','liability','KES',1,'2026-06-28 20:02:39'),('f38baf2c-21e5-4bc2-8231-5418913d2616','12495be8-694e-4b73-b391-62f36e6c42e2','2100','Salaries Payable','liability','KES',1,'2026-06-28 20:02:39'),('f41d78b2-eb17-47b5-b718-23109437a694','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2300','Accrued Expenses','liability','KES',1,'2026-06-28 20:02:37'),('f5b2b170-92be-4656-b9be-cf16c807c2b4','11f852eb-f735-4923-9fa4-538582e42160','5200','Fuel & Vessel Operations','expense','KES',1,'2026-06-28 20:02:38'),('f7184d26-0d55-4ccf-b9bd-4cd5ba15b8d8','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5100','Payroll Expense','expense','KES',1,'2026-06-28 20:02:37'),('f7a49e88-86ce-494e-bf50-7f8f7abf3a2d','11f852eb-f735-4923-9fa4-538582e42160','5000','Cost of Goods Sold','expense','KES',1,'2026-06-28 20:02:38'),('f7e473c2-ed68-4a32-9269-ab18ba68ad1f','12495be8-694e-4b73-b391-62f36e6c42e2','5500','Marketing & Sales','expense','KES',1,'2026-06-28 20:02:39'),('f94f74b6-01a8-4f87-ad79-d66fb6156092','11f852eb-f735-4923-9fa4-538582e42160','3000','Owner\'s Equity','equity','KES',1,'2026-06-28 20:02:38'),('fc82d94e-216b-4f12-82cb-3e2cddc03194','11f852eb-f735-4923-9fa4-538582e42160','5100','Payroll Expense','expense','KES',1,'2026-06-28 20:02:38'),('fe86bc19-989c-4025-8f60-1c4809dd9904','11f852eb-f735-4923-9fa4-538582e42160','1210','Inventory — Frozen & Processed','asset','KES',1,'2026-06-28 20:02:38'),('gl-ap-01','tenant-default-0001','2000','Accounts Payable','liability','KES',1,'2026-06-06 08:45:20'),('gl-ar-01','tenant-default-0001','1100','Accounts Receivable','asset','KES',1,'2026-06-06 08:45:20'),('gl-cash-01','tenant-default-0001','1000','Cash on Hand','asset','KES',1,'2026-06-06 08:45:20'),('gl-exp-01','tenant-default-0001','5000','Cost of Goods Sold','expense','KES',1,'2026-06-06 08:45:20'),('gl-inv-01','tenant-default-0001','1200','Inventory — Fresh Fish','asset','KES',1,'2026-06-06 08:45:20'),('gl-rev-01','tenant-default-0001','4000','Sales Revenue — Seafood','revenue','KES',1,'2026-06-06 08:45:20');
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
INSERT INTO `gps_telemetry` VALUES ('53808682-b5f0-485d-a52a-a785a4469dc2','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8',NULL,-4.03800000,39.67200000,8.50,NULL,NULL,'2026-06-28 20:02:39','iot','2026-06-28 20:02:39'),('e23bb7e4-e642-4697-a08a-7c84095d3207','11f852eb-f735-4923-9fa4-538582e42160','0949445a-9e95-4a3d-aa10-11ba374a0dfb',NULL,-4.03900000,39.67100000,8.50,NULL,NULL,'2026-06-28 20:02:39','iot','2026-06-28 20:02:39'),('ec512d99-b792-4d79-b1e4-615dec8b6893','b21fe9c1-79b2-490e-a254-87df2e52b4d9','208268ef-f228-4e66-9222-0f003acd2f1b',NULL,-4.04000000,39.67000000,8.50,NULL,NULL,'2026-06-28 20:02:38','iot','2026-06-28 20:02:38');
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
INSERT INTO `hr_employees` VALUES ('20bcb7ae-61a1-4f8b-a18a-bb3817255e50','12495be8-694e-4b73-b391-62f36e6c42e2',NULL,'EMP-3B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-10',32000.00,'active','2026-06-28 20:02:39','2026-06-28 20:02:39',NULL,NULL),('213760f5-1307-43ab-8d1e-824188a1f915','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','EMP-3','Demo Captain','Operations','Fleet Captain','2025-05-24',45000.00,'active','2026-06-28 20:02:39','2026-06-28 20:02:39',NULL,NULL),('34bbf970-9226-43b7-95fc-412748686f2f','b21fe9c1-79b2-490e-a254-87df2e52b4d9',NULL,'EMP-1B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-10',32000.00,'active','2026-06-28 20:02:37','2026-06-28 20:02:37',NULL,NULL),('4a9f22e4-53cb-4335-a2c9-8f4bbf4e1831','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','EMP-2','Demo Captain','Operations','Fleet Captain','2025-05-24',45000.00,'active','2026-06-28 20:02:38','2026-06-28 20:02:38',NULL,NULL),('b9751f4a-ec9e-48ee-b634-2911bff885fe','11f852eb-f735-4923-9fa4-538582e42160',NULL,'EMP-2B','Demo Storekeeper','Cold Chain','Storekeeper','2025-12-10',32000.00,'active','2026-06-28 20:02:38','2026-06-28 20:02:38',NULL,NULL),('f00f5c06-3492-4391-81c7-17d9dc4696a6','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','EMP-1','Demo Captain','Operations','Fleet Captain','2025-05-24',45000.00,'active','2026-06-28 20:02:37','2026-06-28 20:02:37',NULL,NULL);
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
INSERT INTO `hr_payroll_runs` VALUES ('12f1fd2d-8315-450d-bca4-bf72ca6ed080','11f852eb-f735-4923-9fa4-538582e42160','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-28 20:02:38',NULL,NULL,NULL),('94e6cebd-29b7-4882-9a6c-cc6afe31575e','b21fe9c1-79b2-490e-a254-87df2e52b4d9','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-28 20:02:37',NULL,NULL,NULL),('bee312a1-d74d-47b1-9b41-f7469478dab1','12495be8-694e-4b73-b391-62f36e6c42e2','2026-05-01','2026-05-31','paid',125000.00,98000.00,'2026-06-28 20:02:39',NULL,NULL,NULL);
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
INSERT INTO `insurance_claims` VALUES ('36488e08-dec7-46b6-96ce-1bc9ef509f08','11f852eb-f735-4923-9fa4-538582e42160','73b54e23-cd22-4b6e-b6ad-6b72bb9c45b4','0949445a-9e95-4a3d-aa10-11ba374a0dfb','CLM-2','2026-05-29','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('4d626ba6-2dec-4e0e-b796-97ca3942295d','b21fe9c1-79b2-490e-a254-87df2e52b4d9','5d843a98-9e7d-477e-a9dc-e2a1af105566','208268ef-f228-4e66-9222-0f003acd2f1b','CLM-1','2026-05-29','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('97c9d252-4332-4cf8-a4a2-5d668753e762','12495be8-694e-4b73-b391-62f36e6c42e2','79aa40d3-8298-4aa5-be38-cfd0dcd418a2','84d88956-cb9b-4069-945c-b3b057d32cf8','CLM-3','2026-05-29','Minor hull damage from docking',45000.00,NULL,'reviewing',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `insurance_policies` VALUES ('5d843a98-9e7d-477e-a9dc-e2a1af105566','b21fe9c1-79b2-490e-a254-87df2e52b4d9','208268ef-f228-4e66-9222-0f003acd2f1b','POL-1','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-29','2027-04-29','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('73b54e23-cd22-4b6e-b6ad-6b72bb9c45b4','11f852eb-f735-4923-9fa4-538582e42160','0949445a-9e95-4a3d-aa10-11ba374a0dfb','POL-2','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-29','2027-04-29','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('79aa40d3-8298-4aa5-be38-cfd0dcd418a2','12495be8-694e-4b73-b391-62f36e6c42e2','84d88956-cb9b-4069-945c-b3b057d32cf8','POL-3','Kenya Marine Insurance','hull',85000.00,2500000.00,'KES','2026-04-29','2027-04-29','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `integration_connections` VALUES ('00065231-9565-45be-b481-2fc6a7a312b9','11f852eb-f735-4923-9fa4-538582e42160','sms','SMS Gateway','{}','inactive',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('2905e04e-ee85-46df-974b-2c613464f397','12495be8-694e-4b73-b391-62f36e6c42e2','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('4dfd91b8-4ff4-4f4c-9274-b4c8ca3a7a73','b21fe9c1-79b2-490e-a254-87df2e52b4d9','sms','SMS Gateway','{}','inactive',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('653c3624-0ea6-4ce9-a6b8-fff2c0c7f27a','12495be8-694e-4b73-b391-62f36e6c42e2','sms','SMS Gateway','{}','inactive',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('87fa8241-4292-477c-8532-6c7abefb9fd6','11f852eb-f735-4923-9fa4-538582e42160','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('a3a14206-4393-4c56-8749-1946485de82f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','mpesa','M-Pesa Sandbox','{\"mode\": \"sandbox\"}','inactive',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `inventory_batches` VALUES ('073eb773-bfb1-46a0-812e-86379f479763','b21fe9c1-79b2-490e-a254-87df2e52b4d9','SKU-COASTFISH','Coast Fish Cooperative Batch','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e','coastfish-batch-1',200.000,0.000,'fresh',NULL,'catch','b2c57a57-4228-417d-9a2d-0123ab9571c2','available','2026-06-28 20:02:37','2026-06-28 20:02:37'),('525f3678-3d31-4bee-9452-a7a734fcf345','11f852eb-f735-4923-9fa4-538582e42160','SKU-LAMUSEA','Lamu Sea Ventures Batch','8b103f48-5204-469b-abe2-564f180c98c0','lamusea-batch-1',205.000,0.000,'fresh',NULL,'catch','f6b82e23-dad6-4bd1-8392-db3e596b8b29','available','2026-06-28 20:02:38','2026-06-28 20:02:38'),('9be80f60-b45d-40e8-b454-76b5f5e03199','12495be8-694e-4b73-b391-62f36e6c42e2','SKU-AQUAERP-DEMO','AquaERP Showcase Tenant Batch','ca801c62-4773-41aa-b017-c98eec91def1','aquaerp-demo-batch-1',210.000,0.000,'fresh',NULL,'catch','088cad5e-d09e-4276-84a0-87147c7bb3e1','available','2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `iot_devices` VALUES ('57d3536f-b39f-4b02-80da-360b333d1d18','11f852eb-f735-4923-9fa4-538582e42160','dev_26c817c7','8a5b8dab25b94918bb43f2a70bcab9a29ae3f58411be2216990d45870fbf40d1','Chill probe 1','temperature_probe',NULL,'e26641a5-1474-45ff-92fc-05eec74b34ec','e584485b-f8f1-4570-b5f9-d51a0b9ed210',NULL,NULL,'active','2026-06-28 20:02:39','2026-06-28 20:02:39','2026-06-28 20:02:39'),('74419e9b-f1fc-447f-be01-f0db39d1c93c','b21fe9c1-79b2-490e-a254-87df2e52b4d9','dev_a0f30e72','ef000f4f35055f532a6ed83c0190c2c70eef2c260088f8c009d30748874a0b4a','Chill probe 1','temperature_probe',NULL,'992f1b20-33a9-476d-a5b8-3d2d950f2e12','4bb4e307-c3a4-450e-a4d8-86caffd34d09',NULL,NULL,'active','2026-06-28 20:02:38','2026-06-28 20:02:38','2026-06-28 20:02:38'),('fbb98dcf-540e-4714-867d-6486f51a7183','12495be8-694e-4b73-b391-62f36e6c42e2','dev_871a0f7f','d9441ca42289291be54f9d2ae77e0f932c8792acdd8c1ec5e0d7c62eeca6a5cb','Chill probe 1','temperature_probe',NULL,'954ef5f5-6433-4b8c-89be-b31895b8081e','5c43c668-8876-463d-8161-d41c147bb8c6',NULL,NULL,'active','2026-06-28 20:02:39','2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `journal_entries` VALUES ('002f51ba-44e1-4de6-97b3-da99dd00c92a','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-12','2026-06-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('115ce3e0-3906-4f28-869f-9d8d41e40e04','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-4','2025-10-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('2267993a-9fb6-4fc5-9dae-2b2560eca6c1','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-6','2025-12-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('2ce70a5b-79ca-4943-af45-650a6a6c228f','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-10','2026-04-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('5b3f4ebf-01af-4e10-a558-bdc096d5e65e','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-11','2026-05-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('6042df6c-e118-4973-9099-28df3ee11879','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-2','2025-08-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('62715b70-87f5-4e96-af6a-f0e5a050c1ab','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-11','2026-05-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('6a6d04b8-84ad-4786-83b7-ba1d13546870','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-12','2026-06-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('6b0ab782-a7b0-43b8-af95-1351fb210f40','11f852eb-f735-4923-9fa4-538582e42160','JE-DEMO-2','2026-06-28','Demo sales recognition','order',NULL,'posted','c45658ae-e152-4f0a-89cd-c8318545b516','2026-06-28 20:02:39'),('7a625805-ce7f-4efd-ba67-02624907e7e0','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-10','2026-04-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('7cbbde85-41a6-448b-b6e9-9f4e5e0cd9f9','b21fe9c1-79b2-490e-a254-87df2e52b4d9','JE-DEMO-1','2026-06-28','Demo sales recognition','order',NULL,'posted','83ab655f-845d-4ec5-ac83-904b755c1a16','2026-06-28 20:02:37'),('92da584f-7a78-4fb8-ba02-ff96130f3330','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-9','2026-03-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('94d60aec-1ea1-42d9-8660-669d5f1d3c84','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-9','2026-03-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('9c43db8b-cff2-4cca-8af6-54ac3ecae919','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-5','2025-11-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('9dc40ec4-eced-47ff-b346-52cfcf128a68','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-3','2025-09-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('a7aea12a-0be6-4a20-a30d-4e0fac98573f','12495be8-694e-4b73-b391-62f36e6c42e2','JE-DEMO-3','2026-06-28','Demo sales recognition','order',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:39'),('ae2cdf20-1699-42f8-8c84-4b9270e117af','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-2','2025-08-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('bfedb929-6183-424a-817e-6dd6be518627','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-8','2026-02-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('c01d8aad-25fb-4c4a-a62b-5e874dee4285','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-6','2025-12-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('c6502151-89f6-4e79-bfef-e325f2df28dc','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-1','2025-07-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('cdf4bde6-d7e1-4bef-9cdf-b47e3fa34ad8','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-1','2025-07-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('cdfe88d4-0525-4dce-95ec-6536a5a2e2a8','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-8','2026-02-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('da0e3831-9c16-4b13-b13e-8004914472a2','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-5','2025-11-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('dc98a48c-14cc-4e0a-98a2-5a56710f0a7e','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-3','2025-09-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('e2e68564-30cc-456d-8231-d96ed67e91e9','12495be8-694e-4b73-b391-62f36e6c42e2','JE-EXP-2025-7','2026-01-28','Monthly Operations Expense','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('e8be586d-d474-41a1-9ee5-8ebf5c188d6f','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-7','2026-01-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47'),('fc68aea8-b85e-40eb-adb6-57f27b39d7ee','12495be8-694e-4b73-b391-62f36e6c42e2','JE-REV-2025-4','2025-10-28','Monthly Sales Summary','manual',NULL,'posted','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:47');
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
INSERT INTO `journal_lines` VALUES ('01813b63-061c-4c94-91e1-b7376b00e794','6b0ab782-a7b0-43b8-af95-1351fb210f40','8e023c1d-8d90-4604-95e7-e309b3793312',26000.00,0.00,'Cash receipt'),('03dcf30f-2184-4902-83cb-1bcf5572ddd8','94d60aec-1ea1-42d9-8660-669d5f1d3c84','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',76617.15,0.00,'Operating expense recognition'),('03f28dbe-7280-41c7-b44c-bbb59b014efa','2267993a-9fb6-4fc5-9dae-2b2560eca6c1','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',175947.23,0.00,'Sales cash receipts'),('0569b003-12d5-4f4f-8a3d-b136f3138de4','2ce70a5b-79ca-4943-af45-650a6a6c228f','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',90211.06,0.00,'Operating expense recognition'),('10c5bd50-1159-4775-8f67-bb18223de050','cdfe88d4-0525-4dce-95ec-6536a5a2e2a8','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,87436.13,'Cash disbursement'),('12d6a337-682f-4605-a23d-feb7cc0f48e3','115ce3e0-3906-4f28-869f-9d8d41e40e04','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,98620.00,'Cash disbursement'),('1568ae79-2253-4dad-bdbe-219a3b4bb8c3','fc68aea8-b85e-40eb-adb6-57f27b39d7ee','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',248309.91,0.00,'Sales cash receipts'),('175620d2-342e-4564-842d-0d384b1da8c0','002f51ba-44e1-4de6-97b3-da99dd00c92a','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,120290.00,'Cash disbursement'),('1bcc4a9c-2c9a-419e-b503-d716c796780d','e8be586d-d474-41a1-9ee5-8ebf5c188d6f','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',148582.79,0.00,'Sales cash receipts'),('31e7750c-d8f8-4cb8-a23e-8f9a01aba4d2','a7aea12a-0be6-4a20-a30d-4e0fac98573f','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,27000.00,'Sales revenue'),('34d83684-4d13-4059-a4de-f66b8d522859','7cbbde85-41a6-448b-b6e9-9f4e5e0cd9f9','d9814932-6c60-4284-94ba-dce98344a70c',0.00,25000.00,'Sales revenue'),('34fcef5e-e659-4183-8cfc-dffe521ada7c','2267993a-9fb6-4fc5-9dae-2b2560eca6c1','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,175947.23,'Monthly revenue recognition'),('3714905c-42eb-48b5-b8e7-90dbd49e2e9a','5b3f4ebf-01af-4e10-a558-bdc096d5e65e','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,230858.55,'Monthly revenue recognition'),('3caa3f5e-b420-475d-a0d2-2a5839370568','6a6d04b8-84ad-4786-83b7-ba1d13546870','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,205820.00,'Monthly revenue recognition'),('3dc6602f-bbeb-4fbb-b252-690eb5badc8c','92da584f-7a78-4fb8-ba02-ff96130f3330','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,189589.00,'Monthly revenue recognition'),('48807899-34a3-4636-9867-fc75c5eef949','e8be586d-d474-41a1-9ee5-8ebf5c188d6f','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,148582.79,'Monthly revenue recognition'),('49601cdd-633e-40cf-9942-ef7743d952ba','7cbbde85-41a6-448b-b6e9-9f4e5e0cd9f9','c0e7abda-b8d1-4985-862a-5385f27903cf',25000.00,0.00,'Cash receipt'),('49740f47-e34d-49ad-911e-c21f9aed4657','cdfe88d4-0525-4dce-95ec-6536a5a2e2a8','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',87436.13,0.00,'Operating expense recognition'),('57025397-b9cf-4fee-9188-5b1bb71434d1','c6502151-89f6-4e79-bfef-e325f2df28dc','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,150329.49,'Monthly revenue recognition'),('57e6b39a-3a81-47f7-a842-7f5a52d3ef01','ae2cdf20-1699-42f8-8c84-4b9270e117af','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,85358.57,'Cash disbursement'),('5cb14ad0-8feb-40fa-9b0f-a3e1b31455e6','c01d8aad-25fb-4c4a-a62b-5e874dee4285','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',109428.41,0.00,'Operating expense recognition'),('6036aa42-7484-4861-9430-f63308112cee','9c43db8b-cff2-4cca-8af6-54ac3ecae919','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,230871.33,'Monthly revenue recognition'),('618b2779-c40b-42eb-a327-ed985d4b52fc','ae2cdf20-1699-42f8-8c84-4b9270e117af','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',85358.57,0.00,'Operating expense recognition'),('6606e2ae-9668-47d6-9d68-a749fcd399b4','62715b70-87f5-4e96-af6a-f0e5a050c1ab','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,111384.05,'Cash disbursement'),('775ffd43-34f4-475c-aad9-a551ff84751f','bfedb929-6183-424a-817e-6dd6be518627','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,149927.88,'Monthly revenue recognition'),('7ee9ad6f-357b-4789-8643-b54c35c4a885','da0e3831-9c16-4b13-b13e-8004914472a2','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,107467.05,'Cash disbursement'),('8047a596-f36b-4ef1-99ac-e00977363c36','c6502151-89f6-4e79-bfef-e325f2df28dc','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',150329.49,0.00,'Sales cash receipts'),('823879e6-8157-4cbe-9b2d-65321ef7d306','e2e68564-30cc-456d-8231-d96ed67e91e9','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,108393.24,'Cash disbursement'),('84a4e764-770a-4b24-a298-f93bf1f56c31','fc68aea8-b85e-40eb-adb6-57f27b39d7ee','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,248309.91,'Monthly revenue recognition'),('84d54b4a-b6bf-4fce-81ef-64468646cc25','cdf4bde6-d7e1-4bef-9cdf-b47e3fa34ad8','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',103586.51,0.00,'Operating expense recognition'),('88b489fd-cd23-43a6-be3c-647f780b6d17','62715b70-87f5-4e96-af6a-f0e5a050c1ab','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',111384.05,0.00,'Operating expense recognition'),('9263914e-3900-4d4d-bebb-1a51a8acb88f','cdf4bde6-d7e1-4bef-9cdf-b47e3fa34ad8','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,103586.51,'Cash disbursement'),('9669eb95-f8c9-4650-8954-b347f0227ade','dc98a48c-14cc-4e0a-98a2-5a56710f0a7e','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,84570.39,'Cash disbursement'),('967e4e0c-f4dc-4add-a555-a6d3c2e024a9','c01d8aad-25fb-4c4a-a62b-5e874dee4285','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,109428.41,'Cash disbursement'),('96a81ef4-054d-4f6b-bbac-05bf5cc8c931','5b3f4ebf-01af-4e10-a558-bdc096d5e65e','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',230858.55,0.00,'Sales cash receipts'),('9eda3579-1be0-4adb-bbe9-1e47f40b8994','bfedb929-6183-424a-817e-6dd6be518627','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',149927.88,0.00,'Sales cash receipts'),('a0937009-6bc0-4c4f-bac5-b3a54675fb08','da0e3831-9c16-4b13-b13e-8004914472a2','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',107467.05,0.00,'Operating expense recognition'),('a203e235-541b-4885-a6f7-5cb2b002a821','7a625805-ce7f-4efd-ba67-02624907e7e0','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',236175.87,0.00,'Sales cash receipts'),('a569c24e-bb0b-4b6c-a05d-ce87271502e3','002f51ba-44e1-4de6-97b3-da99dd00c92a','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',120290.00,0.00,'Operating expense recognition'),('a702f6ff-a720-42d6-8d75-c65e3d6d9f5b','6b0ab782-a7b0-43b8-af95-1351fb210f40','3ba2ff3a-eb2b-4453-a5cd-87c79140bbb6',0.00,26000.00,'Sales revenue'),('b2879d99-7941-48de-819d-14c7e724d989','9c43db8b-cff2-4cca-8af6-54ac3ecae919','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',230871.33,0.00,'Sales cash receipts'),('bba98bb6-1283-4160-8372-5e87ad799de0','94d60aec-1ea1-42d9-8660-669d5f1d3c84','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,76617.15,'Cash disbursement'),('c1ce1376-e015-4543-a495-5d2edb26aba5','a7aea12a-0be6-4a20-a30d-4e0fac98573f','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',27000.00,0.00,'Cash receipt'),('c451873d-66d6-49fc-9f38-3655e9a3df55','115ce3e0-3906-4f28-869f-9d8d41e40e04','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',98620.00,0.00,'Operating expense recognition'),('d687fb44-f18e-4f1e-8b07-fcea56847fcb','2ce70a5b-79ca-4943-af45-650a6a6c228f','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',0.00,90211.06,'Cash disbursement'),('e14e4c3f-6f99-455d-9501-d63b322103c0','92da584f-7a78-4fb8-ba02-ff96130f3330','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',189589.00,0.00,'Sales cash receipts'),('e4107e5b-2ba8-47dc-ac7b-a61db6639674','9dc40ec4-eced-47ff-b346-52cfcf128a68','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,207770.92,'Monthly revenue recognition'),('e456cad5-7702-4af9-b747-8eb1d03fb247','7a625805-ce7f-4efd-ba67-02624907e7e0','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,236175.87,'Monthly revenue recognition'),('e54a72f2-a80a-4f6c-8125-ab6ddab48b17','6042df6c-e118-4973-9099-28df3ee11879','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',162106.94,0.00,'Sales cash receipts'),('e74aa233-247e-49bd-8a6e-394decdfe1af','dc98a48c-14cc-4e0a-98a2-5a56710f0a7e','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',84570.39,0.00,'Operating expense recognition'),('e84fe968-6161-4e69-ac36-8f40b2b834e5','6a6d04b8-84ad-4786-83b7-ba1d13546870','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',205820.00,0.00,'Sales cash receipts'),('f31a9d94-c63d-42e0-8757-4d2c52bbab28','6042df6c-e118-4973-9099-28df3ee11879','a9313ec8-989f-4847-be0f-e70bbb3971ee',0.00,162106.94,'Monthly revenue recognition'),('f4b34049-161f-4957-b1b6-51c1050519e5','9dc40ec4-eced-47ff-b346-52cfcf128a68','9a7c97c9-ee7f-4e03-8b4d-4c50209f92c7',207770.92,0.00,'Sales cash receipts'),('fdeb14b2-8ce3-4925-9846-9d1d4423c06e','e2e68564-30cc-456d-8231-d96ed67e91e9','6b25abf5-d6d9-4b50-bd61-df4168cdecdd',108393.24,0.00,'Operating expense recognition');
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
INSERT INTO `landing_sites` VALUES ('bffb581b-839e-4a74-a7dd-06f6a5ab58be','b21fe9c1-79b2-490e-a254-87df2e52b4d9','Kwale Landing','coastfish-lnd','Kwale',-4.65000000,39.38000000,NULL,'active','2026-06-28 20:02:37','2026-06-28 20:02:37'),('f059f52b-3eb1-4588-85fb-ccd0298a8f75','11f852eb-f735-4923-9fa4-538582e42160','Lamu Landing','lamusea-lnd','Lamu',-2.27000000,40.90000000,NULL,'active','2026-06-28 20:02:38','2026-06-28 20:02:38'),('f5e4d538-33da-4d3a-91b4-4ea96b54b3bf','12495be8-694e-4b73-b391-62f36e6c42e2','Mombasa Landing','aquaerp-demo-lnd','Mombasa',-4.04000000,39.67000000,NULL,'active','2026-06-28 20:02:39','2026-06-28 20:02:39');
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
INSERT INTO `licenses` VALUES ('6fccf9ff-7022-481a-8ef7-8899c371500f','12495be8-694e-4b73-b391-62f36e6c42e2','a8925060-2a3a-4829-a50f-3530a67d147b','trading','LIC-SC-2','2025-07-08','2026-07-08',NULL,'active','2026-06-28 20:02:44','2026-06-28 20:02:44'),('9c05fb84-aea5-489a-ac93-5a4e9d85dd34','12495be8-694e-4b73-b391-62f36e6c42e2','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','fishing','LIC-SC-1','2025-06-13','2026-06-13',NULL,'expired','2026-06-28 20:02:44','2026-06-28 20:02:44'),('d99ba0db-26a2-4df3-b24d-d788863849ba','12495be8-694e-4b73-b391-62f36e6c42e2','02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','fishing','LIC-SC-4','2025-12-25','2026-12-25',NULL,'active','2026-06-28 20:02:44','2026-06-28 20:02:44'),('db5a63c3-da83-4423-b065-e58e2827a54f','12495be8-694e-4b73-b391-62f36e6c42e2','77b36613-6a88-46c2-9ea8-8a0edaf28dfa','transportation','LIC-SC-3','2025-12-25','2026-12-25',NULL,'active','2026-06-28 20:02:44','2026-06-28 20:02:44');
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
INSERT INTO `marketplace_vendors` VALUES ('00bed5df-a0c1-44e4-bb30-cfa7f04e8c93','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','Lamu Sea Ventures Seafood Shop',10.00,'active','2026-06-28 20:02:38'),('2760c482-3445-4a36-8531-14737de041b5','11f852eb-f735-4923-9fa4-538582e42160','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Lamu Sea Ventures Shared Vendor Shop',12.00,'active','2026-06-28 20:02:38'),('2a5c1499-799c-4691-8eb0-5bb589e72bf2','12495be8-694e-4b73-b391-62f36e6c42e2','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','AquaERP Showcase Tenant Shared Vendor Shop',12.00,'active','2026-06-28 20:02:39'),('6ca6cc51-cec8-45b5-8a6b-6499505308ab','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','AquaERP Showcase Tenant Seafood Shop',10.00,'active','2026-06-28 20:02:39'),('9f5d11f2-f55e-4b13-8120-2e2cf9618b21','b21fe9c1-79b2-490e-a254-87df2e52b4d9','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','Coast Fish Cooperative Shared Vendor Shop',12.00,'active','2026-06-28 20:02:37'),('e6611442-c296-4d91-ab93-03a8f8f70607','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','Coast Fish Cooperative Seafood Shop',10.00,'active','2026-06-28 20:02:37');
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
INSERT INTO `notifications` VALUES ('21427f97-7f84-4e59-a66a-6259886029d2','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-28 20:02:40'),('3c29178a-0685-416a-b791-fedcf8696b2c','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-28 20:02:39'),('61825986-f764-47ac-981b-094580e1f78a','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-28 20:02:40'),('9cc715e6-0ce0-4166-9734-d92c75b3f670','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-28 20:02:39'),('b4c3c91d-e6f4-4252-b040-ac9bf3ab3368','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','success','Trip recorded','Your latest fishing trip was saved.',NULL,0,NULL,'2026-06-28 20:02:38'),('efa89d76-a6f2-49d8-bea5-bcd1897c238e','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','info','Order confirmed','A marketplace order was confirmed.',NULL,0,NULL,'2026-06-28 20:02:38');
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
INSERT INTO `order_items` (`id`, `order_id`, `listing_id`, `species_id`, `quantity_kg`, `unit_price`, `created_at`) VALUES ('08449dd8-c214-4188-a4dd-e3692f00a775','08fdd020-1d8f-402c-a3bd-de09ce7973cf',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',110.00,370.00,'2026-06-28 20:02:42'),('08846fc9-22a4-4036-b06e-fab7cc95320c','8b364c9f-8939-4bf7-85ac-a2b3708109a0',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',90.00,430.00,'2026-06-28 20:02:43'),('0d885dc3-efab-4328-af2b-409376aaa1a1','b064fbd1-1978-4716-9554-4ca6d813c5c3','d9b2bb96-bd93-44c2-a968-ccbcaa7c537d','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e',25.00,420.00,'2026-06-28 20:02:37'),('1d66ae52-abd4-4652-9f44-78261c6b5fe2','93ef9732-df9c-4506-8123-0eb009f381de',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',100.00,350.00,'2026-06-28 20:02:42'),('1e273241-a521-4753-9500-95f8f1f24218','1cd47d96-56f6-4222-8434-f157fa1d4aeb',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',70.00,390.00,'2026-06-28 20:02:42'),('28ac3743-e4ac-4f79-bb66-edb23a4cc14d','5f1ed953-a4e4-4540-8659-2536b6f2be78',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',130.00,410.00,'2026-06-28 20:02:43'),('2e1e9ce8-06a2-45c2-8fc1-38e74e1dca62','45cee3d1-0ec7-4be8-b503-f320aa3a967c',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',80.00,410.00,'2026-06-28 20:02:43'),('395157cc-7baf-418e-ad54-c6c4b449c2ea','bf864f06-c983-448e-8d4e-ca2f2698a6d9',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',130.00,410.00,'2026-06-28 20:02:43'),('3cd4092f-48da-4ff7-9a7f-35d827948ecf','9a727e96-cbfd-4ad9-845c-9bfcb2deb79f',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',70.00,390.00,'2026-06-28 20:02:43'),('45ede91f-4c15-44ad-9da9-4556469a17af','fe2c9b7b-03f8-4b58-a5b8-27b6c10682e7',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',60.00,370.00,'2026-06-28 20:02:43'),('4ecbc0c0-847e-4f78-9d1d-4a7d5f4a6f8f','c905964e-7765-4b5a-ab07-2e4d42897a8f',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',90.00,430.00,'2026-06-28 20:02:43'),('51c48cb4-74ac-4567-a0be-3d2456d4f6a7','c1441989-1d31-4931-93e0-bf86b7b51f40',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',100.00,350.00,'2026-06-28 20:02:43'),('52d5f0bd-3c92-407a-ac5e-d0f3c00bf9a6','8b1465ef-6a40-41ab-b54c-0ff71da74cec',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',50.00,350.00,'2026-06-28 20:02:42'),('5e6b3634-571b-4906-b057-b3dca775d24d','f9907338-fed0-4d6e-a85c-2b5fa33fed22',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',120.00,390.00,'2026-06-28 20:02:43'),('63c079bd-7160-45b0-8fb4-8d84f6b2a13a','866a1000-8754-456a-b4fb-d624cc72aebd',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',100.00,350.00,'2026-06-28 20:02:43'),('6409ab1f-b815-44cd-b316-c8c2aa8d6193','85d58e26-defd-4107-8223-3128ff7c3f06',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',80.00,410.00,'2026-06-28 20:02:42'),('6d79b785-62af-4b17-888e-8235431a9991','329d24c7-e21b-4a08-87bd-8fa3b2ff86e8',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',60.00,370.00,'2026-06-28 20:02:43'),('6f988636-6003-4cbf-a6ce-204b00db042d','53d0a6e8-262e-4f98-87f0-4110d8b499ac',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',50.00,350.00,'2026-06-28 20:02:43'),('70f8addd-a130-4de3-8727-5100e83239ae','a9d0d703-e5f0-4f5a-a103-1e913f8f7916',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',50.00,350.00,'2026-06-28 20:02:43'),('71f1b2dc-5213-4787-a371-76bf754bf34f','b322f451-f412-4aa1-8983-c2314e097a3b',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',60.00,370.00,'2026-06-28 20:02:43'),('813ca740-00c1-48ec-879e-ef925a9ae794','a687ae8e-815d-4517-b6fb-ff31a20f97af',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',80.00,410.00,'2026-06-28 20:02:42'),('849f2dab-c109-4132-9542-73e8b9edbb0b','8224ccd1-86cb-46df-8de0-1c5ef0443f69',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',140.00,430.00,'2026-06-28 20:02:43'),('8a98d79b-4019-434d-ae79-6ad4bffb59cf','17971560-4541-41e4-8062-d1b19ba9b3ce',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',90.00,430.00,'2026-06-28 20:02:42'),('8e5d9d64-682c-4b9a-82ec-ff18cfe28f9e','c784600f-a636-49b5-be58-06bab818115b',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',140.00,430.00,'2026-06-28 20:02:43'),('93b38636-c2b0-416f-92c7-d1dea5312fa2','88bcf2a8-9060-4252-952f-500c347065d4',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',70.00,390.00,'2026-06-28 20:02:43'),('97bd2a79-1108-4fba-8bcd-17d012ae21ef','467fe734-c897-4b90-b8c9-28462ad056da',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',120.00,390.00,'2026-06-28 20:02:43'),('9989164d-b2fb-43c9-91da-1d28d0871132','4bc85dba-0158-4ae9-b886-39fd7f86c5b5',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',110.00,370.00,'2026-06-28 20:02:42'),('9ad89b44-3f00-4677-833f-bf0840b553a5','21725d48-1928-4fda-b656-584bfc0711e2',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',70.00,390.00,'2026-06-28 20:02:42'),('9c9cf88b-f150-43ca-9a10-5aa8f37c6eb2','d8148df7-effa-454c-8551-9039e33a4c28',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',60.00,370.00,'2026-06-28 20:02:42'),('b41c7719-069e-4f80-8eb7-fadd8510ac50','3460110d-1e5a-4a39-8d28-31c87484957f',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',80.00,410.00,'2026-06-28 20:02:43'),('b6f266bb-434e-4efa-9b50-f18e564facc3','2692bdd0-6ecc-4cdd-a8f8-07ef16c600c9',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',110.00,370.00,'2026-06-28 20:02:43'),('b7e5eabb-2c83-4b87-9139-cb499db49a7e','f1b79c0c-b5fc-4201-befe-ec6bab2571b5',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',130.00,410.00,'2026-06-28 20:02:43'),('bbc6642a-0454-4bb3-b33f-c127dc51bc00','cdc46416-c5cb-4e9b-82b7-8c3c99fed5cd',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',130.00,410.00,'2026-06-28 20:02:42'),('bef61328-f3aa-4efc-b937-04d367d43b12','6fbd2c28-335c-4642-b442-47b86fbc1f91',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',120.00,390.00,'2026-06-28 20:02:42'),('c78c76b8-a051-42b7-b08b-87a9f67d7932','3f600209-c81f-4bc8-b23e-7323f8caa8dc',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',70.00,390.00,'2026-06-28 20:02:43'),('d1ba5bff-c2f4-42dd-b285-200e23280beb','423825cb-6f13-4efa-a194-fa8a22904d2a',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',25.00,430.00,'2026-06-28 20:02:39'),('d7d4a9d5-dacd-4a1a-8e04-704ff8c27e9b','ed0b480d-95c3-4ee9-891c-c550cf5329a0',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',90.00,430.00,'2026-06-28 20:02:42'),('db44bcc9-d589-4f36-bc6a-531a030e2dba','137e55d3-2de5-4b8a-9731-56900c0ead42',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',100.00,350.00,'2026-06-28 20:02:42'),('e63c4107-7170-4187-b70e-89e3d2474d5e','3edfc383-c943-447a-8d5f-cf3e64407979',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',110.00,370.00,'2026-06-28 20:02:43'),('e8e917cd-04cd-4c5e-8400-2a45f6953d7c','a98ccda9-efbb-4b44-9f60-0d883f463d31',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',120.00,390.00,'2026-06-28 20:02:42'),('eef98d59-1300-4e41-9531-b20039b3e0db','bf67919f-708e-48bc-94c6-283142279863',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',50.00,350.00,'2026-06-28 20:02:43'),('f2e58572-a84d-4721-906e-865657b613fe','70aba1c8-b1c5-4a56-8fa1-5b64b2c23cdc',NULL,'83ce2051-281a-41de-8ee5-050626d2ca3c',60.00,370.00,'2026-06-28 20:02:42'),('f707e66c-3a87-4187-88a6-90d71ee4981b','e22c51a7-edec-4ea5-8a1d-43951cce93e1',NULL,'9be4b9bf-f6e6-4930-b67c-919b4f1c7866',140.00,430.00,'2026-06-28 20:02:43'),('fac90fe4-398a-419d-9cb6-233f9d5e30ca','2ec95e3a-4b39-422c-bc8a-d45a0ad412f7',NULL,'ca801c62-4773-41aa-b017-c98eec91def1',140.00,430.00,'2026-06-28 20:02:42'),('ff52f37b-207f-4925-8d95-23b041b6437e','c0baf4d7-9281-44f5-b43a-7f4bd14fd7f1','714e6a65-7234-4580-9472-43bd36d0a915','8b103f48-5204-469b-abe2-564f180c98c0',25.00,425.00,'2026-06-28 20:02:38');
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
INSERT INTO `orders` VALUES ('08fdd020-1d8f-402c-a3bd-de09ce7973cf','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--16',49873.00,500.00,7979.68,58352.68,'processing','paid','Depot Station 0, Mombasa',NULL,'2025-11-20 13:15:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('137e55d3-2de5-4b8a-9731-56900c0ead42','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--5',38424.00,500.00,6147.84,45071.84,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-08-24 14:52:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('17971560-4541-41e4-8062-d1b19ba9b3ce','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--4',27165.00,500.00,4346.40,32011.40,'delivered','paid','Depot Station 0, Mombasa',NULL,'2025-08-16 13:39:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('1cd47d96-56f6-4222-8434-f157fa1d4aeb','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--2',34793.00,500.00,5566.88,40859.88,'delivered','paid','Depot Station 2, Mombasa',NULL,'2025-07-31 11:13:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('21725d48-1928-4fda-b656-584bfc0711e2','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--12',29338.00,500.00,4694.08,34532.08,'cancelled','refunded','Depot Station 0, Mombasa',NULL,'2025-10-19 15:23:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('2692bdd0-6ecc-4cdd-a8f8-07ef16c600c9','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--26',27545.00,500.00,4407.20,32452.20,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-02-08 11:25:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('2ec95e3a-4b39-422c-bc8a-d45a0ad412f7','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--9',49318.00,500.00,7890.88,57708.88,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-09-25 12:44:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('329d24c7-e21b-4a08-87bd-8fa3b2ff86e8','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--21',22461.00,500.00,3593.76,26554.76,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-12-30 12:20:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('3460110d-1e5a-4a39-8d28-31c87484957f','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--33',25800.00,500.00,4128.00,30428.00,'delivered','paid','Depot Station 1, Mombasa',NULL,'2026-04-05 12:56:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('3edfc383-c943-447a-8d5f-cf3e64407979','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--36',20230.00,500.00,3236.80,23966.80,'cancelled','refunded','Depot Station 0, Mombasa',NULL,'2026-04-29 15:35:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('3f600209-c81f-4bc8-b23e-7323f8caa8dc','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--32',29056.00,500.00,4648.96,34204.96,'processing','paid','Depot Station 0, Mombasa',NULL,'2026-03-28 11:43:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('423825cb-6f13-4efa-a194-fa8a22904d2a','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-DEMO-AQUAERP-DE-3',16000.00,500.00,2560.00,19060.00,'confirmed','paid','Mombasa wholesale depot',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39',NULL,NULL,NULL,NULL,NULL),('45cee3d1-0ec7-4be8-b503-f320aa3a967c','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--23',32200.00,500.00,5152.00,37852.00,'delivered','paid','Depot Station 3, Mombasa',NULL,'2026-01-15 14:46:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('467fe734-c897-4b90-b8c9-28462ad056da','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--27',35984.00,500.00,5757.44,42241.44,'delivered','paid','Depot Station 3, Mombasa',NULL,'2026-02-16 12:38:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('4bc85dba-0158-4ae9-b886-39fd7f86c5b5','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--6',46589.00,500.00,7454.24,54543.24,'delivered','paid','Depot Station 2, Mombasa',NULL,'2025-09-01 15:05:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('53d0a6e8-262e-4f98-87f0-4110d8b499ac','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--40',46161.00,500.00,7385.76,54046.76,'processing','paid','Depot Station 0, Mombasa',NULL,'2026-05-31 13:27:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('5f1ed953-a4e4-4540-8659-2536b6f2be78','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--18',31342.00,500.00,5014.72,36856.72,'delivered','paid','Depot Station 2, Mombasa',NULL,'2025-12-06 15:41:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('6fbd2c28-335c-4642-b442-47b86fbc1f91','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--7',29848.00,500.00,4775.68,35123.68,'delivered','paid','Depot Station 3, Mombasa',NULL,'2025-09-09 10:18:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('70aba1c8-b1c5-4a56-8fa1-5b64b2c23cdc','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--11',44715.00,500.00,7154.40,52369.40,'delivered','paid','Depot Station 3, Mombasa',NULL,'2025-10-11 14:10:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('8224ccd1-86cb-46df-8de0-1c5ef0443f69','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--39',41704.00,500.00,6672.64,48876.64,'delivered','paid','Depot Station 3, Mombasa',NULL,'2026-05-23 12:14:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('85d58e26-defd-4107-8223-3128ff7c3f06','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--3',26548.00,500.00,4247.68,31295.68,'delivered','paid','Depot Station 3, Mombasa',NULL,'2025-08-08 12:26:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('866a1000-8754-456a-b4fb-d624cc72aebd','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--25',33541.00,500.00,5366.56,39407.56,'delivered','paid','Depot Station 1, Mombasa',NULL,'2026-01-31 10:12:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('88bcf2a8-9060-4252-952f-500c347065d4','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--22',49473.00,500.00,7915.68,57888.68,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-01-07 13:33:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('8b1465ef-6a40-41ab-b54c-0ff71da74cec','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--10',27913.00,500.00,4466.08,32879.08,'delivered','paid','Depot Station 2, Mombasa',NULL,'2025-10-03 13:57:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('8b364c9f-8939-4bf7-85ac-a2b3708109a0','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--34',46839.00,500.00,7494.24,54833.24,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-04-13 13:09:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('93ef9732-df9c-4506-8123-0eb009f381de','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--15',22854.00,500.00,3656.64,27010.64,'delivered','paid','Depot Station 3, Mombasa',NULL,'2025-11-12 12:02:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('9a727e96-cbfd-4ad9-845c-9bfcb2deb79f','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--42',29149.00,500.00,4663.84,34312.84,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-06-16 15:53:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('a687ae8e-815d-4517-b6fb-ff31a20f97af','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--13',23171.00,500.00,3707.36,27378.36,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-10-27 10:36:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('a98ccda9-efbb-4b44-9f60-0d883f463d31','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--17',40454.00,500.00,6472.64,47426.64,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-11-28 14:28:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('a9d0d703-e5f0-4f5a-a103-1e913f8f7916','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--20',38598.00,500.00,6175.68,45273.68,'delivered','paid','Depot Station 0, Mombasa',NULL,'2025-12-22 11:07:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('b064fbd1-1978-4716-9554-4ca6d813c5c3','b21fe9c1-79b2-490e-a254-87df2e52b4d9','554e08ea-02dd-4817-b0e7-24042ace45b4','83ab655f-845d-4ec5-ac83-904b755c1a16','ORD-DEMO-COASTFISH-1',15000.00,500.00,2400.00,17900.00,'confirmed','paid','Kwale wholesale depot',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37',NULL,NULL,NULL,NULL,NULL),('b322f451-f412-4aa1-8983-c2314e097a3b','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--41',41746.00,500.00,6679.36,48925.36,'delivered','paid','Depot Station 1, Mombasa',NULL,'2026-06-08 14:40:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('bf67919f-708e-48bc-94c6-283142279863','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--30',38398.00,500.00,6143.68,45041.68,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-03-12 15:17:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('bf864f06-c983-448e-8d4e-ca2f2698a6d9','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--38',29287.00,500.00,4685.92,34472.92,'delivered','paid','Depot Station 2, Mombasa',NULL,'2026-05-15 11:01:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('c0baf4d7-9281-44f5-b43a-7f4bd14fd7f1','11f852eb-f735-4923-9fa4-538582e42160','554e08ea-02dd-4817-b0e7-24042ace45b4','c45658ae-e152-4f0a-89cd-c8318545b516','ORD-DEMO-LAMUSEA-2',15500.00,500.00,2480.00,18480.00,'confirmed','paid','Lamu wholesale depot',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38',NULL,NULL,NULL,NULL,NULL),('c1441989-1d31-4931-93e0-bf86b7b51f40','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--35',24044.00,500.00,3847.04,28391.04,'delivered','paid','Depot Station 3, Mombasa',NULL,'2026-04-21 14:22:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('c784600f-a636-49b5-be58-06bab818115b','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--29',40180.00,500.00,6428.80,47108.80,'delivered','paid','Depot Station 1, Mombasa',NULL,'2026-03-04 14:04:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('c905964e-7765-4b5a-ab07-2e4d42897a8f','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--24',20406.00,500.00,3264.96,24170.96,'cancelled','refunded','Depot Station 0, Mombasa',NULL,'2026-01-23 15:59:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('cdc46416-c5cb-4e9b-82b7-8c3c99fed5cd','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--8',34486.00,500.00,5517.76,40503.76,'processing','paid','Depot Station 0, Mombasa',NULL,'2025-09-17 11:31:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('d8148df7-effa-454c-8551-9039e33a4c28','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--1',45764.00,500.00,7322.24,53586.24,'delivered','paid','Depot Station 1, Mombasa',NULL,'2025-07-23 10:00:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('e22c51a7-edec-4ea5-8a1d-43951cce93e1','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--19',22941.00,500.00,3670.56,27111.56,'delivered','paid','Depot Station 3, Mombasa',NULL,'2025-12-14 10:54:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('ed0b480d-95c3-4ee9-891c-c550cf5329a0','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--14',39874.00,500.00,6379.84,46753.84,'delivered','paid','Depot Station 2, Mombasa',NULL,'2025-11-04 11:49:00','2026-06-28 20:02:42',NULL,NULL,NULL,NULL,NULL),('f1b79c0c-b5fc-4201-befe-ec6bab2571b5','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--28',41599.00,500.00,6655.84,48754.84,'delivered','paid','Depot Station 0, Mombasa',NULL,'2026-02-24 13:51:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('f9907338-fed0-4d6e-a85c-2b5fa33fed22','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--37',36964.00,500.00,5914.24,43378.24,'delivered','paid','Depot Station 1, Mombasa',NULL,'2026-05-07 10:48:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL),('fe2c9b7b-03f8-4b58-a5b8-27b6c10682e7','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','ORD-SHOWCASE-AQUAERP--31',48176.00,500.00,7708.16,56384.16,'delivered','paid','Depot Station 3, Mombasa',NULL,'2026-03-20 10:30:00','2026-06-28 20:02:43',NULL,NULL,NULL,NULL,NULL);
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
INSERT INTO `platform_settings` VALUES ('announcement','{\"body\": \"20 demo tenants are loaded with full module data. Super admins can manage tenants, payments, and branding from Admin Hub.\", \"title\": \"AquaERP platform demo\", \"enabled\": false}','2026-06-28 19:22:29','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('branding','{\"app_name\": \"AquaERP Fisheries OS\", \"logo_url\": \"\", \"primary_color\": \"#0d9488\"}','2026-06-28 19:22:29','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('maintenance','{\"enabled\": false, \"message\": \"Scheduled maintenance completed. All systems operational.\"}','2026-06-28 19:22:29','4771d81c-81ef-495e-b938-7f4d1d3213d4'),('recaptcha','{\"enabled\": false, \"siteKey\": \"\", \"version\": \"v3\", \"minScore\": 0.5, \"secretKey\": \"\", \"protectLogin\": true, \"protectRegister\": true, \"hostnameAllowlist\": [], \"protectGuestCheckout\": \"\\\"\\\\\\\"\\\\\\\\\\\\\\\"true\\\\\\\\\\\\\\\"\\\\\\\"\\\"\"}','2026-06-11 09:37:41',NULL),('signup','{\"locked\": false}','2026-06-28 19:22:29','4771d81c-81ef-495e-b938-7f4d1d3213d4');
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
INSERT INTO `product_catalog` VALUES ('1fb221e8-91c6-49ec-9617-39044777d296','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-LOBSTER','Mombasa Rock Lobster','83ce2051-281a-41de-8ee5-050626d2ca3c','live','kg',1400.00,'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48'),('7717cdd3-229f-4842-b443-d1af7499ec10','11f852eb-f735-4923-9fa4-538582e42160','00bed5df-a0c1-44e4-bb30-cfa7f04e8c93','SKU-LAMUSEA','Lamu Sea Ventures Fresh Fillet','8b103f48-5204-469b-abe2-564f180c98c0','fresh','kg',460.00,NULL,NULL,NULL,'active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('99fa9b61-7c4e-4c17-99da-b0c7632ee58a','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-PERCH','Premium Nile Perch Fillet','ca801c62-4773-41aa-b017-c98eec91def1','fresh','kg',480.00,'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48'),('a4af6f00-e7b5-49ca-aaa8-cc7c8a91ee3f','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-TILAPIA','Fresh Lake Victoria Tilapia','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','fresh','kg',360.00,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48'),('af00b443-2f26-476f-b12b-124a089085a3','b21fe9c1-79b2-490e-a254-87df2e52b4d9','e6611442-c296-4d91-ab93-03a8f8f70607','SKU-COASTFISH','Coast Fish Cooperative Fresh Fillet','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e','fresh','kg',450.00,NULL,NULL,NULL,'active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('d2e7b1c1-60af-4ed8-b85a-dbfa5b58d81a','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-SNAPPER','Whole Red Snapper','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','fresh','kg',520.00,'https://images.unsplash.com/photo-1559737607-3578909a3636?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48'),('e7c8844c-8797-4ade-8b03-f5274e4c87c5','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-TUNA','Yellowfin Tuna Steaks','83ce2051-281a-41de-8ee5-050626d2ca3c','frozen','kg',680.00,'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48'),('fee0cc26-67a3-42fc-83b3-4487ad98dabe','12495be8-694e-4b73-b391-62f36e6c42e2','6ca6cc51-cec8-45b5-8a6b-6499505308ab','SKU-SHOWCASE-PRAWNS','Jumbo Tiger Prawns','9be4b9bf-f6e6-4930-b67c-919b4f1c7866','frozen','kg',950.00,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',NULL,NULL,'active',NULL,'2026-06-28 20:02:48','2026-06-28 20:02:48');
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
INSERT INTO `purchase_order_lines` VALUES ('26171a0e-512e-47bf-8716-1aeca65f9632','119652a8-088a-47b6-ade9-469eb48153d9','Marine diesel',500.000,'L',120.00,60000.00),('4506fd63-3ed0-4a1d-935a-a9b70f0f1e4f','911c0a3b-df31-46ac-ac30-c5ff41d51d4e','Marine diesel',500.000,'L',120.00,60000.00),('9e3c0883-e610-4e6a-beb3-9f22bbeb1df0','297518e6-7e20-4d53-8c39-535fc8c6bc41','Marine diesel',500.000,'L',120.00,60000.00);
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
INSERT INTO `purchase_orders` VALUES ('119652a8-088a-47b6-ade9-469eb48153d9','11f852eb-f735-4923-9fa4-538582e42160','ba05bdc1-28df-444b-b6e5-71bb365bc336','PO-2','sent','KES',45000.00,7200.00,52200.00,'2026-07-05',NULL,'c45658ae-e152-4f0a-89cd-c8318545b516','2026-06-28 20:02:39','2026-06-28 20:02:39'),('297518e6-7e20-4d53-8c39-535fc8c6bc41','12495be8-694e-4b73-b391-62f36e6c42e2','7e544e02-1b2b-455b-b482-08be76ecf384','PO-3','sent','KES',45000.00,7200.00,52200.00,'2026-07-05',NULL,'de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:39','2026-06-28 20:02:39'),('911c0a3b-df31-46ac-ac30-c5ff41d51d4e','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7223a610-bdef-4221-8dd2-92f5e46d17c5','PO-1','sent','KES',45000.00,7200.00,52200.00,'2026-07-05',NULL,'83ab655f-845d-4ec5-ac83-904b755c1a16','2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `purchase_requests` VALUES ('2072a924-f35a-4139-abd2-69617382d16d','11f852eb-f735-4923-9fa4-538582e42160','PR-2','c45658ae-e152-4f0a-89cd-c8318545b516','Operations','approved','2026-07-12','Fuel and ice for next trip','2026-06-28 20:02:39'),('873215ec-943a-4c44-9f6d-522bf144c479','12495be8-694e-4b73-b391-62f36e6c42e2','PR-3','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','Operations','approved','2026-07-12','Fuel and ice for next trip','2026-06-28 20:02:39'),('a2c80ee3-68c1-40b6-85d3-8698d5788744','b21fe9c1-79b2-490e-a254-87df2e52b4d9','PR-1','83ab655f-845d-4ec5-ac83-904b755c1a16','Operations','approved','2026-07-12','Fuel and ice for next trip','2026-06-28 20:02:38');
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
INSERT INTO `sales_contracts` VALUES ('4b26f891-6ec2-49d4-bad5-88619b25b01a','b21fe9c1-79b2-490e-a254-87df2e52b4d9','SC-COASTFISH','Kwale Wholesale Ltd','wholesale-coastfish@example.com',NULL,'15b89fa5-a5da-4507-bc0b-8ed271e9cbec','429762ac-c2bd-4fcd-afd4-18b0cc2f1d1e',400.00,5000.00,1200.00,'KES','active','2026-06-28','2026-12-25','Net 30',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('648ef61e-66eb-45d0-9891-38c5ea3e4946','12495be8-694e-4b73-b391-62f36e6c42e2','SC-AQUAERP-DEMO','Mombasa Wholesale Ltd','wholesale-aquaerp-demo@example.com',NULL,'0414db15-f344-4d04-bedb-060610541f57','ca801c62-4773-41aa-b017-c98eec91def1',406.00,5000.00,1300.00,'KES','active','2026-06-28','2026-12-25','Net 30',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('f4b0fd69-f853-4973-af19-d1dcb11f2fbc','11f852eb-f735-4923-9fa4-538582e42160','SC-LAMUSEA','Lamu Wholesale Ltd','wholesale-lamusea@example.com',NULL,'9bc8b3fc-2206-474e-a8d2-5a18314e0ffd','8b103f48-5204-469b-abe2-564f180c98c0',403.00,5000.00,1250.00,'KES','active','2026-06-28','2026-12-25','Net 30',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `storage_facilities` VALUES ('954ef5f5-6433-4b8c-89be-b31895b8081e','12495be8-694e-4b73-b391-62f36e6c42e2','AquaERP Showcase Tenant Cold Store','aquaerp-demo-cold','cold_room',12000.00,5200.00,'Mombasa','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('992f1b20-33a9-476d-a5b8-3d2d950f2e12','b21fe9c1-79b2-490e-a254-87df2e52b4d9','Coast Fish Cooperative Cold Store','coastfish-cold','cold_room',12000.00,5200.00,'Kwale','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('e26641a5-1474-45ff-92fc-05eec74b34ec','11f852eb-f735-4923-9fa4-538582e42160','Lamu Sea Ventures Cold Store','lamusea-cold','cold_room',12000.00,5200.00,'Lamu','operational',-45.00,5.00,-20.00,5.00,NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38');
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
INSERT INTO `storage_records` VALUES ('0021753d-df6e-4fb2-b31c-8bfb54dbaa0d','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',89.00,'A','iced','2026-05-29 23:02:40','2026-06-03 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('040451c3-4cd0-46a1-8a48-4acb873d18d7','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',128.00,'C','iced','2026-06-09 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('092121ef-9856-40c7-966e-e59907baf83f','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',141.00,'B','iced','2026-06-02 23:02:40','2026-06-08 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('0938824c-cd1e-4c35-840b-2de17164918f','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',77.00,'A','iced','2026-06-04 23:02:40','2026-06-07 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('0b977907-590a-433c-bab6-d589160f49de','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',143.00,'A','iced','2026-06-01 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('0f6f643f-3f19-435c-8b7c-66fcdcd84bea','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',57.00,'B','iced','2026-06-05 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('118d66f5-4354-4ac8-809e-b66be7edb6eb','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',145.00,'B','iced','2026-06-14 23:02:40','2026-06-19 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('195f02a5-fddd-4876-bcde-7417951dc787','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',52.00,'B','iced','2026-06-17 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('1ff50950-3c6c-4c2d-abdd-1f5783b02411','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',102.00,'A','iced','2026-06-13 23:02:40',NULL,NULL,NULL,'expired','2026-06-28 20:02:47'),('224603f3-c52c-481a-b089-9407e984da08','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',63.00,'C','iced','2026-06-18 23:02:40','2026-06-24 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('55ad22cc-9370-47aa-9c4a-564d11e22b46','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',79.00,'C','iced','2026-06-03 23:02:40',NULL,NULL,NULL,'expired','2026-06-28 20:02:47'),('815b2be5-70ca-4c40-ae76-060de8f71a3e','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',134.00,'A','iced','2026-06-10 23:02:40','2026-06-14 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('a541d426-e929-49af-9e01-cbb69a739aba','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',136.00,'B','iced','2026-06-08 23:02:40','2026-06-10 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('c0c046fd-6098-4cb8-bcdf-21bf9a384cc0','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',66.00,'C','iced','2026-06-21 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('c5447c31-53ca-48d3-8e3e-269d66748613','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',74.00,'B','iced','2026-06-20 23:02:40','2026-06-22 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('cd5c6790-3251-473d-9413-dd2fa2d9703f','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',53.00,'A','iced','2026-06-16 23:02:40','2026-06-22 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('cf043ea9-06d1-4bc6-bc35-29994fca6121','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',137.00,'C','iced','2026-06-06 23:02:40','2026-06-10 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('ddc620d5-2507-437a-a8c8-1521e98cb2d8','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',67.00,'B','iced','2026-05-30 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('df63bf31-067b-412a-aeb4-147abfa3dbc2','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',73.00,'A','iced','2026-06-19 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('e1549076-6cf8-42d7-9617-540d6ccabcba','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',112.00,'A','iced','2026-06-22 23:02:40','2026-06-25 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('e16d2995-4a9c-48e2-b0be-99c499d2c0f8','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',67.00,'C','iced','2026-06-12 23:02:40','2026-06-17 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47'),('f0d66c87-ea1d-4570-a277-2f08853260ac','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','ca801c62-4773-41aa-b017-c98eec91def1',109.00,'A','iced','2026-06-07 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('f6027b85-0223-45e9-9761-7394a5074f80','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',112.00,'C','iced','2026-06-15 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('f683099c-7d48-4a4f-91ae-2d142d02d6ef','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','9be4b9bf-f6e6-4930-b67c-919b4f1c7866',126.00,'B','iced','2026-06-11 23:02:40',NULL,NULL,NULL,'stored','2026-06-28 20:02:47'),('ffc612d7-914b-4233-adf7-c63e7c8da8f6','12495be8-694e-4b73-b391-62f36e6c42e2','954ef5f5-6433-4b8c-89be-b31895b8081e','83ce2051-281a-41de-8ee5-050626d2ca3c',117.00,'C','iced','2026-05-31 23:02:40','2026-06-04 23:02:40',NULL,NULL,'removed','2026-06-28 20:02:47');
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
INSERT INTO `storage_zones` VALUES ('382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec','11f852eb-f735-4923-9fa4-538582e42160','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-28 20:02:38'),('3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12','b21fe9c1-79b2-490e-a254-87df2e52b4d9','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-28 20:02:37'),('4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12','b21fe9c1-79b2-490e-a254-87df2e52b4d9','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-28 20:02:37'),('5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e','12495be8-694e-4b73-b391-62f36e6c42e2','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-28 20:02:39'),('7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12','b21fe9c1-79b2-490e-a254-87df2e52b4d9','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-28 20:02:37'),('a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e','12495be8-694e-4b73-b391-62f36e6c42e2','SFZ-1','Ultra-low Tuna Vault',-40.00,-45.00,-35.00,3000.00,'active','2026-06-28 20:02:39'),('d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e','12495be8-694e-4b73-b391-62f36e6c42e2','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-28 20:02:39'),('dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec','11f852eb-f735-4923-9fa4-538582e42160','CZ-1','Fresh Fish Chiller',2.00,0.00,4.00,3000.00,'active','2026-06-28 20:02:38'),('e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec','11f852eb-f735-4923-9fa4-538582e42160','FZ-1','Freezer Room',-20.00,-25.00,-18.00,6000.00,'active','2026-06-28 20:02:38');
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
INSERT INTO `suppliers` VALUES ('00bed5df-a0c1-44e4-bb30-cfa7f04e8c93','11f852eb-f735-4923-9fa4-538582e42160','VND-00bed5df','Lamu Sea Ventures Seafood Shop','Demo Owner','owner-lamusea@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('2760c482-3445-4a36-8531-14737de041b5','11f852eb-f735-4923-9fa4-538582e42160','VND-2760c482','Lamu Sea Ventures Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('2a5c1499-799c-4691-8eb0-5bb589e72bf2','12495be8-694e-4b73-b391-62f36e6c42e2','VND-2a5c1499','AquaERP Showcase Tenant Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('6ca6cc51-cec8-45b5-8a6b-6499505308ab','12495be8-694e-4b73-b391-62f36e6c42e2','VND-6ca6cc51','AquaERP Showcase Tenant Seafood Shop','Demo Owner','owner-aquaerp-demo@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('7223a610-bdef-4221-8dd2-92f5e46d17c5','b21fe9c1-79b2-490e-a254-87df2e52b4d9','SUP-1','Coastal Ice & Fuel Supplies','Supply Desk','supplier-coastfish@example.com','+254720000000','KE',4.50,'active',NULL,'83ab655f-845d-4ec5-ac83-904b755c1a16','2026-06-28 20:02:37','2026-06-28 20:02:37'),('7e544e02-1b2b-455b-b482-08be76ecf384','12495be8-694e-4b73-b391-62f36e6c42e2','SUP-3','Coastal Ice & Fuel Supplies','Supply Desk','supplier-aquaerp-demo@example.com','+254720000002','KE',4.50,'active',NULL,'de4ae297-ba95-4b4e-9d98-ee8f804a05f9','2026-06-28 20:02:39','2026-06-28 20:02:39'),('9f5d11f2-f55e-4b13-8120-2e2cf9618b21','b21fe9c1-79b2-490e-a254-87df2e52b4d9','VND-9f5d11f2','Coast Fish Cooperative Shared Vendor Shop','Demo Vendor','vendor@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('ba05bdc1-28df-444b-b6e5-71bb365bc336','11f852eb-f735-4923-9fa4-538582e42160','SUP-2','Coastal Ice & Fuel Supplies','Supply Desk','supplier-lamusea@example.com','+254720000001','KE',4.50,'active',NULL,'c45658ae-e152-4f0a-89cd-c8318545b516','2026-06-28 20:02:39','2026-06-28 20:02:39'),('e6611442-c296-4d91-ab93-03a8f8f70607','b21fe9c1-79b2-490e-a254-87df2e52b4d9','VND-e6611442','Coast Fish Cooperative Seafood Shop','Demo Owner','owner-coastfish@demo.aquaerp.local',NULL,'KE',5.00,'active','Auto-synced from marketplace vendor',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `temperature_readings` VALUES ('0002b67c-c174-4dd8-b3f6-27e7ec9f2a34','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.41,70.00,'2026-06-26 16:02:40','iot'),('001a93d5-586f-4fd0-a5ba-11e9046d08c3','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.41,82.00,'2026-06-23 23:02:40','iot'),('004ffee3-c14f-42cd-be75-7e32f3e5e4f0','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.37,75.00,'2026-06-25 07:02:40','iot'),('00c38c87-80fa-4b72-bceb-e12170373733','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.09,85.00,'2026-06-24 13:02:40','iot'),('00c5ad3a-d8a2-44d8-8367-7519ad864ca8','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-41.40,55.00,'2026-06-28 16:02:37','iot'),('01af0379-b47b-4662-a4e4-27ea3fd796db','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.43,86.00,'2026-06-26 20:02:40','iot'),('027f3a11-0d21-4964-b68d-7377a8accf00','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.43,89.00,'2026-06-28 17:02:40','iot'),('029398bc-ca8f-4a0d-897c-f7b889c70b69','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.89,75.00,'2026-06-26 23:02:40','iot'),('03352b8c-0b57-423a-a07f-1db058c6c3e9','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-41.20,55.00,'2026-06-28 12:02:37','iot'),('0395de62-e97e-4181-b6c5-9f322e5315dd','11f852eb-f735-4923-9fa4-538582e42160','dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec',2.00,85.00,'2026-06-28 08:02:38','iot'),('04199c64-d944-4cef-a772-f28e24a5de2d','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.67,88.00,'2026-06-24 02:02:40','iot'),('0430ec90-da68-490b-beac-bc21bf420fc2','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.57,86.00,'2026-06-26 21:02:40','iot'),('04e91d0a-c1e6-4e51-a212-f3be4ea0991a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.01,80.00,'2026-06-25 21:02:40','iot'),('07c967f6-87fd-4a10-82e4-c5a6d3bc6375','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.05,83.00,'2026-06-26 18:02:40','iot'),('08d3f6b2-ea1f-493c-98f5-be573fc3a3ed','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.07,79.00,'2026-06-28 20:02:40','iot'),('0905b2d9-103a-4eac-b2bc-71f0519037eb','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.73,79.00,'2026-06-24 14:02:40','iot'),('0966fba2-783a-4e8f-9dda-69f4b1fef314','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.72,88.00,'2026-06-27 22:02:40','iot'),('09972300-d2c4-4a30-84cb-17e948b7f8d7','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.52,87.00,'2026-06-25 01:02:40','iot'),('0a597105-1f48-4b91-9267-54cc1f1f0f0b','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.38,75.00,'2026-06-27 18:02:40','iot'),('0ab05820-35f2-48b5-95db-4361675733a7','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.52,84.00,'2026-06-28 13:02:40','iot'),('0bb200d3-8470-438a-97de-cc03cbca5005','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.75,83.00,'2026-06-27 04:02:40','iot'),('0bf11046-99d5-4ab6-940e-7cb396cf2a7c','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.00,55.00,'2026-06-28 08:02:39','iot'),('0c31d96a-6218-4290-b7fb-1fb213ef5127','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.40,85.00,'2026-06-28 23:02:40','iot'),('0da11029-1b0d-49ed-a81f-e7c988cebf30','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.60,77.00,'2026-06-28 18:02:40','iot'),('0ddde22b-9e5b-4ba7-9811-c0736736adb0','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.00,76.00,'2026-06-25 17:02:40','iot'),('0e676f6c-2c0c-4b2b-a788-13696c6e97ee','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.81,76.00,'2026-06-27 15:02:40','iot'),('0eb50592-5d94-4c77-bb36-01b170640957','11f852eb-f735-4923-9fa4-538582e42160','382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec',-41.40,55.00,'2026-06-28 16:02:38','iot'),('0f54cf4e-b5f9-42a6-8158-6ae697d86f8f','11f852eb-f735-4923-9fa4-538582e42160','dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec',1.60,85.00,'2026-06-28 16:02:38','iot'),('0f7e7818-a912-40c6-a066-2d13cc4df3f6','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.14,79.00,'2026-06-28 20:02:40','iot'),('105ddfd6-1bd4-476e-994e-78191a6c1a66','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.17,88.00,'2026-06-26 15:02:40','iot'),('10d0dbb4-cc47-4836-8f7f-84651c806fdd','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.22,86.00,'2026-06-26 04:02:40','iot'),('1166e5a3-e453-4bf2-b4fa-c050bc782c69','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.68,86.00,'2026-06-24 22:02:40','iot'),('1194f814-b550-4f42-926b-82a244c2a449','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.46,89.00,'2026-06-27 13:02:40','iot'),('11f241c5-f3d8-4593-b254-e67ec52fd18a','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.03,74.00,'2026-06-24 02:02:40','iot'),('122d3459-1290-4d9c-b919-29a1c2e7a11b','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.23,89.00,'2026-06-25 02:02:40','iot'),('137ad7bf-bbe4-475b-809f-376c27ef1f89','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.76,80.00,'2026-06-27 10:02:40','iot'),('1443a2af-a74b-4229-9193-f58f4eb04990','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.48,78.00,'2026-06-28 02:02:40','iot'),('15a738a2-7093-452e-acd9-70b5e9667fd8','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.40,82.00,'2026-06-26 16:02:40','iot'),('15e1fdaf-8040-4822-91c8-71e2f8c2c7ba','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.17,77.00,'2026-06-24 01:02:40','iot'),('17309939-42d4-4ee9-b773-bbdee3c180e2','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.54,88.00,'2026-06-25 23:02:40','iot'),('17321a81-239d-4915-bdbd-2843c71d5bff','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.87,74.00,'2026-06-27 05:02:40','iot'),('17ab36bd-e125-48f4-bf50-c7e652af45f1','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.44,77.00,'2026-06-27 02:02:40','iot'),('181ac750-d41e-405e-b5ee-2f3da7f2e2b7','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.43,78.00,'2026-06-28 14:02:40','iot'),('18b92f88-e9f8-443b-b8e7-22061f45ba24','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.62,74.00,'2026-06-28 16:02:40','iot'),('19504d0b-6aec-46ce-80eb-44cc36e1b609','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.73,86.00,'2026-06-25 05:02:40','iot'),('19bc8569-8dbb-4fbf-a71a-949d4d1ee02c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.70,73.00,'2026-06-25 19:02:40','iot'),('1ae47506-df2b-4bb9-b14b-131a9e270222','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.00,86.00,'2026-06-27 11:02:40','iot'),('1b32ae82-8967-423c-bf8f-a26cfd10f89d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.13,70.00,'2026-06-26 00:02:40','iot'),('1bff8193-a766-4411-a48c-a454e9af36d6','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.86,84.00,'2026-06-28 20:02:40','iot'),('1c532b60-a00d-4e77-aacf-41e4da247201','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.40,81.00,'2026-06-28 15:02:40','iot'),('1c7878b6-0896-4df3-b3ee-cd7e14f2ff47','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.05,88.00,'2026-06-28 07:02:40','iot'),('1c89b4b0-b400-46b4-a529-d703badd9fbb','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.54,75.00,'2026-06-28 01:02:40','iot'),('1c9ef867-3f75-4011-9578-d3ea1f220b7d','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.93,88.00,'2026-06-26 19:02:40','iot'),('1cd85dde-4991-41e9-913c-7b3d7739f76c','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.96,71.00,'2026-06-26 14:02:40','iot'),('1d1d4be9-40d7-4285-a489-ad2e6f4a8394','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.60,73.00,'2026-06-27 14:02:40','iot'),('1d3d9f02-f3a4-447c-bdcf-909c1b4a0464','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.09,82.00,'2026-06-28 21:02:40','iot'),('1f5bf815-2658-4588-a14c-a5472d45a65e','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.48,88.00,'2026-06-28 09:02:40','iot'),('1f6b5a24-1ae3-4b7b-9afa-bc75a129e426','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.14,75.00,'2026-06-24 14:02:40','iot'),('1f8c26f4-6200-480c-831a-b8dc5fc19628','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12',2.20,85.00,'2026-06-28 04:02:37','iot'),('20084f3a-ef05-4f38-87d9-c7321b51a452','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.78,89.00,'2026-06-24 07:02:40','iot'),('2120848d-94d0-4487-a614-aa7259841632','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.95,84.00,'2026-06-26 08:02:40','iot'),('224e8063-32cc-45fa-bd86-7a7f54e17e27','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.70,76.00,'2026-06-26 13:02:40','iot'),('226c84cc-eab4-453d-8812-59a5df78e528','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.70,81.00,'2026-06-26 12:02:40','iot'),('23d62e64-798b-4833-ae56-21caa0e6edd9','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.90,81.00,'2026-06-27 06:02:40','iot'),('246824c8-d0b9-4888-91f8-5c32d3168162','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.68,79.00,'2026-06-24 20:02:40','iot'),('25525e48-3094-468a-8b20-029a4e5ba9a4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.37,80.00,'2026-06-25 02:02:40','iot'),('26369039-fb2b-48fa-943b-80ac66e41155','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.23,79.00,'2026-06-26 12:02:40','iot'),('26394065-2524-4918-adab-65541901e58b','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.11,83.00,'2026-06-25 04:02:40','iot'),('26416bee-755e-4de5-bcc9-5c657175dbbf','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.31,72.00,'2026-06-28 01:02:40','iot'),('26b465b2-e36a-4c0f-80e0-ba506a6d7e13','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.92,79.00,'2026-06-27 23:02:40','iot'),('26c0b7b3-59a5-4a6b-932b-0e7cd540263d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.48,79.00,'2026-06-25 09:02:40','iot'),('26cac78c-aadb-46e1-a719-3dd2992684ae','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.14,80.00,'2026-06-26 08:02:40','iot'),('278f4078-2584-49cf-bdca-4d6d54366ddc','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12',2.00,85.00,'2026-06-28 08:02:37','iot'),('282cf03b-ea0c-41db-98b1-6ee38c7e8dff','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.43,79.00,'2026-06-24 20:02:40','iot'),('28891679-af6d-4fac-a161-6dd572f5bb77','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.27,85.00,'2026-06-25 12:02:40','iot'),('28973c97-fbe3-4e7e-9e49-40b385a4d992','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.08,80.00,'2026-06-25 16:02:40','iot'),('2901b1f1-8651-4d7a-9f2b-3506d92498c6','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.78,78.00,'2026-06-27 14:02:40','iot'),('29c8ec16-c51f-49c3-85a3-555770364c1d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.89,82.00,'2026-06-26 03:02:40','iot'),('2ab12c4d-6d59-4952-826f-aa25a88034a0','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.39,79.00,'2026-06-25 05:02:40','iot'),('2b307654-b9be-4bc9-b655-2e5c022a26bc','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.48,72.00,'2026-06-26 11:02:40','iot'),('2b98072d-889e-4c53-8631-fbf61e9431b7','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-20.50,65.00,'2026-06-28 12:02:37','iot'),('2d71e279-aa0c-4c1d-872d-5d1e343d0d3a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.93,85.00,'2026-06-27 16:02:40','iot'),('2e407593-a036-449f-a088-97c9d7957ab4','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.14,87.00,'2026-06-24 19:02:40','iot'),('2e9f0c34-c06d-4d3a-9434-8519e71a0520','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.60,55.00,'2026-06-28 20:02:39','iot'),('2f700a28-f92b-42a9-a6e6-f3c183da1829','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.62,77.00,'2026-06-27 13:02:40','iot'),('3028f0ce-1fa8-414a-8de9-7ecd1ac947f2','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.19,83.00,'2026-06-24 22:02:40','iot'),('311cd1a7-8044-4f3e-a459-2c3c2ef2842b','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.57,70.00,'2026-06-25 18:02:40','iot'),('316f2d63-6115-4d06-bd9f-226b8f062aac','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.49,88.00,'2026-06-28 00:02:40','iot'),('32204492-a055-417d-b21f-4fd7f357ae01','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.48,84.00,'2026-06-28 22:02:40','iot'),('323b6888-6ec9-4dec-a323-2f4054ba540c','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.75,81.00,'2026-06-28 10:02:40','iot'),('326f65d6-f658-4e71-9a94-f9f29d1bd9bb','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.17,71.00,'2026-06-27 20:02:40','iot'),('3349cdb5-236b-42ef-8ada-b5fdb80dec6c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.30,65.00,'2026-06-28 08:02:39','iot'),('345c5b74-2727-488c-a41e-ffdb15e4273e','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.11,74.00,'2026-06-26 01:02:40','iot'),('34888655-a3df-4db8-9179-3c7673350237','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.40,86.00,'2026-06-24 22:02:40','iot'),('3496240d-b1ae-4715-9b96-172af44f36ce','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.24,75.00,'2026-06-25 13:02:40','iot'),('35174e1e-d48d-4fc3-a8f9-8029a9338742','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.54,78.00,'2026-06-26 21:02:40','iot'),('35b02486-2334-43fe-982c-b793e85468d4','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.20,85.00,'2026-06-28 04:02:39','iot'),('36da2373-1bbe-489d-85cf-4254fdf4ac25','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.96,82.00,'2026-06-26 05:02:40','iot'),('387e801a-d4de-4036-9877-28e9b4d896c7','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.70,73.00,'2026-06-24 09:02:40','iot'),('393b70c3-1720-4de1-9ddc-fcfb983fada6','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.83,72.00,'2026-06-28 07:02:40','iot'),('39ea9336-3c9d-47d1-b280-4956f41c7a5c','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.79,77.00,'2026-06-25 00:02:40','iot'),('3a70c299-e09c-4dc4-bd92-baaa9a5dccf3','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.09,88.00,'2026-06-27 02:02:40','iot'),('3a865c1f-c36c-49c8-837f-26004c3d0c61','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.67,79.00,'2026-06-28 05:02:40','iot'),('3ab0031d-0f27-480d-8d00-cdf28eae45e6','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.59,80.00,'2026-06-24 10:02:40','iot'),('3abb888e-7cd6-41f0-bab0-661c4b5aa70e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.69,70.00,'2026-06-28 04:02:40','iot'),('3c40dee7-1c19-4530-a36d-671b5299b9cc','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.84,88.00,'2026-06-28 00:02:40','iot'),('3c546dd8-2625-4c88-8e49-81df808759c8','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.76,88.00,'2026-06-24 06:02:40','iot'),('3de46a01-4046-4d43-aff1-7e07373f3360','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.57,89.00,'2026-06-26 10:02:40','iot'),('3e02b4fc-1711-4883-8b16-a18a9c4ce144','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.34,80.00,'2026-06-28 11:02:40','iot'),('3e2ed795-17fb-4aa0-b734-08f1f37eccbf','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.61,89.00,'2026-06-28 18:02:40','iot'),('3ebaa513-cbdf-438f-a7c4-7aaea8e67787','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.16,78.00,'2026-06-24 03:02:40','iot'),('3ff3f88b-b4c8-4dc0-bfd5-ec92311abdb6','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.29,70.00,'2026-06-24 21:02:40','iot'),('4099e3b3-84f3-4d55-88f3-9115b92ccd20','11f852eb-f735-4923-9fa4-538582e42160','e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec',-20.50,65.00,'2026-06-28 12:02:38','iot'),('41897c2e-d02d-4d90-a677-c119b6326fbd','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.20,83.00,'2026-06-27 23:02:40','iot'),('427c17fd-1afe-4d20-a2ce-9521b333fb1e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.50,65.00,'2026-06-28 12:02:39','iot'),('465f55a9-20c5-4aec-8138-7b0f95e890b2','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.37,82.00,'2026-06-27 00:02:40','iot'),('479dd94c-cfca-451c-a381-e7b2294eb4d8','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.34,75.00,'2026-06-25 18:02:40','iot'),('47c58f2e-f410-4576-a21a-19e483c25c92','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.72,83.00,'2026-06-26 21:02:40','iot'),('4823bbc4-8b86-456d-9c08-392fc36b918a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.95,76.00,'2026-06-25 20:02:40','iot'),('4920367c-8572-4d0a-bb4f-a5c0fc42187e','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.21,73.00,'2026-06-26 13:02:40','iot'),('498469f8-6f13-4e4c-a531-857a19099ca2','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-20.10,65.00,'2026-06-28 04:02:37','iot'),('4ab38f2a-4a9c-4253-8f9b-172fd6fca8e7','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.42,79.00,'2026-06-27 18:02:40','iot'),('4abb5203-d697-4410-9e8f-60a48a3bf10a','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.44,84.00,'2026-06-27 03:02:40','iot'),('4acacad7-257b-41bd-bbb4-62a07da750d8','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.24,87.00,'2026-06-28 07:02:40','iot'),('4b1795dc-425d-46a6-a39f-cd0089223f5a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.39,75.00,'2026-06-26 04:02:40','iot'),('4d171d69-aacd-4b24-b66d-8d43ac5e2ff8','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.49,70.00,'2026-06-25 12:02:40','iot'),('4ed66905-4e60-4354-a71d-20976da85a6a','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.32,73.00,'2026-06-26 16:02:40','iot'),('501b1d39-ed32-4796-97d4-8d7ff7701264','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.77,85.00,'2026-06-26 18:02:40','iot'),('5164029a-5166-4203-a86e-8722613887c7','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12',1.60,85.00,'2026-06-28 16:02:37','iot'),('52f5bffc-bf15-4ec6-a4c3-952ca311cf53','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.02,74.00,'2026-06-27 00:02:40','iot'),('538ae7a5-925a-4e88-a716-8110648fcfcc','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.86,80.00,'2026-06-27 11:02:40','iot'),('563a2fd3-ec58-4839-9a3c-e363ccba39dd','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.66,89.00,'2026-06-28 22:02:40','iot'),('56593055-3d22-4510-9ffe-5d43a2b25302','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.35,83.00,'2026-06-28 16:02:40','iot'),('56bc7fd0-ee85-498b-98ad-c392891b10f7','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.08,81.00,'2026-06-26 01:02:40','iot'),('5783a4d6-779f-4cba-ade5-dd8828d2f3b2','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.97,72.00,'2026-06-27 01:02:40','iot'),('57845fbd-2dc2-4302-8e72-9a000b50c131','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.53,73.00,'2026-06-26 10:02:40','iot'),('5813f645-4e3e-4714-b593-964fa6a885c4','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.08,75.00,'2026-06-26 07:02:40','iot'),('5891be6d-f36f-4f99-b947-b36a39ae6063','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.58,78.00,'2026-06-28 23:02:40','iot'),('5909a8b7-ec58-4663-ae4f-d32b380c47b4','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.32,86.00,'2026-06-25 10:02:40','iot'),('59c85fee-4902-4b8e-8310-a32ed1dcc49f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-20.90,65.00,'2026-06-28 20:02:37','iot'),('5bfe412c-247c-4bff-8d22-407d1f4c0875','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.84,72.00,'2026-06-24 08:02:40','iot'),('5f03db50-cfcc-4122-b9c8-4e12987d9484','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.70,85.00,'2026-06-28 08:02:40','iot'),('5f10a666-9f87-4266-a4d8-de7374fddd33','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.70,65.00,'2026-06-28 16:02:39','iot'),('5f626f60-5d9f-4ec5-97bc-f4025a509ae2','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.53,81.00,'2026-06-24 09:02:40','iot'),('6249c2e3-3389-48da-a6f9-2f8a360f433d','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.84,77.00,'2026-06-28 08:02:40','iot'),('62ce0b6b-056f-4655-ad56-2c2f73bb7c96','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.26,73.00,'2026-06-28 18:02:40','iot'),('63793aac-f78b-40eb-80cf-37712df3f989','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.16,71.00,'2026-06-25 06:02:40','iot'),('63ea0b34-a798-40a8-a284-2effc171b49a','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.26,76.00,'2026-06-28 04:02:40','iot'),('645435a8-80cb-4798-b935-b6fef64c3d24','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.99,89.00,'2026-06-26 06:02:40','iot'),('64e20c2c-7d9a-4aba-abfc-bcf0f2e72747','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.19,72.00,'2026-06-27 07:02:40','iot'),('64f11f67-adc8-4671-a635-ded88560a184','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.67,82.00,'2026-06-26 17:02:40','iot'),('666e50fe-49ae-4210-8385-e92de7f2f269','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12',1.80,85.00,'2026-06-28 12:02:37','iot'),('6798b521-8a3c-4b12-8ab4-7ff7408f8cf7','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.15,78.00,'2026-06-24 07:02:40','iot'),('68d68949-4ab0-4b59-aada-2eec723e06a4','11f852eb-f735-4923-9fa4-538582e42160','e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec',-20.30,65.00,'2026-06-28 08:02:38','iot'),('6956cb1a-f1da-4de4-aa59-bc4279b10341','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.11,82.00,'2026-06-28 14:02:40','iot'),('69771f30-4f41-45f2-bb6c-cc884d1ee968','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.83,87.00,'2026-06-24 19:02:40','iot'),('6b48a536-7708-4760-b4f1-4ec2268cd176','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.98,88.00,'2026-06-27 16:02:40','iot'),('6bacd2cb-ff49-435f-b504-2ac181a712e9','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.10,81.00,'2026-06-24 12:02:40','iot'),('6be364c9-be49-4f87-a388-d6561f35f479','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.09,86.00,'2026-06-24 14:02:40','iot'),('6be9504c-c9fa-4937-92f3-64b95087253b','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.62,88.00,'2026-06-25 15:02:40','iot'),('6cb5b60c-7c2c-45d8-814c-f385fc0c8d16','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.50,81.00,'2026-06-27 01:02:40','iot'),('6d51b115-d89e-478f-8719-4d27d88c2108','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.91,72.00,'2026-06-26 02:02:40','iot'),('6dd5f284-7121-4743-a84c-d19085cd6ba1','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.26,86.00,'2026-06-28 01:02:40','iot'),('6e838b6a-f176-4297-bfdd-4f3317e33221','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.46,82.00,'2026-06-28 12:02:40','iot'),('6eb33eb7-ab99-448f-aea0-5184b4156218','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.58,76.00,'2026-06-24 17:02:40','iot'),('6eed2fe5-2331-4281-a6bb-161dae7a11e8','11f852eb-f735-4923-9fa4-538582e42160','dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec',2.20,85.00,'2026-06-28 04:02:38','iot'),('6f436e70-2872-4b70-8929-17dc2d4c1501','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.85,87.00,'2026-06-28 14:02:40','iot'),('6fddddb0-eb21-4470-9707-c621c761da92','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.60,75.00,'2026-06-26 11:02:40','iot'),('6fe20cf2-7f14-4947-ab24-884fd09470de','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.22,75.00,'2026-06-25 09:02:40','iot'),('70049a7e-b97a-4cdb-8450-f113befa5c9f','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.84,79.00,'2026-06-27 15:02:40','iot'),('704f633e-d06d-4478-85ef-7d4073ff4d2f','11f852eb-f735-4923-9fa4-538582e42160','dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec',1.80,85.00,'2026-06-28 12:02:38','iot'),('722d859b-b310-4fe1-ae78-8d52a1341d2e','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.67,81.00,'2026-06-26 11:02:40','iot'),('730f6919-a3c7-43bb-b939-828813f94100','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.33,84.00,'2026-06-28 06:02:40','iot'),('738de4aa-8ca5-47e2-b205-b3d63f8e6c34','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.18,81.00,'2026-06-26 03:02:40','iot'),('73f6b0b8-9f09-46a6-aa4d-a1b8acd1cf85','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.00,78.00,'2026-06-27 21:02:40','iot'),('75589afa-9bef-4bce-86ae-097d0e586575','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.59,83.00,'2026-06-28 05:02:40','iot'),('7855dadc-94e5-4a9d-8cb1-0365cc1bccf6','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.64,86.00,'2026-06-24 20:02:40','iot'),('7879bc79-6ab2-4b9b-a20f-a219eafb5441','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.01,83.00,'2026-06-27 23:02:40','iot'),('790da39d-0d07-4f65-8bbc-3f2ff0b28efe','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.49,82.00,'2026-06-24 10:02:40','iot'),('7931ef28-015a-4ab4-932b-aa8109e99010','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.34,72.00,'2026-06-28 13:02:40','iot'),('79676b89-8b38-4cdc-80e4-16fe893216f4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.69,72.00,'2026-06-25 07:02:40','iot'),('79e6eba1-3960-4119-bd8e-7a3dd3defda1','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.34,86.00,'2026-06-27 07:02:40','iot'),('79f136bf-c063-4cff-a250-280a8daf5e2d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.45,74.00,'2026-06-25 15:02:40','iot'),('7aa04e27-7d00-47b5-8a6e-3143ff8641e4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.15,85.00,'2026-06-25 08:02:40','iot'),('7b2ad88e-87b1-4e88-998b-a51962b12733','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.12,85.00,'2026-06-27 01:02:40','iot'),('7c571de5-4a88-406c-8c1b-c0688f9bce66','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.10,65.00,'2026-06-28 04:02:39','iot'),('7cbfc47b-5db6-40d6-b81a-ab97514d33ed','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.12,77.00,'2026-06-26 02:02:40','iot'),('7d04fec9-d064-461c-b39d-65ed83ce7c20','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.46,75.00,'2026-06-25 13:02:40','iot'),('7d5384c8-0e4c-4e69-b7d2-fa499cc0f3f2','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.76,86.00,'2026-06-27 08:02:40','iot'),('7d79a108-34ca-4e6b-9eea-f4764c068cbe','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.87,83.00,'2026-06-25 10:02:40','iot'),('7edd726a-75ed-483f-b3a8-f12892fb4e5a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.36,84.00,'2026-06-24 16:02:40','iot'),('7ef1c599-058c-4820-bbc1-3250ada96df5','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.92,82.00,'2026-06-26 19:02:40','iot'),('7fc23b0d-2b12-4821-828c-ac13627d0845','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.26,81.00,'2026-06-26 19:02:40','iot'),('7fd7453c-e5a4-4123-805a-85f2c5f5d535','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.44,80.00,'2026-06-25 19:02:40','iot'),('815565dc-bd4b-4ca7-9177-983715e42474','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.29,73.00,'2026-06-27 17:02:40','iot'),('81602181-6d10-48fb-9d64-d26f13fba67d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.74,83.00,'2026-06-27 17:02:40','iot'),('818be7c2-8e58-4d52-b971-f10d11ce471c','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.86,82.00,'2026-06-26 00:02:40','iot'),('81b12a45-e89d-414a-8444-2142eb0b5ad0','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.51,70.00,'2026-06-24 16:02:40','iot'),('82123c44-b42c-4fbb-b71c-511e3c6adf04','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.09,88.00,'2026-06-27 21:02:40','iot'),('83033319-856c-4bd2-8cbb-e39f13979271','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.89,73.00,'2026-06-25 21:02:40','iot'),('85d2afdd-b76f-49c3-b558-2b7d56c77e04','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.26,81.00,'2026-06-25 19:02:40','iot'),('86047c96-63d1-499b-8816-0985f5e3204b','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.00,85.00,'2026-06-25 16:02:40','iot'),('861a3e32-084c-4ca5-b242-432e901249de','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.80,72.00,'2026-06-24 11:02:40','iot'),('87de8015-a245-446b-ae04-66bd9508e22f','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.48,72.00,'2026-06-24 05:02:40','iot'),('8833fabe-dd24-4f0c-a142-5b2fb2dc1767','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.87,89.00,'2026-06-27 19:02:40','iot'),('888693dc-11bc-44a9-9818-0e37031b31c4','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.21,79.00,'2026-06-28 08:02:40','iot'),('888bdeff-0215-4c99-95a5-aaa72601bde9','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.33,72.00,'2026-06-26 17:02:40','iot'),('8991ecc8-e7b6-4a56-82cd-255470b1a815','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.23,84.00,'2026-06-27 19:02:40','iot'),('8a58f25b-c778-40c6-bb60-3b9eb61b263e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.08,87.00,'2026-06-26 05:02:40','iot'),('8bd0d2bf-4548-4726-88e1-1abdb2ae5c77','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.71,80.00,'2026-06-28 19:02:40','iot'),('8cf43b1a-bade-4904-87ca-71ac3908717f','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.35,88.00,'2026-06-24 15:02:40','iot'),('8dfd5984-146d-4339-845a-4550fc60467b','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-40.80,55.00,'2026-06-28 04:02:37','iot'),('8f30d02a-a32c-4ef4-b176-6d27bfdd1579','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.91,81.00,'2026-06-28 04:02:40','iot'),('8fc65c59-225d-4bf5-91e7-99063cb60e44','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.81,80.00,'2026-06-27 13:02:40','iot'),('9038a7bf-212b-4d0a-b972-4e8d5057feec','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.80,85.00,'2026-06-28 12:02:39','iot'),('90d66e3a-b13e-48ff-aa1f-584711942eb8','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.42,76.00,'2026-06-28 19:02:40','iot'),('90f4c291-b614-48ad-a3e0-2b9c69ef80e1','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.42,84.00,'2026-06-25 03:02:40','iot'),('912c356a-dfd0-499d-aa5f-8627228cb960','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.37,73.00,'2026-06-28 10:02:40','iot'),('9300994f-bb51-45d2-a2a4-6953b7b888dc','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.58,81.00,'2026-06-28 05:02:40','iot'),('93209bab-8074-4b0f-bb66-035689a485a6','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.51,71.00,'2026-06-25 09:02:40','iot'),('9333d7c6-3fb2-4334-a320-c17ac1ffb541','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-20.70,65.00,'2026-06-28 16:02:37','iot'),('948a7141-34ea-4a00-a6fd-a5590101d7a2','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.13,72.00,'2026-06-24 18:02:40','iot'),('9537047c-c5c0-4939-b6df-8b608c603911','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.97,86.00,'2026-06-27 10:02:40','iot'),('9621bcce-c6b5-4b55-81ed-d6bf48541ab2','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.82,77.00,'2026-06-25 11:02:40','iot'),('968f5645-4689-487a-b2c6-a5518a210d1e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.05,79.00,'2026-06-24 08:02:40','iot'),('96945c4e-a013-4402-b7d2-e6e842d4b470','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.00,76.00,'2026-06-26 09:02:40','iot'),('9737681b-4d24-46ec-802a-180874911405','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.89,86.00,'2026-06-25 01:02:40','iot'),('979d18c2-d8d9-4f8c-8914-37c572c8e004','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.83,83.00,'2026-06-28 12:02:40','iot'),('97dd9408-9788-4b93-b87b-320ec361ea42','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.54,77.00,'2026-06-24 10:02:40','iot'),('97ebb229-c41f-44fb-9586-0438f7a7d9b0','b21fe9c1-79b2-490e-a254-87df2e52b4d9','4bb4e307-c3a4-450e-a4d8-86caffd34d09','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-20.30,65.00,'2026-06-28 08:02:37','iot'),('97f8b418-cbb0-462a-b106-c32e905f9470','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.26,88.00,'2026-06-27 22:02:40','iot'),('99144b0e-2bb9-43b2-b494-dcbd6215d2f0','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.59,75.00,'2026-06-28 09:02:40','iot'),('99293cfb-9a68-4e43-939e-dce0ae214dd0','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.76,71.00,'2026-06-25 02:02:40','iot'),('998f48c5-fa75-4c02-86a5-65764a3ae5b1','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.06,81.00,'2026-06-24 23:02:40','iot'),('9c3ed6d2-f5a3-442f-abd0-b497dcf4664e','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.20,55.00,'2026-06-28 12:02:39','iot'),('9d700714-6bcf-4653-94ae-fca0a73ae4fa','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.65,74.00,'2026-06-27 20:02:40','iot'),('9d722b5b-dc73-46e7-bb50-fbbb2fe0f19d','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.40,55.00,'2026-06-28 16:02:39','iot'),('9df809f9-4ad1-4a8f-b01a-2967578831a6','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.69,70.00,'2026-06-26 15:02:40','iot'),('9e87aae4-ef67-4a3d-ae5e-c79bcbf8b567','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.63,82.00,'2026-06-26 22:02:40','iot'),('9efb33a6-5229-4452-9148-f00b0f2595c4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.49,85.00,'2026-06-24 00:02:40','iot'),('9f19c650-81de-4d42-b5fd-3516884558a4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.41,80.00,'2026-06-25 06:02:40','iot'),('9f910666-0988-44cc-a4cb-38b19681f1ed','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.52,74.00,'2026-06-28 11:02:40','iot'),('a008d8fe-ce36-46ad-986a-505bff33a839','b21fe9c1-79b2-490e-a254-87df2e52b4d9','3d3a838a-7243-48c7-bc41-68101e8f25c9','992f1b20-33a9-476d-a5b8-3d2d950f2e12',1.40,85.00,'2026-06-28 20:02:37','iot'),('a037532a-2618-4baf-9ae4-bd9a0deaaf17','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.36,84.00,'2026-06-25 17:02:40','iot'),('a049372e-e3fc-4cfd-8949-1d47f763a8d3','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.32,75.00,'2026-06-25 14:02:40','iot'),('a08ce990-1efe-4c4a-a7f7-b98c32a74c88','11f852eb-f735-4923-9fa4-538582e42160','382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec',-40.80,55.00,'2026-06-28 04:02:38','iot'),('a0ddbc4c-3998-4cbe-b086-dd45df4af264','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.50,77.00,'2026-06-28 06:02:40','iot'),('a0e3f649-fbac-48b2-984e-bd205aaa5cc8','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.84,77.00,'2026-06-28 03:02:40','iot'),('a1749e77-2ee3-44a7-a6b0-2697a55d1cd7','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.01,81.00,'2026-06-27 05:02:40','iot'),('a3222766-6e2e-4ac4-ac9c-35bb5d385e63','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.70,76.00,'2026-06-23 23:02:40','iot'),('a57d8feb-f101-40d4-91e7-0033a47465e3','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.57,81.00,'2026-06-26 22:02:40','iot'),('a59a93de-11c5-4cda-a26a-49d71a5e8143','11f852eb-f735-4923-9fa4-538582e42160','382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec',-41.20,55.00,'2026-06-28 12:02:38','iot'),('a686acb6-08fb-4bd4-9611-9e031dc944d8','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.70,83.00,'2026-06-26 09:02:40','iot'),('a7453bb2-6a89-43f2-a096-e5f1eeba1f78','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.14,74.00,'2026-06-24 08:02:40','iot'),('a78f35a4-cb72-4be9-bb74-dcf75b707f35','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.29,89.00,'2026-06-28 02:02:40','iot'),('a7d3e04f-48fa-453d-8cdc-b4540076cb9c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.40,70.00,'2026-06-24 17:02:40','iot'),('a808ae51-580d-4ebf-a66e-c25089937ff5','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.00,85.00,'2026-06-28 08:02:39','iot'),('a89ac260-9b95-45d7-92f7-95bf395c5a91','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.39,80.00,'2026-06-24 00:02:40','iot'),('a8ee5e53-b680-4558-a0f1-1f2e80d1976f','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.08,70.00,'2026-06-24 13:02:40','iot'),('a953e53a-9bb6-4b14-90fe-7629c9822faf','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.38,72.00,'2026-06-26 12:02:40','iot'),('a9934e29-686e-4d94-87d2-187d7ec344bc','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.29,86.00,'2026-06-25 21:02:40','iot'),('aa62b256-588e-4bf9-ab5f-31d7334207a1','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.46,73.00,'2026-06-27 04:02:40','iot'),('aaeeded1-3b69-4015-ab78-cb6c29b729ad','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.03,78.00,'2026-06-25 03:02:40','iot'),('ab5f9301-1a75-44be-96c2-7693b9b6648d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.24,78.00,'2026-06-26 18:02:40','iot'),('ab6ec6b4-8263-49f2-af1c-f96438888c72','11f852eb-f735-4923-9fa4-538582e42160','382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec',-41.00,55.00,'2026-06-28 08:02:38','iot'),('acbfbf69-8ed8-4f97-9173-cf412a6a45f9','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.86,71.00,'2026-06-24 07:02:40','iot'),('ad0861d5-189f-4789-a1f3-f28b62fcf97e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.02,84.00,'2026-06-25 00:02:40','iot'),('ad0bc0f5-7ded-480e-8943-6f348f13387c','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.80,83.00,'2026-06-26 07:02:40','iot'),('ad212a78-4793-4295-a546-539acc9ba740','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.18,72.00,'2026-06-27 22:02:40','iot'),('ad29239c-3dcc-4112-9936-b752e8e1d5df','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.14,88.00,'2026-06-28 12:02:40','iot'),('ad7b7b37-5040-4054-b396-3991889f2fe0','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.92,75.00,'2026-06-26 00:02:40','iot'),('ad920225-35d7-4252-a2f9-2b69ff726d5d','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.90,65.00,'2026-06-28 20:02:39','iot'),('adae7802-fe74-4d23-bd5b-1c6847108b0c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.95,81.00,'2026-06-25 04:02:40','iot'),('aeb62a0f-73bd-494b-88ee-7f483dff09bb','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.61,89.00,'2026-06-26 14:02:40','iot'),('aec21619-02ac-4a5c-ae08-9862c724050f','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.40,85.00,'2026-06-28 20:02:39','iot'),('b1637b15-ee95-47a8-bf84-67382882912e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.62,80.00,'2026-06-27 12:02:40','iot'),('b2651725-14b3-4ce1-aaef-e21cbaffd585','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.23,75.00,'2026-06-25 22:02:40','iot'),('b291e402-e206-4f65-8ae2-f51a2a6b31dc','11f852eb-f735-4923-9fa4-538582e42160','dc83e5b8-cdad-4dce-bc8b-997f29479f9c','e26641a5-1474-45ff-92fc-05eec74b34ec',1.40,85.00,'2026-06-28 20:02:38','iot'),('b36178ea-f794-4414-a499-ae2bc58744c1','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.39,83.00,'2026-06-27 14:02:40','iot'),('b3cd94c4-1a09-40dd-a13d-914e56b4d4a5','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.61,88.00,'2026-06-27 09:02:40','iot'),('b3e5ae19-9487-4e14-a43b-b582548ab0a1','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.35,79.00,'2026-06-26 03:02:40','iot'),('b44fe1d1-5eaa-414d-bca5-3770393af88b','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.75,87.00,'2026-06-24 04:02:40','iot'),('b544a5f5-e88a-4de9-8f58-5bf57d2aab62','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.51,71.00,'2026-06-28 21:02:40','iot'),('b5f14dca-bfcf-46ef-a289-1a5b207703b4','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.81,80.00,'2026-06-27 02:02:40','iot'),('b5facfd2-4a3a-406f-9606-400df539a9e3','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.27,77.00,'2026-06-25 13:02:40','iot'),('b61b4418-6068-45e1-8de7-5465fbc4048f','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.42,87.00,'2026-06-28 21:02:40','iot'),('b6412149-bdbb-4a9c-9cd0-e0ec50f3a304','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.30,77.00,'2026-06-26 07:02:40','iot'),('b68b718d-e9c5-4d4f-8882-a65ea1220a30','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.60,80.00,'2026-06-28 17:02:40','iot'),('b69bfc4a-13b9-4418-a222-50bb656de96c','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.48,82.00,'2026-06-25 22:02:40','iot'),('b6cea985-11f9-471d-890e-6cec539d19dd','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.02,78.00,'2026-06-27 16:02:40','iot'),('b8bb251e-c2b0-42c5-bbab-4f2fa0336867','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.95,74.00,'2026-06-26 01:02:40','iot'),('b8bfc3ad-58ad-49e2-ae7b-8f8aae244df6','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.40,86.00,'2026-06-25 11:02:40','iot'),('b98e3ca1-f196-4c5b-82fe-58b8af115483','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.17,77.00,'2026-06-26 06:02:40','iot'),('ba77695d-be8d-4fd1-9e98-fcf3e345ee79','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.20,86.00,'2026-06-24 06:02:40','iot'),('bad99205-5538-466a-8e54-8639b66f3d7a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.69,80.00,'2026-06-24 05:02:40','iot'),('bb8e584f-d733-4500-8fdd-412a7eda78fc','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.83,83.00,'2026-06-24 11:02:40','iot'),('bc0e1217-9364-4115-88f5-f58bec72394d','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.07,76.00,'2026-06-27 06:02:40','iot'),('be2f09de-2176-4560-bf8f-03feb28b82ae','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.24,75.00,'2026-06-25 22:02:40','iot'),('bf498bd7-488d-4eab-89f5-885e6ebdd96c','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.11,83.00,'2026-06-25 08:02:40','iot'),('bf6e38c4-c9b5-4fc1-b1bf-f1de6ad60c3a','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.17,85.00,'2026-06-23 23:02:40','iot'),('c028b4cd-654c-4cc6-a6d2-0ffe442a4094','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.34,73.00,'2026-06-24 15:02:40','iot'),('c04a1572-d47f-4a93-9d7a-ecd3f9a5a07b','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.58,87.00,'2026-06-26 04:02:40','iot'),('c081499a-0a8c-4499-9259-e1873614d129','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.65,74.00,'2026-06-25 14:02:40','iot'),('c254cda9-bb6c-4029-a448-76ce019a19ad','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.43,75.00,'2026-06-25 23:02:40','iot'),('c3fad1a4-6117-4a5b-929c-b12c36dd8ca0','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.73,85.00,'2026-06-25 07:02:40','iot'),('c41e4a42-aeea-45af-8cf5-5ed60312f692','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.53,72.00,'2026-06-26 20:02:40','iot'),('c45849e4-c51c-4bdc-9959-5a11bb75a4c7','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.95,76.00,'2026-06-24 13:02:40','iot'),('c4652947-f0cf-41fa-aa58-6221e72a1d2a','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.09,73.00,'2026-06-27 15:02:40','iot'),('c4827efc-2e8d-476a-9a03-d0620abf4c5a','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.07,86.00,'2026-06-28 02:02:40','iot'),('c50235e1-ed77-4ddc-81e4-7411f6d1722a','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.27,70.00,'2026-06-26 23:02:40','iot'),('c50ee243-b09e-471d-9df5-793deb7a08d2','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.22,87.00,'2026-06-26 08:02:40','iot'),('c5d98923-9199-42c4-8f52-04c29d176446','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.31,85.00,'2026-06-26 20:02:40','iot'),('c6c33da6-cbff-4d84-ba7c-c4f74a3e42ab','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.37,81.00,'2026-06-25 12:02:40','iot'),('c6db72b5-4f52-4c86-8ac7-f184c4b8bfda','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.37,89.00,'2026-06-25 14:02:40','iot'),('c821efe6-ac15-4166-a6ae-bac390b3bec8','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.92,88.00,'2026-06-24 15:02:40','iot'),('c827e808-51ab-4812-9413-0956d6033ec3','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.13,87.00,'2026-06-26 23:02:40','iot'),('c82a0356-e7e2-453d-b283-69c3f9e09726','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.53,75.00,'2026-06-27 08:02:40','iot'),('c840292d-e0f2-466b-91cd-51de98ed1300','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.97,86.00,'2026-06-24 19:02:40','iot'),('ca0fd98b-3743-4e84-aa68-7e48ce279fc7','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.14,74.00,'2026-06-27 06:02:40','iot'),('ca67d56d-bb79-44cb-bb98-9089ff6d72ee','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.09,72.00,'2026-06-25 20:02:40','iot'),('cbe09440-84b7-43d0-99c7-1da6fec6b178','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.73,84.00,'2026-06-24 01:02:40','iot'),('ce4b68c0-472b-458c-8e65-c491cd616c37','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.05,89.00,'2026-06-24 17:02:40','iot'),('cefc2fcb-0c61-4d08-b5a6-a4dc68a46e3e','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.41,79.00,'2026-06-27 11:02:40','iot'),('cf131fac-d88c-4698-b6e5-158b42022d3a','11f852eb-f735-4923-9fa4-538582e42160','e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec',-20.90,65.00,'2026-06-28 20:02:38','iot'),('d00f139a-f82f-4e29-8155-4220a8d712ea','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.54,86.00,'2026-06-24 01:02:40','iot'),('d02d52be-baf2-43bf-a64f-91435ed0c240','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.24,86.00,'2026-06-25 00:02:40','iot'),('d0c33668-6fc9-4809-b20b-fbd213fc120d','11f852eb-f735-4923-9fa4-538582e42160','382520f9-f810-4a1f-8d32-52c27545610a','e26641a5-1474-45ff-92fc-05eec74b34ec',-41.60,55.00,'2026-06-28 20:02:38','iot'),('d0ff12f7-bcf2-40ee-b074-4e8c94a3b993','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.65,78.00,'2026-06-24 21:02:40','iot'),('d12f858f-0c55-48ac-942c-64934eac924b','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.35,88.00,'2026-06-27 17:02:40','iot'),('d1477678-9eed-4fad-8928-ec1fe88ee453','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.11,80.00,'2026-06-24 18:02:40','iot'),('d1aad90c-4013-4d10-82d6-14fd0f18b399','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.86,86.00,'2026-06-28 15:02:40','iot'),('d310de9d-b21e-4246-969c-a4031b1dfa80','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.39,79.00,'2026-06-25 11:02:40','iot'),('d39c8b08-a0f1-4a72-a6e3-4301321f2f63','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.88,85.00,'2026-06-24 11:02:40','iot'),('d40e010a-e143-480f-ac70-e78fd1d2d5ec','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.96,87.00,'2026-06-24 02:02:40','iot'),('d43607c6-9287-43d9-8899-ab45d4ae8cb2','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-41.00,55.00,'2026-06-28 08:02:37','iot'),('d441af0a-6192-433c-8384-2790d668a43c','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.61,84.00,'2026-06-27 03:02:40','iot'),('d4cfb549-ab8a-4f4d-ace8-231be4f3ae6f','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.82,79.00,'2026-06-25 20:02:40','iot'),('d789e7a9-3c9a-457a-b917-67926df69282','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.77,74.00,'2026-06-27 05:02:40','iot'),('d7b70dce-1a5c-43af-8cbd-9416bca65d03','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.00,74.00,'2026-06-27 21:02:40','iot'),('d9246504-be6e-4d72-8201-5b68388b0952','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.49,82.00,'2026-06-24 09:02:40','iot'),('dbe3a145-90a8-46c8-85ef-671587155af5','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.58,88.00,'2026-06-24 00:02:40','iot'),('dbf4fd6b-5cd6-4cca-8fed-ff1b029d01fc','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.49,86.00,'2026-06-28 16:02:40','iot'),('dd013eb8-5cf4-4e1d-91bf-a2ad57c1a918','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.13,86.00,'2026-06-24 16:02:40','iot'),('dd4b2fcc-f9ed-4e89-a833-bffaf224c155','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.70,89.00,'2026-06-28 23:02:40','iot'),('dd7a1a2f-4cf2-4dd0-991b-68170773a04e','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.08,82.00,'2026-06-24 03:02:40','iot'),('dda02dd8-9c05-4cf2-969f-a3b456e29dc3','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.40,77.00,'2026-06-28 17:02:40','iot'),('df208721-7847-4edc-a915-ecce15b8e1a7','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.14,76.00,'2026-06-26 10:02:40','iot'),('df2a2c06-91e7-4a2f-a66a-df8bc1a377df','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.26,75.00,'2026-06-28 15:02:40','iot'),('df9cd5cd-32e1-4ea8-939a-b81d6bb16316','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.53,79.00,'2026-06-27 00:02:40','iot'),('dff9033d-0a55-4635-8f99-cbb922cdfeef','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.72,71.00,'2026-06-24 06:02:40','iot'),('e0ae95eb-b029-42cc-85ee-20d96e82c1f3','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.25,89.00,'2026-06-25 17:02:40','iot'),('e0e822fa-8710-40eb-879c-458b27360757','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.21,89.00,'2026-06-27 08:02:40','iot'),('e143a081-3753-46a9-9633-c62aa96675c0','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.82,71.00,'2026-06-24 12:02:40','iot'),('e158f786-3a9c-4c5a-9d60-39e14a7f5d1b','11f852eb-f735-4923-9fa4-538582e42160','e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec',-20.70,65.00,'2026-06-28 16:02:38','iot'),('e1ac279a-447c-46a7-9d99-dae1678a80bf','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.98,83.00,'2026-06-28 03:02:40','iot'),('e1ff7957-5aef-4b7d-9c22-bd5d55ccaf93','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.97,88.00,'2026-06-28 19:02:40','iot'),('e25eac66-009d-49b9-8469-005c6e585873','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.28,77.00,'2026-06-28 03:02:40','iot'),('e445838b-13e0-45c1-be2b-4b09ca09f2cc','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.84,89.00,'2026-06-24 12:02:40','iot'),('e67d877c-7388-4df8-a054-2647248b4794','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.96,79.00,'2026-06-25 16:02:40','iot'),('e7cceeda-63ae-4754-9a27-fae3a0880971','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.48,88.00,'2026-06-24 04:02:40','iot'),('e8211f87-14a2-430b-b8f0-e6a8220847e5','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.24,78.00,'2026-06-26 17:02:40','iot'),('e886483c-70a9-4071-9c85-ee668eac1934','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.70,85.00,'2026-06-28 10:02:40','iot'),('e970b2c5-92d0-48fa-847e-ef376035672f','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.63,70.00,'2026-06-25 18:02:40','iot'),('eb0fa56b-afd1-43be-93b1-7dbfefa6dfb7','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.68,80.00,'2026-06-26 14:02:40','iot'),('eb143000-3fe7-46a6-95b7-9da93d8b85ef','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.80,55.00,'2026-06-28 04:02:39','iot'),('ec087d44-8553-4232-a021-654e644115f9','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.84,87.00,'2026-06-25 06:02:40','iot'),('ec2b4530-5fc8-4585-b2c9-c27050127ca8','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.97,72.00,'2026-06-24 23:02:40','iot'),('ec86f003-a1b2-4f3d-86f3-a6d90e5daa8f','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.25,75.00,'2026-06-28 09:02:40','iot'),('ecc6fdac-cb27-4da8-8cb1-36af4e5bd7a4','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.60,85.00,'2026-06-28 16:02:39','iot'),('ecdc7a97-c947-4824-8391-ff5a273bdda3','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.71,75.00,'2026-06-24 18:02:40','iot'),('ecee6061-8dd2-44bb-a6ac-55186387033b','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.12,83.00,'2026-06-26 13:02:40','iot'),('ed6e87fe-4513-44f5-92bd-19afce887bd5','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.66,79.00,'2026-06-25 23:02:40','iot'),('ed8bd51d-34aa-42e1-b795-9476013f2845','11f852eb-f735-4923-9fa4-538582e42160','e584485b-f8f1-4570-b5f9-d51a0b9ed210','e26641a5-1474-45ff-92fc-05eec74b34ec',-20.10,65.00,'2026-06-28 04:02:38','iot'),('ed9a0c09-6bc5-461c-9dc7-33875ff22bc4','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.23,71.00,'2026-06-26 05:02:40','iot'),('eebbb481-a486-472f-95a4-bcb529f99989','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.85,73.00,'2026-06-27 18:02:40','iot'),('ef0f4f42-e592-4108-9b8f-2199af33b702','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',0.57,78.00,'2026-06-26 06:02:40','iot'),('ef67ff10-f041-4bb7-a923-b6b4e965696b','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.33,86.00,'2026-06-28 11:02:40','iot'),('f02d4104-30b8-4a0b-8c76-c6dbf5e52431','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.59,73.00,'2026-06-24 21:02:40','iot'),('f03c052a-8ed5-404e-ae14-a8eef2cf7a6d','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.45,76.00,'2026-06-26 15:02:40','iot'),('f068bc56-5178-4a2f-8c53-81516671a7f4','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.99,75.00,'2026-06-24 03:02:40','iot'),('f08e20c0-617d-404e-b7f4-2b6292ef47b2','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.74,89.00,'2026-06-28 06:02:40','iot'),('f170fe81-2fc1-41b7-8f1b-eba3d668bf9c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.04,79.00,'2026-06-26 09:02:40','iot'),('f2176924-e57b-46fc-ba7c-2e1435cd53da','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.44,70.00,'2026-06-27 12:02:40','iot'),('f2c9694a-47d1-4f13-b940-057915c22a24','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.13,82.00,'2026-06-28 13:02:40','iot'),('f3e5a2ef-0264-467d-aaec-be9edee813e2','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-41.25,76.00,'2026-06-26 02:02:40','iot'),('f41bf3d2-acf2-4d00-8faf-cef2ea3aa702','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.78,70.00,'2026-06-27 07:02:40','iot'),('f48d9057-4b6c-4fb3-839e-bbca42beae58','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.47,81.00,'2026-06-27 03:02:40','iot'),('f4d61302-b222-4e06-b4a8-79e7202ad5c9','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.20,72.00,'2026-06-27 04:02:40','iot'),('f4ee8b97-6a38-444c-99d2-698e8eabcdca','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.92,70.00,'2026-06-27 10:02:40','iot'),('f5142320-d869-46b1-9167-bc11b9550fb6','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.53,84.00,'2026-06-25 01:02:40','iot'),('f5d25d45-a5f6-4a88-bf2c-0af0a73f9a30','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.74,77.00,'2026-06-25 04:02:40','iot'),('f71eaf88-190d-4f4d-ba82-8978ae2f94a5','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.42,81.00,'2026-06-27 20:02:40','iot'),('f7c459b4-0376-4b9a-a46e-cd9c346069b2','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.45,70.00,'2026-06-28 22:02:40','iot'),('f7e67ed2-b36f-4b69-aba4-342ff6558a58','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.06,72.00,'2026-06-25 03:02:40','iot'),('f808b859-a877-4f6f-b845-f95f62ee8788','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',1.26,78.00,'2026-06-28 00:02:40','iot'),('f853fc1f-ced0-4e31-b51d-efee3f1080bd','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-19.45,85.00,'2026-06-27 09:02:40','iot'),('f97369d0-bffc-400a-888c-b464c942c474','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.41,75.00,'2026-06-25 10:02:40','iot'),('fa9f6a17-41bf-4eb3-831f-aa095ff35307','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-40.17,89.00,'2026-06-27 12:02:40','iot'),('fae9161f-df39-4c9d-8687-bb5aa1cb1c59','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.40,76.00,'2026-06-27 09:02:40','iot'),('faeb9358-dfe2-41f5-b87f-da3a50f4c476','b21fe9c1-79b2-490e-a254-87df2e52b4d9','7e2a7b92-0275-4478-9269-b4ae5c09364f','992f1b20-33a9-476d-a5b8-3d2d950f2e12',-41.60,55.00,'2026-06-28 20:02:37','iot'),('fb5fb2d5-700e-4c6c-b2e6-b5519d20a175','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',3.73,70.00,'2026-06-25 08:02:40','iot'),('fca12e3e-11d4-4bef-8ccf-23b1a06dc59c','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-20.20,74.00,'2026-06-24 23:02:40','iot'),('fcb6f88d-af1b-449c-950b-4fff0a3f348e','12495be8-694e-4b73-b391-62f36e6c42e2','d063df06-d37d-48e7-9a85-7e68ead72fe2','954ef5f5-6433-4b8c-89be-b31895b8081e',2.61,87.00,'2026-06-24 05:02:40','iot'),('fd0af1f7-03c4-4de3-80e9-0b1400e771f2','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-38.46,87.00,'2026-06-26 22:02:40','iot'),('fe1b70a1-72d6-4fb4-9861-da644fc6cc2e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.61,89.00,'2026-06-25 15:02:40','iot'),('fe5c2bb7-f6ad-424e-a38c-ee5418e4847e','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-18.94,71.00,'2026-06-25 05:02:40','iot'),('fe67cbe1-7dde-4f71-a5e7-a3de481fb8a7','12495be8-694e-4b73-b391-62f36e6c42e2','5c43c668-8876-463d-8161-d41c147bb8c6','954ef5f5-6433-4b8c-89be-b31895b8081e',-21.33,78.00,'2026-06-27 19:02:40','iot'),('fe6ac597-21bf-4865-a956-e4e8fe87e791','12495be8-694e-4b73-b391-62f36e6c42e2','a4e67e93-bcb9-4d5d-87a3-a818e533042b','954ef5f5-6433-4b8c-89be-b31895b8081e',-39.07,80.00,'2026-06-24 04:02:40','iot');
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
INSERT INTO `tenant_feature_flags` VALUES ('11f852eb-f735-4923-9fa4-538582e42160','advanced_analytics',1,'2026-06-28 20:02:38'),('11f852eb-f735-4923-9fa4-538582e42160','ai',1,'2026-06-28 20:02:38'),('11f852eb-f735-4923-9fa4-538582e42160','marketplace',1,'2026-06-28 20:02:38'),('12495be8-694e-4b73-b391-62f36e6c42e2','advanced_analytics',1,'2026-06-28 20:02:39'),('12495be8-694e-4b73-b391-62f36e6c42e2','ai',1,'2026-06-28 20:02:39'),('12495be8-694e-4b73-b391-62f36e6c42e2','marketplace',1,'2026-06-28 20:02:39'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','advanced_analytics',1,'2026-06-28 20:02:37'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','ai',1,'2026-06-28 20:02:37'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','marketplace',1,'2026-06-28 20:02:37');
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
INSERT INTO `tenant_members` VALUES ('1c3252cf-c37c-4f61-8ada-a82181361dac','12495be8-694e-4b73-b391-62f36e6c42e2','4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','','active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40','2026-06-28 20:02:40'),('3c3b7417-249f-4b3a-84f9-330933af34f7','12495be8-694e-4b73-b391-62f36e6c42e2','77b36613-6a88-46c2-9ea8-8a0edaf28dfa','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','','active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40','2026-06-28 20:02:40'),('462270b9-7500-47cc-a5a9-253beb42d5c0','12495be8-694e-4b73-b391-62f36e6c42e2','02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','','active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40','2026-06-28 20:02:40'),('4c95d82e-77ae-4144-a19d-357e60d3c913','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16','27a9307a-a420-4a61-9451-34b2c0064968','tenant_owner','active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37','2026-06-28 20:02:37'),('5a9e0bde-3f7a-4b41-8694-dd9569bd9517','12495be8-694e-4b73-b391-62f36e6c42e2','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','vendor','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39','2026-06-28 20:02:39'),('5bfdfeef-4c2a-4621-8e9a-ea976fbf8746','b21fe9c1-79b2-490e-a254-87df2e52b4d9','554e08ea-02dd-4817-b0e7-24042ace45b4','27a9307a-a420-4a61-9451-34b2c0064968','customer','active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37','2026-06-28 20:02:37'),('85c83cd1-b2a3-42c4-89c4-d06cf9cefba2','12495be8-694e-4b73-b391-62f36e6c42e2','554e08ea-02dd-4817-b0e7-24042ace45b4','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','customer','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39','2026-06-28 20:02:39'),('96aad36b-05e8-4adf-a96e-4fed10e1125a','11f852eb-f735-4923-9fa4-538582e42160','554e08ea-02dd-4817-b0e7-24042ace45b4','642f1048-b22a-4828-a17a-e86ad5123ceb','customer','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38','2026-06-28 20:02:38'),('a999d5e7-7a0d-48e5-bc97-310a98d0aac4','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516','642f1048-b22a-4828-a17a-e86ad5123ceb','tenant_owner','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38','2026-06-28 20:02:38'),('c2b72fa6-e877-4abf-926b-2d21f93cba1f','b21fe9c1-79b2-490e-a254-87df2e52b4d9','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','27a9307a-a420-4a61-9451-34b2c0064968','vendor','active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37','2026-06-28 20:02:37'),('cf9ffe2a-a132-499c-9df4-dd30b232b9bf','11f852eb-f735-4923-9fa4-538582e42160','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','642f1048-b22a-4828-a17a-e86ad5123ceb','vendor','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38','2026-06-28 20:02:38'),('d5bec9af-41a8-44f6-ba59-c30e81f68bf8','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','tenant_owner','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39','2026-06-28 20:02:39'),('eacecf3a-ea60-4960-aa71-4946d190bdf5','12495be8-694e-4b73-b391-62f36e6c42e2','a8925060-2a3a-4829-a50f-3530a67d147b','65dc10a3-fde3-4318-ba99-e96fe2aeeebe','','active',NULL,'2026-06-28 20:02:40','2026-06-28 20:02:40','2026-06-28 20:02:40'),('tm-4771d81c-81ef-495e-b938-7f4d1d321','tenant-default-0001','4771d81c-81ef-495e-b938-7f4d1d3213d4',NULL,'tenant_owner','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-554e08ea-02dd-4817-b0e7-24042ace4','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-9c2fcb6b-12f2-44b2-8f42-9f11d7c8f','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-aa64c08b-dbf8-4c0c-9043-950f1abc2','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c7b4bb8e-69d8-4a0a-9251-4daa2f4ff','tenant-default-0001','c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-c9d59c3d-ede5-4815-9e6d-415ad71f1','tenant-default-0001','c9d59c3d-ede5-4815-9e6d-415ad71f15c5',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39'),('tm-cb9c667d-d1d9-4f4f-91d0-c60928a78','tenant-default-0001','cb9c667d-d1d9-4f4f-91d0-c60928a78ed2',NULL,'fisherman','active',NULL,'2026-06-11 08:12:39','2026-06-11 08:12:39','2026-06-11 08:12:39');
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
INSERT INTO `tenant_onboarding` VALUES ('11f852eb-f735-4923-9fa4-538582e42160',1,'[1, 2, 3]','fisherman','2026-06-28 20:02:38','2026-06-28 20:02:38'),('12495be8-694e-4b73-b391-62f36e6c42e2',1,'[1, 2, 3]','cooperative','2026-06-28 20:02:39','2026-06-28 20:02:39'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9',1,'[1, 2, 3]','cooperative','2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `tenant_role_permissions` VALUES ('11f852eb-f735-4923-9fa4-538582e42160','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:38','2026-06-28 20:02:38'),('11f852eb-f735-4923-9fa4-538582e42160','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:38','2026-06-28 20:02:38'),('12495be8-694e-4b73-b391-62f36e6c42e2','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:39','2026-06-28 20:02:39'),('12495be8-694e-4b73-b391-62f36e6c42e2','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:39','2026-06-28 20:02:39'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','customer','[\"commerce.catalog.read\", \"commerce.coupons.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.loyalty.read\", \"commerce.cart.read\", \"commerce.cart.write\", \"commerce.wishlist.read\", \"commerce.wishlist.write\", \"commerce.checkout.write\", \"commerce.orders.read\", \"commerce.orders.write\", \"commerce.contracts.read\", \"fishing.traceability.read\", \"accounting.wallet.read\", \"accounting.wallet.write\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:37','2026-06-28 20:02:37'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','vendor','[\"commerce.catalog.read\", \"commerce.listings.read\", \"commerce.listings.write\", \"commerce.orders.read\", \"commerce.payouts.read\", \"commerce.vendors.read\", \"commerce.reviews.read\", \"commerce.reviews.write\", \"commerce.storefront.read\", \"commerce.storefront.write\", \"accounting.wallet.read\", \"notifications.read\", \"auth.sessions.read\", \"auth.sessions.write\"]','2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `tenant_storefront_settings` VALUES ('11f852eb-f735-4923-9fa4-538582e42160','ocean-classic','Lamu Sea Ventures','Fresh catch from Lamu',NULL,NULL,NULL,'Welcome to Lamu Sea Ventures',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('12495be8-694e-4b73-b391-62f36e6c42e2','ocean-classic','AquaERP Showcase Tenant','Fresh catch from Mombasa',NULL,NULL,'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80','Welcome to AquaERP Showcase Tenant',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-28 20:02:39','2026-06-28 20:02:48'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','ocean-classic','Coast Fish Cooperative','Fresh catch from Kwale',NULL,NULL,NULL,'Welcome to Coast Fish Cooperative',NULL,'Shop fresh catch','#products',NULL,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-28 20:02:37','2026-06-28 20:02:37'),('tenant-default-0001','ocean-classic','AquaERP Fresh Market','From ocean to table — fully traceable seafood',NULL,NULL,NULL,'Fresh catch, delivered with cold-chain care','Browse species landed today. Every kilo traced from boat to your door.','Shop fresh catch','#products',NULL,1,1,1,'We use cookies for cart and analytics. By continuing you accept our privacy policy.',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-06 08:46:42','2026-06-06 08:46:42');
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
INSERT INTO `tenants` VALUES ('11f852eb-f735-4923-9fa4-538582e42160','lamusea','Lamu Sea Ventures','Lamu Sea Ventures','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','trial','active',NULL,'2026-06-28 20:02:38','2026-06-28 20:02:38'),('12495be8-694e-4b73-b391-62f36e6c42e2','aquaerp-demo','AquaERP Showcase Tenant','AquaERP Showcase Tenant','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','trial','active',NULL,'2026-06-28 20:02:39','2026-06-28 20:02:39'),('b21fe9c1-79b2-490e-a254-87df2e52b4d9','coastfish','Coast Fish Cooperative','Coast Fish Cooperative','KE','KES','Africa/Nairobi',NULL,'#0ea5e9','trial','active',NULL,'2026-06-28 20:02:37','2026-06-28 20:02:37');
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
INSERT INTO `traceability_lots` VALUES ('06a63bca-41b2-4992-8431-eee0b5807e9a','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-9-0','6b0805d0-273c-43b0-97d1-3bb27fecc655','Nile Perch','Showcase Vessel 1','Mombasa Landing','2025-08-20','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('0ec68ead-daf6-40f2-924d-4c9a6a9f1c68','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-3-0','db415b2c-6e99-474c-89cb-67c5895b2efa','Nile Perch','Showcase Vessel 3','Mombasa Landing','2025-07-15','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('11ca0af6-7602-479f-bb1d-d604352e5af3','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-60-0','9369da84-9b54-4207-99a2-080047754054','Nile Perch','Showcase Vessel 0','Mombasa Landing','2026-06-22','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:42'),('1c4d678e-94a9-40ee-a5f0-c0a46115b92b','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-6-0','72accfd8-5506-4b00-8306-3838635e6c1e','Nile Perch','Showcase Vessel 2','Mombasa Landing','2025-08-02','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('20d7b06d-4c34-4dd5-bb3b-5ba9d668deed','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-30-0','8ce5f8d9-fdac-43c5-a417-10a30ec93ebf','Nile Perch','Showcase Vessel 2','Mombasa Landing','2025-12-24','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('20fb6f45-7272-463e-a2c7-5ce9cae12ed4','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-45-0','7ca41099-5563-4daf-8b6d-c28d4480018b','Nile Perch','Showcase Vessel 1','Mombasa Landing','2026-03-24','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('286277e4-fd43-45f8-8ea2-4d78c6acd739','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-24-0','7220edaf-f0ee-4b34-8bee-59e913bef761','Nile Perch','Showcase Vessel 0','Mombasa Landing','2025-11-18','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('29e25532-eb1e-4d2f-b915-d6f4c389dfd4','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-21-0','cd8684b2-3fbb-475d-a166-d7d4f52f466e','Nile Perch','Showcase Vessel 1','Mombasa Landing','2025-10-31','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('30912d41-eb87-4b83-bbe6-e9573f0001ab','11f852eb-f735-4923-9fa4-538582e42160','LOT-LAMUSEA-001','ac788153-b642-448e-8df1-d4ea48bd92f2','lamusea Tilapia','Lamu Sea Ventures Vessel','Lamu Landing','2026-06-25','A',1,'FAO-51',-22.00,'active','2026-06-28 20:02:38'),('3c98c350-5533-46be-a87a-6b90f7a05146','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-18-0','0e953ea2-afd4-41d4-b3c8-7cf1d3b23f77','Nile Perch','Showcase Vessel 2','Mombasa Landing','2025-10-13','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('3ceb373f-8a2b-441d-8cce-1906ea0a7e88','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-39-0','8d80c32b-aa22-49fc-bbfd-210bbffc71aa','Nile Perch','Showcase Vessel 3','Mombasa Landing','2026-02-16','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('4317b9fb-4a8d-419f-b2b9-8ee26c1888e0','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-001','d55ae7c6-732a-41f5-b5f9-d23eed71414e','aquaerp-demo Tilapia','AquaERP Showcase Tenant Vessel','Mombasa Landing','2026-06-24','A',1,'FAO-51',-22.00,'active','2026-06-28 20:02:39'),('49c7da9e-7174-44ef-a791-1629eff11626','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-57-0','66c930b5-fa5d-4a89-afa2-8301e95e1961','Nile Perch','Showcase Vessel 1','Mombasa Landing','2026-06-04','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:42'),('5e8e8f83-facd-44f5-bf04-d7b47ae9faa0','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-36-0','8460324f-025f-4208-8188-1f64b799b848','Nile Perch','Showcase Vessel 0','Mombasa Landing','2026-01-29','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('74060a83-519d-49a8-80f5-0c6aed5ce419','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-15-0','6ced4e65-8b19-47b3-95f8-6861e6f56037','Nile Perch','Showcase Vessel 3','Mombasa Landing','2025-09-25','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('80ccc7bc-83e1-4438-ada8-35f3c949a4b2','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-12-0','ff00064d-ce47-4d2d-896b-865693998a10','Nile Perch','Showcase Vessel 0','Mombasa Landing','2025-09-07','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:40'),('853b51a9-65b9-458e-b2f1-a7df75041986','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-48-0','8d4da810-f372-4c53-9e31-c22874cee9f6','Nile Perch','Showcase Vessel 0','Mombasa Landing','2026-04-11','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('96c3d13b-5d5b-48ec-8cf8-b42f5632dd8e','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-33-0','3ccdc083-f5fd-4a8c-ae5d-acb2997bd8b8','Nile Perch','Showcase Vessel 1','Mombasa Landing','2026-01-11','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('98fe1bf2-786f-41eb-8c46-88d4dd4fd33d','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-51-0','ac2914c5-fd70-46f7-973b-cf8e0fd8941b','Nile Perch','Showcase Vessel 3','Mombasa Landing','2026-04-29','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:42'),('b02ed032-42ad-486d-a7b8-dd0ca0b01f8d','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-54-0','95f3668c-67df-4b8f-a3c4-213d0eff293a','Nile Perch','Showcase Vessel 2','Mombasa Landing','2026-05-17','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:42'),('c1e492ee-1f76-471b-85c5-007d5cf76f8a','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-42-0','a61bdff3-688e-42e7-bf2d-8444a979797e','Nile Perch','Showcase Vessel 2','Mombasa Landing','2026-03-06','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41'),('da0e687e-80ef-4023-8ae4-90ae5be3e737','b21fe9c1-79b2-490e-a254-87df2e52b4d9','LOT-COASTFISH-001','22659f63-b33b-4b9a-9f25-8f3bbf32f145','coastfish Nile Perch','Coast Fish Cooperative Vessel','Kwale Landing','2026-06-26','A',1,'FAO-51',-22.00,'active','2026-06-28 20:02:37'),('da4cfa98-4531-4c8e-8612-15a5645c00ae','12495be8-694e-4b73-b391-62f36e6c42e2','LOT-AQUAERP-DEMO-27-0','f467a795-b0c4-496b-a947-20234d719aba','Nile Perch','Showcase Vessel 3','Mombasa Landing','2025-12-06','A',1,'FAO-51',-18.50,'active','2026-06-28 20:02:41');
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
INSERT INTO `transactions` VALUES ('002604b2-e02b-4f3d-be31-d9d862a4ca82','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',48876.64,'KES',50000.00,98876.64,'Sales payout for ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 20:02:43'),('0092a9c5-7d86-484a-8f45-2f81e19fc716','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',44845.64,'KES',50000.00,94845.64,'Sales payout for ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 19:47:55'),('016d989c-75dc-4d1e-ad48-a9182afdfad2','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',26554.76,'KES',50000.00,76554.76,'Sales payout for ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 20:02:43'),('01b4e89b-0483-4ad2-a544-ebc29514efdd','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',49323.24,'KES',50000.00,99323.24,'Sales payout for ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 19:47:55'),('01bd9709-fa97-4eae-977e-d96af6fb0967','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54095.48,'KES',100000.00,45904.52,'Purchase order ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 19:47:55'),('0437553d-228d-4d8e-bfde-1175f82ea7eb','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',39059.56,'KES',50000.00,89059.56,'Sales payout for ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 19:47:56'),('04b5e8f7-b976-41fa-96f6-86d3e0d1ade5','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-34204.96,'KES',100000.00,65795.04,'Purchase order ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 20:02:43'),('05ded38d-671d-4ec0-8988-b6c686f1d3a5','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',53281.16,'KES',50000.00,103281.16,'Sales payout for ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 19:47:56'),('05ed7c14-907e-4ca7-a024-44051b4a94bb','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',40033.96,'KES',50000.00,90033.96,'Sales payout for ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 19:47:56'),('06a8cfe6-6af3-459f-bbd1-c5a0fe58b307','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',55734.56,'KES',50000.00,105734.56,'Sales payout for ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 19:47:56'),('06f0e5a4-a6b1-48f8-a22c-f7c0106d535e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54833.24,'KES',100000.00,45166.76,'Purchase order ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 20:02:43'),('0a467333-d1bd-4426-8c20-137b926b8161','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',30428.00,'KES',50000.00,80428.00,'Sales payout for ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 20:02:43'),('0aa5dca1-b757-4c87-9d37-335402baf188','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32081.00,'KES',100000.00,67919.00,'Purchase order ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 19:22:12'),('0ae16f73-08bd-4d43-9aa8-6b170e6922b3','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',25246.28,'KES',50000.00,75246.28,'Sales payout for ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 19:22:11'),('0d840dcf-a0cb-48ab-9d8f-f32e38935128','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-55308.84,'KES',100000.00,44691.16,'Purchase order ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 19:47:55'),('0e8a14f1-27a7-4a53-bf15-e384564ff872','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-48876.64,'KES',100000.00,51123.36,'Purchase order ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 20:02:43'),('109b2ca4-67bd-40b3-92fb-ec2bd05ff1ec','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',54827.44,'KES',50000.00,104827.44,'Sales payout for ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 19:47:55'),('11227af4-fb41-48aa-931f-118c425b25e5','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',33213.16,'KES',50000.00,83213.16,'Sales payout for ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 19:47:56'),('11fd22e8-88b0-4a6b-ac9a-e4128eb0ebf1','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',26313.48,'KES',50000.00,76313.48,'Sales payout for ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 19:47:55'),('124d69c7-3293-4c77-bb3d-a74a78ac6f3a','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-29933.84,'KES',100000.00,70066.16,'Purchase order ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 19:47:56'),('156eba94-10e8-4044-a9c1-48c136a09a37','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-30027.80,'KES',100000.00,69972.20,'Purchase order ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 19:22:12'),('15ec5dee-b28b-433e-bb6d-be82adc61ba7','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',31746.92,'KES',50000.00,81746.92,'Sales payout for ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 19:22:11'),('168ed127-70cb-4a0a-9e3a-919e3a8007cd','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-34472.92,'KES',100000.00,65527.08,'Purchase order ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 20:02:43'),('1722a8d7-e827-4962-a471-c8dd2d8c3e95','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-50420.60,'KES',100000.00,49579.40,'Purchase order ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 19:22:12'),('173bf13b-9533-4251-b203-b18efca7bcb8','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',34204.96,'KES',50000.00,84204.96,'Sales payout for ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 20:02:43'),('17d877d9-3124-4546-a23e-99a7632a8f84','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-30020.84,'KES',100000.00,69979.16,'Purchase order ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 19:47:55'),('191e1b5d-184c-4130-921c-30484eb1eed6','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',41345.92,'KES',50000.00,91345.92,'Sales payout for ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 19:47:56'),('1b633262-5efa-4acd-8ad2-feba106a9362','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',48754.84,'KES',50000.00,98754.84,'Sales payout for ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 20:02:43'),('1c44b86c-3744-45a7-9804-4c814e0d86e9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-41345.92,'KES',100000.00,58654.08,'Purchase order ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 19:47:56'),('1c9738cb-e6ac-49f5-9455-a26788837510','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28759.92,'KES',100000.00,71240.08,'Purchase order ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 19:22:11'),('1d5d4627-6abd-4f13-8202-91503fba813b','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',54046.76,'KES',50000.00,104046.76,'Sales payout for ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 20:02:43'),('23c3bdc4-2c7b-4c95-a249-9020bff9f275','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',28391.04,'KES',50000.00,78391.04,'Sales payout for ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 20:02:43'),('27aba06d-6a50-4c40-a84e-8c0cffd5d68d','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',45395.48,'KES',50000.00,95395.48,'Sales payout for ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 19:22:10'),('2917f4b3-6481-4d6b-a34f-5dba6feefb26','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',30027.80,'KES',50000.00,80027.80,'Sales payout for ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 19:22:12'),('2d789251-22c9-49b6-9ca1-f5c6cfa6e507','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',37237.20,'KES',50000.00,87237.20,'Sales payout for ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 19:22:11'),('2e05b352-a268-441d-8f22-19d7f44a9c2c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-43024.44,'KES',100000.00,56975.56,'Purchase order ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 19:47:56'),('2e45f272-3d06-47cd-9b9f-2b57b314f540','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',56384.16,'KES',50000.00,106384.16,'Sales payout for ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 20:02:43'),('2e6b934b-b347-4bca-807d-3bedef0124ce','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',32011.40,'KES',50000.00,82011.40,'Sales payout for ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 20:02:42'),('300550a4-8fe4-4596-a24d-3c450bcee754','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-33249.12,'KES',100000.00,66750.88,'Purchase order ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 19:22:11'),('317f1e3a-d3d4-4562-8cee-d428611e468c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-33194.60,'KES',100000.00,66805.40,'Purchase order ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 19:22:11'),('33262ce8-d6e5-4c6e-991c-5cac3e310948','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28971.04,'KES',100000.00,71028.96,'Purchase order ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 19:47:56'),('33ecc362-3c41-4e71-b52b-a4ee548c61c9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-31295.68,'KES',100000.00,68704.32,'Purchase order ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 20:02:42'),('34d8092a-9ad0-482f-be3b-f673ab8a28a3','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',31295.68,'KES',50000.00,81295.68,'Sales payout for ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 20:02:42'),('355f05c7-afd7-43e9-8611-fbde78fb7a80','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',37852.00,'KES',50000.00,87852.00,'Sales payout for ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 20:02:43'),('38e394b4-b23a-4b3c-b5de-238f58a72cab','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',27702.00,'KES',50000.00,77702.00,'Sales payout for ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 19:47:55'),('3ba1cc24-d8ec-4a36-ae57-18ec5ef45d3f','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-45273.68,'KES',100000.00,54726.32,'Purchase order ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 20:02:43'),('3c66c382-782e-4304-bed8-a7e439fab3d0','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-52891.40,'KES',100000.00,47108.60,'Purchase order ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 19:22:11'),('3d34840c-aa3f-45b4-b6b2-b28220e61ef1','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',27378.36,'KES',50000.00,77378.36,'Sales payout for ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 20:02:42'),('42024f6f-b303-44dc-89f0-cb3d71b21bb9','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',40859.88,'KES',50000.00,90859.88,'Sales payout for ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 20:02:42'),('438297a3-13ed-46f8-94a8-c138d6a99188','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-26779.80,'KES',100000.00,73220.20,'Purchase order ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 19:22:12'),('43ed84ef-c252-420b-a0a5-4e7d573f841a','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',44991.80,'KES',50000.00,94991.80,'Sales payout for ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 19:47:56'),('47d610d8-f482-44c8-901c-f3689a31c177','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',23965.64,'KES',50000.00,73965.64,'Sales payout for ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 19:47:55'),('4acd9a5d-3afa-4ced-be6e-628b23623b61','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',52369.40,'KES',50000.00,102369.40,'Sales payout for ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 20:02:42'),('4b6c4966-2e09-4980-97f9-47af0d82fb89','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-24853.04,'KES',100000.00,75146.96,'Purchase order ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 19:47:56'),('4bfa9906-949d-42c6-9803-769d9eb44ea9','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',41283.28,'KES',50000.00,91283.28,'Sales payout for ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 19:47:56'),('4c6ef50e-2155-44ff-b0f7-8a4cbf4780fc','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-42241.44,'KES',100000.00,57758.56,'Purchase order ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 20:02:43'),('4ccb3766-52b9-43e8-96e7-51674bb7fb84','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32215.56,'KES',100000.00,67784.44,'Purchase order ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 19:22:11'),('4cf5bf4d-4b59-41f5-89e7-80cefebfdcea','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-53633.80,'KES',100000.00,46366.20,'Purchase order ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 19:22:11'),('4d22b437-7763-49e0-bbf3-d9fbdced1901','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44711.08,'KES',100000.00,55288.92,'Purchase order ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 19:22:10'),('4dc63da2-4552-4b22-8bfd-eb04f535b180','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32429.00,'KES',100000.00,67571.00,'Purchase order ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 19:47:55'),('4e18569e-0d9e-4748-afde-8f2c2182f3a8','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-41939.84,'KES',100000.00,58060.16,'Purchase order ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 19:47:55'),('4e323160-fa1b-41cc-a3d9-2165b1b37396','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',43378.24,'KES',50000.00,93378.24,'Sales payout for ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 20:02:43'),('4e4b1c6f-16d3-44fd-bc79-941d96fb7add','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',27111.56,'KES',50000.00,77111.56,'Sales payout for ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 20:02:43'),('4e573300-c526-4609-a916-fb76b1d1c2bd','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-45395.48,'KES',100000.00,54604.52,'Purchase order ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 19:22:10'),('4f06733a-4cda-4a16-9004-5a923e8658bc','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-27010.64,'KES',100000.00,72989.36,'Purchase order ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 20:02:42'),('4f27bb70-e0c5-40c7-9165-a81edbb3e501','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44697.16,'KES',100000.00,55302.84,'Purchase order ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 19:47:55'),('51aa9a49-a680-4437-bb10-9a0db2f24a37','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',54833.24,'KES',50000.00,104833.24,'Sales payout for ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 20:02:43'),('539eb4cb-bab1-43b1-85f3-1ee1ef09cc4e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-39905.20,'KES',100000.00,60094.80,'Purchase order ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 19:22:11'),('55791637-3957-4e6d-b8c3-a0e09e7a8471','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',32879.08,'KES',50000.00,82879.08,'Sales payout for ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 20:02:42'),('55db1984-9829-4215-b61e-fb1055792e10','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',57292.44,'KES',50000.00,107292.44,'Sales payout for ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 19:47:55'),('56e15e0a-c51d-4b4e-9d4b-80029f8440e1','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-34162.04,'KES',100000.00,65837.96,'Purchase order ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 19:47:55'),('576b6058-b2f5-420f-989f-3e41718b7ac7','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',39377.40,'KES',50000.00,89377.40,'Sales payout for ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 19:47:55'),('581a4276-83d4-4fbe-86ba-90e8fac8d7a9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-27702.00,'KES',100000.00,72298.00,'Purchase order ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 19:47:55'),('5855e928-beff-4b00-b0ca-169058b9dd2e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-41673.04,'KES',100000.00,58326.96,'Purchase order ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 19:22:12'),('59dc9257-eb9b-46d9-9cc7-64be7e3892b6','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-46753.84,'KES',100000.00,53246.16,'Purchase order ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 20:02:42'),('59fa2fcb-cef6-400c-bd3c-57e8e365edfe','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-36856.72,'KES',100000.00,63143.28,'Purchase order ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 20:02:43'),('5a4efb4e-6077-4724-b758-b391d0974a49','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',40903.96,'KES',50000.00,90903.96,'Sales payout for ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 19:47:56'),('5aba2a19-ca6d-4808-ab6c-ecdbc144f8ca','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28527.92,'KES',100000.00,71472.08,'Purchase order ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 19:22:11'),('5b5990d2-1a4f-4102-b219-46d33427bc5e','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',26779.80,'KES',50000.00,76779.80,'Sales payout for ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 19:22:12'),('5c016d5c-cfe1-4d11-8fe0-ff0f980cfb00','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-49323.24,'KES',100000.00,50676.76,'Purchase order ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 19:47:55'),('5e0100ae-5530-462b-a9ad-fa28723e71ac','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-47426.64,'KES',100000.00,52573.36,'Purchase order ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 20:02:43'),('6087b862-6c6e-4cd4-967e-24f5fcf84f40','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37434.40,'KES',100000.00,62565.60,'Purchase order ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 19:22:11'),('618bcb95-3eaa-4acd-9827-cc16fb0fb795','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',32081.00,'KES',50000.00,82081.00,'Sales payout for ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 19:22:12'),('630cad82-c360-4eac-bb81-db50c0c07882','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-34297.76,'KES',100000.00,65702.24,'Purchase order ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 19:47:55'),('631b93fd-dbd8-47fa-8e0a-db9846b34527','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',51853.20,'KES',50000.00,101853.20,'Sales payout for ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 19:22:11'),('63ea3486-c0a3-436f-988f-01d31cc4f633','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54724.20,'KES',100000.00,45275.80,'Purchase order ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 19:22:12'),('63ff32e2-89ec-4707-ba9a-ea131b2ca9b5','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',57439.76,'KES',50000.00,107439.76,'Sales payout for ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 19:22:11'),('64a3320d-c4e4-4e35-af43-4acc924a40b4','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',55308.84,'KES',50000.00,105308.84,'Sales payout for ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 19:47:55'),('658a2622-f120-4d76-aee9-feff19c26e08','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',50420.60,'KES',50000.00,100420.60,'Sales payout for ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 19:22:12'),('66008f39-3d26-48ed-8780-66ab53d34db1','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-35123.68,'KES',100000.00,64876.32,'Purchase order ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 20:02:42'),('66051af9-54f7-49d1-94dc-790f775882e5','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-49839.44,'KES',100000.00,50160.56,'Purchase order ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 19:22:10'),('66352222-45d3-4f63-8475-76d35e22cbda','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',45041.68,'KES',50000.00,95041.68,'Sales payout for ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 20:02:43'),('6709c718-aef6-4122-93b3-ce510a4a9b4e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54543.24,'KES',100000.00,45456.76,'Purchase order ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 20:02:42'),('6777bdb4-0e96-4c10-b758-60f81236a88d','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-40371.52,'KES',100000.00,59628.48,'Purchase order ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 19:47:56'),('6839775d-ad0e-400c-8595-fb9b07f01082','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-51853.20,'KES',100000.00,48146.80,'Purchase order ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 19:22:10'),('6a5f0c81-aa39-4ab4-bdaf-0bf2002cdfd3','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',39905.20,'KES',50000.00,89905.20,'Sales payout for ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 19:22:11'),('6b49849e-dad1-45af-97d9-882bab9381ac','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',45273.68,'KES',50000.00,95273.68,'Sales payout for ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 20:02:43'),('6c2ebb6a-9467-416e-9a15-9dcd084b6c03','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',29974.44,'KES',50000.00,79974.44,'Sales payout for ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 19:47:56'),('6ce2099c-bc69-428c-a760-37ed69060897','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44408.32,'KES',100000.00,55591.68,'Purchase order ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 19:22:11'),('6d4254c2-7141-4758-bc4e-ba7807cece77','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-29605.56,'KES',100000.00,70394.44,'Purchase order ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 19:47:56'),('6e0f3ba6-b710-40d4-9062-931275d72311','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-41283.28,'KES',100000.00,58716.72,'Purchase order ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 19:47:56'),('72b11776-fb1f-44c3-a7ce-3d80a4e9e530','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-31746.92,'KES',100000.00,68253.08,'Purchase order ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 19:22:11'),('731d86d1-e6db-448c-993c-3cd32e650d74','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',33249.12,'KES',50000.00,83249.12,'Sales payout for ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 19:22:11'),('7424b3ea-3aae-4bcb-b813-8390dc9f490c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28391.04,'KES',100000.00,71608.96,'Purchase order ORD-SHOWCASE-AQUAERP--35',NULL,NULL,'completed','mpesa','2026-04-21 14:22:00','2026-06-28 20:02:43'),('770d6727-caed-44cc-97d3-a0367f44428e','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',44408.32,'KES',50000.00,94408.32,'Sales payout for ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 19:22:11'),('77bca0ba-9fd4-4e27-9109-31138ad2df31','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54827.44,'KES',100000.00,45172.56,'Purchase order ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 19:47:55'),('78e89184-6d26-4c77-a196-2aeea7d40da1','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',42241.44,'KES',50000.00,92241.44,'Sales payout for ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 20:02:43'),('7938f5b7-b6ab-4ff8-89f5-68a8d419a8a6','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',28759.92,'KES',50000.00,78759.92,'Sales payout for ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 19:22:11'),('796250bb-b937-4947-9dab-ab203301c957','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',37879.84,'KES',50000.00,87879.84,'Sales payout for ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 19:22:11'),('79ebb6b8-86b7-44ae-bd2d-d66af9b7ca9f','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',45071.84,'KES',50000.00,95071.84,'Sales payout for ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 20:02:42'),('7a20a613-9086-4544-97bf-a9956a3cc0d2','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',33984.56,'KES',50000.00,83984.56,'Sales payout for ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 19:47:56'),('7a5afbc7-165b-4531-b980-0bd3da2d21fb','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',51691.96,'KES',50000.00,101691.96,'Sales payout for ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 19:22:11'),('7ab307a6-3065-4b02-a333-d1162bf418d6','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',29933.84,'KES',50000.00,79933.84,'Sales payout for ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 19:47:56'),('7b6089eb-34bf-497b-a46a-518cee1d1ba6','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',44707.60,'KES',50000.00,94707.60,'Sales payout for ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 19:22:11'),('7caf05c2-86ea-4947-a53b-b1ae0cc17b89','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-43378.24,'KES',100000.00,56621.76,'Purchase order ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 20:02:43'),('7d60ab78-368a-4360-8def-b4e0c33f7f9a','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-55734.56,'KES',100000.00,44265.44,'Purchase order ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 19:47:56'),('7ea325b6-4d8c-455a-8ad8-3a549a040fc7','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-47108.80,'KES',100000.00,52891.20,'Purchase order ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 20:02:43'),('7f007f23-d927-4d31-a7e5-24d75df2e9b1','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-57708.88,'KES',100000.00,42291.12,'Purchase order ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 20:02:42'),('823a62d4-9d2d-4131-baa9-6b43e0ef0ead','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',49839.44,'KES',50000.00,99839.44,'Sales payout for ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 19:22:10'),('83042f86-e5ad-4929-bbae-884dd7d51334','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',44711.08,'KES',50000.00,94711.08,'Sales payout for ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 19:22:10'),('838877b9-14e9-4b96-9bd1-f3f4151402dd','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',34472.92,'KES',50000.00,84472.92,'Sales payout for ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 20:02:43'),('8394e886-a6af-414d-bab3-4b44d5bee59f','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-33265.36,'KES',100000.00,66734.64,'Purchase order ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 19:22:11'),('83fa3069-1e33-4730-83a3-976dacdbd3db','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-29974.44,'KES',100000.00,70025.56,'Purchase order ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 19:47:56'),('85ec8a61-fbce-4ec2-b6a1-c0ac455e7273','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',43074.32,'KES',50000.00,93074.32,'Sales payout for ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 19:47:56'),('861f2e15-3f93-481a-bcab-248700972534','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',30020.84,'KES',50000.00,80020.84,'Sales payout for ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 19:47:55'),('8652ab21-cf03-420e-b04b-dd7047d35929','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37852.00,'KES',100000.00,62148.00,'Purchase order ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 20:02:43'),('8751a02c-5b32-40c0-924c-d523d4c1232d','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-30487.16,'KES',100000.00,69512.84,'Purchase order ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 19:22:10'),('8925e0b4-dd30-435e-8e2d-7a56d6eb212b','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-33213.16,'KES',100000.00,66786.84,'Purchase order ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 19:47:56'),('8a0381a6-0c4b-41d2-9235-65feb0674812','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-53985.28,'KES',100000.00,46014.72,'Purchase order ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 19:22:11'),('8a2343af-1fc7-40a6-b003-d01e76dec3d1','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',54543.24,'KES',50000.00,104543.24,'Sales payout for ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 20:02:42'),('8a4a7bf8-04e7-492f-991d-ffea0afa0a78','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-53281.16,'KES',100000.00,46718.84,'Purchase order ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 19:47:56'),('8cba5421-aece-47b6-8206-37802b30854d','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-34312.84,'KES',100000.00,65687.16,'Purchase order ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 20:02:43'),('8e980c06-bfe3-4b6d-8561-33184c110da9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54278.76,'KES',100000.00,45721.24,'Purchase order ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 19:22:12'),('8fad8ca8-c38a-4789-bbb4-a8debb55e0ed','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',34312.84,'KES',50000.00,84312.84,'Sales payout for ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 20:02:43'),('90ad2001-366b-4a76-b756-0153d9b90f1b','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-48925.36,'KES',100000.00,51074.64,'Purchase order ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 20:02:43'),('91507912-6854-41f7-ad63-50245d613f17','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44845.64,'KES',100000.00,55154.36,'Purchase order ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 19:47:55'),('93325239-f06a-49dd-8f51-466642eccd8d','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',57708.88,'KES',50000.00,107708.88,'Sales payout for ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 20:02:42'),('93b52f98-bbec-40f8-802e-e3a8f281bf17','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37143.24,'KES',100000.00,62856.76,'Purchase order ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 19:22:11'),('95dcb90e-24d0-4205-bf17-d04fa013e79d','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',57888.68,'KES',50000.00,107888.68,'Sales payout for ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 20:02:43'),('9866a333-5466-40d0-8ae9-3c2e6871bd2d','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',33194.60,'KES',50000.00,83194.60,'Sales payout for ORD-SHOWCASE-AQUAERP--9',NULL,NULL,'completed','mpesa','2025-09-25 12:44:00','2026-06-28 19:22:11'),('9af49a61-0f00-4234-9448-76df9e48b3bc','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',52891.40,'KES',50000.00,102891.40,'Sales payout for ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 19:22:11'),('9b3bfb76-eb43-42d9-ab02-4242a022fa56','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-33984.56,'KES',100000.00,66015.44,'Purchase order ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 19:47:56'),('9b4c9be1-e83b-4095-9dde-43eec9f51ba1','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',32452.20,'KES',50000.00,82452.20,'Sales payout for ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 20:02:43'),('9b7ad0f1-2c63-4001-971e-4e08d18458b9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-26554.76,'KES',100000.00,73445.24,'Purchase order ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 20:02:43'),('9bb5a404-79aa-47de-a07c-3200f1169328','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',48925.36,'KES',50000.00,98925.36,'Sales payout for ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 20:02:43'),('9cb00762-33d9-4cb6-9a5b-25aa425c234a','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54870.36,'KES',100000.00,45129.64,'Purchase order ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 19:47:55'),('9ce3067b-525b-4068-901e-312d6682072d','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',36246.56,'KES',50000.00,86246.56,'Sales payout for ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 19:22:11'),('a0eea864-8a54-4b2d-9bdf-5339568faf5e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37180.36,'KES',100000.00,62819.64,'Purchase order ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 19:22:12'),('a1ff7d92-c649-4d80-a70e-d78ada408f56','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',47426.64,'KES',50000.00,97426.64,'Sales payout for ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 20:02:43'),('a2306d00-787d-4717-aca8-0209cabf850c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32011.40,'KES',100000.00,67988.60,'Purchase order ORD-SHOWCASE-AQUAERP--4',NULL,NULL,'completed','mpesa','2025-08-16 13:39:00','2026-06-28 20:02:42'),('a2351e82-93af-4f2e-be66-a5050355892d','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44451.24,'KES',100000.00,55548.76,'Purchase order ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 19:47:56'),('a2ced722-3f86-4f27-9100-273b3c370b3e','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',34162.04,'KES',50000.00,84162.04,'Sales payout for ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 19:47:55'),('a3b586d8-0110-4a96-b6ac-27740e340b05','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-53586.24,'KES',100000.00,46413.76,'Purchase order ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 20:02:42'),('a3ea99ef-cba8-4f23-be7a-6f2e3e54309f','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',28954.80,'KES',50000.00,78954.80,'Sales payout for ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 19:22:12'),('a429efaf-f5e6-4ca9-9dbb-42742c766457','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-45041.68,'KES',100000.00,54958.32,'Purchase order ORD-SHOWCASE-AQUAERP--30',NULL,NULL,'completed','mpesa','2026-03-12 15:17:00','2026-06-28 20:02:43'),('a504ca74-4605-4f21-8580-9bb9986a4035','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-57292.44,'KES',100000.00,42707.56,'Purchase order ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 19:47:55'),('a615cff5-3d94-48c6-8a2d-7d085b57c465','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-30428.00,'KES',100000.00,69572.00,'Purchase order ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 20:02:43'),('a7488797-5839-47fb-bc45-1b9f2f35aa9b','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',26576.80,'KES',50000.00,76576.80,'Sales payout for ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 19:47:56'),('a8efb931-9850-4883-8523-0ad008a078bc','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',37143.24,'KES',50000.00,87143.24,'Sales payout for ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 19:22:11'),('a970b169-b6c5-4ae1-a587-ba6eafa90009','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-40503.76,'KES',100000.00,59496.24,'Purchase order ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 20:02:42'),('aa816396-d10c-481c-9d77-1bc516a0730c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-26576.80,'KES',100000.00,73423.20,'Purchase order ORD-SHOWCASE-AQUAERP--38',NULL,NULL,'completed','mpesa','2026-05-15 11:01:00','2026-06-28 19:47:56'),('ac7231e9-f7d6-4cde-b216-ba7fa3f9712e','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',39407.56,'KES',50000.00,89407.56,'Sales payout for ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 20:02:43'),('ace49675-06ff-49fd-b675-e366653a479b','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',37434.40,'KES',50000.00,87434.40,'Sales payout for ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 19:22:11'),('ad6abf8e-1253-4ce3-9620-a5a70adf194f','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-58352.68,'KES',100000.00,41647.32,'Purchase order ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 20:02:42'),('af6a77ac-9580-43f4-8514-346d41b58940','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28835.32,'KES',100000.00,71164.68,'Purchase order ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 19:47:56'),('b0903c3a-85c8-48b2-9985-f5218a96028b','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-39407.56,'KES',100000.00,60592.44,'Purchase order ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 20:02:43'),('b13d0c63-687f-48d6-89fa-736c2bae6c93','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',44697.16,'KES',50000.00,94697.16,'Sales payout for ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 19:47:55'),('b220b921-3ad4-47e1-9f04-40d9d228fb4e','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',40503.76,'KES',50000.00,90503.76,'Sales payout for ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 20:02:42'),('b2e884d0-01ed-4a7b-bf47-7ad50a042334','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',27010.64,'KES',50000.00,77010.64,'Sales payout for ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 20:02:42'),('b323557d-00df-4d02-8ce9-95aa4d49ab9f','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',41939.84,'KES',50000.00,91939.84,'Sales payout for ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 19:47:55'),('b55a4292-ed7a-4975-a611-6bcebb31a841','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',33265.36,'KES',50000.00,83265.36,'Sales payout for ORD-SHOWCASE-AQUAERP--23',NULL,NULL,'completed','mpesa','2026-01-15 14:46:00','2026-06-28 19:22:11'),('b6788705-cc02-4cec-922d-192b5d02b3d2','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',30487.16,'KES',50000.00,80487.16,'Sales payout for ORD-SHOWCASE-AQUAERP--3',NULL,NULL,'completed','mpesa','2025-08-08 12:26:00','2026-06-28 19:22:10'),('b6e6bae5-124a-4407-aaaf-3088868774c8','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-40033.96,'KES',100000.00,59966.04,'Purchase order ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 19:47:56'),('b719fd70-3d1c-4055-92b7-5567239157a5','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',53633.80,'KES',50000.00,103633.80,'Sales payout for ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 19:22:11'),('b775262c-d73f-4aad-b254-9c8a7078a447','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',32215.56,'KES',50000.00,82215.56,'Sales payout for ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 19:22:11'),('b999edb3-15c9-4ad4-ad20-e0650007ae70','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-56384.16,'KES',100000.00,43615.84,'Purchase order ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 20:02:43'),('ba3c274f-b871-4b69-94c3-c8807d6afb41','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',54095.48,'KES',50000.00,104095.48,'Sales payout for ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 19:47:55'),('bb064948-8937-4022-917e-811de144a786','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-28954.80,'KES',100000.00,71045.20,'Purchase order ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 19:22:12'),('bd3cb9d1-90b7-449d-a7c3-69f1aa72e9d0','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',29605.56,'KES',50000.00,79605.56,'Sales payout for ORD-SHOWCASE-AQUAERP--20',NULL,NULL,'completed','mpesa','2025-12-22 11:07:00','2026-06-28 19:47:56'),('bdeec01a-3620-4b50-94c0-1b781c4c9d37','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44991.80,'KES',100000.00,55008.20,'Purchase order ORD-SHOWCASE-AQUAERP--42',NULL,NULL,'completed','mpesa','2026-06-16 15:53:00','2026-06-28 19:47:56'),('bf6f9dfa-92e7-48a0-8da2-e66e0c08198f','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-52369.40,'KES',100000.00,47630.60,'Purchase order ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 20:02:42'),('c01dde82-73b5-4e91-97db-71f8bc3131f0','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',43024.44,'KES',50000.00,93024.44,'Sales payout for ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 19:47:56'),('c2925219-1b1c-4d8e-8bad-16afcf8331bc','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-39059.56,'KES',100000.00,60940.44,'Purchase order ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 19:47:56'),('c3dd835e-bb5b-4efa-85dc-e508f61ded46','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-39204.56,'KES',100000.00,60795.44,'Purchase order ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 19:22:12'),('c58a352d-47b2-4f06-9dcd-211e8a9b6aab','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',35049.44,'KES',50000.00,85049.44,'Sales payout for ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 19:22:10'),('cbf0e1d1-0c0e-4d74-9e9f-59d588fe4849','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',54724.20,'KES',50000.00,104724.20,'Sales payout for ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 19:22:12'),('cca4e13c-7d4d-44e8-b9b0-6e635c4bd950','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-25246.28,'KES',100000.00,74753.72,'Purchase order ORD-SHOWCASE-AQUAERP--21',NULL,NULL,'completed','mpesa','2025-12-30 12:20:00','2026-06-28 19:22:11'),('cd78798b-bf44-429a-b930-3e7570a074fd','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',37180.36,'KES',50000.00,87180.36,'Sales payout for ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 19:22:12'),('cea73c98-03c0-41ea-b214-5e4d8ae4d47c','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-40903.96,'KES',100000.00,59096.04,'Purchase order ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 19:47:56'),('cebff0f6-fb14-487c-8e73-591bba1592f5','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-42316.84,'KES',100000.00,57683.16,'Purchase order ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 19:22:10'),('cfd4bb1d-195b-43af-b434-9bb30a1b2c87','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-35049.44,'KES',100000.00,64950.56,'Purchase order ORD-SHOWCASE-AQUAERP--6',NULL,NULL,'completed','mpesa','2025-09-01 15:05:00','2026-06-28 19:22:10'),('d0132937-ff85-4597-96e8-f8c080a8f63f','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-45071.84,'KES',100000.00,54928.16,'Purchase order ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 20:02:42'),('d0f6bd7c-8e61-4c6e-abec-1cc0d2c9b3ce','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',28971.04,'KES',50000.00,78971.04,'Sales payout for ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 19:47:56'),('d16a36c0-ea17-4cc2-8bd7-d5ada3e7ec15','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-54046.76,'KES',100000.00,45953.24,'Purchase order ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 20:02:43'),('d1b62b7a-5f7d-4e8a-adf6-2e1d4b7d6cad','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-27378.36,'KES',100000.00,72621.64,'Purchase order ORD-SHOWCASE-AQUAERP--13',NULL,NULL,'completed','mpesa','2025-10-27 10:36:00','2026-06-28 20:02:42'),('d1c4558f-743b-41ec-948e-8df267a90711','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',35123.68,'KES',50000.00,85123.68,'Sales payout for ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 20:02:42'),('d3402300-27d2-4360-a113-1f1f4f3832a1','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',53586.24,'KES',50000.00,103586.24,'Sales payout for ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 20:02:42'),('d34184d2-ca1a-4b3b-8ca1-f3326e948fc9','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-44707.60,'KES',100000.00,55292.40,'Purchase order ORD-SHOWCASE-AQUAERP--31',NULL,NULL,'completed','mpesa','2026-03-20 10:30:00','2026-06-28 19:22:11'),('d3b94b80-5b80-48d2-b1e4-a49265c74d91','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',39204.56,'KES',50000.00,89204.56,'Sales payout for ORD-SHOWCASE-AQUAERP--39',NULL,NULL,'completed','mpesa','2026-05-23 12:14:00','2026-06-28 19:22:12'),('d75baaa9-794d-45f0-9455-da8ac5f6480b','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',53985.28,'KES',50000.00,103985.28,'Sales payout for ORD-SHOWCASE-AQUAERP--27',NULL,NULL,'completed','mpesa','2026-02-16 12:38:00','2026-06-28 19:22:11'),('d76a985a-3b36-47f8-821f-3020e5ead858','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',36856.72,'KES',50000.00,86856.72,'Sales payout for ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 20:02:43'),('d792d47d-1b8f-4219-9013-2666476a47c1','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37237.20,'KES',100000.00,62762.80,'Purchase order ORD-SHOWCASE-AQUAERP--18',NULL,NULL,'completed','mpesa','2025-12-06 15:41:00','2026-06-28 19:22:11'),('d9be3a8b-f94e-4ec2-a169-9e2c09eb8916','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',54278.76,'KES',50000.00,104278.76,'Sales payout for ORD-SHOWCASE-AQUAERP--37',NULL,NULL,'completed','mpesa','2026-05-07 10:48:00','2026-06-28 19:22:12'),('db1f91ab-3d0c-4216-8841-59a17a57422b','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',42316.84,'KES',50000.00,92316.84,'Sales payout for ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 19:22:10'),('dbf1e9fc-6832-43b5-8484-0e2e376735a4','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-48744.40,'KES',100000.00,51255.60,'Purchase order ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 19:22:11'),('dca7dc8a-2870-448d-930b-931d96cb12b1','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',41673.04,'KES',50000.00,91673.04,'Sales payout for ORD-SHOWCASE-AQUAERP--32',NULL,NULL,'completed','mpesa','2026-03-28 11:43:00','2026-06-28 19:22:12'),('de9d33be-e4b4-4404-8820-56ba32300530','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-48754.84,'KES',100000.00,51245.16,'Purchase order ORD-SHOWCASE-AQUAERP--28',NULL,NULL,'completed','mpesa','2026-02-24 13:51:00','2026-06-28 20:02:43'),('df566662-c5f8-4705-9689-7528ce8252da','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',40371.52,'KES',50000.00,90371.52,'Sales payout for ORD-SHOWCASE-AQUAERP--40',NULL,NULL,'completed','mpesa','2026-05-31 13:27:00','2026-06-28 19:47:56'),('dff6b6b5-df70-4c92-b758-95c77ae45964','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',28527.92,'KES',50000.00,78527.92,'Sales payout for ORD-SHOWCASE-AQUAERP--11',NULL,NULL,'completed','mpesa','2025-10-11 14:10:00','2026-06-28 19:22:11'),('e2358585-0b54-4da9-98e4-5eae843c7810','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-57888.68,'KES',100000.00,42111.32,'Purchase order ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 20:02:43'),('e2643d02-7b3d-4315-aef4-a9dcb8d6f550','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',24853.04,'KES',50000.00,74853.04,'Sales payout for ORD-SHOWCASE-AQUAERP--41',NULL,NULL,'completed','mpesa','2026-06-08 14:40:00','2026-06-28 19:47:56'),('e2644080-939e-4d36-a0bc-02dbd970e116','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-23965.64,'KES',100000.00,76034.36,'Purchase order ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 19:47:55'),('e2d9ec9f-ed13-4dba-a5f0-7d8d19e70a00','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',47108.80,'KES',50000.00,97108.80,'Sales payout for ORD-SHOWCASE-AQUAERP--29',NULL,NULL,'completed','mpesa','2026-03-04 14:04:00','2026-06-28 20:02:43'),('e2e6e520-6882-491d-8a23-98cb230850b7','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',32429.00,'KES',50000.00,82429.00,'Sales payout for ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 19:47:55'),('e3ecea3a-2f1c-4508-a5ea-a2219fe84662','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',34297.76,'KES',50000.00,84297.76,'Sales payout for ORD-SHOWCASE-AQUAERP--7',NULL,NULL,'completed','mpesa','2025-09-09 10:18:00','2026-06-28 19:47:55'),('e4f1cb3e-2094-4d59-bb9f-8424db2f758a','53e72761-3b3f-4571-87bd-07eff79fa9f6','deposit',48744.40,'KES',50000.00,98744.40,'Sales payout for ORD-SHOWCASE-AQUAERP--8',NULL,NULL,'completed','mpesa','2025-09-17 11:31:00','2026-06-28 19:22:11'),('e5f0571e-37f9-43b1-a72f-2157ae2f9f50','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-40859.88,'KES',100000.00,59140.12,'Purchase order ORD-SHOWCASE-AQUAERP--2',NULL,NULL,'completed','mpesa','2025-07-31 11:13:00','2026-06-28 20:02:42'),('e64567bf-be85-46a7-9624-82932d8448bd','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-26313.48,'KES',100000.00,73686.52,'Purchase order ORD-SHOWCASE-AQUAERP--5',NULL,NULL,'completed','mpesa','2025-08-24 14:52:00','2026-06-28 19:47:55'),('e6801da3-89b7-4d20-bae7-dce06b0c0105','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',54870.36,'KES',50000.00,104870.36,'Sales payout for ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 19:47:55'),('e7522abf-751f-4809-baaf-0aadacce997d','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',44451.24,'KES',50000.00,94451.24,'Sales payout for ORD-SHOWCASE-AQUAERP--33',NULL,NULL,'completed','mpesa','2026-04-05 12:56:00','2026-06-28 19:47:56'),('e7b1bda6-e483-4543-b9b1-afcb4809b15f','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',46753.84,'KES',50000.00,96753.84,'Sales payout for ORD-SHOWCASE-AQUAERP--14',NULL,NULL,'completed','mpesa','2025-11-04 11:49:00','2026-06-28 20:02:42'),('e9dbbf31-8f83-44ba-88db-c185ed43310e','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-57439.76,'KES',100000.00,42560.24,'Purchase order ORD-SHOWCASE-AQUAERP--15',NULL,NULL,'completed','mpesa','2025-11-12 12:02:00','2026-06-28 19:22:11'),('ec0558b0-fde2-49a5-8274-ab4c68d9a598','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-51691.96,'KES',100000.00,48308.04,'Purchase order ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 19:22:11'),('ecb1451b-3b9e-45e5-9494-d83934b744be','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-37879.84,'KES',100000.00,62120.16,'Purchase order ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 19:22:11'),('eea7b47b-4a7b-44cc-ae62-3903c2e2691a','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-36246.56,'KES',100000.00,63753.44,'Purchase order ORD-SHOWCASE-AQUAERP--17',NULL,NULL,'completed','mpesa','2025-11-28 14:28:00','2026-06-28 19:22:11'),('ef1a107a-eacc-4f2f-9020-2856b706eda6','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-43074.32,'KES',100000.00,56925.68,'Purchase order ORD-SHOWCASE-AQUAERP--34',NULL,NULL,'completed','mpesa','2026-04-13 13:09:00','2026-06-28 19:47:56'),('ef6fed0b-29d5-4217-8c3a-2e55d28d9143','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',28835.32,'KES',50000.00,78835.32,'Sales payout for ORD-SHOWCASE-AQUAERP--25',NULL,NULL,'completed','mpesa','2026-01-31 10:12:00','2026-06-28 19:47:56'),('f21b12b0-4883-4835-9628-0b4a0a6c7e7a','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-27111.56,'KES',100000.00,72888.44,'Purchase order ORD-SHOWCASE-AQUAERP--19',NULL,NULL,'completed','mpesa','2025-12-14 10:54:00','2026-06-28 20:02:43'),('f389f71a-c0a6-4d1b-8813-51bb6831eda0','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32879.08,'KES',100000.00,67120.92,'Purchase order ORD-SHOWCASE-AQUAERP--10',NULL,NULL,'completed','mpesa','2025-10-03 13:57:00','2026-06-28 20:02:42'),('f4a3a84d-240d-4a1f-9212-f8c0c8f3c685','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-39377.40,'KES',100000.00,60622.60,'Purchase order ORD-SHOWCASE-AQUAERP--1',NULL,NULL,'completed','mpesa','2025-07-23 10:00:00','2026-06-28 19:47:55'),('f68ea096-7b78-4296-85bb-f4a09b1ec8f2','1522d4e4-b4ad-41c7-9a03-615aa141f9ed','deposit',58352.68,'KES',50000.00,108352.68,'Sales payout for ORD-SHOWCASE-AQUAERP--16',NULL,NULL,'completed','mpesa','2025-11-20 13:15:00','2026-06-28 20:02:42'),('f891f648-ddf1-42b7-84b4-4eae356f5897','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-32452.20,'KES',100000.00,67547.80,'Purchase order ORD-SHOWCASE-AQUAERP--26',NULL,NULL,'completed','mpesa','2026-02-08 11:25:00','2026-06-28 20:02:43'),('f9fcb69f-152d-4f55-8b45-9ebc9c63fe2a','4724a0ce-67c9-41a2-af8a-1cc831a83372','deposit',56185.80,'KES',50000.00,106185.80,'Sales payout for ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 19:47:56'),('fbb8ee54-5cfe-4026-a4bc-6fa6ef77ef0d','0491bbc3-666e-49ac-a4e2-0e72a138b4fc','purchase',-56185.80,'KES',100000.00,43814.20,'Purchase order ORD-SHOWCASE-AQUAERP--22',NULL,NULL,'completed','mpesa','2026-01-07 13:33:00','2026-06-28 19:47:56');
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
INSERT INTO `users` VALUES ('02b0b4b9-a1ef-450b-84a2-7c936e85ebc6','crew-otieno@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Kevin','Otieno',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:40','2026-06-28 20:02:40',NULL,NULL),('4323337f-4938-4d7a-ad5a-c0c77b5556fc','demo@aqualedger.co.ke','$2b$12$UuhLv/oRHQY12ZX.Q7nqgO/PJTfO9L5bUuxr9nYz2rTYnvKtGQO12','Demo','SuperUser',NULL,NULL,'super_admin','active',NULL,1,0,'2026-06-27 12:39:30','2026-06-27 12:39:30',NULL,NULL),('4771d81c-81ef-495e-b938-7f4d1d3213d4','admin@aqualedger.co.ke','$2b$12$swwEUpMxQB6D3921B5XEuuorxXbxuKu8xK.84YlBI7FCYjUK6dqym','Platform','Admin',NULL,NULL,'super_admin','active',NULL,1,0,'2026-06-06 08:48:44','2026-06-11 09:46:57','2026-06-11 09:46:57',NULL),('4d0cfb0e-f744-4fc8-a523-d2c63b5d3170','captain-nyali@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Said','Bakari',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:40','2026-06-28 20:02:40',NULL,NULL),('554e08ea-02dd-4817-b0e7-24042ace45b4','buyer-b2b@demo.aquaerp.local','$2b$12$qBuv.bcxTC6C7TpxGiPcceDbvGd62mjIOA8f0s39jqqmUPdxGm0Cy','B2B','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 09:08:12','2026-06-08 09:14:05','2026-06-08 09:14:05',NULL),('77b36613-6a88-46c2-9ea8-8a0edaf28dfa','crew-mwangi@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Peter','Mwangi',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:40','2026-06-28 20:02:40',NULL,NULL),('83ab655f-845d-4ec5-ac83-904b755c1a16','owner-coastfish@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:37','2026-06-28 20:02:37',NULL,NULL),('9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b','vendor@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Vendor',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-08 08:34:44','2026-06-08 08:34:44',NULL),('a4be805d-2f00-4777-be82-1bda494d50f1','synctest-vendor@test.com','$2b$12$/QECwINL7HKUAPCbYX3Gq.ZSsicdbzr7Afa.eaNmz9zo9Bffa3qLS','SyncTest','VendorContact','+254700000002',NULL,'user','active',NULL,1,0,'2026-05-30 13:24:00','2026-06-11 09:38:48','2026-06-11 09:38:48',NULL),('a8925060-2a3a-4829-a50f-3530a67d147b','crew-juma@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Juma','Ali',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:40','2026-06-28 20:02:40',NULL,NULL),('aa64c08b-dbf8-4c0c-9043-950f1abc259b','buyer@demo.aquaerp.local','$2b$12$oGFtZSTmzuNoOy4biTY8suIq1NfHMQXnHH/KByVoIvUl/SRBVcioi','Demo','Buyer',NULL,NULL,'user','active',NULL,1,0,'2026-06-06 08:48:46','2026-06-06 10:14:03','2026-06-06 10:14:03',NULL),('c45658ae-e152-4f0a-89cd-c8318545b516','owner-lamusea@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:38','2026-06-28 20:02:38',NULL,NULL),('c7b4bb8e-69d8-4a0a-9251-4daa2f4ffa75','jane.smith.new99@gmail.com','$2b$12$WTaILh0Z4jFVOqauaWNSzOCvCJrfPWThNRQiDTFdddIsBHo8CwFnO','Jane','Smith',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:24:57','2026-06-08 09:24:57',NULL,NULL),('c9d59c3d-ede5-4815-9e6d-415ad71f15c5','johndoe@gmail.com','$2b$12$YFf1yamaOgg/teRM/6YEieBBtnCgg5ztyg4rGjF5Rm/btdHWIsoWu','John','Doe','254112576616',NULL,'user','active',NULL,0,0,'2026-06-08 09:24:24','2026-06-08 09:29:25','2026-06-08 09:29:25',NULL),('cb9c667d-d1d9-4f4f-91d0-c60928a78ed2','alice.buyer.fresh@test.com','$2b$12$UJdiXxfSMJ/rDzr.KSeA6uLEALSe3v56LxJ10Vx05/mKVg7baLQQO','Alice','Buyer',NULL,NULL,'user','active',NULL,0,0,'2026-06-08 09:28:37','2026-06-08 09:28:37','2026-06-08 09:28:37',NULL),('de4ae297-ba95-4b4e-9d98-ee8f804a05f9','owner-aquaerp-demo@demo.aquaerp.local','$2b$12$6zkScSshbMKWQjgYcfbbs.oaBPpSNk4cvktjUUckSCrDs.ktvOzc6','Demo','Owner',NULL,NULL,'user','active',NULL,1,0,'2026-06-28 20:02:39','2026-06-28 20:02:39',NULL,NULL);
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
INSERT INTO `wallets` VALUES ('0491bbc3-666e-49ac-a4e2-0e72a138b4fc','tenant-default-0001','554e08ea-02dd-4817-b0e7-24042ace45b4',100000.00,'KES','active','2026-06-06 09:08:12','2026-06-06 09:08:12'),('1522d4e4-b4ad-41c7-9a03-615aa141f9ed','12495be8-694e-4b73-b391-62f36e6c42e2','de4ae297-ba95-4b4e-9d98-ee8f804a05f9',28000.00,'KES','active','2026-06-28 20:02:40','2026-06-28 20:02:40'),('64cf05c3-4839-4b3b-a735-887eb59735f6','tenant-default-0001','9c2fcb6b-12f2-44b2-8f42-9f11d7c8f31b',0.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:46'),('71bcba05-15cd-4843-95a7-26522a4f06ba','','4771d81c-81ef-495e-b938-7f4d1d3213d4',0.00,'KES','active','2026-06-11 08:55:01','2026-06-11 08:55:01'),('920df1f2-e3c7-4dd2-9a8c-dda1692a7529','tenant-default-0001','aa64c08b-dbf8-4c0c-9043-950f1abc259b',100000.00,'KES','active','2026-06-06 08:48:46','2026-06-06 08:48:47'),('be11e1e9-3a32-473a-a8b0-80ccd7ec1e14','11f852eb-f735-4923-9fa4-538582e42160','c45658ae-e152-4f0a-89cd-c8318545b516',26500.00,'KES','active','2026-06-28 20:02:39','2026-06-28 20:02:39'),('ff3813fa-094e-44d0-9710-fa5cf1346598','b21fe9c1-79b2-490e-a254-87df2e52b4d9','83ab655f-845d-4ec5-ac83-904b755c1a16',25000.00,'KES','active','2026-06-28 20:02:38','2026-06-28 20:02:38');
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

-- Dump completed on 2026-06-28 20:02:58
