import { saveCategoryAction } from "@/app/admin/actions";
import type { CategoryRecord } from "@/lib/db/schema";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink/25 bg-white px-3 py-2.5 text-sm outline-none focus:border-action focus:ring-2 focus:ring-mint";

export function CategoryForm({ category }: { category?: CategoryRecord }) {
  return (
    <form action={saveCategoryAction} className="grid gap-4 md:grid-cols-2">
      {category && <input name="id" type="hidden" value={category.id} />}
      {category && <input name="revision" type="hidden" value={category.updatedAt.toISOString()} />}
      <label className="text-sm font-bold">
        Nombre
        <input className={inputClass} defaultValue={category?.name} name="name" required />
      </label>
      <label className="text-sm font-bold">
        Slug
        <input
          className={inputClass}
          defaultValue={category?.slug}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </label>
      <label className="text-sm font-bold md:col-span-2">
        Descripción
        <textarea className={`${inputClass} min-h-24 resize-y`} defaultValue={category?.description ?? ""} name="description" />
      </label>
      <label className="text-sm font-bold">
        Orden
        <input className={inputClass} defaultValue={category?.sortOrder ?? 0} min="0" name="sortOrder" required type="number" />
      </label>
      <label className="flex items-center gap-3 self-end rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-bold">
        <input defaultChecked={category?.active ?? true} name="active" type="checkbox" />
        Categoría activa
      </label>
      <button className="rounded-xl border-2 border-ink bg-action px-4 py-3 font-black text-white md:col-span-2">
        {category ? "Guardar cambios" : "Crear categoría"}
      </button>
    </form>
  );
}
