"use client";

import { useActionState, useState } from "react";

import { saveComboAction, type AdminFormState } from "@/app/admin/actions";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  FormSection,
  ProductThumbnail,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { ProductPicker, type ProductOption } from "@/components/admin/product-picker";
import { productTypeLabels } from "@/lib/admin/presentation";
import { formatArsCents, formatArsInput, parseArsToCents } from "@/lib/money";

type ComboValue = {
  id: string;
  name: string;
  slug: string;
  description: string;
  promotionalPrice: number | null;
  active: boolean;
  published: boolean;
  imageUrl: string | null;
  version: number;
  components: Array<{ productId: string; quantity: number }>;
};

type ComponentLine = { key: string; productId: string; quantity: number };

export function ComboForm({ combo, products }: { combo?: ComboValue; products: ProductOption[] }) {
  const [state, formAction] = useActionState(saveComboAction, {} as AdminFormState);
  const [sequence, setSequence] = useState(combo?.components.length ?? 0);
  const [lines, setLines] = useState<ComponentLine[]>(
    combo?.components.map((component, index) => ({ ...component, key: `saved-${index}` })) ?? [],
  );
  const [promotionalPrice, setPromotionalPrice] = useState(
    combo?.promotionalPrice === null || combo?.promotionalPrice === undefined ? "" : formatArsInput(combo.promotionalPrice),
  );
  const [imageUrl, setImageUrl] = useState(combo?.imageUrl ?? "");

  const productById = new Map(products.map((product) => [product.id, product]));
  const selectedIds = new Set(lines.map((line) => line.productId));
  const referencePrice = lines.reduce((total, line) => {
    const product = productById.get(line.productId);
    return product ? total + product.price * line.quantity : total;
  }, 0);
  const availability = lines.length > 0
    ? Math.min(...lines.map((line) => Math.floor((productById.get(line.productId)?.stock ?? 0) / line.quantity)))
    : 0;

  let parsedPromotionalPrice: number | null = null;
  let priceIsInvalid = false;
  try {
    parsedPromotionalPrice = promotionalPrice ? parseArsToCents(promotionalPrice) : null;
  } catch {
    priceIsInvalid = Boolean(promotionalPrice);
  }
  const savings = parsedPromotionalPrice === null ? null : referencePrice - parsedPromotionalPrice;

  function addProduct(productId: string) {
    if (selectedIds.has(productId)) return;
    const next = sequence + 1;
    setSequence(next);
    setLines((current) => [...current, { key: `new-${next}`, productId, quantity: 1 }]);
  }

  function updateQuantity(key: string, quantity: number) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, quantity } : line)));
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  const hasInvalidLine = lines.length === 0 || lines.some((line) => !Number.isInteger(line.quantity) || line.quantity <= 0);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2">
      {combo && <input name="id" type="hidden" value={combo.id} />}
      {combo && <input name="expectedVersion" type="hidden" value={combo.version} />}
      <input name="components" type="hidden" value={JSON.stringify(lines.map(({ productId, quantity }) => ({ productId, quantity })))} />

      <FormSection description="Datos principales que verá el cliente." title="Información">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Nombre
            <input className={adminInputClass} defaultValue={combo?.name} name="name" required />
          </label>
          <label className="text-sm font-bold">
            Slug
            <input className={adminInputClass} defaultValue={combo?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="combo-gin-tonic" required />
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            Descripción
            <textarea className={`${adminInputClass} min-h-24 resize-y`} defaultValue={combo?.description} name="description" required />
          </label>
        </div>
      </FormSection>

      <div className="grid gap-4">
        <FormSection description="Dejalo vacío para usar la suma de los productos." title="Venta">
          <label className="text-sm font-bold">
            Precio promocional en ARS
            <input className={adminInputClass} inputMode="decimal" name="promotionalPrice" onChange={(event) => setPromotionalPrice(event.target.value)} placeholder="5900" value={promotionalPrice} />
          </label>
          {priceIsInvalid && <p className="mt-2 text-xs font-bold text-red-700" role="alert">Ingresá un importe válido con hasta dos decimales.</p>}
        </FormSection>
        <FormSection description="El combo debe estar activo y publicado para aparecer en la tienda." title="Visibilidad">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 text-sm font-bold"><input className="size-4 accent-action" defaultChecked={combo?.active ?? true} name="active" type="checkbox" /> Activo</label>
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 text-sm font-bold"><input className="size-4 accent-action" defaultChecked={combo?.published ?? false} name="published" type="checkbox" /> Publicado</label>
          </div>
        </FormSection>
      </div>

      <FormSection description="Buscá y agregá productos. Cada producto puede aparecer una sola vez." title="Productos disponibles">
        <ProductPicker onAdd={addProduct} products={products} selectedIds={selectedIds} />
      </FormSection>

      <FormSection description="Ajustá cantidades o quitá componentes antes de guardar." title={`Componentes seleccionados (${lines.length})`}>
        {lines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/15 bg-white px-4 py-8 text-center text-sm text-ink/45">Todavía no agregaste productos.</div>
        ) : (
          <div className="space-y-2">
            {lines.map((line) => {
              const product = productById.get(line.productId);
              if (!product) return null;
              return (
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-xl border border-ink/10 bg-white p-2.5 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_auto]" key={line.key}>
                  <ProductThumbnail imageUrl={product.imageUrl} name={product.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{product.name}</p>
                    <p className="text-xs text-ink/45">{productTypeLabels[product.productType]} · {formatArsCents(product.price)}</p>
                  </div>
                  <label className="text-[0.65rem] font-bold uppercase tracking-wide text-ink/45">
                    Cantidad
                    <input aria-label={`Cantidad de ${product.name}`} className="mt-1 h-9 w-full rounded-lg border border-ink/15 px-2 text-sm font-bold outline-none focus:border-action" min="1" onChange={(event) => updateQuantity(line.key, Number(event.target.value))} step="1" type="number" value={line.quantity} />
                  </label>
                  <button aria-label={`Eliminar ${product.name}`} className="col-span-3 min-h-9 rounded-lg border border-red-200 px-3 text-xs font-black text-red-700 hover:bg-red-50 sm:col-span-1" onClick={() => removeLine(line.key)} type="button">Eliminar</button>
                </div>
              );
            })}
          </div>
        )}
        {hasInvalidLine && <p className="mt-3 text-xs font-bold text-red-700" role="alert">Agregá al menos un producto y usá cantidades mayores a cero.</p>}
      </FormSection>

      <FormSection description="Se mantiene la URL externa; no se suben archivos desde el panel." title="Imagen">
        <div className="grid gap-4 sm:grid-cols-[7rem_1fr] sm:items-start">
          <ProductThumbnail imageUrl={imageUrl.trim() || null} name={combo?.name ?? "Combo"} size="lg" />
          <label className="text-sm font-bold">
            URL de imagen
            <input className={adminInputClass} name="imageUrl" onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." type="url" value={imageUrl} />
          </label>
        </div>
      </FormSection>

      <section className="rounded-2xl bg-action p-5 text-white" aria-label="Resumen del combo">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-mint">Resumen</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-white/60">Suma componentes</dt><dd className="mt-1 font-black">{formatArsCents(referencePrice)}</dd></div>
          <div><dt className="text-white/60">Precio promocional</dt><dd className="mt-1 font-black">{parsedPromotionalPrice === null ? "Sin definir" : formatArsCents(parsedPromotionalPrice)}</dd></div>
          <div><dt className="text-white/60">Ahorro</dt><dd className={`mt-1 font-black ${savings !== null && savings < 0 ? "text-amber-200" : "text-mint"}`}>{savings === null ? "Sin calcular" : formatArsCents(savings)}</dd></div>
          <div><dt className="text-white/60">Disponibilidad derivada</dt><dd className="mt-1 font-black">{availability} combos</dd></div>
        </dl>
        {savings !== null && savings < 0 && <p className="mt-4 rounded-xl bg-amber-300/15 px-3 py-2.5 text-xs font-bold text-amber-100" role="alert">El precio promocional supera la suma individual por {formatArsCents(Math.abs(savings))}. La tienda aplicará el mejor precio.</p>}
      </section>

      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 lg:col-span-2" role="alert">{state.error}</p>}

      <div className="flex justify-end border-t border-ink/10 pt-4 lg:col-span-2">
        <AdminSubmitButton className={`${adminPrimaryButtonClass} w-full sm:w-auto sm:min-w-44`} disabled={hasInvalidLine || priceIsInvalid || products.length === 0} pendingLabel="Guardando combo...">
          {combo ? "Guardar combo" : "Crear combo"}
        </AdminSubmitButton>
      </div>
    </form>
  );
}
