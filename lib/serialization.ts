import { Client as PrismaClient, Authenticator as PrismaAuthenticator } from "@prisma/client";
import { Client } from "@/types/client";
import { Authenticator } from "@/types/authenticator";

export function serializeClient(client: PrismaClient): Client {
    return {
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
        expiresAt: client.expiresAt.toISOString(),
    };
}

export function serializeAuthenticator(auth: PrismaAuthenticator): Authenticator {
    return {
        id: auth.id,
        userId: auth.userId,
        publicKey: auth.publicKey,
        counter: Number(auth.counter),
        transports: auth.transports,
    };
}
