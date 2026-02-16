import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/axios";

type UseValideCodeProps = {
  userId: string;
  onSuccess: (code: string) => Promise<void>;
};

export function useValideCode({ userId, onSuccess }: UseValideCodeProps) {
  const [code, setCode] = useState("");
  const [isPending, setPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();
  const toastShown = useRef(false);

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

        setTimeLeft(60 * 60);
        toastShown.current = true;

        if (onSuccess) onSuccess(code);
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

    // Controle de sessão
    hasActiveSession: timeLeft && timeLeft > 0,
  };
}
