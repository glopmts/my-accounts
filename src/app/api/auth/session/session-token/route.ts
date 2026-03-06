import prisma from "@/lib/prisma";
import { getSession, validateAdminSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Sessão não encontrada ou expirada",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sessão válida",
        data: session,
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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Verificar se é admin
    if (action === "check-admin") {
      const adminCheck = await validateAdminSession();

      if (!adminCheck.isValid) {
        return NextResponse.json(
          {
            success: false,
            message: adminCheck.error,
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Acesso de admin verificado",
          data: { user: adminCheck.user },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Ação não especificada" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in session action:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("code_session")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });

      cookieStore.delete("code_session");
      cookieStore.delete("password_validated");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sessão encerrada com sucesso",
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
