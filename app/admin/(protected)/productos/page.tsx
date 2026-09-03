import { setProductStateAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/notice";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProducts } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";

type ProductsPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const [rows, categoryRows, notice] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    searchParams,
  ]);
  const categoryRecords = categoryRows.map(({ category }) => category);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Catálogo</p>
      <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">PRODUCTOS</h1>
      <p className="mt-3 text-sm text-ink/60">Precio, stock y publicación se actualizan desde el mismo formulario.</p>
      <div className="mt-7"><AdminNotice {...notice} /></div>

      <details className="rounded-2xl border-2 border-action bg-mint/25 p-5">
        <summary className="cursor-pointer font-black">+ Nuevo producto</summary>
        <div className="mt-5"><ProductForm categories={categoryRecords} /></div>
      </details>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {rows.map(({ product, category }) => (
          <article className="rounded-2xl border-2 border-ink bg-white p-4 sm:p-5" key={product.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-action">{category.name} · {product.productType}</p>
                <h2 className="mt-1 text-lg font-black">{product.name}</h2>
                <p className="mt-2 text-sm text-ink/60">{formatArsCents(product.price)} · stock {product.stock}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs font-bold">
                <span className={`rounded-full px-2 py-1 ${product.active ? "bg-mint/45 text-action" : "bg-ink/8 text-ink/50"}`}>{product.active ? "Activo" : "Inactivo"}</span>
                <span className={`rounded-full px-2 py-1 ${product.published ? "bg-action text-white" : "bg-ink/8 text-ink/50"}`}>{product.published ? "Publicado" : "Oculto"}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
              <form action={setProductStateAction}>
                <input name="id" type="hidden" value={product.id} />
                <input name="revision" type="hidden" value={product.updatedAt.toISOString()} />
                <input name="field" type="hidden" value="published" />
                <input name="value" type="hidden" value={String(!product.published)} />
                <button className="rounded-lg border border-ink/25 px-3 py-2 text-xs font-black">{product.published ? "Ocultar" : "Publicar"}</button>
              </form>
              <form action={setProductStateAction}>
                <input name="id" type="hidden" value={product.id} />
                <input name="revision" type="hidden" value={product.updatedAt.toISOString()} />
                <input name="field" type="hidden" value="active" />
                <input name="value" type="hidden" value={String(!product.active)} />
                <button className="rounded-lg border border-ink/25 px-3 py-2 text-xs font-black">{product.active ? "Desactivar" : "Activar"}</button>
              </form>
            </div>
            <details className="mt-4 border-t border-ink/10 pt-4">
              <summary className="cursor-pointer text-sm font-black text-action">Editar precio, stock y datos</summary>
              <div className="mt-5"><ProductForm categories={categoryRecords} product={product} /></div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
