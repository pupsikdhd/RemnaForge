export function parseDevices(devicesJson: string | null): string[] {
    try {
        return JSON.parse(devicesJson || "[]");
    } catch {
        return [];
    }
}

export function calculateUsagePercentage(devicesCount: number, maxDevices: number): number {
    return Math.min((devicesCount / maxDevices) * 100, 100);
}

export function generateVlessLink(client: { id: string; name: string }, hostHeader: string | null): string {
    const reqDomain = (hostHeader || "localhost:3000").split(":")[0];
    const domain = process.env.APP_DOMAIN || reqDomain;
    return `vless://${client.id}@${domain}:443?encryption=none&security=reality&type=tcp#${encodeURIComponent(client.name)}`;
}

export function generatePageUrl(clientId: string, hostHeader: string | null): string {
    const reqDomain = hostHeader || "localhost:3000";
    const domain = process.env.APP_DOMAIN || reqDomain;
    // В продакшене используем https, в локальной разработке - http
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${domain}/customer/${clientId}`;
}
