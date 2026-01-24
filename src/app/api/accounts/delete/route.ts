import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: "ID da conta é obrigatório" },
        { status: 400 },
      );
    }

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

    const myAccounts = await prisma.myAccounts.findUnique({
      where: { id: accountId },
    });

    if (!myAccounts) {
      return NextResponse.json(
        { success: false, message: "Conta não encontrada" },
        { status: 404 },
      );
    }

    const isAdmin = authenticatedUser.role === "ADMIN";
    const isOwner = authenticatedUser.id === myAccounts.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    await prisma.myAccounts.delete({
      where: { id: accountId },
    });

    return NextResponse.json({
      success: true,
      message: "Conta deletada com sucesso",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
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
