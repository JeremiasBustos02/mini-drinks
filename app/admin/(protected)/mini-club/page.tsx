import { count, eq, sql } from "drizzle-orm";

import { MiniSurpriseForms } from "@/components/admin/mini-surprise-forms";
import { AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { db } from "@/lib/db";
import { rewardCampaigns, rewardCodes } from "@/lib/db/schema";

export default async function MiniClubAdminPage() {
  const campaigns = await db.select({ id: rewardCampaigns.id, name: rewardCampaigns.name, status: rewardCampaigns.status, createdAt: rewardCampaigns.createdAt, codes: count(rewardCodes.id), used: sql<number>`count(${rewardCodes.redeemedAt}) filter (where ${rewardCodes.redeemedAt} is not null)` }).from(rewardCampaigns).leftJoin(rewardCodes, eq(rewardCodes.campaignId, rewardCampaigns.id)).groupBy(rewardCampaigns.id).orderBy(sql`${rewardCampaigns.createdAt} desc`);
  return <div className="mx-auto max-w-6xl space-y-8"><AdminPageHeader eyebrow="Mini Club" title="Mini Sorpresa" description="Creá campañas y códigos QR canjeables por puntos." /><MiniSurpriseForms campaigns={campaigns.map(({ id, name }) => ({ id, name }))} />{campaigns.length === 0 ? <EmptyState title="Todavía no hay campañas" description="Creá una campaña para preparar la primera tanda de Mini Sorpresas." /> : <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas text-xs uppercase tracking-wide text-ink/50"><tr><th className="px-4 py-3">Campaña</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Códigos</th><th className="px-4 py-3">Usados</th><th className="px-4 py-3">Disponibles</th></tr></thead><tbody>{campaigns.map((campaign) => <tr className="border-t border-ink/10" key={campaign.id}><td className="px-4 py-3 font-bold">{campaign.name}</td><td className="px-4 py-3 capitalize">{campaign.status}</td><td className="px-4 py-3">{campaign.codes}</td><td className="px-4 py-3">{campaign.used}</td><td className="px-4 py-3">{campaign.codes - campaign.used}</td></tr>)}</tbody></table></div></section>}</div>;
}
