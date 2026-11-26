"use server";

import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { createUserAndRestaurant, SignIn } from "@/services/Authservices";
import { requestEmailVerification } from "@/services/emailVerification";

export type SignupField =
    | "restaurantName"
    | "phone"
    | "city"
    | "address"
    | "adminName"
    | "email"
    | "password"
    | "confirmPassword";

export type SignupState = {
    success: boolean;
    message: string;
    email?: string;
    needsVerification?: boolean;
    invalidFields?: SignupField[];
};

export type SigninState = {
    success: boolean;
    message: string;
    role?: string;
    needsVerification?: boolean;
};

export async function signup(
    prevState: SignupState,
    formData: FormData
): Promise<SignupState> {
    const restaurantName = formData.get("restaurantName");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const address = formData.get("address");
    const adminName = formData.get("adminName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");


    const missingFields: SignupField[] = [];
    if (typeof restaurantName !== "string" || !restaurantName.trim())
        missingFields.push("restaurantName");
    if (typeof phone !== "string" || !phone.trim())
        missingFields.push("phone");
    if (typeof city !== "string" || !city.trim())
        missingFields.push("city");
    if (typeof address !== "string" || !address.trim())
        missingFields.push("address");
    if (typeof adminName !== "string" || !adminName.trim())
        missingFields.push("adminName");
    if (typeof email !== "string" || !email.trim())
        missingFields.push("email");
    if (typeof password !== "string" || !password)
        missingFields.push("password");
    if (typeof confirmPassword !== "string" || !confirmPassword)
        missingFields.push("confirmPassword");

    if (missingFields.length > 0) {
        return {
            success: false,
            message: "Please fill in all fields.",
            invalidFields: missingFields,
        };
    }

    if (password !== confirmPassword) {
        return {
            success: false,
            message: "Passwords do not match.",
            invalidFields: ["password", "confirmPassword"],
        };
    }

    if (password.length < 8) {
        return {
            success: false,
            message: "Password must be at least 8 characters.",
            invalidFields: ["password", "confirmPassword"],
        };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await createUserAndRestaurant({
            name: adminName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            restaurantName: restaurantName.trim(),
            city: city.trim(),
            address: address.trim(),
            phone: phone.trim(),
        });

        const normalizedEmail = email.trim().toLowerCase();

        try {
            await requestEmailVerification(normalizedEmail);
        } catch (error) {
            console.error("Verification email error:", error);

            return {
                success: true,
                message:
                    "Account created! We couldn't send the verification code — please use the resend option on the verification page.",
                email: normalizedEmail,
                needsVerification: true,
            };
        }

        return {
            success: true,
            message:
                "Account created! We sent a 6-digit verification code to your email.",
            email: normalizedEmail,
            needsVerification: true,
        };
    } catch (error) {
        console.error("Signup error:", error);

        if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
                invalidFields:
                    error.message === "This email is already registered."
                        ? ["email"]
                        : undefined,
            };
        }

        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function signInAction(
    prevState: SigninState,
    formData: FormData
): Promise<SigninState> {
    const email = formData.get("email");
    const password = formData.get("password");

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return {
            success: false,
            message: "Please enter your email and password.",
        };
    }

    try {
        const result = await SignIn({
            email: email.trim().toLowerCase(),
            password,
        });

        if (!result.success) {
            return {
                success: false,
                message: result.message,
                needsVerification: result.needsVerification,
            };
        }

        const cookieStore = await cookies();

        cookieStore.set("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return {
            success: true,
            message: "Sign in successful! Redirecting...",
            role: result.role,
        };
    } catch (error) {
        console.error("Sign-in error:", error);

        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
}