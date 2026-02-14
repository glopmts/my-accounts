import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, "A senha deve ter pelo menos 6 caracteres");

export const createPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As novas senhas não coincidem",
    path: ["confirmNewPassword"],
  });
