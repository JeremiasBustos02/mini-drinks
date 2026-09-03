import { setComboStateAction } from "@/app/admin/actions";
import { ComboForm } from "@/components/admin/combo-form";
import { AdminNotice } from "@/components/admin/notice";
import { getAdminCombos, getAdminProductOptions } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";

type CombosPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminCombosPage({ searchParams }: CombosPageProps) {
  const [rows, products, notice] = await Promise.all([
    getAdminCombos(),
    getAdminProductOptions(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-action">Agrupaciones</p>
      <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">COMBOS</h1>
      <p className="mt-3 text-sm text-ink/60">El stock se deriva siempre de los productos componentes.</p>
      <div className="mt-7"><AdminNotice {...notice} /></div>

      <details className="rounded-2xl border-2 border-action bg-mint/25 p-5">
        <summary className="cursor-pointer font-black">+ Nuevo combo</summary>
        <div className="mt-5"><ComboForm products={products} /></div>
      </details>

      <div className="mt-6 space-y-4">
        {rows.map(({ combo, components, referencePrice }) => {
          const savings = combo.promotionalPrice === null ? null : referencePrice - combo.promotionalPrice;
          return (
            <article className="rounded-2xl border-2 border-ink bg-white p-4 sm:p-5" key={combo.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{combo.name}</h2>
                  <p className="mt-1 text-sm text-ink/55">{components.map((item) => `${item.name} ×${item.quantity}`).join(" · ") || "Sin componentes"}</p>
                  <p className="mt-2 text-sm font-bold">Componentes {formatArsCents(referencePrice)} · Promo {combo.promotionalPrice === null ? "sin definir" : formatArsCents(combo.promotionalPrice)}</p>
                  {savings !== null && savings < 0 && <p className="mt-1 text-xs font-bold text-red-700">La promoción es mayor que la suma individual.</p>}
                </div>
                <div className="flex gap-2 text-xs font-bold">
                  <span className={`rounded-full px-2 py-1 ${combo.active ? "bg-mint/45 text-action" : "bg-ink/8 text-ink/50"}`}>{combo.active ? "Activo" : "Inactivo"}</span>
                  <span className={`rounded-full px-2 py-1 ${combo.published ? "bg-action text-white" : "bg-ink/8 text-ink/50"}`}>{combo.published ? "Publicado" : "Oculto"}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                <form action={setComboStateAction}>
                  <input name="id" type="hidden" value={combo.id} /><input name="field" type="hidden" value="published" /><input name="value" type="hidden" value={String(!combo.published)} />
                  <input name="expectedVersion" type="hidden" value={combo.version} />
                  <button className="rounded-lg border border-ink/25 px-3 py-2 text-xs font-black">{combo.published ? "Ocultar" : "Publicar"}</button>
                </form>
                <form action={setComboStateAction}>
                  <input name="id" type="hidden" value={combo.id} /><input name="field" type="hidden" value="active" /><input name="value" type="hidden" value={String(!combo.active)} />
                  <input name="expectedVersion" type="hidden" value={combo.version} />
                  <button className="rounded-lg border border-ink/25 px-3 py-2 text-xs font-black">{combo.active ? "Desactivar" : "Activar"}</button>
                </form>
              </div>
              <details className="mt-4 border-t border-ink/10 pt-4">
                <summary className="cursor-pointer text-sm font-black text-action">Editar combo y componentes</summary>
                <div className="mt-5">
                  <ComboForm
                    combo={{ ...combo, components: components.map(({ productId, quantity }) => ({ productId, quantity })) }}
                    products={products}
                  />
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
