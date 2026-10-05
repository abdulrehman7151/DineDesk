"use server";

import { getUserFromToken } from "@/lib/authtoke";
import {
    createTable,
    deleteTable,
    updateTable,
} from "@/services/TableServices";

export async function createTableAction(data: {
    number: number;
    seats: number;
}) {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const table = await createTable({
            restaurantId: user.restaurantId,
            number: data.number,
            seats: data.seats,
        });

        return {
            success: true,
            message: "Table created successfully",
            table,
        };
    } catch (error) {
        console.error("Create table error:", error);

        return {
            success: false,
            message: "Failed to create table",
        };
    }
}

export async function updateTableAction(
    tableId: number,
    data: {
        number?: number;
        seats?: number;
    }
) {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const table = await updateTable(
            tableId,
            user.restaurantId,
            data
        );

        return {
            success: true,
            message: "Table updated successfully",
            table,
        };
    } catch (error) {
        console.error("Update table error:", error);

        return {
            success: false,
            message: "Failed to update table",
        };
    }
}

export async function deleteTableAction(tableId: number) {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const table = await deleteTable(
            tableId,
            user.restaurantId
        );

        return {
            success: true,
            message: "Table deleted successfully",
            table,
        };
    } catch (error) {
        console.error("Delete table error:", error);

        return {
            success: false,
            message: "Failed to delete table",
        };
    }
}