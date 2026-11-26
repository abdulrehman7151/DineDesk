
import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_CODES_PER_HOUR = 5;

const genericFailureMessage =
    "The code is incorrect or has expired. Please request a new code.";
const waitMessage =
    "Please wait a moment before requesting another code.";

function generateCode(): string {
    return String(randomInt(0, 1000000)).padStart(6, "0");
}

function verificationEmailHtml(code: string): string {
    return `
        <h2>Your DineDesk verification code</h2>
        <p>Use this code to verify your email address:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't create a DineDesk account, ignore this email.</p>
    `;
}

async function sendVerificationCode(email: string): Promise<void> {
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    // Clean up expired codes, then store the new one. Older unexpired codes
    // stop working because verification only ever checks the latest code.
    await prisma.$transaction(async (tx) => {
        await tx.emailVerificationToken.deleteMany({
            where: { email, expiresAt: { lte: new Date() } },
        });
        await tx.emailVerificationToken.create({
            data: { email, codeHash, expiresAt },
        });
    });

    try {
        await sendEmail({
            to: email,
            subject: "Your DineDesk verification code",
            html: verificationEmailHtml(code),
        });
    } catch (error) {
        // Don't leave a code behind that the user never received.
        await prisma.emailVerificationToken.deleteMany({
            where: { email, codeHash },
        });
        throw error;
    }
}

export async function requestEmailVerification(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, emailVerified: true },
    });

    if (!user) {
        return {
            success: true,
            message: "If your account exists, a verification code will be sent.",
        };
    }

    if (user.emailVerified) {
        return {
            success: true,
            message: "Your email is already verified. You can sign in.",
        };
    }

    await sendVerificationCode(normalizedEmail);

    return {
        success: true,
        message:
            "We sent a 6-digit verification code to your email. It expires in 15 minutes.",
    };
}

export async function verifyEmailCode(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
        return { success: false, message: genericFailureMessage };
    }

    const token = await prisma.emailVerificationToken.findFirst({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
        select: { id: true, codeHash: true, expiresAt: true },
    });

    if (!token || token.expiresAt <= new Date()) {
        return { success: false, message: genericFailureMessage };
    }

    const matches = await bcrypt.compare(trimmedCode, token.codeHash);

    if (!matches) {
        return { success: false, message: genericFailureMessage };
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
        // Consume the code atomically so it can't be reused.
        const consumed = await tx.emailVerificationToken.deleteMany({
            where: {
                id: token.id,
                expiresAt: { gt: now },
            },
        });

        if (consumed.count !== 1) {
            return { success: false, message: genericFailureMessage };
        }

        await tx.user.updateMany({
            where: { email: normalizedEmail },
            data: { emailVerified: true },
        });

        return {
            success: true,
            message: "Your email is verified. You can now sign in.",
        };
    });
}

export async function resendEmailVerification(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, emailVerified: true },
    });

    if (!user) {
        return {
            success: true,
            message: "If your account exists, a verification code will be sent.",
        };
    }

    if (user.emailVerified) {
        return {
            success: true,
            message: "Your email is already verified. You can sign in.",
        };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentTokens = await prisma.emailVerificationToken.findMany({
        where: { email: normalizedEmail, createdAt: { gte: oneHourAgo } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
    });

    if (recentTokens.length > 0) {
        const latestSentAt = recentTokens[0].createdAt.getTime();

        if (Date.now() - latestSentAt < RESEND_COOLDOWN_MS) {
            return { success: false, message: waitMessage };
        }
    }

    if (recentTokens.length >= MAX_CODES_PER_HOUR) {
        return {
            success: false,
            message:
                "You've requested too many codes. Please try again later.",
        };
    }

    await sendVerificationCode(normalizedEmail);

    return {
        success: true,
        message:
            "We sent a new 6-digit verification code to your email. It expires in 15 minutes.",
    };
}
