import { redirect } from "next/navigation";

import { loginAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/notice";
import { getAdminAccess } from "@/lib/admin/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const access = await getAdminAccess();
  if (access.status === "authorized") redirect("/admin");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-action px-4 py-10">
      <section className="w-full max-w-md rounded-[1.75rem] border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_#0d0d0d] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Acceso interno</p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em]">MINI. ADMIN</h1>
        <p className="mt-4 text-sm leading-6 text-ink/65">
          Ingresá con el usuario administrativo creado en Supabase.
        </p>
        <div className="mt-6">
          <AdminNotice error={error} />
        </div>
        <form action={loginAction} className="space-y-4">
          <label className="block text-sm font-bold">
            Email
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-normal outline-none focus:border-action"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm font-bold">
            Contraseña
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-normal outline-none focus:border-action"
              minLength={1}
              name="password"
              required
              type="password"
            />
          </label>
          <button className="w-full rounded-xl border-2 border-ink bg-action px-5 py-3.5 font-black text-white shadow-[3px_3px_0_#0d0d0d] active:translate-y-px">
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  );
}
