import z from "zod";
import { SecretType } from "../../app/generated/prisma/enums";

export const passwordSchema = z.object({
  label: z.string().min(1, "Rótulo é obrigatório"),
  value: z.string().min(1, "Senha é obrigatória"),
  type: z
    .enum(["password", "pin", "token", "security_answer"])
    .default("password"),
  hint: z.string().optional(),
  notes: z.string().optional(),
});

export const schemaAccountCreater = z.object({
  userId: z.string(),
  type: z.enum(SecretType).default(SecretType.RESET_PASSWORD),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().max(100, "Máximo de caracteres é 100").optional(),
  icon: z.string().optional(),
  passwords: z.array(passwordSchema).optional(),
  url: z.string().optional(),
  notes: z.string().max(2000, "Máximo de caracteres é 2000").optional(),
});

export const passwordUpdateSchema = z.object({
  id: z.string().optional(), // Para update/delete
  label: z.string().min(1, "Rótulo é obrigatório"),
  value: z.string().optional(), // Opcional em update
  type: z.string().default("password"),
  hint: z.string().optional(),
  notes: z.string().optional(),
  _action: z.enum(["keep", "update", "delete"]).default("keep"), // Ação
});

export const schemaAccountUpdater = z.object({
  id: z.string(),
  type: z.enum(SecretType).optional(),
  title: z.string().min(1, "O título é obrigatório").optional(),
  description: z.string().max(100, "Máximo de caracteres é 100").optional(),
  icon: z.string().max(230, "Máximo de caracteres é 230").optional(),
  passwords: z.array(passwordUpdateSchema).optional(),

  url: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SchemaAccountCreater = z.infer<typeof schemaAccountCreater>;
export type SchemaAccountUpdater = z.infer<typeof schemaAccountUpdater>;
