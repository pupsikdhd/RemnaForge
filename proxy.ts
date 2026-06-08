import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const userAgent = (request.headers.get("user-agent") || "").trim();
    const xHwid = request.headers.get("x-hwid");

    const isHapp = userAgent.startsWith("Happ");

    // Надежное распознавание User-Agent и наличия X-HWID для VPN-клиента Happ
    if (isHapp && xHwid) {
        const url = request.nextUrl.clone();
        const pathname = url.pathname;

        // Паттерн совпадения с /customer/[id], поддерживает любые символы ID
        const customerMatch = pathname.match(/^\/customer\/([^/]+)$/);
        if (customerMatch) {
            const id = customerMatch[1];
            // Без изменения URL в адресной строке клиента (rewrite), перенаправляем на API роут
            url.pathname = `/api/customer/${id}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/customer/:path*",
};
