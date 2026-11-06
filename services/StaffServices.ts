// services/StaffServices.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

type CreateStaffData = {
    restaurantId: number;
    name: string;
    email: string;
    role: string;
    password: string;
};

export async function createStaffMember(data: CreateStaffData) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
            where: { email: data.email },
        });
        const createdUser = !user;

        if (!user) {
            user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: passwordHash,
                },
            });
        }

        const existingLink = await tx.restaurantUser.findUnique({
            where: {
                userId_restaurantId: {
                    userId: user.id,
                    restaurantId: data.restaurantId,
                },
            },
        });

        if (existingLink) {
            throw new Error("This person is already a member of your restaurant.");
        }

        const membership = await tx.restaurantUser.create({
            data: {
                userId: user.id,
                restaurantId: data.restaurantId,
                role: data.role,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return { membership, createdUser };
    }, {
        maxWait: 30000,
        timeout: 60000,
    });
}

/** All staff (members) of a restaurant, joined with their User row. */
export async function getStaffByRestaurant(restaurantId: number) {
    return prisma.restaurantUser.findMany({
        where: { restaurantId },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { id: "desc" },
    });
}

export async function setStaffActive(
    membershipId: number,
    restaurantId: number,
    isActive: boolean
) {
    return prisma.restaurantUser.updateMany({
        where: { id: membershipId, restaurantId },
        data: { isActive },
    });
}