"use client";

import { useActionState } from "react";

import { saveCategoryAction, type AdminFormState } from "@/app/admin/actions";
import { adminInputClass, adminPrimaryButtonClass, FormSection } from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import type { CategoryRecord } from "@/lib/db/schema";

export function CategoryForm({ category }: { category?: CategoryRecord }) {
  const [state, formAction] = useActionState(saveCategoryAction, {} as AdminFormState);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]">
      {category && <input name="id" type="hidden" value={category.id} />}
      {category && <input name="revision" type="hidden" value={category.updatedAt.toISOString()} />}
      <FormSection description="Nombre, URL y texto descriptivo de la sección." title="Información">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">Nombre<input className={adminInputClass} defaultValue={category?.name} name="name" required /></label>
          <label className="text-sm font-bold">Slug<input className={adminInputClass} defaultValue={category?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
          <label className="text-sm font-bold sm:col-span-2">Descripción<textarea className={`${adminInputClass} min-h-24 resize-y`} defaultValue={category?.description ?? ""} name="description" /></label>
        </div>
      </FormSection>
      <FormSection description="Define prioridad y disponibilidad dentro del catálogo." title="Organización">
        <div className="grid gap-4">
          <label className="text-sm font-bold">Orden<input className={adminInputClass} defaultValue={category?.sortOrder ?? 0} min="0" name="sortOrder" required type="number" /></label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 text-sm font-bold"><input className="size-4 accent-action" defaultChecked={category?.active ?? true} name="active" type="checkbox" /> Categoría activa</label>
        </div>
      </FormSection>
      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 lg:col-span-2" role="alert">{state.error}</p>}
      <div className="flex justify-end border-t border-ink/10 pt-4 lg:col-span-2"><AdminSubmitButton className={`${adminPrimaryButtonClass} w-full sm:w-auto sm:min-w-44`} pendingLabel="Guardando categoría...">{category ? "Guardar cambios" : "Crear categoría"}</AdminSubmitButton></div>
    </form>
  );
}
