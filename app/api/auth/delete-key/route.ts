import { PrismaClient } from "@prisma/client";
import { validateRequest } from "@/lib/auth-validator";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { user } = await validateRequest();
    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credentialId } = await request.json();

    // Считаем сколько ключей у юзера
    const userKeysCount = await prisma.authenticator.count({
        where: { userId: user.id }
    });

    if (userKeysCount <= 1) {
        return Response.json({ error: "Нельзя удалить единственный ключ доступа!" }, { status: 400 });
    }

    await prisma.authenticator.delete({
        where: { id: credentialId }
    });

    return Response.json({ success: true });
}