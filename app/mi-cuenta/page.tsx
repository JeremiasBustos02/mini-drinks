import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { getAccountAccess, getCustomerProfile } from "@/lib/account/auth";

export default async function MyAccountPage() {
  const access = await getAccountAccess();
  if (access.status === "unauthenticated") redirect("/login");
  if (access.isAdmin) redirect("/admin");
  const profile = await getCustomerProfile(access.userId);
  const displayName = profile?.displayName || access.email || "Tu cuenta";

  return <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6"><div className="mx-auto max-w-3xl"><p className="font-display text-2xl tracking-[-0.04em]">MINI<span className="text-action">.</span></p><div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-action">Mi cuenta</p><h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Hola, {displayName}</h1></div><form action={logoutAction}><button className="min-h-11 rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold hover:bg-paper" type="submit">Cerrar sesión</button></form></div><section className="mt-8 rounded-3xl border border-ink/10 bg-paper p-6"><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Email</dt><dd className="mt-1 font-bold">{access.email ?? "Sin email disponible"}</dd></div><div><dt className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Estado de sesión</dt><dd className="mt-1 font-bold text-action">Sesión activa</dd></div></dl></section><div className="mt-6 grid gap-6 md:grid-cols-2"><section className="rounded-3xl border border-ink/10 bg-white p-6"><h2 className="text-xl font-black">Mis pedidos</h2><p className="mt-3 text-sm leading-6 text-ink/60">Todavía no tenés pedidos asociados a tu cuenta.</p></section><section className="rounded-3xl border border-ink/10 bg-white p-6"><h2 className="text-xl font-black">Mini Club</h2><p className="mt-3 text-sm leading-6 text-ink/60">Mini Club próximamente.</p></section></div></div></main>;
}
