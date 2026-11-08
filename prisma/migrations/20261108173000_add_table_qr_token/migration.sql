ALTER TABLE `Table`
ADD COLUMN `qrToken` VARCHAR(32) NULL;

UPDATE `Table`
SET `qrToken` = LOWER(REPLACE(UUID(), '-', ''))
WHERE `qrToken` IS NULL;

ALTER TABLE `Table`
MODIFY `qrToken` VARCHAR(32) NOT NULL;

CREATE UNIQUE INDEX `Table_qrToken_key` ON `Table`(`qrToken`);
