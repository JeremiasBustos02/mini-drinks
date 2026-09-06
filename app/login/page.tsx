import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/account/auth-forms";
import { getAccountAccess } from "@/lib/account/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [access, params] = await Promise.all([getAccountAccess(), searchParams]);
  if (access.status === "authenticated") redirect("/");

  return <main className="auth-page grid min-h-screen place-items-center bg-canvas px-4 py-10"><section className="auth-card w-full max-w-md rounded-3xl border border-ink/10 bg-paper p-6 shadow-[0_24px_70px_rgba(13,13,13,0.10)] sm:p-8"><Link className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-2 text-sm font-bold text-ink/65 transition duration-200 hover:-translate-y-px hover:bg-mint/25 hover:text-action active:translate-y-0 active:bg-mint/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action" href="/">← Volver</Link><p className="mt-4 font-display text-2xl tracking-[-0.04em]">MINI<span className="text-action">.</span></p><p className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-action">Mi cuenta</p><h1 className="mt-2 text-3xl font-black tracking-[-0.035em]">Iniciar sesión</h1><p className="mt-2 text-sm leading-6 text-ink/55">Usá tu email y contraseña para continuar.</p><div className="mt-7"><LoginForm next={params.next} /></div></section></main>;
}
