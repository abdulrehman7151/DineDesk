
import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";

export async function requestPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) {
        return {
            success: true,
            message: "If your account exists, a reset link will be sent.",
        };
    }

    const appUrlValue = process.env.APP_URL;

    if (!appUrlValue) {
        throw new Error("Application URL is missing.");
    }

    const appUrl = new URL(appUrlValue);

    if (
        !["http:", "https:"].includes(appUrl.protocol) ||
        appUrl.username ||
        appUrl.password ||
        (process.env.NODE_ENV === "production" &&
            appUrl.protocol !== "https:")
    ) {
        throw new Error("Password reset application URL is invalid.");
    }

    const token = randomBytes(32).toString("hex");

    const hashedToken = createHash("sha256")
        .update(token)
        .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            email: normalizedEmail,
            token: hashedToken,
            expiresAt,
        },
    });

    try {
        const resetUrl = new URL("/reset-password", appUrl.origin);
        resetUrl.searchParams.set("token", token);

        await sendEmail({
            to: normalizedEmail,
            subject: "Reset Your DineDesk Password",
            html: `
                <h2>Reset Your Password</h2>
                <p>You requested a password reset.</p>
                <p>Click below to create a new password.</p>

                <a href="${resetUrl.toString()}"
                   style="background:#dc2626;color:white;padding:12px 20px;text-decoration:none;border-radius:8px;">
                   Reset Password
                </a>

                <p>This link expires in 15 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
            `,
        });

        await prisma.passwordResetToken.deleteMany({
            where: {
                email: normalizedEmail,
                token: { not: hashedToken },
            },
        });

        return {
            success: true,
            message: "If your account exists, a reset link will be sent.",
        };

    } catch (error) {
        await prisma.passwordResetToken.deleteMany({
            where: {
                email: normalizedEmail,
                token: hashedToken,
            },
        });

        throw error;
    }
}

export async function completePasswordReset(token: string, password: string) {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
        return false;
    }

    const hashedToken = createHash("sha256")
        .update(token)
        .digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
        select: { id: true, email: true, expiresAt: true },
    });

    if (!resetToken || resetToken.expiresAt <= new Date()) {
        return false;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
        const consumed = await tx.passwordResetToken.deleteMany({
            where: {
                id: resetToken.id,
                token: hashedToken,
                expiresAt: { gt: now },
            },
        });

        if (consumed.count !== 1) {
            return false;
        }

        const updatedUser = await tx.user.updateMany({
            where: { email: resetToken.email },
            data: { password: passwordHash },
        });

        return updatedUser.count === 1;
    });
}
