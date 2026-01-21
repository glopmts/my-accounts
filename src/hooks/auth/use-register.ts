"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const useRegister = () => {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Função modificada para aceitar username
  const handleSignUp = async (emailAddress: string, username?: string) => {
    if (!signUpLoaded || !signUp) return { success: false };

    setLoading(true);
    setError("");

    try {
      // Gera um username automático se não fornecido
      const generatedUsername = username || emailAddress.split("@")[0];

      await signUp.create({
        emailAddress,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      return { success: true };
    } catch (err) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de verificação simplificada
  const handleVerify = async (code: string) => {
    if (!signUpLoaded || !signUp) {
      toast.error("Serviço de autenticação não está disponível.");
      return { success: false };
    }

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        toast.success("Conta verificada com sucesso!");

        // Pequeno delay para garantir que a sessão está ativa
        setTimeout(() => {
          router.push("/complete");
        }, 1000);

        return { success: true };
      } else {
        // Se não estiver completo, verifique o estado atual
        console.log("Status da verificação:", signUpAttempt.status);

        // Se ainda precisa de informações adicionais
        if (signUpAttempt.missingFields?.length > 0) {
          toast.error("Informações adicionais são necessárias.");
          router.push("/complete");
          return { success: true };
        }

        toast.error("Processo de verificação não foi concluído.");
        return { success: false };
      }
    } catch (err) {
      let errorMessage =
        "Ocorreu um erro durante a verificação. Tente novamente.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError("");

  return {
    handleSignUp,
    handleVerify,
    loading,
    error,
    resetError,
    isLoaded: signUpLoaded,
  };
};
