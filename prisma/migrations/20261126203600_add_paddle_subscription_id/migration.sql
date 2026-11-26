-- Add Paddle provider ids so Paddle webhooks can link subscriptions and
-- payments without relying on custom data alone. Mirrors the SafePay
-- provider id columns (safepaySubscriptionId / safepayTransactionId).
ALTER TABLE `Subscription` ADD COLUMN `paddleSubscriptionId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Subscription_paddleSubscriptionId_key` ON `Subscription` (`paddleSubscriptionId`);
ALTER TABLE `Payment` ADD COLUMN `paddleTransactionId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Payment_paddleTransactionId_key` ON `Payment` (`paddleTransactionId`);
