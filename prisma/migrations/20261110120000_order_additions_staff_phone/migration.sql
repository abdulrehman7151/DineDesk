-- AlterTable
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `hasNewAdditions` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `isAddition` BOOLEAN NOT NULL DEFAULT false;