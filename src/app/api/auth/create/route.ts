import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/prisma";

function generateUniqueCode(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  const numbers = Math.floor(100000 + Math.random() * 900000).toString();

  return `${letter}${numbers}`;
}

async function generateUniqueUserCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  for (let i = 0; i < 10; i++) {
    code = generateUniqueCode();

    const existingCode = await db.user.findUnique({
      where: { code },
    });

    if (!existingCode) {
      isUnique = true;
      return code;
    }
  }

  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const timestamp = Date.now().toString().slice(-6);
  return `${letter}${timestamp}`;
}

export async function POST(req: NextRequest) {
  try {
    const client = await clerkClient();

    const { userId, name } = await req.json();

    if (!userId || !name) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe" },
        { status: 409 },
      );
    }

    const code = await generateUniqueUserCode();

    const clerkUser = await client.users.getUser(userId);

    const user = await db.user.create({
      data: {
        name: name,
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        image: clerkUser.imageUrl || null,
        code: code,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          code: user.code,
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
