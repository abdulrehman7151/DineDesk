/*
  Warnings:

  - You are about to drop the column `userId` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Restaurant` DROP FOREIGN KEY `Restaurant_userId_fkey`;

-- DropIndex
DROP INDEX `Restaurant_userId_fkey` ON `Restaurant`;

-- AlterTable
ALTER TABLE `Restaurant` DROP COLUMN `userId`,
    ADD COLUMN `ownerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `role`;

-- CreateTable
CREATE TABLE `RestaurantUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `restaurantId` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'chef',

    UNIQUE INDEX `RestaurantUser_userId_restaurantId_key`(`userId`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantUser` ADD CONSTRAINT `RestaurantUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantUser` ADD CONSTRAINT `RestaurantUser_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
