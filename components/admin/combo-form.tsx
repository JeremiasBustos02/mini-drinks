"use client";

import { useState } from "react";

import { saveComboAction } from "@/app/admin/actions";
import { formatArsCents, formatArsInput, parseArsToCents } from "@/lib/money";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  published: boolean;
  categoryActive: boolean;
};

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

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink/25 bg-white px-3 py-2.5 text-sm outline-none focus:border-action focus:ring-2 focus:ring-mint";

export function ComboForm({ combo, products }: { combo?: ComboValue; products: ProductOption[] }) {
  const [sequence, setSequence] = useState(combo?.components.length ?? 1);
  const [lines, setLines] = useState<ComponentLine[]>(
    combo?.components.map((component, index) => ({ ...component, key: `saved-${index}` })) ?? [
      { key: "new-0", productId: "", quantity: 1 },
    ],
  );
  const [promotionalPrice, setPromotionalPrice] = useState(
    combo?.promotionalPrice === null || combo?.promotionalPrice === undefined
      ? ""
      : formatArsInput(combo.promotionalPrice),
  );

  const productById = new Map(products.map((product) => [product.id, product]));
  const selectedIds = lines.map((line) => line.productId).filter(Boolean);
  const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
  const hasInvalidLine = lines.some(
    (line) => !line.productId || !Number.isInteger(line.quantity) || line.quantity <= 0,
  );
  const referencePrice = lines.reduce((total, line) => {
    const product = productById.get(line.productId);
    return product ? total + product.price * line.quantity : total;
  }, 0);
  let parsedPromotionalPrice: number | null = null;
  try {
    parsedPromotionalPrice = promotionalPrice ? parseArsToCents(promotionalPrice) : null;
  } catch {
    parsedPromotionalPrice = null;
  }
  const savings = parsedPromotionalPrice === null ? null : referencePrice - parsedPromotionalPrice;

  function addLine() {
    const next = sequence + 1;
    setSequence(next);
    setLines((current) => [...current, { key: `new-${next}`, productId: "", quantity: 1 }]);
  }

  function updateLine(key: string, patch: Partial<ComponentLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  return (
    <form action={saveComboAction} className="grid gap-4 md:grid-cols-2">
      {combo && <input name="id" type="hidden" value={combo.id} />}
      {combo && <input name="expectedVersion" type="hidden" value={combo.version} />}
      <input
        name="components"
        type="hidden"
        value={JSON.stringify(lines.map(({ productId, quantity }) => ({ productId, quantity })))}
      />
      <label className="text-sm font-bold">
        Nombre
        <input className={inputClass} defaultValue={combo?.name} name="name" required />
      </label>
      <label className="text-sm font-bold">
        Slug
        <input className={inputClass} defaultValue={combo?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
      </label>
      <label className="text-sm font-bold md:col-span-2">
        Descripción
        <textarea className={`${inputClass} min-h-24 resize-y`} defaultValue={combo?.description} name="description" required />
      </label>
      <label className="text-sm font-bold">
        Precio promocional ARS (opcional)
        <input
          className={inputClass}
          inputMode="decimal"
          name="promotionalPrice"
          onChange={(event) => setPromotionalPrice(event.target.value)}
          placeholder="5900"
          value={promotionalPrice}
        />
      </label>
      <label className="text-sm font-bold">
        URL de imagen (opcional)
        <input className={inputClass} defaultValue={combo?.imageUrl ?? ""} name="imageUrl" type="url" />
      </label>

      <fieldset className="rounded-2xl border border-ink/20 p-4 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <legend className="font-black">Componentes</legend>
          <button className="rounded-lg border border-ink/25 px-3 py-2 text-xs font-black" onClick={addLine} type="button">+ Agregar línea</button>
        </div>
        <div className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <div className="grid gap-2 rounded-xl bg-canvas p-3 sm:grid-cols-[1fr_7rem_auto]" key={line.key}>
              <label className="text-xs font-bold">
                Producto {index + 1}
                <select className={inputClass} onChange={(event) => updateLine(line.key, { productId: event.target.value })} value={line.productId}>
                  <option value="">Elegir producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} · stock {product.stock}{product.active && product.published && product.categoryActive ? "" : " · no disponible"}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold">
                Cantidad
                <input className={inputClass} min="1" onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })} step="1" type="number" value={line.quantity} />
              </label>
              <button className="self-end rounded-lg border border-red-300 px-3 py-2.5 text-xs font-black text-red-800 disabled:opacity-40" disabled={lines.length === 1} onClick={() => removeLine(line.key)} type="button">Quitar</button>
            </div>
          ))}
        </div>
        {hasDuplicates && <p className="mt-3 text-sm font-bold text-red-700" role="alert">El mismo producto no puede aparecer en dos líneas.</p>}
        {hasInvalidLine && <p className="mt-3 text-sm font-bold text-red-700">Elegí un producto y una cantidad mayor a cero en cada línea.</p>}
      </fieldset>

      <div className="rounded-xl bg-action p-4 text-white md:col-span-2">
        <div className="flex flex-wrap justify-between gap-3">
          <span className="text-sm text-white/75">Suma actual de componentes</span>
          <strong>{formatArsCents(referencePrice)}</strong>
        </div>
        {savings !== null && (
          <p className={`mt-2 text-sm font-bold ${savings < 0 ? "text-yellow-200" : "text-mint"}`}>
            {savings < 0
              ? `Advertencia: la promoción supera la suma por ${formatArsCents(Math.abs(savings))}. La tienda aplicará el mejor precio.`
              : `Ahorro de referencia: ${formatArsCents(savings)}`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <label className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-bold">
          <input defaultChecked={combo?.active ?? true} name="active" type="checkbox" /> Activo
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-bold">
          <input defaultChecked={combo?.published ?? false} name="published" type="checkbox" /> Publicado
        </label>
      </div>
      <button className="rounded-xl border-2 border-ink bg-action px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-45 md:col-span-2" disabled={hasDuplicates || hasInvalidLine || products.length === 0}>
        {combo ? "Guardar combo" : "Crear combo"}
      </button>
    </form>
  );
}
