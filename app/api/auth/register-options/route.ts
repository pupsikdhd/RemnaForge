import { generateRegistrationOptions } from "@simplewebauthn/server";
import { validateRequest } from "@/lib/auth-validator";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client"; // Добавляем призму

const prisma = new PrismaClient();

export async function GET() {
    const { user } = await validateRequest();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Получаем из базы все существующие ключи пользователя
    const userAuthenticators = await prisma.authenticator.findMany({
        where: { userId: user.id },
        select: { id: true, transports: true } // Нам нужны только ID и транспорты
    });

    // 2. Генерируем опции для WebAuthn
    const options = await generateRegistrationOptions({
        rpName: "Aeza Home Auth",
        rpID: "localhost",
        userID: new TextEncoder().encode(user.id),
        userName: user.username,
        attestationType: "none",

        // ПЕРЕДАЕМ СУЩЕСТВУЮЩИЕ КЛЮЧИ В ИСКЛЮЧЕНИЯ
        excludeCredentials: userAuthenticators.map(auth => ({
            id: auth.id, // В Prisma id уже строка (base64url), simplewebauthn её переварит
            type: 'public-key',
            transports: auth.transports ? JSON.parse(auth.transports) : undefined,
        })),

        authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred"
        }
    });

    const cookieStore = await cookies();
    cookieStore.set("reg_challenge", options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 300,
        sameSite: "lax"
    });

    return Response.json(options);
}