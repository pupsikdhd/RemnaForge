import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    const userAgent = (request.headers.get("user-agent") || "").trim();
    const xHwid = request.headers.get("x-hwid");

    const isHapp = userAgent.startsWith("Happ");

    if (!isHapp || !xHwid) {
        return new Response(JSON.stringify({ error: "Access Denied" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Ищем клиента в базе
    const client = await prisma.client.findUnique({
        where: { id }
    });

    if (!client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    const isExpired = new Date(client.expiresAt) < new Date();
    if (!client.isActive || isExpired) {
        return new Response(JSON.stringify({ error: "Subscription is inactive or expired" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Проверка лимита устройств
    let devicesList: string[] = [];
    try {
        devicesList = JSON.parse(client.devices || "[]");
    } catch {}

    if (!devicesList.includes(xHwid)) {
        if (devicesList.length >= client.maxDevices) {
            return new Response(JSON.stringify({ error: "Device limit reached" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }
        devicesList.push(xHwid);
        
        // Сохраняем новое устройство в базу
        await prisma.client.update({
            where: { id },
            data: { devices: JSON.stringify(devicesList) }
        });
    }

    // Получаем URL удаленного сервера подписок из .env
    const backendUrl = process.env.SUB_BACKEND_URL;
    if (!backendUrl) {
        return new Response(JSON.stringify({ error: "Backend subscription URL is not configured in .env" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Хелпер для получения заголовков: приоритетно из .env, иначе из запроса клиента
    const getHeaderValue = (headerName: string, envVarName: string) => {
        return process.env[envVarName] || request.headers.get(headerName) || "";
    };

    const headers = new Headers();
    headers.set("X-HWID", getHeaderValue("x-hwid", "DEFAULT_X_HWID"));
    headers.set("X-Device-OS", getHeaderValue("x-device-os", "DEFAULT_X_DEVICE_OS"));
    headers.set("X-Ver-OS", getHeaderValue("x-ver-os", "DEFAULT_X_VER_OS"));
    headers.set("User-Agent", getHeaderValue("user-agent", "DEFAULT_USER_AGENT"));
    headers.set("X-Device-Model", getHeaderValue("x-device-model", "DEFAULT_X_DEVICE_MODEL"));
    headers.set("X-App-Version", getHeaderValue("x-app-version", "DEFAULT_X_APP_VERSION"));
    headers.set("Accept-Encoding", getHeaderValue("accept-encoding", "DEFAULT_ACCEPT_ENCODING"));

    try {
        const response = await fetch(backendUrl, {
            method: "GET",
            headers,
        });

        const data = await response.arrayBuffer();

        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (["content-type", "content-disposition", "cache-control"].includes(lowerKey)) {
                responseHeaders.set(key, value);
            }
        });

        return new Response(data, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (err) {
        console.error("Failed to query remote subscription URL:", err);
        return new Response(JSON.stringify({ error: "Error contacting remote subscription server" }), {
            status: 502,
            headers: { "Content-Type": "application/json" }
        });
    }
}
