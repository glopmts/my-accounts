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

    const { accountId, passwordId } = await request.json();

    if (!accountId || !passwordId) {
      return NextResponse.json(
        { success: false, message: "Dados incompletos" },
        { status: 400 },
      );
    }

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

    const passwordRecord = await prisma.password.findFirst({
      where: {
        id: passwordId,
        accountId: accountId,
      },
      select: {
        value: true,
        label: true,
        hint: true,
      },
    });

    if (!passwordRecord) {
      return NextResponse.json(
        { success: false, message: "Senha não encontrada" },
        { status: 404 },
      );
    }

    const decryptedValue = PasswordService.decryptText(
      passwordRecord.value,
      ENCRYPTION_KEY,
    );

    const decryptedHint = passwordRecord.hint
      ? PasswordService.decryptText(passwordRecord.hint, ENCRYPTION_KEY)
      : null;

    return NextResponse.json({
      success: true,
      value: decryptedValue,
      hint: decryptedHint,
      label: passwordRecord.label,
    });
  } catch (error) {
    console.error("Error decrypting password:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao descriptografar senha",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
