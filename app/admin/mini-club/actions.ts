"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { rewardCampaigns } from "@/lib/db/schema";
import { createRewardCodeBatch } from "@/lib/rewards/service";
import { campaignSchema, parseRewardDistribution } from "@/lib/rewards/validation";

export type MiniSurpriseState = { error?: string; success?: string; codes?: { code: string; redeemUrl: string; points: number }[] };

export async function createCampaignAction(_previous: MiniSurpriseState, formData: FormData): Promise<MiniSurpriseState> {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : null;
  const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;
  if ((startsAt && Number.isNaN(startsAt.valueOf())) || (endsAt && Number.isNaN(endsAt.valueOf())) || (startsAt && endsAt && endsAt <= startsAt)) return { error: "Las fechas de campaña no son válidas." };
  await db.insert(rewardCampaigns).values({ name: parsed.data.name, description: parsed.data.description || null, startsAt, endsAt, status: "active" });
  revalidatePath("/admin/mini-club");
  return { success: "Campaña creada." };
}

export async function generateRewardCodesAction(_previous: MiniSurpriseState, formData: FormData): Promise<MiniSurpriseState> {
  await requireAdmin();
  const campaignId = String(formData.get("campaignId") ?? "");
  try {
    const codes = await createRewardCodeBatch(campaignId, parseRewardDistribution(String(formData.get("distribution") ?? "")));
    revalidatePath("/admin/mini-club");
    return { success: `${codes.length} códigos generados. Guardalos ahora: no se vuelven a mostrar.`, codes };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo generar el lote." };
  }
}
