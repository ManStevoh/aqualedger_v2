-- E-commerce storefront themes & tenant customization
USE aqualedger32;

CREATE TABLE IF NOT EXISTS tenant_storefront_settings (
  tenant_id VARCHAR(36) PRIMARY KEY,
  theme_id VARCHAR(50) NOT NULL DEFAULT 'ocean-classic',
  store_name VARCHAR(200) NULL,
  tagline VARCHAR(500) NULL,
  logo_url VARCHAR(500) NULL,
  favicon_url VARCHAR(500) NULL,
  hero_image_url VARCHAR(500) NULL,
  hero_headline VARCHAR(255) NULL,
  hero_subheadline VARCHAR(500) NULL,
  hero_cta_label VARCHAR(80) DEFAULT 'Shop fresh catch',
  hero_cta_href VARCHAR(255) DEFAULT '#products',
  custom_tokens JSON NULL COMMENT 'Override theme tokens',
  show_traceability TINYINT(1) DEFAULT 1,
  show_reviews TINYINT(1) DEFAULT 1,
  show_loyalty TINYINT(1) DEFAULT 1,
  cookie_banner_text VARCHAR(500) NULL,
  privacy_policy_url VARCHAR(500) NULL,
  terms_url VARCHAR(500) NULL,
  footer_text TEXT NULL,
  social_links JSON NULL,
  seo_title VARCHAR(200) NULL,
  seo_description VARCHAR(500) NULL,
  published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS storefront_collections (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  sort_order INT DEFAULT 0,
  featured TINYINT(1) DEFAULT 0,
  status ENUM('active', 'hidden') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_slug (tenant_id, slug),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tenant_storefront_settings (
  tenant_id, theme_id, store_name, tagline, hero_headline, hero_subheadline, published, cookie_banner_text
) VALUES (
  'tenant-default-0001',
  'ocean-classic',
  'AquaERP Fresh Market',
  'From ocean to table — fully traceable seafood',
  'Fresh catch, delivered with cold-chain care',
  'Browse species landed today. Every kilo traced from boat to your door.',
  1,
  'We use cookies for cart and analytics. By continuing you accept our privacy policy.'
);
