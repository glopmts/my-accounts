import { validateUserSession } from "@/lib/auth/auth.middleware";
import { createPasswordSchema } from "@/lib/auth/password.schema";
import { PasswordService } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await validateUserSession(request);

    if (sessionResult.errorResponse) {
      return sessionResult.errorResponse;
    }

    if (!sessionResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não encontrado",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validation = createPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: validation.error,
        },
        { status: 400 },
      );
    }

    const { password, confirmPassword } = validation.data;

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "As senhas não coincidem",
        },
        { status: 400 },
      );
    }

    if (sessionResult.user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário já possui senha cadastrada",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await PasswordService.hashPassword(password);

    await prisma.user.update({
      where: { id: sessionResult.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha criada com sucesso",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating password:", error);
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
