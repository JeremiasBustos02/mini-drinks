import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Container } from "@/components/ui/container";
import { getPublicOrder } from "@/lib/db/queries/orders";

export const metadata: Metadata = {
  title: "Estado del pago | MINI.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const tokenSchema = z.uuid();
const resultLabels = {
  exito: "Volviste de Mercado Pago",
  pendiente: "Pago pendiente",
  error: "No se completó el pago",
};

export default async function PaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ resultado: string }>;
  searchParams: Promise<{ order?: string | string[]; token?: string | string[] }>;
}) {
  const [{ resultado }, query] = await Promise.all([params, searchParams]);
  if (!(resultado in resultLabels)) notFound();
  const order = typeof query.order === "string" ? query.order : "";
  const token = tokenSchema.safeParse(typeof query.token === "string" ? query.token : "");
  if (!token.success || order.length > 64) notFound();
  const result = await getPublicOrder(order, token.data);
  if (!result) notFound();

  const orderUrl = `/pedido/${encodeURIComponent(order)}?token=${encodeURIComponent(token.data)}`;
  const confirmed = ["paid", "preparing", "ready_for_pickup", "out_for_delivery", "completed"].includes(result.order.status);
  return (
    <StorefrontShell>
      <main id="contenido" className="py-14 sm:py-20">
        <Container>
          <section className="mx-auto max-w-2xl rounded-[1.75rem] bg-mint/55 p-7 sm:p-10">
            <p className="text-xs font-black tracking-[0.2em] text-action uppercase">{resultLabels[resultado as keyof typeof resultLabels]}</p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.9] uppercase">{confirmed ? "Pago confirmado" : "Estamos confirmando"}</h1>
            <p className="mt-5 text-ink/65">El regreso desde Mercado Pago no confirma por sí solo la compra. Mostramos únicamente el estado persistido que actualiza nuestro webhook.</p>
            <Link href={orderUrl} className="motion-button mt-7 inline-flex min-h-12 items-center rounded-xl bg-action px-6 py-3 font-black text-white">Ver estado del pedido</Link>
          </section>
        </Container>
      </main>
    </StorefrontShell>
  );
}
