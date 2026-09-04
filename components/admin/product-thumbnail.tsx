"use client";

import { useState } from "react";

export function ProductThumbnail({ imageUrl, name, size = "md" }: { imageUrl: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const sizes = { sm: "size-10", md: "size-12", lg: "h-28 w-full" };
  const showImage = Boolean(imageUrl && failedUrl !== imageUrl);

  return (
    <div className={`${sizes[size]} grid shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-canvas text-xs font-black text-ink/30`}>
      {showImage ? (
        // Admin URLs can use arbitrary HTTP(S) hosts and are intentionally not routed through next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-full object-contain p-1" loading="lazy" onError={() => setFailedUrl(imageUrl)} referrerPolicy="no-referrer" src={imageUrl!} />
      ) : <span aria-label={`Sin imagen para ${name}`}>{name.slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}
