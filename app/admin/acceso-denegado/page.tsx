import { logoutAction } from "@/app/admin/actions";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <section className="max-w-lg rounded-[1.75rem] border-2 border-ink bg-white p-8 text-center shadow-[8px_8px_0_#024018]">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Acceso denegado</p>
        <h1 className="mt-3 font-display text-4xl leading-none">ESTA CUENTA NO ES ADMIN</h1>
        <p className="mt-5 leading-7 text-ink/65">
          La identidad es válida, pero su UUID no está registrado en la tabla de administradores.
        </p>
        <form action={logoutAction} className="mt-7">
          <button className="rounded-xl border-2 border-ink bg-action px-5 py-3 font-black text-white">
            Cerrar sesión
          </button>
        </form>
      </section>
    </main>
  );
}
