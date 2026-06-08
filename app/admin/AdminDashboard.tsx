"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    createClient,
    deleteClient,
    toggleClientStatus,
    updateClient,
} from "./actions";
import ClientsTable from "./ClientsTable";
import { CreateClientModal, EditClientModal } from "./ClientModals";
import { Client } from "@/types/client";


interface AdminDashboardProps {
    initialClients: Client[];
}

export default function AdminDashboard({
    initialClients,
}: AdminDashboardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Состояния для модалок
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyLink = (clientId: string) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const link = `${origin}/customer/${clientId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(clientId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreateClientSubmit = async (name: string, maxDevices: number, expiresAt: string) => {
        setLoading(true);
        setError(null);
        try {
            await createClient({
                name,
                maxDevices,
                expiresAt,
            });
            setIsCreateModalOpen(false);
            setSuccess("Клиент успешно создан!");
            setTimeout(() => setSuccess(null), 3000);
            router.refresh();
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Не удалось создать клиента");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (client: Client) => {
        setCurrentClient(client);
        setIsEditModalOpen(true);
    };

    const handleUpdateClientSubmit = async (name: string, maxDevices: number, expiresAt: string) => {
        if (!currentClient) return;
        setLoading(true);
        setError(null);
        try {
            await updateClient(currentClient.id, {
                name,
                maxDevices,
                expiresAt,
            });
            setIsEditModalOpen(false);
            setCurrentClient(null);
            setSuccess("Данные клиента обновлены");
            setTimeout(() => setSuccess(null), 3000);
            router.refresh();
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Не удалось обновить клиента");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить этого клиента?")) return;
        setError(null);
        try {
            await deleteClient(id);
            setSuccess("Клиент удален");
            setTimeout(() => setSuccess(null), 3000);
            router.refresh();
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Ошибка удаления");
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleClientStatus(id);
            router.refresh();
        } catch (err) {
            const errorObject = err as Error;
            setError(errorObject.message || "Ошибка смены статуса");
        }
    };

    return (
        <div>
            {/* Уведомления */}
            {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                    {error}
                </div>
            )}
            {success && (
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    {success}
                </div>
            )}

            {/* Actions bar */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Всего клиентов: {initialClients.length}
                </h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-zinc-900 px-3.5 py-1.8 text-xs font-medium text-white rounded-lg hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
                    </svg>
                    Создать клиента
                </button>
            </div>

            {/* Таблица клиентов */}
            <ClientsTable
                clients={initialClients}
                copiedId={copiedId}
                onCopyLink={handleCopyLink}
                onToggleStatus={handleToggleStatus}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClient}
            />

            {/* Модалки */}
            <CreateClientModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateClientSubmit}
                loading={loading}
            />

            <EditClientModal
                isOpen={isEditModalOpen}
                client={currentClient}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setCurrentClient(null);
                }}
                onSubmit={handleUpdateClientSubmit}
                loading={loading}
            />
        </div>
    );
}
