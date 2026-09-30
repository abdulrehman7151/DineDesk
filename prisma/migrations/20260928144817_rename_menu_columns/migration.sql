/*
  Warnings:

  - You are about to drop the column `name` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MenuItemSize` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[menuItemId,Size]` on the table `MenuItemSize` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ProductName` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Size` to the `MenuItemSize` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MenuItemSize` DROP FOREIGN KEY `MenuItemSize_menuItemId_fkey`;

-- DropIndex
DROP INDEX `MenuItemSize_menuItemId_name_key` ON `MenuItemSize`;

-- AlterTable
ALTER TABLE `MenuItem` DROP COLUMN `name`,
    ADD COLUMN `ProductName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MenuItemSize` DROP COLUMN `name`,
    ADD COLUMN `Size` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `MenuItemSize_menuItemId_Size_key` ON `MenuItemSize`(`menuItemId`, `Size`);
