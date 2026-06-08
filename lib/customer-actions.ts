"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword, isPasswordSet } from "@/lib/crypto";

export async function resetDevicesAction(clientId: string, password?: string) {
    const clientDb = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!clientDb) {
        throw new Error("Клиент не найден");
    }

    if (isPasswordSet(clientDb.passwordHash)) {
        if (!password || !verifyPassword(password, clientDb.passwordHash)) {
            throw new Error("Неверный защитный пароль");
        }
    }

    await prisma.client.update({
        where: { id: clientId },
        data: { devices: "[]" }
    });
    revalidatePath(`/customer/${clientId}`);
}

export async function setPasswordAction(clientId: string, password: string) {
    const clientDb = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!clientDb) {
        throw new Error("Клиент не найден");
    }

    if (isPasswordSet(clientDb.passwordHash)) {
        throw new Error("Пароль уже установлен");
    }

    const hashed = hashPassword(password);
    await prisma.client.update({
        where: { id: clientId },
        data: { passwordHash: hashed }
    });
    revalidatePath(`/customer/${clientId}`);
}

export async function changePasswordAction(clientId: string, oldPassword: string, newPassword: string) {
    const clientDb = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!clientDb) {
        throw new Error("Клиент не найден");
    }

    if (!isPasswordSet(clientDb.passwordHash)) {
        throw new Error("Пароль еще не установлен");
    }

    if (!verifyPassword(oldPassword, clientDb.passwordHash)) {
        throw new Error("Неверный текущий пароль");
    }

    const hashed = hashPassword(newPassword);
    await prisma.client.update({
        where: { id: clientId },
        data: { passwordHash: hashed }
    });
    revalidatePath(`/customer/${clientId}`);
}
