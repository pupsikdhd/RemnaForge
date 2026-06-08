"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";
import Link from "next/link";

interface RegisterClientProps {
    isRegistrationDisabled: boolean;
}

export default function RegisterClient({ isRegistrationDisabled }: RegisterClientProps) {
    const [step, setStep] = useState<"username" | "passkey">("username");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        isRegistrationDisabled ? "Регистрация новых администраторов временно отключена" : null
    );
    const router = useRouter();

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegistrationDisabled) {
            setError("Регистрация новых администраторов временно отключена");
            return;
        }

        if (!username || username.trim().length < 3) {
            setError("Имя пользователя должно содержать не менее 3 символов");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Создаем аккаунт и автоматически создаем сессию
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось создать аккаунт");
            }

            // Переходим к шагу регистрации аппаратного ключа / passkey
            setStep("passkey");
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Ошибка при регистрации");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPasskey = async () => {
        if (isRegistrationDisabled) {
            setError("Регистрация новых администраторов временно отключена");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Получаем опции для регистрации ключа от сервера (юзер уже залогинен)
            const optionsRes = await fetch("/api/auth/register-options");
            if (!optionsRes.ok) {
                const errData = await optionsRes.json();
                throw new Error(errData.error || "Не удалось получить параметры регистрации");
            }

            const options = await optionsRes.json();

            // 2. Вызываем браузерный интерфейс создания ключа
            const regResponse = await startRegistration({
                optionsJSON: options,
            });

            // 3. Отправляем результат для проверки и сохранения на сервере
            const verifyRes = await fetch("/api/auth/register-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regResponse),
            });

            if (!verifyRes.ok) {
                const verifyData = await verifyRes.json();
                throw new Error(verifyData.error || "Не удалось верифицировать ключ");
            }

            const verifyResult = await verifyRes.json();

            if (verifyResult.verified) {
                // Перенаправляем администратора в личный кабинет
                router.push("/admin");
                router.refresh();
            } else {
                throw new Error("Верификация ключа не пройдена");
            }
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            if (errorObject.name === "NotAllowedError") {
                setError("Операция отменена пользователем или истекло время ожидания.");
            } else {
                setError(errorObject.message || "Произошла ошибка при регистрации ключа.");
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
                            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                        />
                    </svg>
                </div>

                {/* Заголовок */}
                {step === "username" ? (
                    <>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Регистрация администратора
                        </h1>
                        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                            Создайте новый профиль для управления сервером
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Привязка аппаратного ключа
                        </h1>
                        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                            Добавьте Passkey (Face ID / Touch ID / Yubikey) для входа
                        </p>
                    </>
                )}

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                {step === "username" ? (
                    <form onSubmit={handleCreateAccount} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                                Имя пользователя
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                placeholder="Например, admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading || isRegistrationDisabled}
                                className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isRegistrationDisabled}
                            className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                "Продолжить"
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="mt-6 space-y-4">
                        <div className="rounded-lg bg-amber-50 p-3.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                            <span className="font-semibold block mb-0.5">Внимание!</span>
                            Для этого аккаунта не задан классический пароль. Вы сможете заходить в систему только с помощью зарегистрированного физического ключа или Passkey.
                        </div>

                        <button
                            type="button"
                            onClick={handleRegisterPasskey}
                            disabled={loading || isRegistrationDisabled}
                            className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
                                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>
                                    Создать и привязать ключ
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div className="mt-8 border-t border-zinc-100 pt-4 text-center dark:border-zinc-800/80">
                    <Link
                        href="/login"
                        className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        Уже есть аккаунт? Войти →
                    </Link>
                </div>
            </div>
        </div>
    );
}
