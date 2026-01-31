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
    const { newEmail } = body;

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email inválido" },
        { status: 400 },
      );
    }

    // Verificar se o usuário existe
    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, name: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    // Verificar se o novo email já está em uso
    const emailExists = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });

    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Este email já está em uso" },
        { status: 400 },
      );
    }

    const verificationCode = await CodeService.generateUniqueCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailCode.create({
      data: {
        email: authenticatedUser.email,
        code: verificationCode,
        userId: authenticatedUser.id,
        expiresAt,
      },
    });

    await emailService.sendEmailChangeCode(
      authenticatedUser.email,
      authenticatedUser.name || "Usuário",
      verificationCode,
      newEmail,
    );

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Código de verificação enviado para seu email atual",
      data: {
        currentEmail: authenticatedUser.email,
        newEmail,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao solicitar alteração de email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
