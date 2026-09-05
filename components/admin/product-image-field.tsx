"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { adminInputClass, adminSecondaryButtonClass } from "@/components/admin/admin-ui";
import {
  getProductImageDimensionWarning,
  isValidProductImageUrl,
  PRODUCT_IMAGE_ACCEPT,
  validateProductImageFile,
  type ProductImageMode,
} from "@/lib/admin/product-images";

function ImagePreview({ alt, src }: { alt: string; src: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const failed = Boolean(src && failedUrl === src);
  const loaded = Boolean(src && loadedUrl === src);

  return (
    <div className="relative grid h-64 w-full place-items-center overflow-hidden rounded-2xl border border-ink/10 bg-white sm:h-72">
      {src && !failed ? (
        // URLs can be external or from Supabase Storage, so the admin intentionally avoids a global next/image allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} className={`size-full object-contain p-3 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`} onError={() => setFailedUrl(src)} onLoad={() => setLoadedUrl(src)} referrerPolicy="no-referrer" src={src} />
      ) : null}
      {src && !loaded && !failed && <span className="absolute inline-flex items-center gap-2 text-xs font-bold text-ink/45"><span className="size-3.5 animate-spin rounded-full border-2 border-action border-r-transparent" /> Cargando preview...</span>}
      {(!src || failed) && <div className="px-5 text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-action"><svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 21" /></svg></div><p className="mt-3 text-sm font-black">{failed ? "No se pudo cargar la imagen" : "Sin imagen seleccionada"}</p><p className="mt-1 text-xs leading-5 text-ink/45">{failed ? "Revisá la URL o elegí otro archivo." : "La vista previa aparecerá acá."}</p></div>}
    </div>
  );
}

export function ProductImageField({
  fieldId = "product-image",
  initialImageUrl,
  productName,
  recommendation = "Recomendado: 1200 × 1600 px · proporción 3:4 · WebP, PNG o JPG · máximo 2 MB",
}: {
  fieldId?: string;
  initialImageUrl: string | null;
  productName: string;
  recommendation?: string;
}) {
  const { pending } = useFormStatus();
  const [mode, setMode] = useState<ProductImageMode>("url");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dimensionWarning, setDimensionWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionVersion = useRef(0);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const trimmedUrl = imageUrl.trim();
  const urlIsValid = !trimmedUrl || isValidProductImageUrl(trimmedUrl);
  const urlWarning = urlIsValid && trimmedUrl.startsWith("http://")
    ? "Preferí HTTPS para evitar bloqueos en producción."
    : null;

  function clearSelectedFile(error: string | null = null) {
    selectionVersion.current += 1;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setDimensionWarning(null);
    setFileError(error);
  }

  function changeMode(nextMode: ProductImageMode) {
    if (nextMode === mode) return;
    if (nextMode === "url") clearSelectedFile();
    setMode(nextMode);
  }

  function handleFile(file: File | undefined) {
    if (!file) {
      clearSelectedFile();
      return;
    }
    const validation = validateProductImageFile(file);
    if (!validation.ok) {
      clearSelectedFile(validation.error);
      return;
    }

    const version = selectionVersion.current + 1;
    selectionVersion.current = version;
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(previewUrl);
    setFileError(null);
    setDimensionWarning(null);

    const image = new window.Image();
    image.onload = () => {
      if (selectionVersion.current !== version) return;
      setDimensionWarning(getProductImageDimensionWarning(image.naturalWidth, image.naturalHeight));
    };
    image.onerror = () => {
      if (selectionVersion.current !== version) return;
      clearSelectedFile("No se pudo leer la imagen. Elegí un archivo WebP, PNG o JPG válido.");
    };
    image.src = previewUrl;
  }

  return (
    <div>
      <input name="imageMode" type="hidden" value={mode} />
      <div aria-label="Origen de la imagen" className="grid grid-cols-2 rounded-xl border border-ink/10 bg-white p-1" role="group">
        <button aria-pressed={mode === "upload"} className={`min-h-10 rounded-lg px-3 text-sm font-black transition ${mode === "upload" ? "bg-action text-white" : "text-ink/55 hover:bg-canvas"}`} onClick={() => changeMode("upload")} type="button">Subir archivo</button>
        <button aria-pressed={mode === "url"} className={`min-h-10 rounded-lg px-3 text-sm font-black transition ${mode === "url" ? "bg-action text-white" : "text-ink/55 hover:bg-canvas"}`} onClick={() => changeMode("url")} type="button">Usar URL</button>
      </div>

      <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-[minmax(0,0.85fr)_minmax(16rem,1.15fr)]">
        <ImagePreview alt={`Vista previa de ${productName}`} src={mode === "url" && urlIsValid ? trimmedUrl || null : filePreviewUrl} />

        <div className="min-w-0">
          <div className="rounded-xl border border-mint/60 bg-mint/15 p-3.5">
            <p className="text-xs font-black text-action">{recommendation}</p>
            <p className="mt-1.5 text-xs leading-5 text-ink/50">Usá fondo transparente o limpio, producto centrado, márgenes moderados y buena iluminación.</p>
          </div>

          {mode === "url" ? (
            <div className="mt-4">
              <label className="block text-sm font-bold" htmlFor={`${fieldId}-url`}>URL de imagen<input aria-describedby={`${fieldId}-url-help ${fieldId}-url-error`} aria-invalid={!urlIsValid} className={adminInputClass} id={`${fieldId}-url`} maxLength={2048} name="imageUrl" onChange={(event) => setImageUrl(event.target.value)} pattern="https?://.+" placeholder="https://..." type="url" value={imageUrl} /></label>
              <p className="mt-1.5 text-xs leading-5 text-ink/45" id={`${fieldId}-url-help`}>Puede ser una URL externa o una URL pública existente de Storage.</p>
              {!urlIsValid && <p className="mt-2 text-xs font-bold text-red-700" id={`${fieldId}-url-error`} role="alert">Ingresá una URL completa que comience con http:// o https://.</p>}
              {urlWarning && <p className="mt-2 text-xs font-bold text-amber-700" role="status">{urlWarning}</p>}
              {trimmedUrl && <button className={`${adminSecondaryButtonClass} mt-3`} onClick={() => setImageUrl("")} type="button">Quitar imagen</button>}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block text-sm font-bold" htmlFor={`${fieldId}-file`}>Archivo de imagen</label>
              <input accept={PRODUCT_IMAGE_ACCEPT} aria-describedby={`${fieldId}-file-help ${fieldId}-file-error`} className="mt-1.5 block min-h-11 w-full min-w-0 rounded-xl border border-ink/15 bg-white text-sm text-ink file:mr-3 file:min-h-11 file:border-0 file:border-r file:border-ink/10 file:bg-canvas file:px-3 file:text-sm file:font-black file:text-action hover:file:bg-mint/20" id={`${fieldId}-file`} name="imageFile" onChange={(event) => handleFile(event.target.files?.[0])} ref={fileInputRef} required type="file" />
              <p className="mt-1.5 text-xs leading-5 text-ink/45" id={`${fieldId}-file-help`}>La imagen se subirá al guardar.</p>
              {selectedFile && <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-3"><div className="min-w-0"><p className="truncate text-sm font-black">{selectedFile.name}</p><p className="mt-0.5 text-xs text-ink/45">{Math.ceil(selectedFile.size / 1024)} KB · Lista para subir</p></div><button className="shrink-0 text-xs font-black text-red-700 hover:underline" onClick={() => clearSelectedFile()} type="button">Cancelar</button></div>}
              {fileError && <p className="mt-2 text-xs font-bold text-red-700" id={`${fieldId}-file-error`} role="alert">{fileError}</p>}
              {dimensionWarning && <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800" role="status">{dimensionWarning}</p>}
            </div>
          )}

          {pending && mode === "upload" && <p className="mt-4 inline-flex items-center gap-2 text-sm font-black text-action" role="status"><span className="size-4 animate-spin rounded-full border-2 border-action border-r-transparent" /> Subiendo imagen...</p>}
        </div>
      </div>
    </div>
  );
}
