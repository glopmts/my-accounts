import prisma from "@/lib/prisma";
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

    if (authenticatedUser.id !== accountData.userId) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    const newAccount = await prisma.myAccounts.update({
      where: {
        id: validatedData.id,
      },
      data: {
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        icon: validatedData.icon,
        password: validatedData.password,
        url: validatedData.url,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: newAccount,
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
