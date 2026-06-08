"use client";

import { useState, useEffect } from "react";

import { Client } from "@/types/client";


interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, maxDevices: number, expiresAt: string) => Promise<void>;
    loading: boolean;
}

export function CreateClientModal({ isOpen, onClose, onSubmit, loading }: CreateClientModalProps) {
    const [name, setName] = useState("");
    const [maxDevices, setMaxDevices] = useState(2);
    const [expiresAt, setExpiresAt] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName("");
            setMaxDevices(2);
            const d = new Date();
            d.setDate(d.getDate() + 30);
            setExpiresAt(d.toISOString().split("T")[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(name, maxDevices, expiresAt);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                    Создание клиента доступа
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Имя клиента
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Например, Саня водопровод"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Максимум устройств
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={10}
                            value={maxDevices}
                            onChange={(e) => setMaxDevices(Number(e.target.value))}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Активен до
                        </label>
                        <input
                            type="date"
                            required
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3.5 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Создание..." : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface EditClientModalProps {
    isOpen: boolean;
    client: Client | null;
    onClose: () => void;
    onSubmit: (name: string, maxDevices: number, expiresAt: string) => Promise<void>;
    loading: boolean;
}

export function EditClientModal({ isOpen, client, onClose, onSubmit, loading }: EditClientModalProps) {
    const [name, setName] = useState("");
    const [maxDevices, setMaxDevices] = useState(2);
    const [expiresAt, setExpiresAt] = useState("");


    useEffect(() => {
        if (isOpen && client) {
            setName(client.name);
            setMaxDevices(client.maxDevices);
            setExpiresAt(client.expiresAt.split("T")[0]);
        }
    }, [isOpen, client]);

    if (!isOpen || !client) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(name, maxDevices, expiresAt);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                    Редактирование клиента
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Имя клиента
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Максимум устройств
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={10}
                            value={maxDevices}
                            onChange={(e) => setMaxDevices(Number(e.target.value))}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Активен до
                        </label>
                        <input
                            type="date"
                            required
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:placeholder-zinc-600 disabled:opacity-50"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3.5 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
