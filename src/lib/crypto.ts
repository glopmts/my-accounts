import bcrypt from "bcryptjs";
import crypto, { DecipherGCM } from "crypto";

export interface PasswordItem {
  label: string;
  value: string;
  type?: string;
  hint?: string;
  notes?: string;
}

export interface EncryptedPasswordData {
  iv: string;
  encrypted: string;
  authTag: string;
  algorithm: string;
}

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SCRYPT_SALT = process.env.ENCRYPTION_SALT!;

  /**
   * Hash de senha para autenticação (bcrypt)
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      if (!password) {
        throw new Error("Senha não fornecida");
      }

      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error("Erro ao criar hash da senha:", error);
      throw new Error("Falha ao processar senha para hash");
    }
  }

  /**
   * Verifica se uma senha corresponde ao hash
   */
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      if (!password || !hash) {
        return false;
      }

      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      return false;
    }
  }

  /**
   * Deriva uma chave de criptografia a partir de uma senha mestra
   * Usa scrypt para tornar a derivação computacionalmente intensiva
   */
  static deriveEncryptionKey(
    masterPassword: string,
    userSpecificSalt?: string,
  ): Buffer {
    try {
      const salt = userSpecificSalt || this.SCRYPT_SALT;
      return crypto.scryptSync(masterPassword, salt, this.KEY_LENGTH, {
        N: 16384, // Custo de CPU/memória (2^14)
        r: 8, // Tamanho do bloco
        p: 1, // Paralelização
      });
    } catch (error) {
      console.error("Erro ao derivar chave:", error);
      throw new Error("Falha ao derivar chave de criptografia");
    }
  }

  /**
   * Gera uma chave aleatória segura (para chaves mestras)
   */
  static generateRandomKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Criptografa texto sensível usando AES-256-GCM
   * Inclui autenticação para detectar modificações
   */
  static encryptText(text: string, key: string | Buffer): string {
    try {
      if (!text) {
        return text; // Retorna vazio se não houver texto
      }

      // Converte string key para Buffer se necessário
      const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;

      // Garante que a chave tem o tamanho correto
      if (keyBuffer.length !== this.KEY_LENGTH) {
        throw new Error(`Chave deve ter ${this.KEY_LENGTH} bytes`);
      }

      // Gera IV aleatório
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Cria cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, keyBuffer, iv);

      // Criptografa
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Obtém tag de autenticação
      const authTag = cipher.getAuthTag();

      // Prepara objeto com dados criptografados
      const encryptedData: EncryptedPasswordData = {
        iv: iv.toString("hex"),
        encrypted: encrypted,
        authTag: authTag.toString("hex"),
        algorithm: this.ALGORITHM,
      };

      return JSON.stringify(encryptedData);
    } catch (error) {
      console.error("Erro ao criptografar:", error);
      throw new Error("Falha ao criptografar dados");
    }
  }

  /**
   * Descriptografa texto criptografado com AES-256-GCM
   */
  static decryptText(encryptedData: string, key: string | Buffer): string {
    try {
      if (!encryptedData || !key) {
        return encryptedData || "";
      }

      if (!this.isEncrypted(encryptedData)) {
        return encryptedData;
      }

      const parsed: EncryptedPasswordData = JSON.parse(encryptedData);

      if (!parsed.iv || !parsed.encrypted || !parsed.authTag) {
        throw new Error("Formato de dados criptografados inválido");
      }

      // Prepara key buffer
      const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;

      // Valida tamanho da chave
      if (keyBuffer.length !== this.KEY_LENGTH) {
        throw new Error(`Chave deve ter ${this.KEY_LENGTH} bytes`);
      }

      const decipher = crypto.createDecipheriv(
        parsed.algorithm || this.ALGORITHM,
        keyBuffer,
        Buffer.from(parsed.iv, "hex"),
      ) as DecipherGCM;

      decipher.setAuthTag(Buffer.from(parsed.authTag, "hex"));

      // Descriptografa
      let decrypted = decipher.update(parsed.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Erro ao descriptografar:", error);
      // Em vez de lançar erro, retorna marcador de erro
      return "[Falha na descriptografia]";
    }
  }

  /**
   * Verifica se uma string está no formato criptografado
   */
  static isEncrypted(text: string): boolean {
    if (!text || typeof text !== "string") {
      return false;
    }

    try {
      const parsed = JSON.parse(text);
      return !!(
        parsed &&
        typeof parsed === "object" &&
        parsed.iv &&
        parsed.encrypted &&
        parsed.authTag
      );
    } catch {
      return false;
    }
  }

  /**
   * Criptografa múltiplas senhas com a mesma chave
   */
  static encryptPasswords(
    passwords: PasswordItem[],
    encryptionKey: string | Buffer,
  ): PasswordItem[] {
    if (!passwords || passwords.length === 0) {
      return [];
    }

    if (!encryptionKey) {
      throw new Error("Chave de criptografia é obrigatória");
    }

    return passwords.map((pwd) => ({
      label: pwd.label,
      value: this.encryptText(pwd.value, encryptionKey),
      type: pwd.type || "password",
      hint: pwd.hint ? this.encryptText(pwd.hint, encryptionKey) : undefined,
      notes: pwd.notes ? this.encryptText(pwd.notes, encryptionKey) : undefined,
    }));
  }

  /**
   * Descriptografa múltiplas senhas para exibição
   */
  static decryptPasswords(
    passwords: PasswordItem[],
    encryptionKey: string | Buffer,
  ): PasswordItem[] {
    if (!passwords || !encryptionKey) {
      return passwords || [];
    }

    return passwords.map((pwd) => {
      try {
        return {
          ...pwd,
          value: this.decryptText(pwd.value, encryptionKey),
          hint: pwd.hint
            ? this.decryptText(pwd.hint, encryptionKey)
            : undefined,
          notes: pwd.notes
            ? this.decryptText(pwd.notes, encryptionKey)
            : undefined,
        };
      } catch (error) {
        console.error(`Erro ao descriptografar senha "${pwd.label}":`, error);
        return {
          ...pwd,
          value: "*** ERRO AO DESCRIPTOGRAFAR ***",
          hint: pwd.hint ? "*** ERRO ***" : undefined,
          notes: pwd.notes ? "*** ERRO ***" : undefined,
        };
      }
    });
  }

  /**
   * Gera uma senha forte aleatória
   */
  static generateStrongPassword(length: number = 16): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = uppercase + lowercase + numbers + special;

    // Garante pelo menos um de cada tipo
    let password =
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      special[Math.floor(Math.random() * special.length)];

    // Completa com caracteres aleatórios
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralha a senha
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}
