-- Platform branding for login, marketing, and default shell when tenant has no overrides

INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES
  ('branding', JSON_OBJECT('logo_url', '', 'primary_color', '', 'app_name', ''));
