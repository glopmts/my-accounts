import db from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "ID do usuário necessário" },
        { status: 400 },
      );
    }

    if (!db) {
      console.error("Database client não está disponível");
      return NextResponse.json(
        { message: "Erro de conexão com o banco de dados" },
        { status: 500 },
      );
    }

    if (!db.user) {
      console.error("Modelo User não encontrado no Prisma Client");
      return NextResponse.json(
        { message: "Erro de configuração do banco de dados" },
        { status: 500 },
      );
    }

    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    console.log("Usuário encontrado:", existingUser ? "Sim" : "Não");

    return NextResponse.json({
      exists: !!existingUser,
      user: existingUser || null,
    });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
