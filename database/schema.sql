-- ===========================================
-- AquaLedger V2 - Database Schema
-- ===========================================
-- Initial schema for the Fisheries Operating System
-- Run with: mysql -u root -p aqualedger < database/schema.sql

USE aqualedger32;

-- ===========================================
-- Core Authentication & Users
-- ===========================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  county VARCHAR(100),
  role ENUM('super_admin', 'investor', 'user') DEFAULT 'user',
  status ENUM('active', 'suspended', 'pending', 'inactive') DEFAULT 'active',
  avatar_url VARCHAR(500),
  kyc_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  notification_preferences JSON NULL,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Financial & Wallets
-- ===========================================

CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'KES',
  status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  wallet_id VARCHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'transfer', 'purchase', 'refund', 'commission') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  balance_before DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  description VARCHAR(255),
  reference_type VARCHAR(50),
  reference_id VARCHAR(36),
  status ENUM('pending', 'completed', 'failed', 'reversed') DEFAULT 'completed',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  INDEX idx_wallet_id (wallet_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS credit_scores (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  score INT DEFAULT 400,
  grade CHAR(1) DEFAULT 'C',
  payment_history INT DEFAULT 0,
  default_count INT DEFAULT 0,
  accounts_opened INT DEFAULT 0,
  credit_inquiries INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Investment & Packages
-- ===========================================

CREATE TABLE IF NOT EXISTS investment_packages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  min_investment DECIMAL(15, 2) NOT NULL,
  max_investment DECIMAL(15, 2),
  expected_return_rate DECIMAL(5, 2) DEFAULT 12.00,
  duration_months INT NOT NULL,
  risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
  total_pool DECIMAL(15, 2) DEFAULT 0.00,
  available_amount DECIMAL(15, 2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'closed', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS investments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  package_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  expected_return DECIMAL(15, 2),
  actual_return DECIMAL(15, 2) DEFAULT 0.00,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES investment_packages(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_package_id (package_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Fishing Operations - Fleet & Trips
-- ===========================================

CREATE TABLE IF NOT EXISTS boats (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type ENUM('fiber', 'wooden', 'steel', 'aluminum') DEFAULT 'fiber',
  capacity_kg INT NOT NULL,
  length_meters DECIMAL(5, 2),
  engine_power_hp INT,
  engine_type VARCHAR(100),
  year_built INT,
  gps_enabled BOOLEAN DEFAULT FALSE,
  imei_number VARCHAR(50),
  status ENUM('active', 'inactive', 'maintenance', 'decommissioned') DEFAULT 'active',
  registration_expires_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS boat_crew (
  id VARCHAR(36) PRIMARY KEY,
  boat_id VARCHAR(36) NOT NULL,
  crew_member_id VARCHAR(36) NOT NULL,
  role ENUM('captain', 'engineer', 'deckhand', 'nets_officer') DEFAULT 'deckhand',
  status ENUM('active', 'inactive') DEFAULT 'active',
  joined_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE,
  FOREIGN KEY (crew_member_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_boat_crew (boat_id, crew_member_id),
  INDEX idx_boat_id (boat_id),
  INDEX idx_crew_member_id (crew_member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS boat_maintenance (
  id VARCHAR(36) PRIMARY KEY,
  boat_id VARCHAR(36) NOT NULL,
  maintenance_type VARCHAR(100) NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2),
  maintenance_date DATE NOT NULL,
  completion_date DATE,
  status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE,
  INDEX idx_boat_id (boat_id),
  INDEX idx_maintenance_date (maintenance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS landing_sites (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  county VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_county (county)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fishing_trips (
  id VARCHAR(36) PRIMARY KEY,
  boat_id VARCHAR(36) NOT NULL,
  captain_id VARCHAR(36) NOT NULL,
  landing_site_id VARCHAR(36),
  departure_time DATETIME NOT NULL,
  return_time DATETIME,
  fishing_zone VARCHAR(100),
  weather_conditions VARCHAR(200),
  sea_state ENUM('calm', 'moderate', 'rough', 'very_rough') DEFAULT 'calm',
  fuel_used_liters DECIMAL(8, 2) DEFAULT 0,
  fuel_cost DECIMAL(10, 2) DEFAULT 0,
  total_catch_kg DECIMAL(10, 2) DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE,
  FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (landing_site_id) REFERENCES landing_sites(id) ON DELETE SET NULL,
  INDEX idx_boat_id (boat_id),
  INDEX idx_captain_id (captain_id),
  INDEX idx_departure_time (departure_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_crew (
  id VARCHAR(36) PRIMARY KEY,
  trip_id VARCHAR(36) NOT NULL,
  crew_member_id VARCHAR(36) NOT NULL,
  role VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
  FOREIGN KEY (crew_member_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Fish Species & Catches
-- ===========================================

CREATE TABLE IF NOT EXISTS fish_species (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  scientific_name VARCHAR(200),
  description TEXT,
  average_weight_kg DECIMAL(5, 2),
  market_price_per_kg DECIMAL(8, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catches (
  id VARCHAR(36) PRIMARY KEY,
  trip_id VARCHAR(36) NOT NULL,
  species_id VARCHAR(36) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  grade ENUM('A', 'B', 'C') DEFAULT 'B',
  unit_price DECIMAL(8, 2) NOT NULL,
  total_value DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_kg * unit_price) STORED,
  storage_method ENUM('iced', 'frozen', 'salted', 'dried') DEFAULT 'iced',
  recorded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES fish_species(id) ON DELETE RESTRICT,
  INDEX idx_trip_id (trip_id),
  INDEX idx_species_id (species_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Marketplace
-- ===========================================

CREATE TABLE IF NOT EXISTS fish_listings (
  id VARCHAR(36) PRIMARY KEY,
  seller_id VARCHAR(36) NOT NULL,
  species_id VARCHAR(36) NOT NULL,
  fish_type VARCHAR(100),
  quantity_kg DECIMAL(10, 2) NOT NULL,
  available_quantity_kg DECIMAL(10, 2) NOT NULL,
  grade ENUM('A', 'B', 'C') DEFAULT 'B',
  price_per_kg DECIMAL(8, 2) NOT NULL,
  landing_site_id VARCHAR(36),
  storage_method ENUM('iced', 'frozen', 'salted', 'dried') DEFAULT 'iced',
  expires_at DATETIME,
  status ENUM('available', 'sold_out', 'expired', 'delisted') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES fish_species(id) ON DELETE RESTRICT,
  FOREIGN KEY (landing_site_id) REFERENCES landing_sites(id) ON DELETE SET NULL,
  INDEX idx_seller_id (seller_id),
  INDEX idx_species_id (species_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(15, 2) DEFAULT 0,
  delivery_fee DECIMAL(15, 2) DEFAULT 0,
  tax DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  delivery_address TEXT,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  listing_id VARCHAR(36),
  species_id VARCHAR(36) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(8, 2) NOT NULL,
  subtotal DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_kg * unit_price) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES fish_listings(id) ON DELETE SET NULL,
  FOREIGN KEY (species_id) REFERENCES fish_species(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- BMU & Compliance
-- ===========================================

CREATE TABLE IF NOT EXISTS bmu (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  county VARCHAR(100) NOT NULL,
  chairman_id VARCHAR(36),
  status ENUM('active', 'inactive') DEFAULT 'active',
  total_members INT DEFAULT 0,
  total_boats INT DEFAULT 0,
  registration_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chairman_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_county (county)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS licenses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  license_type ENUM('fishing', 'trading', 'transportation') NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  issued_date DATE NOT NULL,
  expires_date DATE NOT NULL,
  issuing_authority VARCHAR(200),
  status ENUM('active', 'expired', 'suspended', 'revoked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_license_type (license_type),
  INDEX idx_expires_date (expires_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Storage & Logistics
-- ===========================================

CREATE TABLE IF NOT EXISTS storage_facilities (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('cold_room', 'freezer', 'ice_plant', 'warehouse') DEFAULT 'cold_room',
  capacity_kg DECIMAL(12, 2) NOT NULL,
  current_stock_kg DECIMAL(12, 2) DEFAULT 0,
  county VARCHAR(100) NOT NULL,
  status ENUM('operational', 'maintenance', 'closed') DEFAULT 'operational',
  temperature_min DECIMAL(5, 2),
  temperature_max DECIMAL(5, 2),
  current_temperature DECIMAL(5, 2),
  daily_rate_per_kg DECIMAL(8, 2) DEFAULT 0,
  manager_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_county (county)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS storage_records (
  id VARCHAR(36) PRIMARY KEY,
  facility_id VARCHAR(36) NOT NULL,
  species_id VARCHAR(36),
  quantity_kg DECIMAL(10, 2) NOT NULL,
  grade ENUM('A', 'B', 'C') DEFAULT 'B',
  storage_method ENUM('iced', 'frozen', 'salted', 'dried') DEFAULT 'iced',
  entry_date DATETIME NOT NULL,
  exit_date DATETIME,
  daily_cost DECIMAL(10, 2),
  total_cost DECIMAL(15, 2),
  status ENUM('stored', 'removed', 'expired') DEFAULT 'stored',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES storage_facilities(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES fish_species(id) ON DELETE SET NULL,
  INDEX idx_facility_id (facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Climate & Alerts
-- ===========================================

CREATE TABLE IF NOT EXISTS climate_alerts (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('advisory', 'warning', 'weather', 'environmental') DEFAULT 'weather',
  severity ENUM('low', 'moderate', 'high', 'critical') DEFAULT 'moderate',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  affected_counties JSON,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_severity (severity),
  INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Expenses & Financial Tracking
-- ===========================================

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  receipt_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by VARCHAR(36),
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Notifications & Communications
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('success', 'info', 'warning', 'error') DEFAULT 'info',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Analytics & Reports
-- ===========================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  event_type VARCHAR(100) NOT NULL,
  event_data JSON,
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Audit Trail
-- ===========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NULL,
  resource_id VARCHAR(36) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Initial Data: Fish Species
-- ===========================================

INSERT IGNORE INTO fish_species (id, name, scientific_name, average_weight_kg, market_price_per_kg) VALUES
('sp_001', 'Tilapia', 'Oreochromis niloticus', 0.8, 350),
('sp_002', 'Nile Perch', 'Lates niloticus', 5.0, 450),
('sp_003', 'Catfish', 'Clarias gariepinus', 1.5, 280),
('sp_004', 'Sardines', 'Sardinella gibbosa', 0.05, 150),
('sp_005', 'Mackerel', 'Rastrelliger kanagurta', 0.3, 320),
('sp_006', 'Tuna', 'Thunnus albacares', 8.0, 600),
('sp_007', 'Squid', 'Loligo vulgaris', 0.2, 500),
('sp_008', 'Shrimp', 'Penaeus indicus', 0.01, 1200);

-- ===========================================
-- Indexes for Performance
-- ===========================================

CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_transactions_wallet_created ON transactions(wallet_id, created_at);
CREATE INDEX idx_catches_trip_created ON catches(trip_id, created_at);
CREATE INDEX idx_listings_seller_status ON fish_listings(seller_id, status);
CREATE INDEX idx_orders_buyer_created ON orders(buyer_id, created_at);
CREATE INDEX idx_storage_facility_stock ON storage_facilities(current_stock_kg);
