-- Platform-wide settings (maintenance, signup lock, announcements)

CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES
  ('maintenance', JSON_OBJECT('enabled', FALSE, 'message', '')),
  ('signup', JSON_OBJECT('locked', FALSE)),
  ('announcement', JSON_OBJECT('enabled', FALSE, 'title', '', 'body', ''));
