"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getAccountAccess } from "@/lib/account/auth";
import { db } from "@/lib/db";
import { customerProfiles } from "@/lib/db/schema";

export type ProfileFormState = { error?: string; success?: string };

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Ingresá tu nombre.").max(120, "El nombre es demasiado largo."),
  phone: z.string().trim().max(40, "El teléfono es demasiado largo.").optional(),
});

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const access = await getAccountAccess();
  if (access.status !== "authenticated" || access.isAdmin) return { error: "No pudimos actualizar tus datos." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };

  const { displayName, phone } = parsed.data;
  const result = await db
    .update(customerProfiles)
    .set({ displayName, phone: phone || null })
    .where(eq(customerProfiles.authUserId, access.userId))
    .returning({ id: customerProfiles.id });

  if (!result.length) return { error: "No encontramos tu perfil para actualizarlo." };

  revalidatePath("/mi-cuenta");
  return { success: "Tus datos se actualizaron." };
}
