import { emailService } from "@/lib/email/nodemailer";
import prisma from "@/lib/prisma";
import { CodeService } from "@/services/code.service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userId, generateNew = false } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    // Busca o usuário autenticado
    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        email: true,
        name: true,
        code: true,
        codeGeneratedAt: true,
      },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    // Verifica se o usuário tem permissão
    if (authenticatedUser.id !== userId) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    // Verifica se tem email cadastrado
    if (!authenticatedUser.email) {
      return NextResponse.json(
        { success: false, message: "Email não cadastrado para este usuário" },
        { status: 400 },
      );
    }

    let codeToSend: string;
    let codeUpdated = false;

    if (generateNew) {
      const canGenerateNewCode =
        !authenticatedUser.codeGeneratedAt ||
        new Date().getTime() -
          new Date(authenticatedUser.codeGeneratedAt).getTime() >
          5 * 60 * 1000;

      if (!canGenerateNewCode) {
        const nextAvailableTime = new Date(
          new Date(authenticatedUser.codeGeneratedAt!).getTime() +
            5 * 60 * 1000,
        );

        return NextResponse.json(
          {
            success: false,
            message: "Aguarde para gerar um novo código",
            data: {
              nextAvailable: nextAvailableTime.toISOString(),
              remainingMinutes: Math.ceil(
                (nextAvailableTime.getTime() - new Date().getTime()) /
                  (60 * 1000),
              ),
            },
          },
          { status: 429 },
        );
      }

      const newCode = await CodeService.generateUniqueCode(
        authenticatedUser.code || undefined,
      );

      await prisma.user.update({
        where: { id: authenticatedUser.id },
        data: {
          code: newCode,
          codeGeneratedAt: new Date(),
        },
      });

      codeToSend = newCode;
      codeUpdated = true;
    } else {
      if (!authenticatedUser.code) {
        return NextResponse.json(
          {
            success: false,
            message: "Nenhum código definido para este usuário",
          },
          { status: 400 },
        );
      }
      codeToSend = authenticatedUser.code;
    }

    // Envia o email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      emailSent = await emailService.sendEmailChangeCode(
        authenticatedUser.email,
        authenticatedUser.name || "Usuário",
        codeToSend,
      );

      if (!emailSent) {
        throw new Error("Falha ao enviar email");
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      emailError = error instanceof Error ? error.message : "Erro desconhecido";

      if (codeUpdated) {
        return NextResponse.json(
          {
            success: true,
            message: "Código gerado com sucesso, mas falha ao enviar email",
            data: {
              id: authenticatedUser.id,
              name: authenticatedUser.name,
              email: authenticatedUser.email,
              code: codeToSend,
              codeGeneratedAt: new Date().toISOString(),
              emailSent: false,
              emailError: emailError,
            },
            warning:
              "Código foi salvo, mas email não enviado. Verifique seu email mais tarde.",
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Falha ao enviar email com código",
          error: emailError,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: generateNew
          ? "Novo código gerado e enviado por email com sucesso"
          : "Código atual enviado por email com sucesso",
        data: {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          code: codeToSend,
          codeGeneratedAt: generateNew
            ? new Date().toISOString()
            : authenticatedUser.codeGeneratedAt,
          emailSent,
          codeUpdated,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending code email:", error);

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

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    // Busca informações do usuário
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        email: true,
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

    const canGenerateNewCode =
      !user.codeGeneratedAt ||
      new Date().getTime() - new Date(user.codeGeneratedAt).getTime() >
        5 * 60 * 1000;

    let nextAvailableTime = null;
    let remainingMinutes = null;

    if (!canGenerateNewCode) {
      nextAvailableTime = new Date(
        new Date(user.codeGeneratedAt!).getTime() + 5 * 60 * 1000,
      );
      remainingMinutes = Math.ceil(
        (nextAvailableTime.getTime() - new Date().getTime()) / (60 * 1000),
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          hasCode: !!user.code,
          hasEmail: !!user.email,
          canGenerateNewCode,
          ...(nextAvailableTime && {
            nextAvailable: nextAvailableTime.toISOString(),
            remainingMinutes,
          }),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking code status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar status",
      },
      { status: 500 },
    );
  }
}
