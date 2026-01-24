import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { MyAccounts } from "../../../generated/prisma/client";

interface AccountUpdateData {
  id: string;
  position: number;
}

export async function PUT(request: NextRequest) {
  try {
    const { accounts, userId } = await request.json();

    if (!userId || !accounts?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validação dos dados - apenas id e position
    const validAccounts: AccountUpdateData[] = accounts
      .map((account: MyAccounts, index: number) => ({
        id: String(account.id || ""),
        position: Number(account.position) || index,
      }))
      .filter((acc: MyAccounts) => acc.id);

    if (validAccounts.length === 0) {
      return NextResponse.json(
        { error: "No valid accounts to update" },
        { status: 400 },
      );
    }

    // Atualização otimizada
    const result = await prisma.$transaction(
      validAccounts.map((account) =>
        prisma.myAccounts.update({
          where: {
            id: account.id,
            userId: userId,
          },
          data: {
            position: account.position,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            title: true,
            position: true,
          },
        }),
      ),
    );

    // Ordena o resultado pela posição
    const sortedResult = result.sort((a, b) => a.position - b.position);

    return NextResponse.json({
      success: true,
      updated: sortedResult.length,
      accounts: sortedResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error,
      },
      { status: 500 },
    );
  }
}
