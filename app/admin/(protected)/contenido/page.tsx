import {
  deleteStorefrontAssetAction,
  saveStorefrontAssetAction,
} from "@/app/admin/image-actions";
import {
  adminInputClass,
  AdminPageHeader,
  adminPrimaryButtonClass,
  FormSection,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/form-submit-button";
import { AdminNotice } from "@/components/admin/notice";
import { ProductImageField } from "@/components/admin/product-image-field";
import { getAdminStorefrontAssets } from "@/lib/db/queries/storefront-assets";
import { storefrontAssetDefinitions, storefrontAssetKeys } from "@/lib/storefront/assets";

type ContentSearchParams = { error?: string; success?: string };

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<ContentSearchParams> }) {
  const [params, rows] = await Promise.all([searchParams, getAdminStorefrontAssets()]);
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader description="Administrá solamente las imágenes editoriales. Los textos y layouts permanecen en código." eyebrow="Storefront" title="Contenido" />
      <div className="mt-6"><AdminNotice error={params.error} success={params.success} /></div>
      <div className="mt-6 space-y-5">
        {storefrontAssetKeys.map((key) => {
          const asset = byKey.get(key);
          const definition = storefrontAssetDefinitions[key];
          return (
            <FormSection description={definition.description} key={key} title={definition.label}>
              <form action={saveStorefrontAssetAction}>
                <input name="assetKey" type="hidden" value={key} />
                <ProductImageField
                  fieldId={`storefront-${key}`}
                  initialImageUrl={asset?.imageUrl ?? null}
                  productName={definition.label}
                  recommendation="WebP preferido · PNG o JPEG · máximo 2 MB. Respetá la composición y safe areas documentadas."
                />
                <label className="mt-4 block text-sm font-bold">Texto alternativo<input className={adminInputClass} defaultValue={asset?.alt} maxLength={160} name="imageAlt" placeholder="Describí la imagen si aporta información" /></label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminSubmitButton className={adminPrimaryButtonClass} pendingLabel="Guardando imagen...">Reemplazar imagen</AdminSubmitButton>
                </div>
              </form>
              {asset ? <form action={deleteStorefrontAssetAction} className="mt-3"><input name="assetKey" type="hidden" value={key} /><AdminSubmitButton className="min-h-10 rounded-lg border border-red-200 px-4 text-sm font-black text-red-700 hover:bg-red-50" confirmMessage={`¿Quitar la imagen de ${definition.label} y volver al fallback?`} pendingLabel="Quitando...">Quitar imagen</AdminSubmitButton></form> : <p className="mt-3 text-xs text-ink/45">Sin valor en DB. {definition.fallbackUrl ? `Se usa ${definition.fallbackUrl}.` : "Se conserva la composición visual incluida en código."}</p>}
            </FormSection>
          );
        })}
      </div>
    </div>
  );
}
