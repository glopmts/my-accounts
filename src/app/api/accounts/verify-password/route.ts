import { PasswordService } from "@/lib/crypto";
import prisma from "@/lib/prisma";
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

    const { accountId, passwordId, password } = await request.json();

    if (!accountId || !passwordId || !password) {
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
        type: true,
      },
    });

    if (!passwordRecord) {
      return NextResponse.json(
        { success: false, message: "Senha não encontrada" },
        { status: 404 },
      );
    }

    const isValid = await PasswordService.verifyPassword(
      password,
      passwordRecord.value,
    );

    return NextResponse.json({
      success: true,
      isValid,
      label: passwordRecord.label,
      type: passwordRecord.type,
    });
  } catch (error) {
    console.error("Error verifying password:", error);
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
