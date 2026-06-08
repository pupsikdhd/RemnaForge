import { verifyRegistrationResponse } from "@simplewebauthn/server";
// ПОПРАВЛЕНО: isoBase64URL с заглавными буквами
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { validateRequest } from "@/lib/auth-validator";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { user } = await validateRequest();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("reg_challenge")?.value;

    if (!expectedChallenge) {
        return Response.json({ error: "Challenge expired or missing" }, { status: 400 });
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: process.env.NEXT_PUBLIC_WEBAUTHN_ORIGIN || "http://localhost:3000",
            expectedRPID: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || "localhost"
        });

        // ПОПРАВЛЕНО: Проверяем наличие нового вложенного объекта credential
        if (verification.verified && verification.registrationInfo?.credential) {

            // В свежих версиях все данные лежат внутри объекта credential
            const { id, publicKey, counter } = verification.registrationInfo.credential;

            // Записываем в базу, приводя Uint8Array к строкам через корректный хелпер
            await prisma.authenticator.create({
                data: {
                    id: id,
                    userId: user.id,
                    publicKey: isoBase64URL.fromBuffer(publicKey),
                    // SQLite не умеет в BigInt на уровне драйвера иногда,
                    // но Prisma 6 приводит BigInt к стандартному числу, если оно влезает
                    counter: BigInt(counter),
                    transports: JSON.stringify(body.response.transports || [])
                }
            });

            cookieStore.delete("reg_challenge");

            return Response.json({ verified: true });
        }

        return Response.json({ verified: false, error: "Verification failed" }, { status: 400 });
    } catch (error) {
        console.error(error); // Полезно логировать в консоль для дебага
        return Response.json({ error: "Internal error during verification" }, { status: 500 });
    }
}