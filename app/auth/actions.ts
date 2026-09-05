"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminUser } from "@/lib/account/auth";
import { accountLoginSchema, accountRegistrationSchema } from "@/lib/account/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; success?: string };

function safeNext(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value, "https://mini.local");
    if (url.origin !== "https://mini.local") return null;
    if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

async function destinationFor(userId: string, next: string | undefined) {
  if (!(await isAdminUser(userId))) return "/mi-cuenta";
  const safePath = safeNext(next);
  return safePath ?? "/admin";
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = accountLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { error: "Email o contraseña incorrectos." };

  revalidatePath("/", "layout");
  redirect(await destinationFor(data.user.id, parsed.data.next));
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = accountRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });
  if (error || !data.user) return { error: "No se pudo crear la cuenta. Intentá nuevamente." };

  revalidatePath("/", "layout");
  if (!data.session) {
    return { success: "Revisá tu email para confirmar la cuenta y después iniciá sesión." };
  }
  redirect("/mi-cuenta");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
