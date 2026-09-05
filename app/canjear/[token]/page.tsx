import Link from "next/link";

import { RedeemForm } from "@/components/account/redeem-form";
import { getAccountAccess } from "@/lib/account/auth";

export default async function RedeemPage({ params }: { params: Promise<{ token: string }> }) {
  const [{ token }, access] = await Promise.all([params, getAccountAccess()]);
  const next = `/canjear/${token}`;
  return <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10"><div className="w-full max-w-md">{access.status === "unauthenticated" ? <section className="rounded-3xl border border-ink/10 bg-paper p-7"><p className="text-xs font-black uppercase tracking-[0.14em] text-action">Mini Club</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Encontraste una Mini Sorpresa.</h1><p className="mt-3 text-sm leading-6 text-ink/60">Iniciá sesión para descubrirla y sumarla a tu cuenta.</p><div className="mt-6 flex gap-3"><Link className="inline-flex min-h-11 items-center rounded-xl bg-action px-4 py-2 text-sm font-black text-white" href={`/login?next=${encodeURIComponent(next)}`}>Iniciar sesión</Link><Link className="inline-flex min-h-11 items-center rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold" href={`/registro?next=${encodeURIComponent(next)}`}>Crear cuenta</Link></div></section> : <RedeemForm token={token} />}</div></main>;
}
