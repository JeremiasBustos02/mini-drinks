import { orderTracker } from "@/lib/account/order-presentation";
import type { DeliveryType, OrderStatus } from "@/types/domain";

export function OrderTracker({
  deliveryType,
  status,
}: {
  deliveryType: DeliveryType;
  status: OrderStatus;
}) {
  const tracker = orderTracker(status, deliveryType);
  if (tracker.exceptional)
    return (
      <section className="mt-6 rounded-2xl border border-action/25 bg-mint/20 p-5">
        <p className="font-black">{tracker.title}</p>
        <p className="mt-2 text-sm leading-6 text-ink/65">{tracker.body}</p>
      </section>
    );
  return (
    <section className="mt-6 rounded-2xl border border-ink/10 bg-paper p-5">
      <p className="text-xs font-black uppercase tracking-[.14em] text-action">
        Seguimiento
      </p>
      <p className="mt-2 font-bold">{tracker.title}</p>
      <p className="mt-1 text-sm text-ink/65">{tracker.body}</p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-5">
        {tracker.steps.map((step, index) => (
          <li className="flex items-center gap-2 sm:block" key={step}>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${index < tracker.current ? "bg-mint text-ink" : index === tracker.current ? "bg-action text-white" : "bg-ink/10 text-ink/45"}`}
            >
              {index + 1}
            </span>
            <p
              className={`text-xs font-bold sm:mt-2 ${index === tracker.current ? "text-ink" : "text-ink/55"}`}
            >
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
