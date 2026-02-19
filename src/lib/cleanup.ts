import prisma from "./prisma";

export async function cleanupExpiredSessions() {
  try {
    await prisma.session.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isValid: false }],
      },
    });
    console.log("Sessões expiradas removidas com sucesso");
  } catch (error) {
    console.error("Erro ao limpar sessões expiradas:", error);
  }
}
