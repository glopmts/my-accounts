import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

function generateUniqueCode(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numbers = Math.floor(100000 + Math.random() * 900000).toString();
  return `${letter}${numbers}`;
}

async function generateUniqueUserCode(currentCode?: string): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateUniqueCode();
    attempts++;

    if (currentCode && code === currentCode) {
      continue;
    }

    const existingUser = await prisma.user.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existingUser) {
      return code;
    }
  } while (attempts < maxAttempts);

  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const timestamp = Date.now().toString().slice(-6);
  const fallbackCode = `${letter}${timestamp}`;

  const existingFallback = await prisma.user.findUnique({
    where: { code: fallbackCode },
    select: { id: true },
  });

  return existingFallback
    ? `${letter}${Date.now().toString().slice(-5)}1`
    : fallbackCode;
}

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
    const { userId, generateNewCode } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, code: true },
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

    if (!generateNewCode) {
      return NextResponse.json(
        {
          success: true,
          message: "Código atual do usuário",
          data: {
            code: authenticatedUser.code,
          },
        },
        { status: 200 },
      );
    }

    const newCode = await generateUniqueUserCode(authenticatedUser.code!);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        code: newCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        code: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Novo código gerado com sucesso",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          code: updatedUser.code,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user code:", error);

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
