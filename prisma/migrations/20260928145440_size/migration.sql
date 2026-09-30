/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,ProductName]` on the table `MenuItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `MenuItem_restaurantId_ProductName_key` ON `MenuItem`(`restaurantId`, `ProductName`);

-- AddForeignKey
ALTER TABLE `MenuItemSize` ADD CONSTRAINT `MenuItemSize_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
