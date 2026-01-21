import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .toLowerCase()
  .trim();

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(6, "O código deve ter exatamente 6 dígitos")
    .regex(/^\d+$/, "O código deve conter apenas números"),
});

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export type EmailOnlyFormData = z.infer<typeof emailOnlySchema>;
export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;
