"use client";

import { useActionState, useState } from "react";

import { updateProfileAction, type ProfileFormState } from "@/app/mi-cuenta/actions";

const initialState: ProfileFormState = {};

export function ProfileEditor({
  displayName,
  email,
  phone,
}: {
  displayName: string;
  email: string | null;
  phone: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <section className="account-profile">
      <div className="account-section-heading">
        <div>
          <p>Mis datos</p>
          <h2>Tu perfil mini.</h2>
        </div>
        <button
          className="account-edit-button"
          onClick={() => setEditing((value) => !value)}
          type="button"
        >
          {editing ? "Cerrar edición" : "Editar"}
        </button>
      </div>
      {editing ? (
        <form action={formAction} className="account-profile-form">
          <label>
            Nombre
            <input autoComplete="name" defaultValue={displayName} name="displayName" required type="text" />
          </label>
          <label>
            Teléfono
            <input autoComplete="tel" defaultValue={phone ?? ""} inputMode="tel" name="phone" type="tel" />
          </label>
          <p className="account-profile-email">Email: {email ?? "Sin email disponible"}</p>
          {state.error ? (
            <p className="account-form-message account-form-error" role="alert">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="account-form-message account-form-success" role="status">{state.success}</p>
          ) : null}
          <div className="account-profile-actions">
            <button disabled={pending} type="submit">{pending ? "Guardando..." : "Guardar cambios"}</button>
            <button disabled={pending} onClick={() => setEditing(false)} type="button">Cancelar</button>
          </div>
        </form>
      ) : (
        <dl className="account-profile-summary">
          <div><dt>Nombre</dt><dd>{displayName}</dd></div>
          <div><dt>Teléfono</dt><dd>{phone || "Sumalo para tenerlo a mano."}</dd></div>
          <div><dt>Email</dt><dd>{email ?? "Sin email disponible"}</dd></div>
        </dl>
      )}
    </section>
  );
}
