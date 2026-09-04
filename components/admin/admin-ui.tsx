import Link from "next/link";

export { ProductThumbnail } from "@/components/admin/product-thumbnail";

export const adminInputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-action focus:ring-3 focus:ring-mint/45";
export const adminPrimaryButtonClass = "inline-flex min-h-11 items-center justify-center rounded-xl bg-action px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#013512] disabled:cursor-not-allowed disabled:opacity-50";
export const adminSecondaryButtonClass = "inline-flex min-h-10 items-center justify-center rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm font-bold text-ink transition hover:border-ink/30 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50";

export function AdminPageHeader({
  action,
  eyebrow,
  title,
  description,
}: {
  action?: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-action">{eyebrow}</p>
        <h1 className="mt-1.5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <fieldset className="rounded-2xl border border-ink/10 bg-canvas/65 p-4 sm:p-5">
      <legend className="px-1 text-sm font-black">{title}</legend>
      {description && <p className="mb-4 text-xs leading-5 text-ink/50">{description}</p>}
      {children}
    </fieldset>
  );
}

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-white px-5 py-10 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-mint/30 text-action">
        <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01" /><circle cx="12" cy="12" r="9" /></svg>
      </div>
      <h2 className="mt-3 font-black">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink/50">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function QuickLink({ description, href, label }: { description: string; href: string; label: string }) {
  return (
    <Link className="group flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white p-4 transition hover:border-action/35" href={href}>
      <span>
        <span className="block text-sm font-black">{label}</span>
        <span className="mt-0.5 block text-xs text-ink/45">{description}</span>
      </span>
      <span aria-hidden="true" className="text-lg text-action transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export function StatCard({ href, label, value, tone = "neutral" }: { href: string; label: string; value: number; tone?: "neutral" | "green" | "amber" | "blue" }) {
  const tones = { neutral: "bg-ink/10", green: "bg-action", amber: "bg-amber-500", blue: "bg-sky-600" };
  return (
    <Link className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-sm" href={href}>
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tones[tone]}`} />
      <p className="text-sm font-bold text-ink/50">{label}</p>
      <div className="mt-5 flex items-end justify-between gap-3"><p className="text-4xl font-black tracking-[-0.05em]">{value}</p><span aria-hidden="true" className="text-action transition-transform group-hover:translate-x-0.5">→</span></div>
    </Link>
  );
}
