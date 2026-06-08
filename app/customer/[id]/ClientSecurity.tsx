"use client";

import { useState } from "react";

interface ClientSecurityProps {
    isPwdSet: boolean;
    devicesCount: number;
    resetDevicesAction: (password?: string) => Promise<void>;
    setPasswordAction: (password: string) => Promise<void>;
    changePasswordAction: (oldPassword: string, newPassword: string) => Promise<void>;
}

type Mode = "idle" | "reset-confirm" | "reset-password" | "set-pwd" | "change-pwd";

export default function ClientSecurity({
    isPwdSet,
    devicesCount,
    resetDevicesAction,
    setPasswordAction,
    changePasswordAction
}: ClientSecurityProps) {
    const [mode, setMode] = useState<Mode>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form inputs
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    const resetForm = () => {
        setPassword("");
        setConfirmPassword("");
        setOldPassword("");
        setError(null);
    };

    const handleCancel = () => {
        setMode("idle");
        resetForm();
    };

    const triggerSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 5000);
    };

    const handleResetDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            await resetDevicesAction(isPwdSet ? password : undefined);
            triggerSuccess("Привязка устройств успешно сброшена!");
            setMode("idle");
            resetForm();
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            setError(errorObject.message || "Не удалось сбросить привязку устройств");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("Пожалуйста, введите пароль");
            return;
        }
        if (password.length < 4) {
            setError("Пароль должен быть не менее 4 символов");
            return;
        }
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await setPasswordAction(password);
            triggerSuccess("Пароль успешно установлен!");
            setMode("idle");
            resetForm();
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            setError(errorObject.message || "Не удалось установить пароль");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword) {
            setError("Введите текущий пароль");
            return;
        }
        if (!password) {
            setError("Введите новый пароль");
            return;
        }
        if (password.length < 4) {
            setError("Новый пароль должен быть не менее 4 символов");
            return;
        }
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await changePasswordAction(oldPassword, password);
            triggerSuccess("Пароль успешно изменен!");
            setMode("idle");
            resetForm();
        } catch (err) {
            console.error(err);
            const errorObject = err as Error;
            setError(errorObject.message || "Не удалось изменить пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Status alerts */}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50/50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-950/30 animate-fadeIn">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMsg}</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50/50 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-950/30 animate-fadeIn">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {mode === "idle" && (
                <div className="space-y-2.5">
                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            if (isPwdSet) {
                                setMode("reset-password");
                            } else {
                                setMode("reset-confirm");
                            }
                        }}
                        disabled={devicesCount === 0 || loading}
                        className="w-full text-center py-2.5 text-xs font-semibold rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60 active:scale-[0.98] transition-all disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                    >
                        Сбросить привязанные устройства
                    </button>

                    {/* Password Config Line */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                            {isPwdSet ? (
                                <>
                                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Защита паролем активна</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Рекомендуется установить пароль</span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                if (isPwdSet) {
                                    setMode("change-pwd");
                                } else {
                                    setMode("set-pwd");
                                }
                            }}
                            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                            {isPwdSet ? "Изменить пароль" : "Установить пароль"}
                        </button>
                    </div>
                </div>
            )}

            {/* Mode: reset-confirm (No password set) */}
            {mode === "reset-confirm" && (
                <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-3.5 dark:border-amber-950/30 dark:bg-amber-950/10 space-y-3 animate-fadeIn">
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-normal font-medium">
                        Вы действительно хотите сбросить все устройства? Любой человек с этой ссылкой сможет сбросить привязку. Рекомендуется сначала установить пароль.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleResetDevices}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer"
                        >
                            {loading ? "Сброс..." : "Да, сбросить"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Mode: reset-password (Password is set) */}
            {mode === "reset-password" && (
                <div className="rounded-xl border border-zinc-250/60 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-3 animate-fadeIn">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        Для сброса устройств введите ваш защитный пароль:
                    </p>
                    <input
                        type="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleResetDevices}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Проверка..." : "Подтвердить сброс"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Mode: set-pwd (Setting password for the first time) */}
            {mode === "set-pwd" && (
                <form onSubmit={handleSetPassword} className="rounded-xl border border-zinc-250/60 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-3 animate-fadeIn">
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Установка защитного пароля</div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
                        После установки пароля сбросить привязанные устройства можно будет только введя этот пароль.
                    </p>
                    <div className="space-y-2">
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите новый пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}

            {/* Mode: change-pwd (Changing password) */}
            {mode === "change-pwd" && (
                <form onSubmit={handleChangePassword} className="rounded-xl border border-zinc-250/60 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 space-y-3 animate-fadeIn">
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Изменение защитного пароля</div>
                    <div className="space-y-2">
                        <input
                            type="password"
                            placeholder="Текущий пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите новый пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
