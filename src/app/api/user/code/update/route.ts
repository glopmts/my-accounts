import prisma from "@/lib/prisma";
import { CodeService } from "@/services/code.service";
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
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Código é obrigatório" },
        { status: 400 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        code: true,
        email: true,
        name: true,
      },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    // Valida formato do código
    if (!CodeService.isValidCodeFormat(code)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de código inválido",
          details:
            "Use o formato: Letra maiúscula seguida de 5 números (ex: A12345)",
        },
        { status: 400 },
      );
    }

    const existingCodeUser = await prisma.user.findFirst({
      where: {
        code: code,
        id: { not: authenticatedUser.id },
      },
      select: { id: true, name: true },
    });

    if (existingCodeUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Código já está em uso",
          data: {
            suggestedCodes: await CodeService.suggestAvailableCodes(
              code,
              authenticatedUser.id,
            ),
          },
        },
        { status: 409 },
      );
    }

    // Atualiza o código no banco
    await prisma.user.update({
      where: {
        id: authenticatedUser.id,
      },
      data: {
        code: code,
        codeGeneratedAt: new Date(),
      },
    });

    // Opcional: Enviar email de confirmação
    try {
      const { emailService } = await import("@/lib/email/nodemailer");
      await emailService.sendEmailChangeCode(
        authenticatedUser.email || "",
        authenticatedUser.name || "Usuário",
        code,
      );
    } catch (emailError) {
      console.error("Erro ao enviar email de confirmação:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Código atualizado com sucesso",
        data: {
          code,
          updatedAt: new Date().toISOString(),
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

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    // Busca código atual do usuário
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        name: true,
        code: true,
        codeGeneratedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          code: user.code,
          codeGeneratedAt: user.codeGeneratedAt,
          hasCode: !!user.code,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting user code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar código",
      },
      { status: 500 },
    );
  }
}
