-- Order lifecycle: orders must never keep a table occupied forever.
-- SERVED orders close themselves (COMPLETED) after the restaurant's
-- auto-close minutes with no new items; PENDING / PREPARING / READY
-- orders untouched for 24 hours close as EXPIRED (abandoned, never a
-- sale). servedAt records when an order was last served so the timer can
-- run. OrderItem.createdAt lets "today" stats count items on the day
-- they were added instead of the day the order was created.
-- SafePay removal: the SafePay provider columns are dropped. Paddle is
-- the only payment provider now.
-- NOTE: existing OrderItem rows get createdAt = the migration time, so
-- "today" stats and the 7-day top sellers briefly include older items
-- once, on the day this migration runs.

-- AlterEnum
ALTER TABLE `Order` MODIFY COLUMN `status` ENUM('PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `servedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Restaurant` ADD COLUMN `servedAutoCloseMinutes` INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
CREATE INDEX `OrderItem_createdAt_idx` ON `OrderItem` (`createdAt`);

-- AlterTable
ALTER TABLE `SubscriptionPlan` DROP COLUMN `safepayPlanId`;

-- AlterTable
ALTER TABLE `Subscription` DROP COLUMN `safepaySubscriptionId`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `safepayTransactionId`;
