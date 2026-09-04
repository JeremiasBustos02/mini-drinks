"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { createOrderAction, quoteCheckoutAction } from "@/app/checkout/actions";
import { useCartHydration } from "@/components/cart/use-cart-hydration";
import { Container } from "@/components/ui/container";
import { getCartSubtotal } from "@/lib/cart/cart-utils";
import { formatArsCents } from "@/lib/money";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";
import type {
  CheckoutCartLine,
  CheckoutFailure,
  CheckoutPayload,
  ResolvedCheckout,
} from "@/types/checkout";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-base outline-none transition focus:border-action";
const checkoutAttemptStorageKey = "mini-checkout-attempt-v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toCheckoutLines(items: CartItem[]): CheckoutCartLine[] | null {
  const lines: CheckoutCartLine[] = [];
  for (const item of items) {
    if (item.type === "product") {
      lines.push({
        type: "product",
        productId: item.productId,
        quantity: item.quantity,
        displayedUnitPrice: item.unitPrice,
      });
      continue;
    }
    if (item.type === "combo") {
      lines.push({
        type: "combo",
        comboId: item.comboId,
        quantity: item.quantity,
        displayedUnitPrice: item.unitPrice,
      });
      continue;
    }
    if (item.type === "custom_combo") {
      const quantities = new Map(item.components.map((component) => [component.productId, component.quantity]));
      lines.push({
        type: "custom_combo",
        quantity: item.quantity,
        displayedUnitPrice: item.unitPrice,
        components: [
          { role: "miniature", productId: item.configuration.miniatureId, quantity: quantities.get(item.configuration.miniatureId) ?? 1 },
          { role: "mixer", productId: item.configuration.mixerId, quantity: quantities.get(item.configuration.mixerId) ?? 1 },
          { role: "glass", productId: item.configuration.glassId, quantity: quantities.get(item.configuration.glassId) ?? 1 },
          ...item.configuration.extraIds.map((productId) => ({
            role: "extra" as const,
            productId,
            quantity: quantities.get(productId) ?? 1,
          })),
        ],
      });
      continue;
    }
    return null;
  }
  return lines;
}

function getComponents(line: ResolvedCheckout["lines"][number]) {
  const configuration = line.configurationJson;
  if (!configuration) return [];
  return configuration.kind === "preset_combo"
    ? configuration.components
    : [...configuration.baseComponents, ...configuration.extras];
}

