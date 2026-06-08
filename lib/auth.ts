import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Связываем сессии и админов из схемы Prisma с Lucia
const adapter = new PrismaAdapter(prisma.session, prisma.admin);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        // имя куки, которая будет лететь в браузер
        name: "auth_session",
        expires: false, // кука будет жить долго, валидность проверяем по БД
        attributes: {
            // в продакшене кука должна быть Secure (только HTTPS)
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        }
    },
    // Какие данные из таблицы Admin мы хотим автоматически подмешивать в объект сессии
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username
        };
    }
});

// Важно для TypeScript, чтобы он понимал типы данных пользователя
declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
}