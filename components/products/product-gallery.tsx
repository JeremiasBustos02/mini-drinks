"use client";

import { useEffect, useRef, useState } from "react";

import { ProductVisual } from "@/components/products/product-visual";
import type { CatalogImage, ProductType, VisualVariant } from "@/types/catalog";

type ProductGalleryProps = {
  images: CatalogImage[];
  name: string;
  productType?: ProductType;
  variant: VisualVariant;
  volumeLabel?: string;
};

export function ProductGallery({ images, name, productType, variant, volumeLabel }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = images[selectedIndex] ?? images[0];
  const imageCount = images.length;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>("button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft") setSelectedIndex((index) => (index - 1 + imageCount) % imageCount);
      if (event.key === "ArrowRight") setSelectedIndex((index) => (index + 1) % imageCount);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (dialog?.open) dialog.close();
      trigger?.focus();
    };
  }, [imageCount, open]);

  if (!selected) {
    return <ProductVisual variant={variant} volumeLabel={volumeLabel} productType={productType} className="product-detail-media aspect-[3/4] !h-auto" />;
  }

  return (
    <>
      <button ref={triggerRef} className="product-detail-media group relative block aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] bg-white" onClick={() => setOpen(true)} type="button">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={selected.alt || name} className="size-full object-contain p-5 sm:p-8" src={selected.imageUrl} />
        <span className="absolute right-4 bottom-4 rounded-full bg-ink px-3 py-2 text-xs font-black text-white transition group-hover:bg-action">Ampliar imagen</span>
      </button>
      {images.length > 1 ? (
        <div aria-label="Elegir imagen" className="mt-3 grid grid-cols-4 gap-2" role="group">
          {images.map((image, index) => (
            <button aria-label={`Ver imagen ${index + 1} de ${name}`} aria-pressed={index === selectedIndex} className={`aspect-square min-h-12 overflow-hidden rounded-xl border-2 bg-white ${index === selectedIndex ? "border-action" : "border-transparent"}`} key={image.id} onClick={() => setSelectedIndex(index)} type="button">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="size-full object-contain p-1.5" decoding="async" loading="lazy" src={image.imageUrl} />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <dialog aria-label={`Galería de ${name}`} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none place-items-center bg-transparent p-3 backdrop:bg-ink/90 open:grid sm:p-6" onCancel={() => setOpen(false)} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} ref={dialogRef}>
          <div className="relative flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col rounded-[1.5rem] bg-paper p-3 sm:max-h-[calc(100dvh-3rem)] sm:p-5">
             <div className="flex items-center justify-between gap-3 pb-3"><p aria-live="polite" className="truncate text-sm font-black">{name} · {selectedIndex + 1} de {images.length}</p><button aria-label="Cerrar galería" className="grid size-11 place-items-center rounded-full border-2 border-ink bg-white text-xl font-black" onClick={() => setOpen(false)} type="button">×</button></div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={selected.alt || name} className="size-full object-contain p-3 sm:p-6" src={selected.imageUrl} />
              {images.length > 1 ? <><button aria-label="Imagen anterior" className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink text-xl font-black text-white sm:left-4" onClick={() => setSelectedIndex((index) => (index - 1 + images.length) % images.length)} type="button">←</button><button aria-label="Imagen siguiente" className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink text-xl font-black text-white sm:right-4" onClick={() => setSelectedIndex((index) => (index + 1) % images.length)} type="button">→</button></> : null}
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
