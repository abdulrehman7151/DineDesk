/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Subscription` ADD COLUMN `reference` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Subscription_reference_key` ON `Subscription`(`reference`);
