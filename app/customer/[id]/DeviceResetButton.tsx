"use client";

import { useState } from "react";

interface DeviceResetButtonProps {
    onReset: () => Promise<void>;
    disabled: boolean;
}

export default function DeviceResetButton({ onReset, disabled }: DeviceResetButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!confirm("Вы действительно хотите сбросить все привязанные устройства? Это позволит подключить новые устройства с этого момента.")) {
            return;
        }
        setLoading(true);
        try {
            await onReset();
        } catch (err) {
            console.error("Ошибка при сбросе устройств:", err);
            alert("Не удалось сбросить привязку устройств");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={disabled || loading}
            className="w-full text-center py-2 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] transition-all dark:border-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200 cursor-pointer"
        >
            {loading ? "Сброс..." : "Сбросить привязанные устройства"}
        </button>
    );
}
