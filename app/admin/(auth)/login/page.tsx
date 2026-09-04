import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminAccess } from "@/lib/admin/auth";

export default async function AdminLoginPage() {
  const access = await getAdminAccess();
  if (access.status === "authorized") redirect("/admin");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-4 py-10">
      <div aria-hidden="true" className="absolute -top-24 right-[-8rem] size-80 rounded-full bg-mint/30 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-36 left-[-7rem] size-96 rounded-full bg-action/[0.05] blur-3xl" />
      <section className="relative w-full max-w-[27rem] rounded-3xl border border-ink/10 bg-paper p-6 shadow-[0_24px_70px_rgba(13,13,13,0.10)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-action font-display text-sm text-white">M.</span>
          <div>
            <p className="font-black tracking-[-0.02em]">MINI.</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/40">Panel administrativo</p>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-action">Acceso interno</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em]">Iniciar sesión</h1>
          <p className="mt-2 text-sm leading-6 text-ink/50">Ingresá con tus credenciales de administración.</p>
        </div>
        <div className="mt-7"><LoginForm /></div>
        <p className="mt-6 border-t border-ink/10 pt-5 text-center text-xs leading-5 text-ink/40">Acceso exclusivo para personal autorizado.</p>
      </section>
    </main>
  );
}
