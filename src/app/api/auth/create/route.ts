import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const client = await clerkClient();

    const { userId, name } = await req.json();

    if (!userId || !name) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    // Verifica se o usuário já existe
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe" },
        { status: 409 },
      );
    }

    // Obtém informações adicionais do Clerk
    const clerkUser = await client.users.getUser(userId);

    // Cria o usuário no banco
    const user = await db.user.create({
      data: {
        name: name,
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        image: clerkUser.imageUrl || null,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
