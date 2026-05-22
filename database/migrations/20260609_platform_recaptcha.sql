-- Google reCAPTCHA platform security (super-admin configurable)

INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES
  ('recaptcha', JSON_OBJECT(
    'enabled', FALSE,
    'version', 'v3',
    'siteKey', '',
    'secretKey', '',
    'minScore', 0.5,
    'protectLogin', TRUE,
    'protectRegister', TRUE,
    'protectGuestCheckout', TRUE,
    'hostnameAllowlist', JSON_ARRAY()
  ));
