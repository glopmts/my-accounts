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
      include: {
        passwords: true,
        archiveds: true,
      },
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

    if (myAccounts.passwords && myAccounts.passwords.length > 0) {
      await prisma.password.deleteMany({
        where: { accountId: accountId },
      });
    }

    if (myAccounts.archiveds && myAccounts.archiveds.length > 0) {
      await prisma.archived.deleteMany({
        where: { myaccountId: accountId },
      });
    }

    await prisma.myAccounts.delete({
      where: { id: accountId },
    });

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Conta e senhas relacionadas deletadas com sucesso",
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
