import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { PrismaClient } from "@prisma/client";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get("login_challenge")?.value;

        if (!expectedChallenge) {
            return Response.json({ error: "Challenge expired or missing" }, { status: 400 });
        }

        // 1. Ищем зарегистрированный ключ в базе по его ID
        const credentialId = body.id;
        const authenticator = await prisma.authenticator.findUnique({
            where: { id: credentialId },
            include: { admin: true }
        });

        if (!authenticator) {
            return Response.json({ error: "Ключ не зарегистрирован в системе" }, { status: 400 });
        }

        // 2. Верифицируем подпись аппаратного ключа / passkey
        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: "http://localhost:3000", // В продакшене укажите ваш точный origin
            expectedRPID: "localhost",
            credential: {
                id: authenticator.id,
                publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
                counter: Number(authenticator.counter),
                transports: JSON.parse(authenticator.transports) as AuthenticatorTransport[],
            }
        });

        if (verification.verified && verification.authenticationInfo) {
            const { newCounter } = verification.authenticationInfo;

            // 3. Обновляем счетчик использования ключа для защиты от replay-атак
            await prisma.authenticator.update({
                where: { id: credentialId },
                data: { counter: BigInt(newCounter) }
            });

            // 4. Создаем сессию пользователя через Lucia Auth
            const session = await lucia.createSession(authenticator.userId, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

            // Удаляем временную куку челленджа
            cookieStore.delete("login_challenge");

            return Response.json({ verified: true });
        }

        return Response.json({ verified: false, error: "Не удалось проверить подпись ключа" }, { status: 400 });
    } catch (error) {
        console.error("WebAuthn verification error:", error);
        return Response.json({ error: "Ошибка сервера при авторизации" }, { status: 500 });
    }
}
