import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    let allowCredentials;

    if (username) {
        const user = await prisma.admin.findUnique({
            where: { username: username.trim() },
            include: { authenticators: true }
        });

        if (user && user.authenticators.length > 0) {
            allowCredentials = user.authenticators.map((auth) => ({
                id: auth.id,
                type: "public-key" as const,
                transports: JSON.parse(auth.transports) as AuthenticatorTransport[],
            }));
        }
    }

    const options = await generateAuthenticationOptions({
        rpID: "localhost", // В продакшене замените на ваш домен без протокола
        userVerification: "preferred",
        allowCredentials,
    });

    const cookieStore = await cookies();
    cookieStore.set("login_challenge", options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 300, // 5 минут
        sameSite: "lax"
    });

    return Response.json(options);
}
