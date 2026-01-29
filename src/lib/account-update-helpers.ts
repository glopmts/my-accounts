import type {
  AccountUpdateData,
  AccountUpdateInput,
  PasswordCreateInputProps,
} from "@/types/interfaces";
import { PasswordService } from "./crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export async function prepareAccountUpdateData(
  data: AccountUpdateData,
  accountId: string,
): Promise<AccountUpdateInput> {
  const updateData: AccountUpdateInput = {};

  const accountFields = [
    "type",
    "title",
    "description",
    "icon",
    "url",
    "notes",
  ] as const;

  accountFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field] as any;
    }
  });

  // Processar senhas se fornecidas
  if (data.passwords && data.passwords.length > 0) {
    const passwordOperations = {
      create: [] as PasswordCreateInputProps[],
      update: [] as Array<{
        where: { id: string };
        data: Partial<PasswordCreateInputProps>;
      }>,
      delete: [] as { id: string }[],
    };

    // Separar senhas por ação
    for (const pwd of data.passwords) {
      switch (pwd._action) {
        case "delete":
          if (pwd.id) {
            passwordOperations.delete.push({ id: pwd.id });
          }
          break;

        case "update":
          if (pwd.id) {
            const updateData: Partial<PasswordCreateInputProps> = {
              label: pwd.label,
              type: pwd.type || "password",
            };

            // Atualizar senha se fornecida
            if (pwd.value) {
              updateData.value = await PasswordService.hashPassword(pwd.value);
            }

            // Atualizar hint se fornecido
            if (pwd.hint !== undefined) {
              updateData.hint = pwd.hint
                ? PasswordService.encryptText(pwd.hint, ENCRYPTION_KEY)
                : null;
            }

            // Atualizar notes se fornecido
            if (pwd.notes !== undefined) {
              updateData.notes = pwd.notes
                ? PasswordService.encryptText(pwd.notes, ENCRYPTION_KEY)
                : null;
            }

            passwordOperations.update.push({
              where: { id: pwd.id },
              data: updateData,
            });
          }
          break;

        case "keep":
          // Não faz nada, mantém a senha
          break;

        default:
          if (!pwd.id && pwd.value) {
            const createData: PasswordCreateInputProps = {
              accountId: accountId,
              label: pwd.label,
              value: await PasswordService.hashPassword(pwd.value),
              type: pwd.type || "password",
              hint: pwd.hint
                ? PasswordService.encryptText(pwd.hint, ENCRYPTION_KEY)
                : null,
              notes: pwd.notes
                ? PasswordService.encryptText(pwd.notes, ENCRYPTION_KEY)
                : null,
            };
            passwordOperations.create.push(createData);
          }
      }
    }

    // Filtrar operações vazias
    if (
      passwordOperations.create.length > 0 ||
      passwordOperations.update.length > 0 ||
      passwordOperations.delete.length > 0
    ) {
      updateData.passwords = {};

      if (passwordOperations.create.length > 0) {
        updateData.passwords.create = passwordOperations.create;
      }
      if (passwordOperations.update.length > 0) {
        updateData.passwords.update = passwordOperations.update;
      }
      if (passwordOperations.delete.length > 0) {
        updateData.passwords.delete = passwordOperations.delete;
      }
    }
  }

  return updateData;
}
