"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/axios";

export function usePasswordValide({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: (password: string) => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleConfirm = async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Senha inválida. Deve ter no mínimo 6 caracteres");
      return;
    }

    setIsPending(true);

    try {
      const res = await api.post("/auth/confirm-password", {
        password,
      });

      if (res.data.success) {
        toast.success("Senha validada com sucesso!");
        setPassword("");
        setIsOpen(false);

        if (onSuccess) onSuccess(password);
      } else {
        toast.error(res.data.message || "Erro ao validar senha");
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message || "Erro ao validar senha";
        toast.error(errorMessage);
        console.error("Error confirming password:", error);
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    setIsPending,
    isOpen,
    setIsOpen,
    password,
    setPassword,

    handleConfirm,
  };
}
