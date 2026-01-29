import { PasswordService } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const { accountId, passwordId, field } = await request.json();

    if (
      !accountId ||
      !passwordId ||
      !field ||
      !["hint", "notes"].includes(field)
    ) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos" },
        { status: 400 },
      );
    }

    // Verificar acesso
    const account = await prisma.myAccounts.findFirst({
      where: {
        id: accountId,
        user: {
          clerkId: clerkUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Conta não encontrada" },
        { status: 404 },
      );
    }

    // Buscar campo criptografado
    const passwordRecord = await prisma.password.findFirst({
      where: {
        id: passwordId,
        accountId: accountId,
      },
      select: {
        [field]: true,
      },
    });

    if (!passwordRecord || !passwordRecord[field]) {
      return NextResponse.json({
        success: true,
        data: "",
        isEncrypted: false,
      });
    }

    // Descriptografar
    const decryptedText = PasswordService.decryptText(
      passwordRecord[field] as string,
      ENCRYPTION_KEY,
    );

    return NextResponse.json({
      success: true,
      data: decryptedText,
      isEncrypted: true,
    });
  } catch (error) {
    console.error("Error decrypting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao descriptografar",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
