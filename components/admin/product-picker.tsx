"use client";

import { useDeferredValue, useState } from "react";

import { adminInputClass, ProductThumbnail } from "@/components/admin/admin-ui";
import { productTypeLabels } from "@/lib/admin/presentation";
import { formatArsCents } from "@/lib/money";
import type { ProductType } from "@/types/domain";

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
  productType: ProductType;
  imageUrl: string | null;
  active: boolean;
  published: boolean;
  categoryActive: boolean;
};

export function ProductPicker({
  onAdd,
  products,
  selectedIds,
}: {
  onAdd: (productId: string) => void;
  products: ProductOption[];
  selectedIds: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("es"));
  const filteredProducts = products.filter((product) => product.name.toLocaleLowerCase("es").includes(deferredSearch));

  return (
    <div>
      <label className="block text-sm font-bold" htmlFor="combo-product-search">
        Buscar productos
        <input className={adminInputClass} id="combo-product-search" onChange={(event) => setSearch(event.target.value)} placeholder="Nombre del producto" type="search" value={search} />
      </label>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2">
        {filteredProducts.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink/45">No hay productos que coincidan.</p>
        ) : filteredProducts.map((product) => {
          const selected = selectedIds.has(product.id);
          const operational = product.active && product.published && product.categoryActive;
          return (
            <div className="flex items-center gap-3 rounded-xl border border-transparent p-2 hover:border-ink/10 hover:bg-canvas/60" key={product.id}>
              <ProductThumbnail imageUrl={product.imageUrl} name={product.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{product.name}</p>
                <p className="mt-0.5 text-xs text-ink/45">{productTypeLabels[product.productType]} · {formatArsCents(product.price)} · stock {product.stock}</p>
                {!operational && <p className="mt-0.5 text-xs font-bold text-amber-700">No disponible en tienda</p>}
              </div>
              <button className="min-h-9 shrink-0 rounded-lg border border-action/20 px-3 text-xs font-black text-action hover:bg-mint/20 disabled:border-ink/10 disabled:text-ink/35" disabled={selected} onClick={() => onAdd(product.id)} type="button">
                {selected ? "Agregado" : "Agregar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
