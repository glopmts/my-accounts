import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../../types/user-interfaces";

export async function validateUserSession(request: NextRequest): Promise<{
  user: User | null;
  errorResponse: NextResponse | null;
}> {
  try {
    // Verificar autenticação Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            message: "Não autorizado - Faça login novamente",
          },
          { status: 401 },
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            message: "Usuário não encontrado no sistema",
          },
          { status: 404 },
        ),
      };
    }

    return {
      user,
      errorResponse: null,
    };
  } catch (error) {
    console.error("Erro na validação de sessão:", error);

    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Erro na validação de sessão",
        },
        { status: 500 },
      ),
    };
  }
}
