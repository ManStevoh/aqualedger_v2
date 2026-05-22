-- Add guest checkout protection flag to existing recaptcha settings

UPDATE platform_settings
SET setting_value = JSON_SET(
  COALESCE(setting_value, JSON_OBJECT()),
  '$.protectGuestCheckout',
  COALESCE(JSON_EXTRACT(setting_value, '$.protectGuestCheckout'), TRUE)
)
WHERE setting_key = 'recaptcha';
