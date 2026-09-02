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
      className="motion-button inline-flex items-center gap-2 text-sm font-bold text-ink/65 transition-colors hover:text-action"
    >
      <ArrowBackIcon className="size-4" />
      Volver
    </button>
  );
}
