import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth-validator";
import { prisma } from "@/lib/prisma";
import { serializeAuthenticator } from "@/lib/serialization";
import SecurityDashboard from "./SecurityDashboard";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
    const { user } = await validateRequest();

    if (!user) {
        redirect("/login");
    }

    const authenticators = await prisma.authenticator.findMany({
        where: { userId: user.id }
    });

    const serializedAuthenticators = authenticators.map(serializeAuthenticator);

    return (
        <SecurityDashboard
            user={user}
            initialAuthenticators={serializedAuthenticators}
        />
    );
}
