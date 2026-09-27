/*
  Warnings:

  - Made the column `ownerId` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Restaurant` DROP FOREIGN KEY `Restaurant_ownerId_fkey`;

-- DropIndex
DROP INDEX `Restaurant_ownerId_fkey` ON `Restaurant`;

-- AlterTable
ALTER TABLE `Restaurant` MODIFY `ownerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
