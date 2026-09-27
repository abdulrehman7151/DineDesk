"use server";

import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { createUserAndRestaurant, SignIn } from "@/services/Authservices";

export type SignupState = {
    success: boolean;
    message: string;
};

export type SigninState = {
    success: boolean;
    message: string;
    role?: string;
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

    if (
        typeof restaurantName !== "string" ||
        typeof phone !== "string" ||
        typeof city !== "string" ||
        typeof address !== "string" ||
        typeof adminName !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string" ||
        !restaurantName.trim() ||
        !phone.trim() ||
        !city.trim() ||
        !address.trim() ||
        !adminName.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
    ) {
        return {
            success: false,
            message: "Please fill in all fields.",
        };
    }

    if (password !== confirmPassword) {
        return {
            success: false,
            message: "Passwords do not match.",
        };
    }

    if (password.length < 8) {
        return {
            success: false,
            message: "Password must be at least 8 characters.",
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

        return {
            success: true,
            message: "Account created successfully!",
        };
    } catch (error) {
        console.error("Signup error:", error);

        if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
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