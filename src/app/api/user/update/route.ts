import prisma from "@/lib/prisma";
import { updateUserSchema } from "@/utils/validations/user-schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId, ...userData } = body;

    const validatedData = updateUserSchema.parse(userData);

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    if (authenticatedUser.id !== userId) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuário atualizado com sucesso",
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error update user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
