"use client";

import { useActionState } from "react";

import { saveProductAction, type AdminFormState } from "@/app/admin/actions";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  FormSection,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { ProductImageField } from "@/components/admin/product-image-field";
import { productTypeLabels } from "@/lib/admin/presentation";
import type { CategoryRecord, ProductRecord } from "@/lib/db/schema";
import { formatArsInput } from "@/lib/money";
import { productTypeValues } from "@/types/domain";

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryRecord[];
  product?: ProductRecord;
}) {
  const [state, formAction] = useActionState(saveProductAction, {} as AdminFormState);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-2">
      {product && <input name="id" type="hidden" value={product.id} />}
      {product && <input name="expectedVersion" type="hidden" value={product.version} />}

      <FormSection description="Datos que identifican el producto en el catálogo." title="Información">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Nombre
            <input className={adminInputClass} defaultValue={product?.name} maxLength={200} name="name" required />
          </label>
          <label className="text-sm font-bold">
            Slug
            <input className={adminInputClass} defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="mini-gin" required />
            <span className="mt-1.5 block text-xs font-normal text-ink/45">Solo minúsculas, números y guiones.</span>
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            Descripción
            <textarea className={`${adminInputClass} min-h-24 resize-y`} defaultValue={product?.description} name="description" required />
          </label>
        </div>
      </FormSection>

      <div className="grid gap-4">
        <FormSection description="Organización interna y tipo comercial." title="Clasificación">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Categoría
              <select className={adminInputClass} defaultValue={product?.categoryId ?? ""} name="categoryId" required>
                <option disabled value="">Elegir categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.active ? "" : " (inactiva)"}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">
              Tipo
              <select className={adminInputClass} defaultValue={product?.productType ?? "miniature"} name="productType">
                {productTypeValues.map((type) => <option key={type} value={type}>{productTypeLabels[type]}</option>)}
              </select>
            </label>
          </div>
        </FormSection>

        <FormSection description="El stock cargado es físico; el disponible puede ser menor por reservas activas." title="Venta">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Precio en ARS
              <input className={adminInputClass} defaultValue={product ? formatArsInput(product.price) : ""} inputMode="decimal" name="price" placeholder="5900" required />
            </label>
            <label className="text-sm font-bold">
              Stock físico
              <input className={adminInputClass} defaultValue={product?.stock ?? 0} min="0" name="stock" required step="1" type="number" />
            </label>
          </div>
        </FormSection>
      </div>

      <FormSection description="Controlá si puede venderse y si aparece en la tienda." title="Visibilidad">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm font-bold">
            <input className="size-4 accent-action" defaultChecked={product?.active ?? true} name="active" type="checkbox" />
            <span><span className="block">Activo</span><span className="mt-0.5 block text-xs font-normal text-ink/45">Disponible para la operación.</span></span>
          </label>
          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm font-bold">
            <input className="size-4 accent-action" defaultChecked={product?.published ?? false} name="published" type="checkbox" />
            <span><span className="block">Publicado</span><span className="mt-0.5 block text-xs font-normal text-ink/45">Visible en el storefront.</span></span>
          </label>
        </div>
      </FormSection>

      <FormSection description="Elegí un archivo para Storage o mantené una URL externa." title="Imagen del producto">
        <ProductImageField initialImageUrl={product?.imageUrl ?? null} productName={product?.name ?? "Producto"} />
      </FormSection>

      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 lg:col-span-2" role="alert">{state.error}</p>}

      <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-end lg:col-span-2">
        <AdminSubmitButton className={`${adminPrimaryButtonClass} sm:min-w-44`} pendingLabel="Guardando producto...">
          {product ? "Guardar producto" : "Crear producto"}
        </AdminSubmitButton>
      </div>
    </form>
  );
}
