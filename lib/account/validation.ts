import { z } from "zod";

export const accountLoginSchema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá la contraseña."),
  next: z.string().optional(),
});

export const accountRegistrationSchema = z
  .object({
    displayName: z.string().trim().min(1, "Ingresá tu nombre.").max(120, "El nombre es demasiado largo."),
    email: z.email("Ingresá un email válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
