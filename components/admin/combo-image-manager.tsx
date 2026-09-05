import {
  addComboImageAction,
  deleteComboImageAction,
  moveComboImageAction,
  setPrimaryComboImageAction,
} from "@/app/admin/image-actions";
import {
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  FormSection,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { ProductImageField } from "@/components/admin/product-image-field";

export type ManagedComboImage = {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export function ComboImageManager({ comboId, comboName, images }: { comboId: string; comboName: string; images: ManagedComboImage[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" id="imagenes">
      <FormSection description="Subí una imagen por vez o usá una URL pública. La primera será principal automáticamente." title="Agregar imagen">
        <form action={addComboImageAction}>
          <input name="comboId" type="hidden" value={comboId} />
          <ProductImageField fieldId={`combo-${comboId}`} initialImageUrl={null} productName={comboName} />
          <label className="mt-4 block text-sm font-bold">Texto alternativo<input className={adminInputClass} maxLength={160} name="imageAlt" placeholder={comboName} /></label>
          <AdminSubmitButton className={`${adminPrimaryButtonClass} mt-4 w-full`} pendingLabel="Agregando imagen...">Agregar imagen</AdminSubmitButton>
        </form>
      </FormSection>

      <FormSection description="La principal se usa en cards y metadata. El orden define la galería de la ficha." title={`Galería (${images.length})`}>
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/15 bg-white px-4 py-8 text-center text-sm text-ink/45">Todavía no hay imágenes. Mientras tanto se usa la URL anterior o el fallback visual.</div>
        ) : (
          <ol className="space-y-3">
            {images.map((image, index) => (
              <li className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-xl border border-ink/10 bg-white p-3" key={image.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="aspect-[3/4] size-full rounded-lg bg-canvas object-contain p-1" src={image.imageUrl} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-black">{image.alt || comboName}</p>{image.isPrimary && <span className="rounded-full bg-mint px-2 py-1 text-[0.65rem] font-black text-action">Principal</span>}</div>
                  <p className="mt-1 truncate text-xs text-ink/40">{image.imageUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!image.isPrimary && <form action={setPrimaryComboImageAction}><input name="comboId" type="hidden" value={comboId} /><input name="imageId" type="hidden" value={image.id} /><AdminSubmitButton className={adminSecondaryButtonClass} pendingLabel="Actualizando...">Hacer principal</AdminSubmitButton></form>}
                    <form action={moveComboImageAction}><input name="comboId" type="hidden" value={comboId} /><input name="imageId" type="hidden" value={image.id} /><input name="direction" type="hidden" value="up" /><AdminSubmitButton className={adminSecondaryButtonClass} disabled={image.isPrimary || index === 1} pendingLabel="Moviendo...">Subir</AdminSubmitButton></form>
                    <form action={moveComboImageAction}><input name="comboId" type="hidden" value={comboId} /><input name="imageId" type="hidden" value={image.id} /><input name="direction" type="hidden" value="down" /><AdminSubmitButton className={adminSecondaryButtonClass} disabled={image.isPrimary || index === images.length - 1} pendingLabel="Moviendo...">Bajar</AdminSubmitButton></form>
                    <form action={deleteComboImageAction}><input name="comboId" type="hidden" value={comboId} /><input name="imageId" type="hidden" value={image.id} /><AdminSubmitButton className="min-h-10 rounded-lg border border-red-200 px-3 text-xs font-black text-red-700 hover:bg-red-50" confirmMessage="¿Eliminar esta imagen del combo?" pendingLabel="Eliminando...">Eliminar</AdminSubmitButton></form>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </FormSection>
    </div>
  );
}
