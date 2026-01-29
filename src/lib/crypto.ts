import bcrypt from "bcryptjs";
import crypto from "crypto";

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Cria hash seguro da senha
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error("Erro ao criar hash da senha:", error);
      throw new Error("Falha ao processar senha");
    }
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      return false;
    }
  }

  /**
   * Criptografa texto sensível (para hints, notas, etc)
   * Usa criptografia simétrica AES-256-GCM
   */
  static encryptText(text: string, encryptionKey: string): string {
    const algorithm = "aes-256-gcm";
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, "salt", 32);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString("hex"),
      encrypted: encrypted,
      authTag: authTag.toString("hex"),
    });
  }

  /**
   * Descriptografa texto criptografado
   */
  static decryptText(encryptedData: string, encryptionKey: string): string {
    try {
      const { iv, encrypted, authTag } = JSON.parse(encryptedData);
      const algorithm = "aes-256-gcm";
      const key = crypto.scryptSync(encryptionKey, "salt", 32);

      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, "hex"),
      );

      decipher.setAuthTag(Buffer.from(authTag, "hex"));

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error("Falha ao descriptografar dados");
    }
  }

  /**
   * Processa múltiplas senhas
   */
  static async processMultiplePasswords(
    passwords?: Array<{
      label: string;
      value: string;
      type?: string;
      hint?: string;
      notes?: string;
    }>,
    encryptionKey?: string,
  ): Promise<
    Array<{
      label: string;
      value: string; // Hash
      type: string;
      hint?: string;
      notes?: string;
    }>
  > {
    if (!passwords || passwords.length === 0) {
      return [];
    }

    const processedPasswords = await Promise.all(
      passwords.map(async (pwd) => ({
        label: pwd.label,
        value: await this.hashPassword(pwd.value),
        type: pwd.type || "password",
        hint:
          pwd.hint && encryptionKey
            ? this.encryptText(pwd.hint, encryptionKey)
            : pwd.hint,
        notes:
          pwd.notes && encryptionKey
            ? this.encryptText(pwd.notes, encryptionKey)
            : pwd.notes,
      })),
    );

    return processedPasswords;
  }
}
