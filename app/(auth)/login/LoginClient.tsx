"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import Link from "next/link";

export default function LoginClient() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Получаем опции для авторизации от сервера
            const url = username.trim() 
                ? `/api/auth/login-options?username=${encodeURIComponent(username.trim())}`
                : "/api/auth/login-options";

            const optionsRes = await fetch(url);
            if (!optionsRes.ok) {
                const errData = await optionsRes.json();
                throw new Error(errData.error || "Не удалось получить параметры входа");
            }

            const options = await optionsRes.json();

            // 2. Вызываем браузерное окно WebAuthn для подписи челленджа ключом
            const authResponse = await startAuthentication({
                optionsJSON: options,
            });

            // 3. Отправляем подпись обратно на сервер для верификации
            const verifyRes = await fetch("/api/auth/login-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(authResponse),
            });

            if (!verifyRes.ok) {
                const verifyData = await verifyRes.json();
                throw new Error(verifyData.error || "Ошибка проверки ключа");
            }

            const verifyResult = await verifyRes.json();

            if (verifyResult.verified) {
                router.push("/admin");
                router.refresh();
            } else {
                throw new Error("Не удалось верифицировать ключ");
            }
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            if (errorObject.name === "NotAllowedError") {
                setError("Операция отменена пользователем или время ожидания истекло.");
            } else {
                setError(errorObject.message || "Произошла неизвестная ошибка при входе");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans antialiased dark:bg-zinc-950 selection:bg-indigo-500/30">
            {/* Размытый фон */}
            <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 transition-all dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none">
                
                {/* Логотип */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                        />
                    </svg>
                </div>

                {/* Заголовок */}
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Вход в панель
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Авторизуйтесь с помощью Passkey или аппаратного ключа
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Имя пользователя (опционально)
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Например, admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600"
                        />
                        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                            Если оставить пустым, система попытается найти ключ на вашем устройстве автоматически
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                        {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.864 16.517L7.5 16.5c-.716 0-1.39-.377-1.763-1.006L3 11.25m16.5 1.5L18 16.5a2.25 2.25 0 0 1-2.25 2.25H9.75M3 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                                Войти с ключом доступа
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 border-t border-zinc-100 pt-4 text-center dark:border-zinc-800/80">
                    <Link
                        href="/register"
                        className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        Создать новый аккаунт администратора →
                    </Link>
                </div>
            </div>
        </div>
    );
}
