import Link from "next/link";

import { setComboStateAction } from "@/app/admin/actions";
import {
  adminInputClass,
  AdminPageHeader,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  EmptyState,
  ProductThumbnail,
} from "@/components/admin/admin-ui";
import { ComboForm } from "@/components/admin/combo-form";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { AdminNotice } from "@/components/admin/notice";
import { getAdminCombos, getAdminProductOptions } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";

type CombosSearchParams = { create?: string; edit?: string; error?: string; q?: string; success?: string };

function ComboStatePills({ active, published }: { active: boolean; published: boolean }) {
  return <div className="flex flex-wrap gap-1.5"><span className={`rounded-full border px-2 py-1 text-[0.68rem] font-bold ${published ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-ink/10 bg-ink/[0.04] text-ink/50"}`}>{published ? "Publicado" : "Oculto"}</span><span className={`rounded-full border px-2 py-1 text-[0.68rem] font-bold ${active ? "border-sky-200 bg-sky-50 text-sky-800" : "border-ink/10 bg-ink/[0.04] text-ink/50"}`}>{active ? "Activo" : "Inactivo"}</span></div>;
}

function ComboStateActions({ combo }: { combo: { id: string; active: boolean; published: boolean; version: number } }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={setComboStateAction}>
        <input name="id" type="hidden" value={combo.id} /><input name="field" type="hidden" value="published" /><input name="value" type="hidden" value={String(!combo.published)} /><input name="expectedVersion" type="hidden" value={combo.version} />
        <AdminSubmitButton className={adminSecondaryButtonClass} confirmMessage={combo.published ? "¿Ocultar este combo de la tienda?" : undefined} pendingLabel="Actualizando...">{combo.published ? "Ocultar" : "Publicar"}</AdminSubmitButton>
      </form>
      <form action={setComboStateAction}>
        <input name="id" type="hidden" value={combo.id} /><input name="field" type="hidden" value="active" /><input name="value" type="hidden" value={String(!combo.active)} /><input name="expectedVersion" type="hidden" value={combo.version} />
        <AdminSubmitButton className={adminSecondaryButtonClass} confirmMessage={combo.active ? "¿Desactivar este combo?" : undefined} pendingLabel="Actualizando...">{combo.active ? "Desactivar" : "Activar"}</AdminSubmitButton>
      </form>
    </div>
  );
}

