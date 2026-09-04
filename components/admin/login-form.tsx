"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/admin/actions";
import { adminInputClass, adminPrimaryButtonClass } from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} aria-busy={pending} className="space-y-4">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-bold text-red-800" role="alert">
          {state.error}
        </p>
      )}
      <label className="block text-sm font-bold" htmlFor="admin-email">
        Email
        <input autoComplete="email" className={adminInputClass} id="admin-email" name="email" placeholder="admin@mini.com" required type="email" />
      </label>
      <label className="block text-sm font-bold" htmlFor="admin-password">
        Contraseña
        <input autoComplete="current-password" className={adminInputClass} id="admin-password" minLength={1} name="password" required type="password" />
      </label>
      <AdminSubmitButton className={`${adminPrimaryButtonClass} mt-2 w-full`} pendingLabel="Ingresando...">
        Iniciar sesión
      </AdminSubmitButton>
    </form>
  );
}
