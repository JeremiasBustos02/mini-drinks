"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { redeemRewardAction, type RedeemState } from "@/app/canjear/actions";

const initialState: RedeemState = {};

export function RedeemForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    redeemRewardAction,
    initialState,
  );
  useEffect(() => {
    if (state.outcome === "redeemed")
      window.dispatchEvent(new Event("mini-account-summary-invalidated"));
  }, [state.outcome]);
  if (state.outcome === "redeemed")
    return (
      <section className="rounded-3xl border border-mint bg-mint/25 p-7">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-action">
          Mini Sorpresa
        </p>
        <h1 className="mt-2 font-display text-6xl tracking-[-0.06em]">
          +{state.points} pts
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Se sumaron a tu Mini Club.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-action px-4 py-2 text-sm font-black text-white"
          href="/mi-cuenta"
        >
          Ver mi Mini Club
        </Link>
      </section>
    );
  const messages = {
    invalid: "No pudimos descubrir esta sorpresa.",
    already_redeemed: "Esta sorpresa ya fue descubierta.",
    unavailable: "Esta sorpresa no está disponible en este momento.",
    rate_limited: "Probá de nuevo en unos minutos.",
  };
  return (
    <form
      action={action}
      className="rounded-3xl border border-ink/10 bg-white p-7"
    >
      <input name="token" type="hidden" value={token} />
      <p className="text-xs font-black uppercase tracking-[0.14em] text-action">
        Mini Sorpresa
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Descubrí tu recompensa
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/60">
        Tu sorpresa se acredita una sola vez a tu cuenta.
      </p>
      {state.outcome && (
        <p
          className="mt-4 rounded-xl bg-canvas px-3 py-3 text-sm font-bold"
          role="status"
        >
          {messages[state.outcome]}
        </p>
      )}
      <button
        className="mt-6 min-h-11 rounded-xl bg-action px-4 py-2 text-sm font-black text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Descubriendo..." : "Descubrir mi sorpresa"}
      </button>
    </form>
  );
}
