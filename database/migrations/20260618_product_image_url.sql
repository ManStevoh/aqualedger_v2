-- AquaLedger V2 - Add product image support to catalog
USE aqualedger32;

ALTER TABLE product_catalog ADD COLUMN image_url VARCHAR(500) NULL AFTER base_price;
