"use server";

import {
    resendEmailVerification,
    verifyEmailCode,
} from "@/services/emailVerification";

export type EmailVerificationActionState = {
    success: boolean;
    message: string;
};

export async function verifyEmailAction(
    _prevState: EmailVerificationActionState,
    formData: FormData
): Promise<EmailVerificationActionState> {
    const email = formData.get("email");
    const code = formData.get("code");

    if (
        typeof email !== "string" ||
        typeof code !== "string" ||
        !email.trim() ||
        !code.trim()
    ) {
        return {
            success: false,
            message: "Please enter the 6-digit code we sent to your email.",
        };
    }

    try {
        return await verifyEmailCode(email, code);
    } catch (error) {
        console.error("Verify email action error:", error);
        return {
            success: false,
            message: "We couldn't verify your code. Please try again later.",
        };
    }
}

export async function resendVerificationAction(
    _prevState: EmailVerificationActionState,
    formData: FormData
): Promise<EmailVerificationActionState> {
    const email = formData.get("email");

    if (
        typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return {
            success: false,
            message: "Please enter a valid email address.",
        };
    }

    try {
        return await resendEmailVerification(email);
    } catch (error) {
        console.error("Resend verification action error:", error);
        return {
            success: false,
            message: "We couldn't send a new code. Please try again later.",
        };
    }
}
