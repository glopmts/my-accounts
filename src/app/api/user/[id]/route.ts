import db from "@/lib/prisma";
import { ApiResponse, User } from "@/types/user-interfaces";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    let user: User | null = null;

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const isClerkId = id.startsWith("user_");

    if (isUuid) {
      user = await db.user.findUnique({
        where: { id },
      });
    } else if (isClerkId) {
      user = await db.user.findUnique({
        where: { clerkId: id },
      });
    } else {
      user = await db.user.findFirst({
        where: {
          OR: [{ id }, { clerkId: id }],
        },
      });
    }

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    if (user.clerkId !== clerkUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: {
        ...user,
        clerkId: user.clerkId || "",
      },
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
