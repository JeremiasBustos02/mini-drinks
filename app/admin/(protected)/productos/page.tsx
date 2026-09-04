import Link from "next/link";

import { setProductStateAction } from "@/app/admin/actions";
import {
  adminInputClass,
  AdminPageHeader,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  EmptyState,
  ProductThumbnail,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { AdminNotice } from "@/components/admin/notice";
import { ProductForm } from "@/components/admin/product-form";
import { productTypeLabels } from "@/lib/admin/presentation";
import {
  getAdminCategories,
  getAdminProducts,
  type AdminProductStatusFilter,
} from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";
import { productTypeValues, type ProductType } from "@/types/domain";

type ProductsSearchParams = {
  category?: string;
  create?: string;
  edit?: string;
  error?: string;
  q?: string;
  status?: string;
  success?: string;
  type?: string;
};

const statusOptions: Array<{ value: AdminProductStatusFilter; label: string }> = [
  { value: "published", label: "Publicados" },
  { value: "hidden", label: "Ocultos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "low_stock", label: "Poco stock" },
  { value: "out_of_stock", label: "Sin stock" },
];

function StatePills({ active, published }: { active: boolean; published: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`rounded-full border px-2 py-1 text-[0.68rem] font-bold ${published ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-ink/10 bg-ink/[0.04] text-ink/50"}`}>{published ? "Publicado" : "Oculto"}</span>
      <span className={`rounded-full border px-2 py-1 text-[0.68rem] font-bold ${active ? "border-sky-200 bg-sky-50 text-sky-800" : "border-ink/10 bg-ink/[0.04] text-ink/50"}`}>{active ? "Activo" : "Inactivo"}</span>
    </div>
  );
}

function ProductStateActions({ id, expectedVersion, active, published }: { id: string; expectedVersion: number; active: boolean; published: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={setProductStateAction}>
        <input name="id" type="hidden" value={id} />
        <input name="expectedVersion" type="hidden" value={expectedVersion} />
        <input name="field" type="hidden" value="published" />
        <input name="value" type="hidden" value={String(!published)} />
        <AdminSubmitButton className={adminSecondaryButtonClass} confirmMessage={published ? "¿Ocultar este producto de la tienda?" : undefined} pendingLabel="Actualizando...">{published ? "Ocultar" : "Publicar"}</AdminSubmitButton>
      </form>
      <form action={setProductStateAction}>
        <input name="id" type="hidden" value={id} />
        <input name="expectedVersion" type="hidden" value={expectedVersion} />
        <input name="field" type="hidden" value="active" />
        <input name="value" type="hidden" value={String(!active)} />
        <AdminSubmitButton className={adminSecondaryButtonClass} confirmMessage={active ? "¿Desactivar este producto? Puede afectar combos existentes." : undefined} pendingLabel="Actualizando...">{active ? "Desactivar" : "Activar"}</AdminSubmitButton>
      </form>
    </div>
  );
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<ProductsSearchParams> }) {
  const params = await searchParams;
  const productType = productTypeValues.includes(params.type as ProductType) ? params.type as ProductType : undefined;
  const status = statusOptions.some((option) => option.value === params.status) ? params.status as AdminProductStatusFilter : undefined;
  const categoryRows = await getAdminCategories();
  const categoryRecords = categoryRows.map(({ category }) => category);
  const categoryId = categoryRecords.some((category) => category.id === params.category) ? params.category : undefined;
  const rows = await getAdminProducts({ search: params.q, categoryId, productType, status });
  const editedRow = params.edit ? rows.find(({ product }) => product.id === params.edit) : undefined;
  const showEditor = params.create === "1" || Boolean(editedRow);

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader
        action={<Link className={adminPrimaryButtonClass} href="/admin/productos?create=1#editor">Nuevo producto</Link>}
        description="Administrá información, precio, stock y visibilidad del catálogo."
        eyebrow="Catálogo"
        title="Productos"
      />
      <div className="mt-6"><AdminNotice error={params.error} success={params.success} /></div>

      {showEditor && (
        <section className="mb-6 rounded-2xl border border-action/20 bg-white p-4 shadow-sm sm:p-6" id="editor">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
            <div><p className="text-xs font-black uppercase tracking-[0.12em] text-action">{editedRow ? "Edición" : "Alta"}</p><h2 className="mt-1 text-xl font-black">{editedRow ? editedRow.product.name : "Nuevo producto"}</h2></div>
            <Link className={adminSecondaryButtonClass} href="/admin/productos">Cerrar</Link>
          </div>
          <ProductForm categories={categoryRecords} product={editedRow?.product} />
        </section>
      )}

      <form className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.5fr)_1fr_1fr_1fr_auto] lg:items-end" method="get">
        <label className="text-sm font-bold">Buscar por nombre<input className={adminInputClass} defaultValue={params.q} name="q" placeholder="Ej. Gin" type="search" /></label>
        <label className="text-sm font-bold">Categoría<select className={adminInputClass} defaultValue={categoryId ?? ""} name="category"><option value="">Todas</option>{categoryRecords.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="text-sm font-bold">Tipo<select className={adminInputClass} defaultValue={productType ?? ""} name="type"><option value="">Todos</option>{productTypeValues.map((type) => <option key={type} value={type}>{productTypeLabels[type]}</option>)}</select></label>
        <label className="text-sm font-bold">Estado<select className={adminInputClass} defaultValue={status ?? ""} name="status"><option value="">Todos</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1"><button className={`${adminPrimaryButtonClass} flex-1`} type="submit">Filtrar</button><Link className={adminSecondaryButtonClass} href="/admin/productos">Limpiar</Link></div>
      </form>

      <div className="mt-4 flex items-center justify-between gap-4"><p className="text-sm text-ink/50">{rows.length} {rows.length === 1 ? "producto" : "productos"}</p></div>

      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState action={<Link className={adminPrimaryButtonClass} href="/admin/productos?create=1#editor">Crear producto</Link>} description="Probá limpiar los filtros o cargá el primer producto del catálogo." title="No encontramos productos" /></div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white lg:block">
            <table className="w-full min-w-[72rem] text-left text-sm">
              <caption className="sr-only">Listado de productos</caption>
              <thead className="border-b border-ink/10 bg-canvas/70 text-xs font-bold uppercase tracking-[0.08em] text-ink/45"><tr><th className="px-4 py-3" scope="col">Producto</th><th className="px-4 py-3" scope="col">Categoría</th><th className="px-4 py-3" scope="col">Tipo</th><th className="px-4 py-3 text-right" scope="col">Precio</th><th className="px-4 py-3" scope="col">Stock</th><th className="px-4 py-3" scope="col">Estado</th><th className="px-4 py-3 text-right" scope="col">Acciones</th></tr></thead>
              <tbody className="divide-y divide-ink/[0.07]">
                {rows.map(({ product, category, availableStock }) => (
                  <tr className="align-middle hover:bg-canvas/35" key={product.id}>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><ProductThumbnail imageUrl={product.imageUrl} name={product.name} /><div className="min-w-0"><p className="max-w-56 truncate font-black">{product.name}</p><p className="mt-0.5 text-xs text-ink/40">/{product.slug}</p></div></div></td>
                    <td className="px-4 py-3 text-ink/60">{category.name}</td>
                    <td className="px-4 py-3 text-ink/60">{productTypeLabels[product.productType]}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatArsCents(product.price)}</td>
                    <td className="px-4 py-3"><p className={`font-black ${availableStock <= 5 ? "text-amber-700" : ""}`}>{availableStock} disponible</p><p className="text-xs text-ink/40">{product.stock} físico</p></td>
                    <td className="px-4 py-3"><StatePills active={product.active} published={product.published} /></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><Link className={adminSecondaryButtonClass} href={`/admin/productos?edit=${product.id}#editor`}>Editar</Link><ProductStateActions active={product.active} expectedVersion={product.version} id={product.id} published={product.published} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden sm:grid-cols-2">
            {rows.map(({ product, category, availableStock }) => (
              <article className="rounded-2xl border border-ink/10 bg-white p-4" key={product.id}>
                <div className="flex gap-3"><ProductThumbnail imageUrl={product.imageUrl} name={product.name} /><div className="min-w-0 flex-1"><p className="truncate font-black">{product.name}</p><p className="mt-0.5 text-xs text-ink/45">{category.name} · {productTypeLabels[product.productType]}</p><div className="mt-2"><StatePills active={product.active} published={product.published} /></div></div></div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-canvas/70 p-3 text-sm"><div><p className="text-xs text-ink/45">Precio</p><p className="mt-0.5 font-black">{formatArsCents(product.price)}</p></div><div><p className="text-xs text-ink/45">Stock</p><p className={`mt-0.5 font-black ${availableStock <= 5 ? "text-amber-700" : ""}`}>{availableStock} disp. <span className="font-normal text-ink/40">/ {product.stock} fís.</span></p></div></div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4"><Link className={adminSecondaryButtonClass} href={`/admin/productos?edit=${product.id}#editor`}>Editar</Link><ProductStateActions active={product.active} expectedVersion={product.version} id={product.id} published={product.published} /></div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
