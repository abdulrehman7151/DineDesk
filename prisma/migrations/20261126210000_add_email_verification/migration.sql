-- Add email verification for new signups. Existing accounts stay verified
-- (the new column defaults to true), while new accounts are created with
-- emailVerified false and must verify with a 6-digit code.
ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE `EmailVerificationToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
);

CREATE INDEX `EmailVerificationToken_email_idx` ON `EmailVerificationToken` (`email`);
