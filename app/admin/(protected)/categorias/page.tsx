import Link from "next/link";

import { setCategoryActiveAction } from "@/app/admin/actions";
import { adminPrimaryButtonClass, AdminPageHeader, adminSecondaryButtonClass, EmptyState } from "@/components/admin/admin-ui";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { AdminNotice } from "@/components/admin/notice";
import { getAdminCategories } from "@/lib/db/queries/admin";

type CategoriesSearchParams = { create?: string; edit?: string; error?: string; success?: string };

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<CategoriesSearchParams> }) {
  const [categoryRows, params] = await Promise.all([getAdminCategories(), searchParams]);
  const editedRow = params.edit ? categoryRows.find(({ category }) => category.id === params.edit) : undefined;
  const showEditor = params.create === "1" || Boolean(editedRow);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader action={<Link className={adminPrimaryButtonClass} href="/admin/categorias?create=1#editor">Nueva categoría</Link>} description="Organizá la navegación y disponibilidad de las familias de productos." eyebrow="Catálogo" title="Categorías" />
      <div className="mt-6"><AdminNotice error={params.error} success={params.success} /></div>

      {showEditor && <section className="mb-6 rounded-2xl border border-action/20 bg-white p-4 shadow-sm sm:p-6" id="editor"><div className="mb-5 flex items-start justify-between gap-4 border-b border-ink/10 pb-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-action">{editedRow ? "Edición" : "Alta"}</p><h2 className="mt-1 text-xl font-black">{editedRow ? editedRow.category.name : "Nueva categoría"}</h2></div><Link className={adminSecondaryButtonClass} href="/admin/categorias">Cerrar</Link></div><CategoryForm category={editedRow?.category} /></section>}

      {categoryRows.length === 0 ? <EmptyState action={<Link className={adminPrimaryButtonClass} href="/admin/categorias?create=1#editor">Crear categoría</Link>} description="Creá una categoría para poder organizar y cargar productos." title="No hay categorías" /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryRows.map(({ category, productCount }) => (
            <article className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5" key={category.id}>
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-black">{category.name}</h2><span className={`rounded-full border px-2 py-1 text-[0.68rem] font-bold ${category.active ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-ink/10 bg-ink/[0.04] text-ink/50"}`}>{category.active ? "Activa" : "Inactiva"}</span></div><p className="mt-1 text-xs text-ink/45">/{category.slug}</p></div><span className="shrink-0 rounded-lg bg-canvas px-2.5 py-1 text-xs font-bold">Orden {category.sortOrder}</span></div>
              <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-ink/50">{category.description || "Sin descripción."}</p>
              <p className="mt-3 text-xs font-bold text-ink/45">{productCount} {productCount === 1 ? "producto asociado" : "productos asociados"}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4"><Link className={adminSecondaryButtonClass} href={`/admin/categorias?edit=${category.id}#editor`}>Editar</Link><form action={setCategoryActiveAction}><input name="id" type="hidden" value={category.id} /><input name="expectedVersion" type="hidden" value={category.version} /><input name="value" type="hidden" value={String(!category.active)} /><AdminSubmitButton className={adminSecondaryButtonClass} confirmMessage={category.active ? "¿Desactivar esta categoría?" : undefined} pendingLabel="Actualizando...">{category.active ? "Desactivar" : "Activar"}</AdminSubmitButton></form></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
