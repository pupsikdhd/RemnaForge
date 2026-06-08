"use server";

import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/lib/auth-validator";
import { revalidatePath } from "next/cache";

// Функция проверки авторизации
async function checkAuth() {
    const { user } = await validateRequest();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

// Получить список всех клиентов
export async function getClients() {
    await checkAuth();
    return prisma.client.findMany({
        orderBy: { createdAt: "desc" }
    });
}

// Создать нового клиента
export async function createClient(data: { name: string; expiresAt: string; maxDevices: number }) {
    await checkAuth();

    const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await prisma.client.create({
        data: {
            name: data.name.trim(),
            passwordHash: randomPassword,
            isActive: true,
            expiresAt: new Date(data.expiresAt),
            maxDevices: Number(data.maxDevices),
            devices: "[]",
        }
    });

    revalidatePath("/admin");
}

// Переключить статус активности клиента
export async function toggleClientStatus(id: string) {
    await checkAuth();

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new Error("Client not found");

    await prisma.client.update({
        where: { id },
        data: { isActive: !client.isActive }
    });

    revalidatePath("/admin");
}

// Удалить клиента
export async function deleteClient(id: string) {
    await checkAuth();

    await prisma.client.delete({ where: { id } });

    revalidatePath("/admin");
}

// Редактировать данные клиента
export async function updateClient(id: string, data: { name: string; expiresAt: string; maxDevices: number }) {
    await checkAuth();

    await prisma.client.update({
        where: { id },
        data: {
            name: data.name.trim(),
            expiresAt: new Date(data.expiresAt),
            maxDevices: Number(data.maxDevices),
        }
    });

    revalidatePath("/admin");
}

// Получить список аппаратных ключей текущего администратора
export async function getAuthenticators() {
    const user = await checkAuth();
    return prisma.authenticator.findMany({
        where: { userId: user.id }
    });
}

// Получить статус ограничения регистрации
export async function getRegistrationSetting() {
    await checkAuth();
    const setting = await prisma.systemSetting.findUnique({
        where: { key: "disableRegistration" }
    });
    return setting ? setting.value === "true" : false;
}

// Изменить статус ограничения регистрации
export async function setRegistrationSetting(disable: boolean) {
    await checkAuth();
    await prisma.systemSetting.upsert({
        where: { key: "disableRegistration" },
        update: { value: disable ? "true" : "false" },
        create: { key: "disableRegistration", value: disable ? "true" : "false" }
    });
    revalidatePath("/admin");
}
