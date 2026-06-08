import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth-validator";
import { prisma } from "@/lib/prisma";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
    const { user } = await validateRequest();

    if (user) {
        redirect("/admin");
    }

    // Получаем состояние регистрации из настроек
    const registrationSetting = await prisma.systemSetting.findUnique({
        where: { key: "disableRegistration" }
    });
    const isRegistrationDisabled = registrationSetting ? registrationSetting.value === "true" : false;

    return <RegisterClient isRegistrationDisabled={isRegistrationDisabled} />;
}
