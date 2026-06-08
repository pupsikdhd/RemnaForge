"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
    text: string;
}

export default function QRCodeImage({ text }: QRCodeImageProps) {
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    useEffect(() => {
        QRCode.toDataURL(text, { 
            width: 250, 
            margin: 1.5,
            color: {
                dark: "#000000",
                light: "#ffffff"
            }
        })
            .then((url) => setQrUrl(url))
            .catch((err) => console.error("Error generating QR code:", err));
    }, [text]);

    if (!qrUrl) {
        return (
            <div className="mx-auto h-[250px] w-[250px] bg-zinc-100 animate-pulse rounded-xl dark:bg-zinc-800" />
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl border border-zinc-200/80 shadow-md dark:border-zinc-800">
                <img
                    src={qrUrl}
                    alt="QR-код для подключения"
                    className="w-[200px] h-[200px] block"
                />
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                Отсканируйте код в приложении Happ
            </span>
        </div>
    );
}
