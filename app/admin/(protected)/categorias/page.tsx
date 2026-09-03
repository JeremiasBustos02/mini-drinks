import { setCategoryActiveAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminNotice } from "@/components/admin/notice";
import { getAdminCategories } from "@/lib/db/queries/admin";

type CategoriesPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  const [categoryRows, notice] = await Promise.all([getAdminCategories(), searchParams]);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Catálogo</p>
      <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">CATEGORÍAS</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
        Organizá la navegación, el orden y la disponibilidad de las categorías.
      </p>
      <div className="mt-7"><AdminNotice {...notice} /></div>

      <details className="rounded-2xl border-2 border-action bg-mint/25 p-5" open={categoryRows.length === 0}>
        <summary className="cursor-pointer font-black">+ Nueva categoría</summary>
        <div className="mt-5"><CategoryForm /></div>
      </details>

      <div className="mt-6 space-y-3">
        {categoryRows.map(({ category, productCount }) => (
          <article className="rounded-2xl border-2 border-ink bg-white p-4 sm:p-5" key={category.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black">{category.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${category.active ? "bg-mint/45 text-action" : "bg-ink/8 text-ink/55"}`}>
                    {category.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/55">/{category.slug} · orden {category.sortOrder} · {productCount} productos</p>
              </div>
              <form action={setCategoryActiveAction}>
                <input name="id" type="hidden" value={category.id} />
                <input name="revision" type="hidden" value={category.updatedAt.toISOString()} />
                <input name="value" type="hidden" value={String(!category.active)} />
                <button className="rounded-xl border border-ink/30 px-3 py-2 text-xs font-black">
                  {category.active ? "Desactivar" : "Activar"}
                </button>
              </form>
            </div>
            <details className="mt-4 border-t border-ink/10 pt-4">
              <summary className="cursor-pointer text-sm font-black text-action">Editar categoría</summary>
              <div className="mt-5"><CategoryForm category={category} /></div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
