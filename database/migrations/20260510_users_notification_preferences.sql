-- Adds JSON column for persisted notification toggles (run once per environment)
USE aqualedger32;

ALTER TABLE users ADD COLUMN notification_preferences JSON NULL;
