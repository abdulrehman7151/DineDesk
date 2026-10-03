// hotel-mangement/services/Authservices.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/authtoke";
import { createUniqueSlug } from "@/lib/slug";

type SignupData = {
    name: string;
    email: string;
    password: string;
    restaurantName: string;
    city: string;
    address: string;
    phone: string;
};

type SignInData = {
    email: string;
    password: string;
};

export type SignInResult =
    | {
        success: false;
        message: string;
    }
    | {
        success: true;
        message: string;
        token: string;
        role: string;
    };

export async function createUserAndRestaurant(data: SignupData) {
    // 1. Generate a unique slug BEFORE opening the transaction,
    //    since createUniqueSlug performs its own DB reads.
    const slug = await createUniqueSlug(data.restaurantName);

    // 2. Guard against duplicate emails.
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error("This email is already registered.");
    }

    // 3. Create user + restaurant + membership atomically.
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
            },
        });

        const restaurant = await tx.restaurant.create({
            data: {
                name: data.restaurantName,
                slug,
                city: data.city,
                address: data.address,
                phone: data.phone,
                ownerId: user.id,
            },
        });

        const membership = await tx.restaurantUser.create({
            data: {
                userId: user.id,
                restaurantId: restaurant.id,
                role: "admin",
            },
        });

        return {
            user,
            restaurant,
            membership,
        };
    });
}

export async function SignIn(data: SignInData): Promise<SignInResult> {
    const findUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
        include: {
            memberships: {
                select: {
                    role: true,
                    restaurantId: true,
                },
            },
        },
    });

    if (!findUser) {
        return {
            success: false,
            message: "No account found with this email address.",
        };
    }

    const passwordCorrect = await bcrypt.compare(
        data.password,
        findUser.password
    );

    if (!passwordCorrect) {
        return {
            success: false,
            message: "Incorrect password.",
        };
    }

    const membership = findUser.memberships[0];

    if (!membership) {
        return {
            success: false,
            message: "No restaurant membership found.",
        };
    }

    const token = await createToken(
        findUser.id,
        findUser.email,
        membership.role,
        membership.restaurantId
    );

    return {
        success: true,
        message: "Sign in successful.",
        token,
        role: membership.role,
    };
}