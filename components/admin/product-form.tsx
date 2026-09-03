import { saveProductAction } from "@/app/admin/actions";
import type { CategoryRecord, ProductRecord } from "@/lib/db/schema";
import { formatArsInput } from "@/lib/money";
import { productTypeValues, type ProductType } from "@/types/domain";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink/25 bg-white px-3 py-2.5 text-sm outline-none focus:border-action focus:ring-2 focus:ring-mint";
const labels: Record<ProductType, string> = {
  miniature: "Miniatura",
  mixer: "Mixer",
  glass: "Vaso",
  extra: "Extra",
  accessory: "Accesorio",
  supply: "Insumo",
};

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryRecord[];
  product?: ProductRecord;
}) {
  return (
    <form action={saveProductAction} className="grid gap-4 md:grid-cols-2">
      {product && <input name="id" type="hidden" value={product.id} />}
      {product && <input name="revision" type="hidden" value={product.updatedAt.toISOString()} />}
      <label className="text-sm font-bold">
        Nombre
        <input className={inputClass} defaultValue={product?.name} name="name" required />
      </label>
      <label className="text-sm font-bold">
        Slug
        <input className={inputClass} defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
      </label>
      <label className="text-sm font-bold">
        Categoría
        <select className={inputClass} defaultValue={product?.categoryId ?? ""} name="categoryId" required>
          <option disabled value="">Elegir categoría</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="text-sm font-bold">
        Tipo
        <select className={inputClass} defaultValue={product?.productType ?? "miniature"} name="productType">
          {productTypeValues.map((type) => <option key={type} value={type}>{labels[type]}</option>)}
        </select>
      </label>
      <label className="text-sm font-bold">
        Precio en ARS
        <input className={inputClass} defaultValue={product ? formatArsInput(product.price) : ""} inputMode="decimal" name="price" placeholder="5900" required />
      </label>
      <label className="text-sm font-bold">
        Stock
        <input className={inputClass} defaultValue={product?.stock ?? 0} min="0" name="stock" required step="1" type="number" />
      </label>
      <label className="text-sm font-bold md:col-span-2">
        Descripción
        <textarea className={`${inputClass} min-h-24 resize-y`} defaultValue={product?.description} name="description" required />
      </label>
      <label className="text-sm font-bold md:col-span-2">
        URL de imagen (opcional)
        <input className={inputClass} defaultValue={product?.imageUrl ?? ""} name="imageUrl" placeholder="https://..." type="url" />
      </label>
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <label className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-bold">
          <input defaultChecked={product?.active ?? true} name="active" type="checkbox" /> Activo
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-bold">
          <input defaultChecked={product?.published ?? false} name="published" type="checkbox" /> Publicado
        </label>
      </div>
      <button className="rounded-xl border-2 border-ink bg-action px-4 py-3 font-black text-white md:col-span-2">
        {product ? "Guardar producto" : "Crear producto"}
      </button>
    </form>
  );
}
