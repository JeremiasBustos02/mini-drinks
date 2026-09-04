import {
  FulfillmentBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
  ReservationStatusBadge,
} from "@/components/admin/status-badge";
import { formatAdminDateTime, orderItemTypeLabels, productTypeLabels } from "@/lib/admin/presentation";
import type { AdminOrderDetailData } from "@/lib/db/queries/admin";
import { formatArsCents } from "@/lib/money";
import type { OrderSnapshotComponent } from "@/types/checkout";

function DetailSection({ children, description, title }: { children: React.ReactNode; description?: string; title: string }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
      <div className="border-b border-ink/10 pb-3"><h2 className="font-black">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-ink/45">{description}</p>}</div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function DataItem({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return <div><dt className="text-xs font-bold text-ink/40">{label}</dt><dd className={`mt-1 text-sm ${strong ? "font-black" : "text-ink/75"}`}>{value}</dd></div>;
}

function SnapshotComponents({ components, title }: { components: OrderSnapshotComponent[]; title?: string }) {
  return (
    <div>
      {title && <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.08em] text-ink/40">{title}</p>}
      <div className="space-y-2">
        {components.map((component, index) => (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas/75 px-3 py-2 text-xs" key={`${component.productId}-${index}`}>
            <span className="min-w-0"><span className="font-black">{component.name}</span><span className="ml-1 text-ink/40">· {productTypeLabels[component.productType]}</span></span>
            <span className="shrink-0 font-bold">{component.quantity} × {formatArsCents(component.unitPrice)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetail({ data }: { data: AdminOrderDetailData }) {
  const { order, items, payments, reservation, effectiveReservationStatus } = data;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
      <div className="space-y-5">
        <DetailSection title="Resumen">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataItem label="Número" strong value={order.publicNumber} />
            <DataItem label="Fecha" value={formatAdminDateTime(order.createdAt)} />
            <DataItem label="Estado del pedido" value={<OrderStatusBadge status={order.status} />} />
            <DataItem label="Subtotal" value={formatArsCents(order.subtotal)} />
            {order.discountTotal > 0 && <DataItem label="Descuento" value={`-${formatArsCents(order.discountTotal)}`} />}
            <DataItem label="Envío" value={formatArsCents(order.deliveryTotal)} />
            <DataItem label="Total" strong value={formatArsCents(order.total)} />
          </dl>
        </DetailSection>

        <DetailSection description="La composición y los precios provienen del snapshot guardado al comprar." title={`Items (${items.length})`}>
          <div className="space-y-3">
            {items.map((item) => (
              <article className="rounded-xl border border-ink/10 p-3.5 sm:p-4" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><span className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-action">{orderItemTypeLabels[item.itemType]}</span><h3 className="mt-1 font-black">{item.displayName}</h3><p className="mt-1 text-xs text-ink/45">{item.quantity} unidad{item.quantity === 1 ? "" : "es"} × {formatArsCents(item.unitPrice)}</p></div>
                  <p className="text-lg font-black">{formatArsCents(item.subtotal)}</p>
                </div>

                {item.configuration && (
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    {item.configuration.kind === "preset_combo" ? (
                      <>
                        <SnapshotComponents components={item.configuration.components} title="Composición por unidad" />
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/50"><span>Valor individual: <strong className="text-ink">{formatArsCents(item.configuration.referencePrice)}</strong></span><span>Precio promocional: <strong className="text-ink">{item.configuration.promotionalPrice === null ? "Sin definir" : formatArsCents(item.configuration.promotionalPrice)}</strong></span></div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <SnapshotComponents components={item.configuration.baseComponents} title="Base por unidad" />
                        {item.configuration.extras.length > 0 && <SnapshotComponents components={item.configuration.extras} title="Extras por unidad" />}
                        <div className="grid gap-2 rounded-lg bg-mint/15 p-3 text-xs sm:grid-cols-2"><span>Base individual: <strong>{formatArsCents(item.configuration.individualBasePrice)}</strong></span><span>Extras: <strong>{formatArsCents(item.configuration.extrasPrice)}</strong></span><span>Combo coincidente: <strong>{item.configuration.matchedCombo?.name ?? "Ninguno"}</strong></span><span>Ahorro aplicado: <strong>{formatArsCents(item.configuration.savings)}</strong></span></div>
                      </div>
                    )}
                  </div>
                )}
                {item.hasInvalidConfiguration && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800" role="alert">No se pudo interpretar el snapshot de composición de este item.</p>}
              </article>
            ))}
          </div>
        </DetailSection>

        <DetailSection description={payments.length > 1 ? "Se muestran todos los intentos, del más reciente al más antiguo." : undefined} title="Pago">
          {payments.length === 0 ? <p className="rounded-xl bg-canvas/70 px-4 py-5 text-sm text-ink/45">Todavía no hay intentos de pago registrados.</p> : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <article className="rounded-xl border border-ink/10 p-3.5" key={payment.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-black">{payments.length > 1 ? `Intento ${payments.length - index}` : "Mercado Pago"}</p><PaymentStatusBadge status={payment.status} /></div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DataItem label="Provider" value={payment.provider} />
                    <DataItem label="Payment ID" value={<span className="break-all">{payment.providerPaymentId ?? "No asignado"}</span>} />
                    <DataItem label="Monto" strong value={`${formatArsCents(payment.amount)} ${payment.currency}`} />
                    <DataItem label="Status detail" value={payment.statusDetail ?? "Sin detalle"} />
                    <DataItem label="Fecha aprobación" value={formatAdminDateTime(payment.dateApproved)} />
                    <DataItem label="Método" value={payment.providerMetadata?.paymentMethodId ?? payment.providerMetadata?.paymentTypeId ?? "No informado"} />
                  </dl>
                  {payment.providerMetadata?.validationError && <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800">Conciliación: {payment.providerMetadata.validationError}</p>}
                </article>
              ))}
            </div>
          )}
        </DetailSection>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <DetailSection title="Cliente">
          <dl className="grid gap-4"><DataItem label="Nombre" strong value={`${order.customerName} ${order.customerLastName}`} /><DataItem label="Email" value={order.customerEmail ? <a className="break-all text-action hover:underline" href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a> : "No informado"} /><DataItem label="Teléfono" value={<a className="text-action hover:underline" href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>} /></dl>
        </DetailSection>

        <DetailSection title="Entrega">
          <div className="mb-4"><FulfillmentBadge type={order.deliveryType} /></div>
          <dl className="grid gap-4">
            {order.deliveryType === "delivery" && <><DataItem label="Dirección" strong value={order.deliveryAddress ?? "No informada"} /><DataItem label="Localidad" value={order.city ?? "No informada"} /></>}
            <DataItem label="Observaciones" value={order.notes ? <span className="whitespace-pre-wrap">{order.notes}</span> : "Sin observaciones"} />
          </dl>
        </DetailSection>

        <DetailSection description="La vigencia se deriva con la fecha actual; no modifica la reserva persistida." title="Reserva">
          <div className="mb-4"><ReservationStatusBadge status={effectiveReservationStatus} /></div>
          {reservation ? <dl className="grid gap-4"><DataItem label="Vence" value={formatAdminDateTime(reservation.expiresAt)} /><DataItem label="Consumida" value={formatAdminDateTime(reservation.consumedAt)} /><DataItem label="Liberada" value={formatAdminDateTime(reservation.releasedAt)} /></dl> : <p className="text-sm text-ink/45">No hay una reserva asociada.</p>}
        </DetailSection>

        <div className="rounded-2xl border border-mint/60 bg-mint/15 p-4 text-xs leading-5 text-action">Esta vista es informativa. Los estados de pago, pedido y reserva no pueden modificarse manualmente desde este detalle.</div>
      </aside>
    </div>
  );
}
