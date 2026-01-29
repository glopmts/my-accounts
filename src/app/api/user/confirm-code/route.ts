import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_EXPIRY = 40 * 60 * 1000;

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

    // Corrigido: await cookies() retorna o cookieStore diretamente
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

export async function GET(request: NextRequest) {
  try {
    // Corrigido: await cookies() para obter o cookieStore
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("code_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Sessão não encontrada" },
        { status: 401 },
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        sessionToken,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      // Corrigido: usa o cookieStore já obtido
      cookieStore.delete("code_session");
      return NextResponse.json(
        { success: false, message: "Sessão expirada ou inválida" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sessão válida",
        data: {
          user: session.user,
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Corrigido: await cookies() para obter o cookieStore
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("code_session")?.value;

    if (sessionToken) {
      await prisma.session.updateMany({
        where: { sessionToken },
        data: { isValid: false },
      });

      // Remove o cookie
      cookieStore.delete("code_session");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sessão removida com sucesso",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing session:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
