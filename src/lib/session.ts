import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export type SessionData = {
  user: SessionUser;
  expiresAt: Date;
  isValid: boolean;
};

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("code_session")?.value;

    if (!sessionToken) {
      return null;
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
            role: true,
          },
        },
      },
    });

    if (!session) {
      // Limpar cookies inválidos
      cookieStore.delete("code_session");
      cookieStore.delete("password_validated");
      return null;
    }

    return {
      user: session.user,
      expiresAt: session.expiresAt,
      isValid: true,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function validateAdminSession(): Promise<{
  isValid: boolean;
  user?: SessionUser;
  error?: string;
}> {
  const session = await getSession();

  if (!session) {
    return {
      isValid: false,
      error: "Sessão não encontrada ou expirada",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      isValid: false,
      error: "Acesso negado: necessário privilégios de administrador",
    };
  }

  return {
    isValid: true,
    user: session.user,
  };
}
