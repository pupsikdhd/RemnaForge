 // В Next.js куки берутся прямо из контекста запроса
import { lucia } from "./auth";
import type { User, Session } from "lucia";
 import {cookies} from "next/headers";

export async function validateRequest(): Promise<{ user: User; session: Session } | { user: null; session: null }> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
        return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId);

    try {
        // Если сессия валидна, но её время жизни подходит к концу, Lucia автоматически её обновит
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        // Если сессия протухла или невалидна, затираем куку в браузере
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
    } catch {
        // Игнорируем ошибки контекста Next.js, если куки меняются внутри чистого GET-рендеринга
    }

    return result;
}

export async function checkAuth(): Promise<boolean> {
    const { user } = await validateRequest();
    return !!user;
}