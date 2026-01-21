"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { User } from "../types/user-interfaces";

// Schema de validação
const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID é obrigatório"),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100)
    .optional(),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

const updateUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID é obrigatório"),
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

// Função auxiliar para verificar se usuário existe
async function checkUserExists(email: string, clerkId?: string) {
  if (clerkId) {
    const userByClerk = await db.user.findUnique({
      where: { clerkId },
    });
    if (userByClerk) return userByClerk;
  }

  const userByEmail = await db.user.findUnique({
    where: { email },
  });

  return userByEmail;
}

// Server Action para criar/atualizar usuário
export async function syncUserWithDatabase(
  data: Partial<CreateUserInput>,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  action?: "created" | "updated" | "exists";
}> {
  try {
    if (!data.clerkId || !data.email) {
      return {
        success: false,
        error: "Dados incompletos",
      };
    }

    // Verificar se usuário já existe
    const existingUser = await checkUserExists(data.email, data.clerkId);

    if (existingUser) {
      // Se já existe, verificar se precisa atualizar
      const needsUpdate =
        existingUser.name !== data.name || existingUser.image !== data.image;

      if (needsUpdate) {
        const updatedUser = await db.user.update({
          where: { id: existingUser.id },
          data: {
            name: data.name,
            image: data.image,
            updatedAt: new Date(),
          },
        });

        revalidatePath("/", "layout");
        return {
          success: true,
          user: updatedUser,
          action: "updated",
        };
      }

      return {
        success: true,
        user: existingUser,
        action: "exists",
      };
    }

    // Criar novo usuário
    const validatedData = createUserSchema.parse({
      clerkId: data.clerkId,
      email: data.email,
      name: data.name,
      image: data.image,
    });

    const newUser = await db.user.create({
      data: {
        clerkId: validatedData.clerkId,
        email: validatedData.email,
        name: validatedData.name || null,
        image: validatedData.image || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      user: newUser,
      action: "created",
    };
  } catch (error) {
    console.error("Error syncing user:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno",
    };
  }
}

// Server Action para buscar usuário pelo Clerk ID
export async function getUserByClerkId(clerkId: string) {
  try {
    if (!clerkId) {
      throw new Error("Clerk ID é obrigatório");
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno",
    };
  }
}
