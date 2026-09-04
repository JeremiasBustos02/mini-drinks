"use client";

import { useRouter } from "next/navigation";

import { ArrowBackIcon } from "@/components/ui/icons";

type BackButtonProps = {
  fallbackHref: string;
};

export function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    const hasInternalReferrer = document.referrer.startsWith(window.location.origin);

    if (hasInternalReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="motion-button inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-ink/20 bg-white px-4 py-2 text-sm font-bold text-ink shadow-[0_3px_0_rgb(13_13_13_/_14%)] hover:border-action hover:text-action"
    >
      <ArrowBackIcon className="size-4" />
      Volver
    </button>
  );
}
