import z from "zod";
import { SecretType } from "../../app/generated/prisma/enums";

export const schemaAccountCreater = z.object({
  userId: z.string(),
  type: z.enum(SecretType).default(SecretType.RESET_PASSWORD),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().max(100, "Máximo de caracteres é 100").optional(),
  icon: z.string().optional(),
  password: z.string().array().default([]),
  url: z.string().optional(),
  notes: z.string().max(230, "Máximo de caracteres é 230").optional(),
});

export const schemaAccountUpdater = z.object({
  id: z.string(),
  type: z.enum(SecretType).optional(),
  title: z.string().min(1, "O título é obrigatório").optional(),
  description: z.string().max(100, "Máximo de caracteres é 100").optional(),
  icon: z.string().max(230, "Máximo de caracteres é 230").optional(),
  password: z.string().array(),
  url: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SchemaAccountCreater = z.infer<typeof schemaAccountCreater>;
export type SchemaAccountUpdater = z.infer<typeof schemaAccountUpdater>;
