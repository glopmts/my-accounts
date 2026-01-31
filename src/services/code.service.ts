import prisma from "@/lib/prisma";

export class CodeService {
  static generateCode(): string {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    return `${letter}${numbers}`;
  }

  static isValidCodeFormat(code: string): boolean {
    const regex = /^[A-Z][0-9]{5}$/;
    return regex.test(code);
  }

  static async generateUniqueCode(currentCode?: string): Promise<string> {
    try {
      let newCode: string;
      let attempts = 0;
      const maxAttempts = 50; // Aumentei para mais tentativas

      do {
        newCode = this.generateCode();
        attempts++;

        if (attempts >= maxAttempts) {
          // Fallback: usar timestamp se não conseguir código único
          const timestamp = Date.now().toString().slice(-6);
          const letter = String.fromCharCode(
            65 + Math.floor(Math.random() * 26),
          );
          newCode = `${letter}${timestamp.padStart(5, "0").slice(0, 5)}`;
          break;
        }

        // Verifica se o código já existe no banco
        const existingUser = await prisma.user.findFirst({
          where: {
            code: newCode,
          },
          select: { id: true },
        });

        // Se não existe e é diferente do currentCode, podemos usar
        if (!existingUser && newCode !== currentCode) {
          break;
        }
      } while (true);

      console.log(`Código gerado após ${attempts} tentativas: ${newCode}`);
      return newCode;
    } catch (error) {
      console.error("Erro no CodeService.generateUniqueCode:", error);
      // Fallback em caso de erro
      return this.generateFallbackCode();
    }
  }

  private static generateFallbackCode(): string {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const timestamp = Date.now().toString().slice(-5);
    return `${letter}${timestamp}`;
  }

  static async suggestAvailableCodes(
    baseCode: string,
    excludeUserId: string,
  ): Promise<string[]> {
    if (!this.isValidCodeFormat(baseCode)) {
      return [];
    }

    const suggestions: string[] = [];
    const letter = baseCode[0];
    const baseNumbers = parseInt(baseCode.slice(1), 10);

    // Gera variações e verifica disponibilidade
    for (let offset = 1; offset <= 20; offset++) {
      // Variações positivas
      const positiveCode = `${letter}${((baseNumbers + offset) % 100000).toString().padStart(5, "0")}`;

      // Variações negativas (com wrap-around)
      const negativeOffset = (baseNumbers - offset + 100000) % 100000;
      const negativeCode = `${letter}${negativeOffset.toString().padStart(5, "0")}`;

      // Verifica disponibilidade para cada código
      const [positiveAvailable, negativeAvailable] = await Promise.all([
        this.checkCodeAvailability(positiveCode, excludeUserId),
        this.checkCodeAvailability(negativeCode, excludeUserId),
      ]);

      if (positiveAvailable && suggestions.length < 5) {
        suggestions.push(positiveCode);
      }
      if (negativeAvailable && suggestions.length < 5) {
        suggestions.push(negativeCode);
      }

      if (suggestions.length >= 5) break;
    }

    // Se ainda não tem 5 sugestões, tenta variações de letra
    if (suggestions.length < 5) {
      const letterCode = letter.charCodeAt(0);
      for (let offset = 1; offset <= 3; offset++) {
        const nextLetter = String.fromCharCode(
          ((letterCode - 65 + offset) % 26) + 65,
        );
        const prevLetter = String.fromCharCode(
          ((letterCode - 65 - offset + 26) % 26) + 65,
        );

        const codes = [
          `${nextLetter}${baseCode.slice(1)}`,
          `${prevLetter}${baseCode.slice(1)}`,
        ];

        for (const code of codes) {
          if (suggestions.length >= 5) break;

          const available = await this.checkCodeAvailability(
            code,
            excludeUserId,
          );
          if (available) {
            suggestions.push(code);
          }
        }
      }
    }

    return suggestions;
  }

  private static async checkCodeAvailability(
    code: string,
    excludeUserId: string,
  ): Promise<boolean> {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          code: code,
          id: { not: excludeUserId },
        },
      });
      return !existingUser;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade do código:", error);
      return false;
    }
  }
}
