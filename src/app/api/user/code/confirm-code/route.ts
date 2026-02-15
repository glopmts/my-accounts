import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_EXPIRY = 60 * 60 * 1000;

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
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Código é obrigatório" },
        { status: 400 },
      );
    }

    // Busca o usuário pelo clerkId
    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, code: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    if (authenticatedUser.code !== code) {
      return NextResponse.json(
        { success: false, message: "Código inválido" },
        { status: 400 },
      );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

    const session = await prisma.session.create({
      data: {
        userId: authenticatedUser.id,
        sessionToken,
        expiresAt,
        isValid: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "code_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Código validado com sucesso",
        data: {
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error validating user code:", error);

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
