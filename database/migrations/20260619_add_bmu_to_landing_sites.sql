-- AquaLedger V2 - Add BMU link to landing sites
USE aqualedger32;

ALTER TABLE landing_sites ADD COLUMN bmu_id VARCHAR(36) NULL AFTER longitude;
ALTER TABLE landing_sites ADD INDEX idx_bmu_id (bmu_id);
ALTER TABLE landing_sites ADD CONSTRAINT fk_landing_sites_bmu FOREIGN KEY (bmu_id) REFERENCES bmu(id) ON DELETE SET NULL;
