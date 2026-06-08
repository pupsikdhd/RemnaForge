import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientSecurity from "./ClientSecurity";
import QRCodeImage from "./QRCodeImage";
import { headers } from "next/headers";
import { isPasswordSet } from "@/lib/crypto";
import { parseDevices, calculateUsagePercentage, generateVlessLink, generatePageUrl } from "@/lib/customer";
import { resetDevicesAction, setPasswordAction, changePasswordAction } from "@/lib/customer-actions";

export const dynamic = "force-dynamic";

interface CustomerPageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: CustomerPageProps) {
    const { id } = await params;
    
    const client = await prisma.client.findUnique({
        where: { id }
    });

    if (!client) {
        notFound();
    }

    const isExpired = new Date(client.expiresAt) < new Date();
    const isReady = client.isActive && !isExpired;

    const devicesList = parseDevices(client.devices);
    const usagePercentage = calculateUsagePercentage(devicesList.length, client.maxDevices);

    const headerList = await headers();
    const host = headerList.get("host") || "localhost:3000";
    const vlessLink = generateVlessLink(client, host);
    const pageUrl = generatePageUrl(client.id, host);

    const boundResetDevicesAction = resetDevicesAction.bind(null, client.id);
    const boundSetPasswordAction = setPasswordAction.bind(null, client.id);
    const boundChangePasswordAction = changePasswordAction.bind(null, client.id);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans antialiased dark:bg-zinc-950 selection:bg-indigo-500/30">
            {/* Размытый фон */}
            <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 transition-all dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none">
                
                {/* Статус-индикатор */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${isReady ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            {isReady ? "Подписка активна" : isExpired ? "Срок действия истек" : "Доступ заблокирован"}
                        </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">v2.0</span>
                </div>

                {/* Заголовок */}
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {client.name}
                </h1>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Ваш персональный профиль подключения к прокси
                </p>

                {/* Детали подписки */}
                <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-950/40">
                        <div className="text-xs text-zinc-400 dark:text-zinc-500">Срок действия:</div>
                        <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            до {new Date(client.expiresAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Устройства */}
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-950/40">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 dark:text-zinc-500">Привязано устройств:</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{devicesList.length} из {client.maxDevices}</span>
                        </div>
                        
                        {/* Прогресс-бар */}
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${usagePercentage >= 100 ? "bg-red-500" : usagePercentage >= 75 ? "bg-amber-500" : "bg-indigo-500"}`} 
                                style={{ width: `${usagePercentage}%` }}
                            />
                        </div>

                        {devicesList.length > 0 && (
                            <div className="mt-3.5 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
                                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Активные сессии устройств:</span>
                                {devicesList.map((device, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                                        <span className="h-1 w-1 rounded-full bg-zinc-400" />
                                        {device}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <ClientSecurity
                                isPwdSet={isPasswordSet(client.passwordHash)}
                                devicesCount={devicesList.length}
                                resetDevicesAction={boundResetDevicesAction}
                                setPasswordAction={boundSetPasswordAction}
                                changePasswordAction={boundChangePasswordAction}
                            />
                        </div>
                    </div>

                    {/* Реквизиты подключения */}
                    {isReady && (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/30 dark:bg-indigo-950/10 space-y-4">
                            <div>
                                <span className="block text-xs font-medium text-indigo-700 dark:text-indigo-400">Ваш ключ доступа (UUID):</span>
                                <div className="mt-1.5 flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-indigo-100 dark:bg-zinc-950 dark:border-indigo-950/50">
                                    <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all select-all font-medium">
                                        {client.id}
                                    </code>
                                </div>
                            </div>

                            {/* QR-код для быстрого импорта */}
                            <div className="pt-2 border-t border-indigo-100/30 dark:border-indigo-950/30 flex justify-center">
                                <QRCodeImage text={pageUrl} />
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
