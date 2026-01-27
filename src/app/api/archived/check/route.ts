import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const myaccountId = searchParams.get("myaccountId");

    if (!myaccountId) {
      return NextResponse.json(
        { success: false, message: "ID da conta é obrigatório" },
        { status: 400 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Check if account belongs to the user
    const existingAccount = await prisma.myAccounts.findUnique({
      where: {
        id: myaccountId,
        userId: authenticatedUser.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, message: "Conta não encontrada!" },
        { status: 404 },
      );
    }

    const archiveRecord = await prisma.archived.findFirst({
      where: {
        myaccountId: myaccountId,
        userId: authenticatedUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isArchived: !!archiveRecord,
        archivedAt: archiveRecord?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking archive status:", error);
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