export default async function AdminCombosPage({ searchParams }: { searchParams: Promise<CombosSearchParams> }) {
  const params = await searchParams;
  const [rows, products] = await Promise.all([getAdminCombos({ search: params.q }), getAdminProductOptions()]);
  const editedRow = params.edit ? rows.find(({ combo }) => combo.id === params.edit) : undefined;
  const showEditor = params.create === "1" || Boolean(editedRow);

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader action={<Link className={adminPrimaryButtonClass} href="/admin/combos?create=1#editor">Nuevo combo</Link>} description="Definí composiciones, precio promocional y disponibilidad sin duplicar stock." eyebrow="Catálogo" title="Combos" />
      <div className="mt-6"><AdminNotice error={params.error} success={params.success} /></div>

      {showEditor && (
        <section className="mb-6 rounded-2xl border border-action/20 bg-white p-4 shadow-sm sm:p-6" id="editor">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink/10 pb-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-action">{editedRow ? "Edición" : "Alta"}</p><h2 className="mt-1 text-xl font-black">{editedRow ? editedRow.combo.name : "Nuevo combo"}</h2></div><Link className={adminSecondaryButtonClass} href="/admin/combos">Cerrar</Link></div>
          {products.length === 0 ? <EmptyState description="Cargá al menos un producto antes de crear un combo." title="No hay productos disponibles" /> : (
            <ComboForm combo={editedRow ? { ...editedRow.combo, components: editedRow.components.map(({ productId, quantity }) => ({ productId, quantity })) } : undefined} products={products} />
          )}
        </section>
      )}

      <form className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 sm:flex-row sm:items-end" method="get">
        <label className="flex-1 text-sm font-bold">Buscar por nombre<input className={adminInputClass} defaultValue={params.q} name="q" placeholder="Ej. Combo gin" type="search" /></label>
        <div className="flex gap-2"><button className={adminPrimaryButtonClass} type="submit">Buscar</button><Link className={adminSecondaryButtonClass} href="/admin/combos">Limpiar</Link></div>
      </form>
      <p className="mt-4 text-sm text-ink/50">{rows.length} {rows.length === 1 ? "combo" : "combos"}</p>

      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState action={<Link className={adminPrimaryButtonClass} href="/admin/combos?create=1#editor">Crear combo</Link>} description="Probá otra búsqueda o armá el primer combo promocional." title="No encontramos combos" /></div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white lg:block">
            <table className="w-full min-w-[70rem] text-left text-sm">
              <caption className="sr-only">Listado de combos</caption>
              <thead className="border-b border-ink/10 bg-canvas/70 text-xs font-bold uppercase tracking-[0.08em] text-ink/45"><tr><th className="px-4 py-3" scope="col">Combo</th><th className="px-4 py-3 text-right" scope="col">Precio promo</th><th className="px-4 py-3 text-right" scope="col">Componentes</th><th className="px-4 py-3 text-right" scope="col">Ahorro</th><th className="px-4 py-3" scope="col">Disponibilidad</th><th className="px-4 py-3" scope="col">Estado</th><th className="px-4 py-3 text-right" scope="col">Acciones</th></tr></thead>
              <tbody className="divide-y divide-ink/[0.07]">
                {rows.map(({ combo, components, referencePrice, availability }) => {
                  const savings = combo.promotionalPrice === null ? null : referencePrice - combo.promotionalPrice;
                  return (
                    <tr className="align-middle hover:bg-canvas/35" key={combo.id}>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><ProductThumbnail imageUrl={combo.imageUrl} name={combo.name} /><div className="min-w-0"><p className="max-w-60 truncate font-black">{combo.name}</p><p className="mt-0.5 max-w-72 truncate text-xs text-ink/40">{components.map((item) => `${item.name} ×${item.quantity}`).join(" · ") || "Sin componentes"}</p></div></div></td>
                      <td className="px-4 py-3 text-right font-black">{combo.promotionalPrice === null ? <span className="font-normal text-ink/40">Sin definir</span> : formatArsCents(combo.promotionalPrice)}</td>
                      <td className="px-4 py-3 text-right text-ink/60">{formatArsCents(referencePrice)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${savings !== null && savings < 0 ? "text-red-700" : "text-action"}`}>{savings === null ? "-" : formatArsCents(savings)}</td>
                      <td className="px-4 py-3"><span className={`font-black ${availability <= 0 ? "text-red-700" : availability <= 3 ? "text-amber-700" : ""}`}>{availability}</span><span className="ml-1 text-xs text-ink/40">combos</span></td>
                      <td className="px-4 py-3"><ComboStatePills active={combo.active} published={combo.published} /></td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-2"><Link className={adminSecondaryButtonClass} href={`/admin/combos?edit=${combo.id}#editor`}>Editar</Link><ComboStateActions combo={combo} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden sm:grid-cols-2">
            {rows.map(({ combo, components, referencePrice, availability }) => {
              const savings = combo.promotionalPrice === null ? null : referencePrice - combo.promotionalPrice;
              return (
                <article className="rounded-2xl border border-ink/10 bg-white p-4" key={combo.id}>
                  <div className="flex gap-3"><ProductThumbnail imageUrl={combo.imageUrl} name={combo.name} /><div className="min-w-0 flex-1"><p className="truncate font-black">{combo.name}</p><p className="mt-0.5 truncate text-xs text-ink/45">{components.length} componentes</p><div className="mt-2"><ComboStatePills active={combo.active} published={combo.published} /></div></div></div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 rounded-xl bg-canvas/70 p-3 text-sm"><div><dt className="text-xs text-ink/45">Promoción</dt><dd className="mt-0.5 font-black">{combo.promotionalPrice === null ? "Sin definir" : formatArsCents(combo.promotionalPrice)}</dd></div><div><dt className="text-xs text-ink/45">Componentes</dt><dd className="mt-0.5 font-black">{formatArsCents(referencePrice)}</dd></div><div><dt className="text-xs text-ink/45">Ahorro</dt><dd className={`mt-0.5 font-black ${savings !== null && savings < 0 ? "text-red-700" : "text-action"}`}>{savings === null ? "-" : formatArsCents(savings)}</dd></div><div><dt className="text-xs text-ink/45">Disponibilidad</dt><dd className={`mt-0.5 font-black ${availability <= 3 ? "text-amber-700" : ""}`}>{availability} combos</dd></div></dl>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink/45">{components.map((item) => `${item.name} ×${item.quantity}`).join(" · ")}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4"><Link className={adminSecondaryButtonClass} href={`/admin/combos?edit=${combo.id}#editor`}>Editar</Link><ComboStateActions combo={combo} /></div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
