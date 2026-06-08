"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";

import { Authenticator } from "@/types/authenticator";


interface SecurityDashboardProps {
    user: {
        id: string;
        username: string;
    };
    initialAuthenticators: Authenticator[];
}

export default function SecurityDashboard({
    initialAuthenticators,
}: SecurityDashboardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegisterNewKey = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const optionsRes = await fetch("/api/auth/register-options");
            if (!optionsRes.ok) {
                const errData = await optionsRes.json();
                throw new Error(errData.error || "Не удалось получить опции");
            }
            const options = await optionsRes.json();

            const regResponse = await startRegistration({
                optionsJSON: options,
            });

            const verifyRes = await fetch("/api/auth/register-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regResponse),
            });

            if (!verifyRes.ok) {
                const verifyData = await verifyRes.json();
                throw new Error(verifyData.error || "Верификация не пройдена");
            }

            const verifyResult = await verifyRes.json();
            if (verifyResult.verified) {
                setSuccess("Новый ключ успешно привязан!");
                setTimeout(() => setSuccess(null), 4000);
                router.refresh();
            } else {
                throw new Error("Не удалось сохранить ключ");
            }
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            if (errorObject.name === "NotAllowedError") {
                setError("Операция отменена или таймаут.");
            } else {
                setError(errorObject.message || "Ошибка при привязке нового ключа");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!confirm("Вы действительно хотите удалить этот ключ доступа?")) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/delete-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credentialId: keyId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Не удалось удалить ключ");
            }

            setSuccess("Ключ успешно удален");
            setTimeout(() => setSuccess(null), 3000);
            router.refresh();
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Ошибка при удалении ключа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Уведомления */}
            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    {success}
                </div>
            )}

            {/* Passkey details bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Ключи безопасности для входа
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Вы можете добавить несколько ключей (например, Face ID на телефоне и Yubikey) для резервного входа.
                    </p>
                </div>
                <button
                    onClick={handleRegisterNewKey}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 bg-zinc-900 px-3.5 py-1.8 text-xs font-medium text-white rounded-lg hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all cursor-pointer disabled:opacity-50"
                >
                    {loading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                        </svg>
                    )}
                    Привязать новый ключ
                </button>
            </div>

            {/* Authenticators List */}
            {initialAuthenticators.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 mx-auto text-zinc-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <h3 className="mt-3 text-xs font-medium text-zinc-900 dark:text-zinc-50">Нет ключей доступа</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Привяжите аппаратный ключ или Passkey для безопасного входа.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {initialAuthenticators.map((auth, index) => {
                        let transportsList: string[] = [];
                        try {
                            transportsList = JSON.parse(auth.transports);
                        } catch {}

                        return (
                            <div
                                key={auth.id}
                                className="p-4 rounded-xl border border-zinc-200/60 bg-white dark:bg-zinc-900/40 dark:border-zinc-800/60 flex items-start justify-between gap-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-indigo-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                                        </svg>
                                        <span className="text-xs font-semibold text-zinc-950 dark:text-white">
                                            Ключ #{index + 1}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 break-all select-all pr-2">
                                        ID: {auth.id.substring(0, 15)}...
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 text-[9px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-mono">
                                            Счетчик: {auth.counter}
                                        </span>
                                        {transportsList.map((t) => (
                                            <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-[9px] text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteKey(auth.id)}
                                    disabled={initialAuthenticators.length <= 1}
                                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600 dark:hover:bg-red-950/20 disabled:pointer-events-none disabled:opacity-30 transition-colors cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                    title={initialAuthenticators.length <= 1 ? "Нельзя удалить единственный ключ" : "Удалить ключ"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
