import Link from "next/link";
import { checkAuth } from "@/lib/auth-validator";
import {headers} from "next/headers";

export default async function Home() {

  const headerList = await headers();

  return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans antialiased dark:bg-zinc-950 selection:bg-indigo-500/30">

        {/* Декоративный размытый фон на бэкграунде (опционально, для красоты) */}
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)]" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 transition-all dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none">

          {/* Иконка / Логотип */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          {/* Текстовый блок */}
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Приватный узел доступа
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Это закрытый сервер авторизации. Для управления своей подпиской и устройствами используйте вашу персональную ссылку.
          </p>

          <div className="mt-6 rounded-lg bg-zinc-50 p-4 font-mono text-xs border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800/60">
            <span className="text-indigo-600 dark:text-indigo-400 break-all font-medium">
            {headerList.get("host") || "localhost:3000"}/customer/<span className="text-zinc-400 dark:text-zinc-500">{"{ваш_secret_uuid}"}</span>
          </span>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
            <span>Статус: <span className="text-emerald-500 font-medium">● Online</span></span>
            <Link href={await checkAuth() ? "/admin" : "/login"} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-medium">
              Панель управления →
            </Link>
          </div>

        </div>
      </div>
  );
}