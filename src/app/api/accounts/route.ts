import { PasswordService } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { AccountCreateInput } from "@/types/interfaces";
import { schemaAccountCreater } from "@/utils/validations/schema-my-accounts";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    const isAdmin = authenticatedUser.role === "ADMIN";
    const isOwner = authenticatedUser.id === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    const accounts = await prisma.myAccounts.findMany({
      where: {
        userId: isAdmin ? undefined : userId,
        AND: [
          {
            archiveds: {
              every: {
                isArchived: false,
              },
            },
          },
        ],
      },
      include: {
        passwords: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
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

/// Creater

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "chave-de-fallback-dev-somente";

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
    const { accountData } = body;

    const validatedData = schemaAccountCreater.parse(accountData);

    const authenticatedUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado no banco" },
        { status: 404 },
      );
    }

    if (authenticatedUser.id !== validatedData.userId) {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 },
      );
    }

    const accountDataToCreate: AccountCreateInput = {
      userId: validatedData.userId,
      type: validatedData.type,
      title: validatedData.title,
      description: validatedData.description,
      icon: validatedData.icon,
      url: validatedData.url,
      notes: validatedData.notes,
    };

    if (validatedData.passwords && validatedData.passwords.length > 0) {
      const passwordsToProcess = validatedData.passwords.map((pwd) => ({
        label: pwd.label,
        value: pwd.value,
        type: pwd.type,
        hint: pwd.hint,
        notes: pwd.notes,
      }));

      const processedPasswords = await PasswordService.processMultiplePasswords(
        passwordsToProcess,
        ENCRYPTION_KEY,
      );

      accountDataToCreate.passwords = {
        create: processedPasswords,
      };
    }

    const newAccount = await prisma.myAccounts.create({
      data: accountDataToCreate,
      include: {
        passwords: {
          select: {
            id: true,
            label: true,
            type: true,
            hint: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const { passwords, ...accountWithoutPasswords } = newAccount;

    return NextResponse.json({
      success: true,
      data: {
        ...accountWithoutPasswords,
        passwordCount: passwords.length,
        passwords: passwords.map((p) => ({
          id: p.id,
          label: p.label,
          type: p.type,
          hasHint: !!p.hint,
          hasNotes: !!p.notes,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating account:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.message,
        },
        { status: 400 },
      );
    }

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
