-- Add opening/closing times so owners can set their hours in Settings and
-- guests see them on the menu page. Existing rows get NULL (unknown hours)
-- and the guest page keeps its current hours text until they are set.
ALTER TABLE `Restaurant` ADD COLUMN `openingTime` VARCHAR(191) NULL;
ALTER TABLE `Restaurant` ADD COLUMN `closingTime` VARCHAR(191) NULL;
