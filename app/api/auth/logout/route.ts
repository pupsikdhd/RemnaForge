import { validateRequest } from "@/lib/auth-validator";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
    // 1. Проверяем, активна ли сессия вообще
    const { session } = await validateRequest();

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Дропаем сессию из SQLite (аналог твоего redis.del(sessionId))
    await lucia.invalidateSession(session.id);

    // 3. Стираем куку у клиента
    const cookieStore = await cookies();
    const blankCookie = lucia.createBlankSessionCookie();
    cookieStore.set(blankCookie.name, blankCookie.value, blankCookie.attributes);

    return Response.json({ success: true });
}