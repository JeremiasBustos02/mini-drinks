"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { accountLoginSchema, accountRegistrationSchema } from "@/lib/account/validation";
import { createClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/lib/observability/logger";

export type AuthFormState = { error?: string; success?: string };

function registrationErrorMessage(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message?.toLowerCase() ?? "";
  if (code === "user_already_exists" || /already (registered|exists)/.test(message)) return "Ya existe una cuenta con ese email.";
  if (code === "weak_password" || message.includes("password")) return "La contraseña no cumple los requisitos.";
  if (code.includes("rate_limit") || /rate limit|too many requests/.test(message)) return "Hubo demasiados intentos. Probá nuevamente en unos minutos.";
  if (code === "email_address_invalid" || /invalid email|valid email/.test(message)) return "Ingresá un email válido.";
  return "No pudimos crear la cuenta. Intentá nuevamente.";
}

function safeNext(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value, "https://mini.local");
    if (url.origin !== "https://mini.local") return null;
    if (/^\/canjear\/[A-Za-z0-9_-]{32,}$/.test(url.pathname)) return `${url.pathname}${url.search}${url.hash}`;
    return null;
  } catch {
    return null;
  }
}

function destinationFor(next: string | undefined) {
  return safeNext(next) ?? "/";
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
  redirect(destinationFor(parsed.data.next));
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = accountRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };

  const supabase = await createClient();
  const startedAt = performance.now();
  logServerEvent("info", "register.start");
  logServerEvent("info", "supabase.sign_up.start");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });
  logServerEvent(error || !data.user ? "warn" : "info", "supabase.sign_up.end", {
    durationMs: Math.round(performance.now() - startedAt),
    status: error ? error.status : data.user ? "created" : "missing_user",
    errorCode: error?.code,
    errorName: error?.name,
    technicalMessage: error?.message?.slice(0, 240),
  });
  if (error || !data.user) return { error: registrationErrorMessage(error) };

  revalidatePath("/", "layout");
  if (!data.session) {
    return { success: "Revisá tu email para confirmar la cuenta y después iniciá sesión." };
  }
  redirect(destinationFor(parsed.data.next));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
