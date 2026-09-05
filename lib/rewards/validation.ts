import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre.").max(120),
  description: z.string().trim().max(500).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export function parseRewardDistribution(value: string) {
  const entries = value.split(/\r?\n/).filter(Boolean).map((line) => {
    const [quantity, points, ...rest] = line.split(/[|,;\s]+/).filter(Boolean);
    if (!quantity || !points || rest.length) throw new Error("Usá una línea por tanda: cantidad | puntos.");
    const parsedQuantity = Number(quantity);
    const parsedPoints = Number(points);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || !Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      throw new Error("Las cantidades y los puntos deben ser enteros positivos.");
    }
    return { quantity: parsedQuantity, points: parsedPoints };
  });
  const total = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  if (!entries.length || total > 1_000) throw new Error("Ingresá entre 1 y 1.000 códigos.");
  return entries;
}
