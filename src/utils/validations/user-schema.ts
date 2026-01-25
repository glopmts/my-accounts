import { z } from "zod/v3";

export const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID é obrigatório"),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100)
    .optional(),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100)
    .optional(),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

// Tipos
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
