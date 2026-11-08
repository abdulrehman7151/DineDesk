
"use server";

import {
    completePasswordReset,
    requestPasswordReset,
} from "@/services/passwordReset";

export type PasswordResetActionState = {
    success: boolean;
    message: string;
};

const genericRequestMessage = "If your account exists, a reset link will be sent.";

export async function forgotPasswordAction(
    _prevState: PasswordResetActionState,
    formData: FormData
): Promise<PasswordResetActionState> {
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
        await requestPasswordReset(email);
        return { success: true, message: genericRequestMessage };
    } catch (error) {
        console.error("Forgot password action error:", error);

        return {
            success: false,
            message: "We couldn't send a reset link. Please try again later.",
        };
    }
}

export async function resetPasswordAction(
    _prevState: PasswordResetActionState,
    formData: FormData
): Promise<PasswordResetActionState> {
    const token = formData.get("token");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (
        typeof token !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return {
            success: false,
            message: "Please complete all fields and try again.",
        };
    }

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match." };
    }

    if (password.length < 8) {
        return {
            success: false,
            message: "Password must be at least 8 characters.",
        };
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        return {
            success: false,
            message: "Password must be 72 bytes or fewer.",
        };
    }

    try {
        const updated = await completePasswordReset(token, password);

        if (!updated) {
            return {
                success: false,
                message: "This reset link is invalid or expired. Request a new one.",
            };
        }

        return {
            success: true,
            message: "Your password has been reset. You can now sign in.",
        };
    } catch (error) {
        console.error("Reset password action error:", error);
        return {
            success: false,
            message: "We couldn't reset your password. Please try again.",
        };
    }
}
