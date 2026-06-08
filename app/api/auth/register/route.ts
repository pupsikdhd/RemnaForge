import { PrismaClient } from "@prisma/client";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username || typeof username !== "string" || username.trim().length < 3) {
            return Response.json({ error: "Неверное имя пользователя" }, { status: 400 });
        }

        // Проверяем, не отключена ли регистрация новых администраторов
        const registrationSetting = await prisma.systemSetting.findUnique({
            where: { key: "disableRegistration" }
        });
        if (registrationSetting && registrationSetting.value === "true") {
            return Response.json({ error: "Регистрация новых администраторов временно отключена" }, { status: 403 });
        }

        // 1. Проверяем, нет ли уже такого админа
        const existingUser = await prisma.admin.findUnique({
            where: { username: username.trim() }
        });

        if (existingUser) {
            return Response.json({ error: "Имя пользователя уже занято" }, { status: 400 });
        }

        // 2. Создаем админа в SQLite
        const newAdmin = await prisma.admin.create({
            data: { username: username.trim() }
        });

        // 3. Сразу создаем сессию (как ты делал в .NET)
        const session = await lucia.createSession(newAdmin.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        const cookieStore = await cookies();
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}