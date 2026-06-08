"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { setRegistrationSetting } from "./actions";

interface AdminHeaderProps {
    user: {
        username: string;
    };
    isRegistrationDisabled: boolean;
}

export default function AdminHeader({ user, isRegistrationDisabled }: AdminHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [regDisabled, setRegDisabled] = useState(isRegistrationDisabled);

    const handleToggleRegistration = async () => {
        setLoading(true);
        try {
            const nextValue = !regDisabled;
            await setRegistrationSetting(nextValue);
            setRegDisabled(nextValue);
            router.refresh();
        } catch (err) {
            console.error("Не удалось изменить настройки регистрации:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                router.push("/login");
                router.refresh();
            }
        } catch (err) {
            console.error("Ошибка при выходе:", err);
        }
    };

    return (
        <div>
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                            RemnaForge
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Администратор: <span className="font-medium text-zinc-800 dark:text-zinc-200">{user.username}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Кнопка блокировки регистрации администраторов */}
                    <button
                        onClick={handleToggleRegistration}
                        disabled={loading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 ${
                            regDisabled
                                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                        }`}
                        title={regDisabled ? "Разрешить регистрацию новых администраторов" : "Запретить регистрацию новых администраторов"}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${regDisabled ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                        {regDisabled ? "Регистрация закрыта" : "Регистрация открыта"}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-800 dark:hover:bg-zinc-900 transition-all text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Выйти
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="mt-6 flex gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-px">
                <Link
                    href="/admin"
                    className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                        pathname === "/admin"
                            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                    Клиенты доступа
                </Link>
                <Link
                    href="/admin/security"
                    className={`pb-2.5 text-sm font-medium transition-all relative cursor-pointer ${
                        pathname === "/admin/security"
                            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                    Безопасность (Passkeys)
                </Link>
            </div>
        </div>
    );
}
