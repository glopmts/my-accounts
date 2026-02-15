"use client";

import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordFormData } from "../../types/interfaces";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PasswordListProps {
  passwords: PasswordFormData[];
  accountId: string;
}

const PasswordList = ({ passwords, accountId }: PasswordListProps) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );
  const [decryptedValues, setDecryptedValues] = useState<
    Record<string, string>
  >({});
  const [loadingPasswords, setLoadingPasswords] = useState<Set<string>>(
    new Set(),
  );

  const togglePasswordVisibility = async (
    passwordId: string,
    encryptedValue: string,
  ) => {
    // Se já está visível, apenas esconde
    if (visiblePasswords.has(passwordId)) {
      setVisiblePasswords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(passwordId);
        return newSet;
      });
      return;
    }

    // Se já temos o valor descriptografado, mostra
    if (decryptedValues[passwordId]) {
      setVisiblePasswords((prev) => {
        const newSet = new Set(prev);
        newSet.add(passwordId);
        return newSet;
      });
      return;
    }

    // Se não, busca do backend
    setLoadingPasswords((prev) => {
      const newSet = new Set(prev);
      newSet.add(passwordId);
      return newSet;
    });

    try {
      const response = await fetch("/api/accounts/decrypt-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          passwordId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao descriptografar");
      }

      setDecryptedValues((prev) => ({
        ...prev,
        [passwordId]: data.value,
      }));

      setVisiblePasswords((prev) => {
        const newSet = new Set(prev);
        newSet.add(passwordId);
        return newSet;
      });
    } catch (error) {
      console.error("Erro ao descriptografar senha:", error);
      toast.error("Não foi possível exibir a senha");
    } finally {
      setLoadingPasswords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(passwordId);
        return newSet;
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Senha "${label}" copiada!`);
    } catch (err) {
      toast.error("Falha ao copiar");
    }
  };

  if (!passwords || passwords.length === 0) {
    return null;
  }

  return (
    <div className="pb-3 space-y-2.5 w-full p-2 rounded-2xl dark:bg-zinc-900 border dark:border-zinc-800 shadow-xs">
      <div className="flex justify-between items-center">
        <Label>
          <KeyRound size={16} />
          {passwords.length > 1 ? "Senhas" : "Senha"}
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        {passwords.map((password, index) => {
          const isLoading = loadingPasswords.has(password.id);
          const isVisible = visiblePasswords.has(password.id);
          const displayValue =
            isVisible && decryptedValues[password.id]
              ? decryptedValues[password.id]
              : "••••••••";

          return (
            <div className="w-full" key={password.id}>
              <div className="flex justify-between items-center">
                <Label className="pb-2">
                  {password.label || `Senha ${index + 1}`}
                </Label>
                {decryptedValues[password.id] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                      copyToClipboard(
                        decryptedValues[password.id],
                        password.label,
                      )
                    }
                  >
                    Copiar
                  </Button>
                )}
              </div>
              <div className="relative flex w-full items-center">
                <Input
                  type={isVisible ? "text" : "password"}
                  value={displayValue}
                  className="relative pr-10 font-mono"
                  readOnly
                />
                <button
                  onClick={() =>
                    togglePasswordVisibility(password.id, password.value)
                  }
                  className="absolute right-0 px-4 cursor-pointer"
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isVisible ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {password.hint && (
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Dica:</span> {password.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordList;
