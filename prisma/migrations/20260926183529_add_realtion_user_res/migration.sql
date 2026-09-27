/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_restaurantId_fkey`;

-- DropIndex
DROP INDEX `User_restaurantId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Restaurant` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `restaurantId`;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