function CheckoutSummary({ quote, items }: { quote: ResolvedCheckout | null; items: CartItem[] }) {
  if (!quote) {
    return (
      <div className="rounded-[1.5rem] bg-white p-5 sm:p-6">
        <p className="text-xs font-black tracking-[0.16em] text-action uppercase">Resumen actual</p>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.lineId} className="flex justify-between gap-4 border-b border-ink/10 pb-4 text-sm">
              <div><p className="font-black">{item.quantity} x {item.name}</p>{item.type !== "product" ? <p className="mt-1 text-xs text-ink/55">{item.components.map((component) => `${component.quantity} x ${component.name}`).join(" · ")}</p> : null}</div>
              <p className="shrink-0 font-bold">{formatArsCents(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between border-t-2 border-ink pt-4">
          <div><p className="font-black">Estimado</p><p className="text-xs text-ink/55">Se recalcula en servidor.</p></div>
          <p className="text-2xl font-black">{formatArsCents(getCartSubtotal(items))}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] bg-white p-5 sm:p-6">
      <p className="text-xs font-black tracking-[0.16em] text-action uppercase">Total validado</p>
      <div className="mt-4 space-y-4">
        {quote.lines.map((line) => (
          <div key={line.lineIndex} className="border-b border-ink/10 pb-4 text-sm">
            <div className="flex justify-between gap-4"><p className="font-black">{line.quantity} x {line.displayName}</p><p className="shrink-0 font-bold">{formatArsCents(line.subtotal)}</p></div>
            {getComponents(line).length > 0 ? <p className="mt-1 text-xs text-ink/55">{getComponents(line).map((component) => `${component.quantity} x ${component.name}`).join(" · ")}</p> : null}
            {line.priceChanged ? <p className="mt-2 text-xs font-bold text-action">Precio actualizado de {formatArsCents(line.previousUnitPrice!)} a {formatArsCents(line.unitPrice)}.</p> : null}
          </div>
        ))}
      </div>
      <dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{formatArsCents(quote.subtotal)}</dd></div><div className="flex justify-between"><dt>Entrega</dt><dd className="font-bold">{quote.deliveryTotal === 0 ? "Sin cargo definido" : formatArsCents(quote.deliveryTotal)}</dd></div></dl>
      <div className="mt-4 flex items-end justify-between border-t-2 border-ink pt-4"><p className="font-black">Total</p><p className="text-2xl font-black">{formatArsCents(quote.total)}</p></div>
    </div>
  );
}

export function CheckoutPage() {
  const hydrated = useCartHydration();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [quote, setQuote] = useState<ResolvedCheckout | null>(null);
  const [quoteHash, setQuoteHash] = useState("");
  const [quoteCartSignature, setQuoteCartSignature] = useState("");
  const [error, setError] = useState<CheckoutFailure | null>(null);
  const [isPending, startTransition] = useTransition();
  const checkoutAttemptId = useRef("");
  const accessToken = useRef("");
  const cartSignature = JSON.stringify(items);
  const activeQuote = quoteCartSignature === cartSignature ? quote : null;

  function ensureIdentifiers() {
    if (!checkoutAttemptId.current || !accessToken.current) {
      try {
        const stored = JSON.parse(localStorage.getItem(checkoutAttemptStorageKey) ?? "null") as {
          checkoutAttemptId?: unknown;
          accessToken?: unknown;
        } | null;
        if (
          typeof stored?.checkoutAttemptId === "string" &&
          typeof stored.accessToken === "string" &&
          uuidPattern.test(stored.checkoutAttemptId) &&
          uuidPattern.test(stored.accessToken)
        ) {
          checkoutAttemptId.current = stored.checkoutAttemptId;
          accessToken.current = stored.accessToken;
        }
      } catch {
        localStorage.removeItem(checkoutAttemptStorageKey);
      }
    }
    checkoutAttemptId.current ||= crypto.randomUUID();
    accessToken.current ||= crypto.randomUUID();
    localStorage.setItem(checkoutAttemptStorageKey, JSON.stringify({
      checkoutAttemptId: checkoutAttemptId.current,
      accessToken: accessToken.current,
    }));
  }

  function payloadFromForm(form: HTMLFormElement): CheckoutPayload | null {
    ensureIdentifiers();
    const lines = toCheckoutLines(items);
    if (!lines) return null;
    const data = new FormData(form);
    const base = {
      checkoutAttemptId: checkoutAttemptId.current,
      accessToken: accessToken.current,
      customer: {
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
      },
      notes: String(data.get("notes") ?? "") || undefined,
      lines,
    };
    return fulfillment === "pickup"
      ? { ...base, fulfillment: { type: "pickup" } }
      : {
          ...base,
          fulfillment: {
            type: "delivery",
            address: {
              street: String(data.get("street") ?? ""),
              number: String(data.get("number") ?? ""),
              locality: String(data.get("locality") ?? ""),
              reference: String(data.get("reference") ?? "") || undefined,
            },
          },
        };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = payloadFromForm(event.currentTarget);
    if (!payload) {
      setError({ ok: false, code: "invalid_payload", message: "El carrito contiene un tipo que todavía no admite checkout." });
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (!activeQuote) {
          const result = await quoteCheckoutAction(payload);
          if (result.ok) {
            setQuote(result.quote);
            setQuoteHash(result.quoteHash);
            setQuoteCartSignature(cartSignature);
          } else setError(result);
          return;
        }
        const result = await createOrderAction({
          ...payload,
          acceptedTotal: activeQuote.total,
          acceptedQuoteHash: quoteHash,
        });
        if (result.ok) {
          localStorage.removeItem(checkoutAttemptStorageKey);
          if (JSON.stringify(useCartStore.getState().items) === cartSignature) clearCart();
          window.location.assign(result.paymentUrl);
        } else {
          setError(result);
          if (result.quote && result.quoteHash) {
            setQuote(result.quote);
            setQuoteHash(result.quoteHash);
            setQuoteCartSignature(cartSignature);
          }
        }
      } catch {
        setError({
          ok: false,
          code: "order_not_created",
          message: "No pudimos comunicarnos con el servidor. Tu carrito sigue guardado.",
        });
      }
    });
  }

  if (!hydrated) return <section className="py-12"><Container><div className="h-96 rounded-[1.5rem] bg-white" /></Container></section>;
  if (items.length === 0) return <section className="py-16"><Container><div className="mx-auto max-w-xl rounded-[1.5rem] bg-white p-8 text-center"><h1 className="font-display text-4xl uppercase">Tu carrito está vacío</h1><Link href="/productos" className="motion-button mt-6 inline-flex rounded-xl bg-action px-6 py-3 font-black text-white">Ver productos</Link></div></Container></section>;

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <Container>
        <div className="max-w-3xl"><p className="text-xs font-black tracking-[0.2em] text-action uppercase">Último paso</p><h1 className="mt-2 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.04em] uppercase">Completá tu pedido</h1><p className="mt-4 max-w-2xl text-ink/65">Primero validamos el total con el catálogo y stock actuales. Después te pedimos una confirmación final.</p></div>
        <form onSubmit={handleSubmit} onChange={() => { setQuote(null); setQuoteHash(""); setError(null); }} className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="space-y-6">
            <fieldset className="rounded-[1.5rem] bg-white p-5 sm:p-7"><legend className="px-2 font-display text-2xl uppercase">Tus datos</legend><div className="mt-2 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Nombre<input name="firstName" autoComplete="given-name" required maxLength={80} className={fieldClass} /></label><label className="text-sm font-bold">Apellido<input name="lastName" autoComplete="family-name" required maxLength={80} className={fieldClass} /></label><label className="text-sm font-bold">Teléfono<input name="phone" type="tel" autoComplete="tel" required maxLength={40} className={fieldClass} /></label><label className="text-sm font-bold">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} /></label></div></fieldset>
            <fieldset className="rounded-[1.5rem] bg-white p-5 sm:p-7"><legend className="px-2 font-display text-2xl uppercase">Entrega</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-xl border-2 p-4 ${fulfillment === "pickup" ? "border-action bg-mint/35" : "border-ink/15"}`}><input type="radio" name="fulfillment" value="pickup" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} className="mr-2" /><span className="font-black">Retiro</span><span className="mt-1 block text-xs text-ink/60">Coordinamos el punto y horario.</span></label><label className={`cursor-pointer rounded-xl border-2 p-4 ${fulfillment === "delivery" ? "border-action bg-mint/35" : "border-ink/15"}`}><input type="radio" name="fulfillment" value="delivery" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")} className="mr-2" /><span className="font-black">Envío local</span><span className="mt-1 block text-xs text-ink/60">Entrega propia, sujeta a coordinación.</span></label></div>{fulfillment === "delivery" ? <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]"><label className="text-sm font-bold">Calle<input name="street" autoComplete="address-line1" required maxLength={120} className={fieldClass} /></label><label className="text-sm font-bold">Número<input name="number" required maxLength={20} className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Localidad<input name="locality" autoComplete="address-level2" required maxLength={100} className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Referencia <span className="font-normal text-ink/50">(opcional)</span><input name="reference" maxLength={240} className={fieldClass} /></label></div> : null}</fieldset>
            <label className="block rounded-[1.5rem] bg-white p-5 text-sm font-bold sm:p-7">Observaciones <span className="font-normal text-ink/50">(opcional)</span><textarea name="notes" maxLength={500} rows={3} className={fieldClass} /></label>
          </div>
          <aside className="lg:sticky lg:top-28"><CheckoutSummary quote={activeQuote} items={items} />{activeQuote ? <div className="mt-4 rounded-xl border-2 border-action bg-mint/40 p-4 text-sm font-bold">{activeQuote.hasPriceChanges ? "El total fue actualizado. Revisalo antes de pagar." : "Total validado. Al continuar reservamos el stock y abrimos Mercado Pago."}</div> : null}{error ? <p role="alert" className="mt-4 rounded-xl border-2 border-red-800 bg-red-50 p-4 text-sm font-bold text-red-900">{error.message}</p> : null}<button type="submit" disabled={isPending} className="motion-button mt-4 flex min-h-13 w-full items-center justify-center rounded-xl bg-action px-6 py-3 text-base font-black text-white disabled:cursor-wait disabled:opacity-60">{isPending ? "Preparando pago..." : activeQuote ? "Pagar con Mercado Pago" : "Validar total"}</button><Link href="/carrito" className="motion-button mt-4 flex min-h-11 items-center justify-center text-sm font-bold text-action underline decoration-2 underline-offset-4">Volver al carrito</Link></aside>
        </form>
      </Container>
    </section>
  );
}
