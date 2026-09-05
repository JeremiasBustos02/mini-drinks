"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Admin route failed to render.", { errorName: error.name });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-black">No pudimos cargar el panel</h1>
        <p className="mt-3 text-sm text-ink/60">
          La sesión o los datos del dashboard no respondieron correctamente.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-black text-white"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
