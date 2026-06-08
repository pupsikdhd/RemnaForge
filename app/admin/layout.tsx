import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth-validator";
import { prisma } from "@/lib/prisma";
import AdminHeader from "./AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = await validateRequest();

    if (!user) {
        redirect("/login");
    }

    const registrationSetting = await prisma.systemSetting.findUnique({
        where: { key: "disableRegistration" }
    });
    const isRegistrationDisabled = registrationSetting ? registrationSetting.value === "true" : false;

    return (
        <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-800 dark:text-zinc-200">
            {/* Размытая сетка на фоне */}
            <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                <AdminHeader user={user} isRegistrationDisabled={isRegistrationDisabled} />
                <main className="mt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
