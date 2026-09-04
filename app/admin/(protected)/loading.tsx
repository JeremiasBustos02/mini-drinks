export default function AdminLoading() {
  return (
    <div aria-label="Cargando contenido" className="mx-auto max-w-[92rem] animate-pulse" role="status">
      <div className="h-3 w-24 rounded-full bg-ink/10" />
      <div className="mt-3 h-10 w-56 rounded-xl bg-ink/10" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-ink/[0.06]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div className="h-32 rounded-2xl border border-ink/[0.06] bg-white" key={item} />)}
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
