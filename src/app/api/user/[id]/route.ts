import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/prisma";
import { ApiResponse, User } from "../../../../types/user-interfaces";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { id } = await params;

    if (!clerkUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    // Buscar usuário no banco
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o usuário autenticado tem acesso a este recurso
    if (user.clerkId !== clerkUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
