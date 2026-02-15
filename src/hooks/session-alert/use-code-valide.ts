import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/axios";

type UseValideCodeProps = {
  userId: string;
  onSuccess?: () => void;
};

export function useValideCode({ userId, onSuccess }: UseValideCodeProps) {
  const [code, setCode] = useState("");
  const [isPending, setPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();
  const hasCheckedSession = useRef(false);
  const toastShown = useRef(false);
  const checkSessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer para contagem regressiva
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        clearInterval(timer);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const checkSession = useCallback(async () => {
    if (hasCheckedSession.current) return;

    try {
      hasCheckedSession.current = true;
      const response = await api.get("/auth/session/session-token");

      if (response.data.success) {
        const expiresAt = new Date(response.data.data.expiresAt);
        const now = new Date();
        const diffInSeconds = Math.floor(
          (expiresAt.getTime() - now.getTime()) / 1000,
        );

        if (diffInSeconds > 0) {
          setTimeLeft(diffInSeconds);

          if (!toastShown.current) {
            toast.success("Sessão ativa");
            toastShown.current = true;
          }

          if (isOpen) {
            setIsOpen(false);
            if (onSuccess) onSuccess();
          }
        } else {
          setTimeLeft(null);
          toastShown.current = false;
          await api.delete("/auth/session/session-token");
        }
      } else {
        setTimeLeft(null);
        toastShown.current = false;
      }
    } catch (error) {
      setTimeLeft(null);
      toastShown.current = false;
    } finally {
      setTimeout(() => {
        hasCheckedSession.current = false;
      }, 5000);
    }
  }, [isOpen, onSuccess]);

  // Verificação inicial - executa apenas uma vez
  useEffect(() => {
    if (hasCheckedSession.current) return;

    checkSession();
  }, [checkSession]);

  // Verificação periódica
  useEffect(() => {
    // Limpa intervalo anterior
    if (checkSessionIntervalRef.current) {
      clearInterval(checkSessionIntervalRef.current);
    }

    // Só inicia intervalo se não tiver sessão ativa
    if (!timeLeft || timeLeft <= 0) {
      checkSessionIntervalRef.current = setInterval(() => {
        checkSession();
      }, 60000);
    }

    return () => {
      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
      }
    };
  }, [timeLeft, checkSession]);

  const handleConfirm = async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    if (!code || code.length !== 6) {
      toast.error(
        "Código inválido. Deve ter 6 caracteres (1 letra + 5 números)",
      );
      return;
    }

    setPending(true);

    try {
      const res = await api.post("/user/code/confirm-code", {
        code: code.toUpperCase(),
      });

      if (res.data.success) {
        toast.success("Código validado com sucesso!");
        setCode("");
        setIsOpen(false);

        // Define tempo correto (40 minutos em segundos)
        setTimeLeft(40 * 60);
        toastShown.current = true;

        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(res.data.message || "Erro ao validar código");
      }
    } catch (error) {
      toast.error(error + "Erro ao validar código");
      console.error("Error confirming code:", error);
    } finally {
      setPending(false);
    }
  };

  // Limpa sessão quando expira
  useEffect(() => {
    if (timeLeft === 0) {
      const cleanupSession = async () => {
        try {
          await api.delete("/auth/session/session-token");
          toastShown.current = false;
          toast.info("Sessão expirada. Por favor, valide novamente.");

          window.dispatchEvent(new CustomEvent("session-expired"));
        } catch (error) {
          console.error("Error cleaning up session:", error);
        }
      };
      cleanupSession();
    }
  }, [timeLeft]);

  // Fecha o modal automaticamente se sessão estiver ativa
  useEffect(() => {
    if (timeLeft && timeLeft > 0 && isOpen) {
      setIsOpen(false);
      if (onSuccess) onSuccess();
    }
  }, [timeLeft, isOpen, onSuccess]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const updateCode = (value: string) => setCode(value);

  return {
    // Estados
    code,
    isOpen,
    isPending,
    timeLeft,

    // Setters
    setCode: updateCode,
    setIsOpen,
    setPending,
    setTimeLeft,

    // Funções
    handleConfirm,
    openModal,
    closeModal,
    checkSession,

    // Controle de sessão
    hasActiveSession: timeLeft && timeLeft > 0,
  };
}
