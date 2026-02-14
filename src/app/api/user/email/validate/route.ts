import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const client = await clerkClient();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { code, newEmail } = body;

    if (!code || !newEmail) {
      return NextResponse.json(
        { success: false, message: "Código e novo email são obrigatórios" },
        { status: 400 },
      );
    }

    // Buscar usuário
    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Buscar código de verificação
    const emailCode = await prisma.emailCode.findFirst({
      where: {
        code,
        userId: authenticatedUser.id,
        email: authenticatedUser.email,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!emailCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Código inválido ou expirado",
        },
        { status: 400 },
      );
    }

    const emailExists = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });

    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Este email já está em uso" },
        { status: 400 },
      );
    }

    const clerkUser = await client.users.getUser(clerkUserId);

    const newEmailAddress = await client.emailAddresses.createEmailAddress({
      userId: clerkUserId,
      emailAddress: newEmail,
    });

    await client.emailAddresses.updateEmailAddress(newEmailAddress.id, {
      verified: true,
    });

    await client.users.updateUser(clerkUserId, {
      primaryEmailAddressID: newEmailAddress.id,
    });

    if (clerkUser.primaryEmailAddressId) {
      await client.emailAddresses.deleteEmailAddress(
        clerkUser.primaryEmailAddressId,
      );
    }

    // Atualizar no banco
    const updatedUser = await prisma.user.update({
      where: { id: authenticatedUser.id },
      data: { email: newEmail },
      select: { email: true, name: true },
    });

    await prisma.emailCode.delete({
      where: { id: emailCode.id },
    });

    await prisma.emailCode.deleteMany({
      where: {
        userId: authenticatedUser.id,
        id: { not: emailCode.id },
      },
    });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Email alterado com sucesso!",
      data: {
        oldEmail: authenticatedUser.email,
        newEmail: updatedUser.email,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao validar código:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
