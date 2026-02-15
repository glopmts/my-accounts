import { validateUserSession } from "@/lib/auth/auth.middleware";
import { PasswordService } from "@/lib/crypto";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_EXPIRY = 40 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await validateUserSession(request);

    if (authenticatedUser.errorResponse) {
      return authenticatedUser.errorResponse;
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Senha é obrigatória" },
        { status: 400 },
      );
    }

    if (!authenticatedUser.user?.password) {
      return NextResponse.json(
        { success: false, message: "Nenhuma senha encontrado!" },
        { status: 404 },
      );
    }

    // Valida a senha
    const isValid = await PasswordService.decryptText(
      password,
      authenticatedUser.user?.password || "",
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Senha incorreta" },
        { status: 401 },
      );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "password_validated",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Senha validada com sucesso",
        data: {
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error validating password:", error);

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
