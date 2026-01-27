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

    const body = await request.json();
    const { myaccountId } = body;

    if (!myaccountId) {
      return NextResponse.json(
        { success: false, message: "ID da conta é obrigatório" },
        { status: 400 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const existingAccount = await prisma.myAccounts.findUnique({
      where: {
        id: myaccountId,
        userId: authenticatedUser.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, message: "Conta não encontrada!" },
        { status: 404 },
      );
    }

    const existingArchive = await prisma.archived.findFirst({
      where: {
        myaccountId: myaccountId,
        userId: authenticatedUser.id,
      },
    });

    if (existingArchive) {
      await prisma.archived.delete({
        where: {
          id: existingArchive.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Conta desarquivada com sucesso!",
        data: { isArchived: false },
      });
    } else {
      await prisma.archived.create({
        data: {
          myaccountId: myaccountId,
          userId: authenticatedUser.id,
          isArchived: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Conta arquivada com sucesso!",
        data: { isArchived: true },
      });
    }
  } catch (error) {
    console.error("Error archiving/unarchiving account:", error);
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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const archiveds = await prisma.archived.findMany({
      where: {
        userId: authenticatedUser.id,
      },
      include: {
        myaccount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: archiveds,
    });
  } catch (error) {
    console.error("Error get archiveds:", error);
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
