import { prepareAccountUpdateData } from "@/lib/account-update-helpers";
import prisma from "@/lib/prisma";
import { AccountUpdateData } from "@/types/interfaces";
import { schemaAccountUpdater } from "@/utils/validations/schema-my-accounts";
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
    const { accountData } = body;

    const validatedData = schemaAccountUpdater.parse(accountData);

    // 3. Verificar usuário
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

    // 4. Verificar se conta existe e pertence ao usuário
    const existingAccount = await prisma.myAccounts.findFirst({
      where: {
        id: validatedData.id,
        userId: authenticatedUser.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, message: "Conta não encontrada ou acesso negado" },
        { status: 404 },
      );
    }

    const updateData = await prepareAccountUpdateData(
      validatedData as AccountUpdateData,
      validatedData.id,
    );

    await prisma.$transaction(async (tx) => {
      const account = await tx.myAccounts.update({
        where: { id: validatedData.id },
        data: updateData,
      });

      const passwords = await tx.password.findMany({
        where: { accountId: validatedData.id },
        select: {
          id: true,
          label: true,
          type: true,
          hint: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      return { ...account, passwords };
    });

    return NextResponse.json({
      success: true,
      message: "Conta atualizada com sucesso",
    });
  } catch (error) {
    console.error("Error update account:", error);
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
