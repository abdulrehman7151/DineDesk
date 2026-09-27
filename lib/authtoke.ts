import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(
    userId: number,
    email: string,
    role: string,
    restaurantId: number
) {
    const token = await new SignJWT({
        userId,
        email,
        role,
        restaurantId,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setExpirationTime("7d")
        .sign(secret);

    return token;
}

export async function getUserFromToken() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secret);

        return {
            userId: payload.userId as number,
            email: payload.email as string,
            role: payload.role as string,
            restaurantId: payload.restaurantId as number,
        };
    } catch {
        return null;
    }
}

export async function requireRole(allowedRoles: string[]) {
    const user = await getUserFromToken();

    if (!user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    return user;
}