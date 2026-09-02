import { Container } from "@/components/ui/container";

export function FulfillmentInfo() {
  return (
    <section className="border-y border-ink/10 bg-white py-10 sm:py-14">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2">
          <article className="rounded-xl bg-canvas p-5 sm:p-6">
            <p className="text-xs font-black tracking-[0.18em] text-action uppercase">Delivery</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-base">
              Delivery propio en zonas habilitadas de Mar del Plata y Balcarce.
            </p>
          </article>
          <article className="rounded-xl bg-canvas p-5 sm:p-6">
            <p className="text-xs font-black tracking-[0.18em] text-action uppercase">Retiro</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/65 sm:text-base">
              Retiro disponible. Punto y horarios a confirmar antes del lanzamiento.
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
