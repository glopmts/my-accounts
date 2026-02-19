import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("code_session")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: {
          sessionToken,
        },
      });

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
