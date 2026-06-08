import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth-validator";
import { prisma } from "@/lib/prisma";
import { serializeClient } from "@/lib/serialization";
import AdminDashboard from "./AdminDashboard";


export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const { user } = await validateRequest();

    if (!user) {
        redirect("/login");
    }

    // Получаем список клиентов на сервере
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" }
    });

    // Сериализуем данные с помощью общего хелпера
    const serializedClients = clients.map(serializeClient);

    return (
        <AdminDashboard
            initialClients={serializedClients}
        />
    );
}
