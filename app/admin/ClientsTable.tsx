"use client";

import { Client } from "@/types/client";


interface ClientsTableProps {
    clients: Client[];
    copiedId: string | null;
    onCopyLink: (id: string) => void;
    onToggleStatus: (id: string) => void;
    onEditClick: (client: Client) => void;
    onDeleteClick: (id: string) => void;
}

export default function ClientsTable({
    clients,
    copiedId,
    onCopyLink,
    onToggleStatus,
    onEditClick,
    onDeleteClick,
}: ClientsTableProps) {
    const isClientExpired = (expiresAtStr: string) => {
        return new Date(expiresAtStr) < new Date();
    };

    if (clients.length === 0) {
        return (
            <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-8 h-8 mx-auto text-zinc-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                </svg>
                <h3 className="mt-3 text-xs font-medium text-zinc-900 dark:text-zinc-50">Нет клиентов</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Добавьте вашего первого клиента для предоставления доступа.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40">
            <table className="w-full text-left border-collapse text-xs">
                <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400">
                        <th className="p-4 font-medium">Имя / ID</th>
                        <th className="p-4 font-medium">Статус</th>
                        <th className="p-4 font-medium">Лимит устройств</th>
                        <th className="p-4 font-medium">Срок действия</th>
                        <th className="p-4 font-medium">Ссылка подписки</th>
                        <th className="p-4 font-medium text-right">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {clients.map((client) => {
                        const expired = isClientExpired(client.expiresAt);
                        return (
                            <tr key={client.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{client.name}</div>
                                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 select-all">
                                        {client.id}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {!client.isActive ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                            Выключен
                                        </span>
                                    ) : expired ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                            Истек
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            Активен
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 font-mono">{client.maxDevices} устр.</td>
                                <td className="p-4">
                                    <div className={`${expired ? "text-red-500 font-medium" : ""}`}>
                                        {new Date(client.expiresAt).toLocaleDateString("ru-RU")}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => onCopyLink(client.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 rounded-md border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer text-[11px]"
                                    >
                                        {copiedId === client.id ? (
                                            <span className="text-emerald-500 font-medium">Скопировано!</span>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-3 h-3 text-zinc-500"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.4M9 2.25H18a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 20.25H9M2.25 12h18"
                                                    />
                                                </svg>
                                                Скопировать
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => onToggleStatus(client.id)}
                                        className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                                            client.isActive
                                                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400"
                                                : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400"
                                        }`}
                                        title={client.isActive ? "Выключить" : "Включить"}
                                    >
                                        {client.isActive ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-3.5 h-3.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5.636 5.636a9 9 0 1 0 12.728 12.728M5.636 5.636l12.728 12.728"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-3.5 h-3.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onEditClick(client)}
                                        className="p-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-colors cursor-pointer"
                                        title="Редактировать"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-3.5 h-3.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(client.id)}
                                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:border-red-900/50 dark:text-red-400 transition-colors cursor-pointer"
                                        title="Удалить"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-3.5 h-3.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                            />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
