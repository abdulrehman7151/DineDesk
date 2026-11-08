import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

type CreateTableData = {
    restaurantId: number;
    number: number;
    seats: number;
};

export async function createTable(data: CreateTableData) {
    const table = await prisma.table.create({
        data: {
            qrToken: randomBytes(16).toString("hex"),
            number: data.number,
            seats: data.seats,
            restaurantId: data.restaurantId,
        },
    });

    return table;
}

export async function getTables(restaurantId: number) {
    const tables = await prisma.table.findMany({
        where: {
            restaurantId,
        },
        orderBy: {
            number: "asc",
        },
    });

    return tables;
}

export async function getTableById(
    tableId: number,
    restaurantId: number
) {
    const table = await prisma.table.findFirst({
        where: {
            id: tableId,
            restaurantId,
        },
    });

    return table;
}

export async function updateTable(
    tableId: number,
    restaurantId: number,
    data: {
        number?: number;
        seats?: number;
    }
) {
    const table = await prisma.table.updateMany({
        where: {
            id: tableId,
            restaurantId,
        },
        data,
    });

    return table;
}

export async function deleteTable(
    tableId: number,
    restaurantId: number
) {
    const table = await prisma.table.deleteMany({
        where: {
            id: tableId,
            restaurantId,
        },
    });

    return table;
}