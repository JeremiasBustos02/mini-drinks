"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, registerAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = {};
const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-ink outline-offset-2 focus:border-action";

function SubmitButton({ children, pendingLabel, pending }: { children: string; pendingLabel: string; pending: boolean }) {
  return <button className="min-h-11 w-full rounded-xl bg-action px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70" disabled={pending} type="submit">{pending ? pendingLabel : children}</button>;
}

function Notice({ state }: { state: AuthFormState }) {
  if (state.error) return <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-bold text-red-800" role="alert">{state.error}</p>;
  if (state.success) return <p className="rounded-xl border border-mint bg-mint/20 px-3.5 py-3 text-sm font-bold text-ink" role="status">{state.success}</p>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  return <form action={formAction} aria-busy={pending} className="space-y-4">
    <Notice state={state} />
    <input name="next" type="hidden" value={next ?? ""} />
    <label className="block text-sm font-bold" htmlFor="email">Email<input autoComplete="email" className={inputClass} id="email" inputMode="email" name="email" required type="email" /></label>
    <label className="block text-sm font-bold" htmlFor="password">Contraseña<input autoComplete="current-password" className={inputClass} id="password" name="password" required type="password" /></label>
    <SubmitButton pending={pending} pendingLabel="Ingresando...">Iniciar sesión</SubmitButton>
    <p className="text-center text-sm text-ink/60">¿Todavía no tenés cuenta? <Link className="font-bold text-action hover:underline" href="/registro">Registrate</Link></p>
  </form>;
}

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  return <form action={formAction} aria-busy={pending} className="space-y-4">
    <Notice state={state} />
    <label className="block text-sm font-bold" htmlFor="display-name">Nombre<input autoComplete="name" className={inputClass} id="display-name" name="displayName" required type="text" /></label>
    <label className="block text-sm font-bold" htmlFor="email">Email<input autoComplete="email" className={inputClass} id="email" inputMode="email" name="email" required type="email" /></label>
    <label className="block text-sm font-bold" htmlFor="password">Contraseña<input autoComplete="new-password" className={inputClass} id="password" minLength={8} name="password" required type="password" /><span className="mt-1 block text-xs font-normal text-ink/55">Al menos 8 caracteres.</span></label>
    <label className="block text-sm font-bold" htmlFor="confirm-password">Confirmá tu contraseña<input autoComplete="new-password" className={inputClass} id="confirm-password" minLength={8} name="confirmPassword" required type="password" /></label>
    <SubmitButton pending={pending} pendingLabel="Creando cuenta...">Crear cuenta</SubmitButton>
    <p className="text-center text-sm text-ink/60">¿Ya tenés cuenta? <Link className="font-bold text-action hover:underline" href="/login">Iniciá sesión</Link></p>
  </form>;
}
