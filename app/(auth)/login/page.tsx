import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth-validator";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const { user } = await validateRequest();

    if (user) {
        redirect("/admin");
    }

    return <LoginClient />;
}
