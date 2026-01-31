import { AxiosError } from "axios";
import { Mail, MessageCircle, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/axios";
import { useAuthCustom } from "../lib/useAuth";
import { ErrorResponse } from "../types/interface-error";

interface ListOption {
  id: number;
  label: string;
  icon: React.ElementType;
  description: string;
  action: () => Promise<void> | void;
  requiresConfirmation?: boolean;
  destructive?: boolean;
}

export function useSettings() {
  const { user, isLoading, refetch, error, userId } = useAuthCustom();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isGeneratingCodeEmail, setIsGeneratingCodeEmail] = useState(false);
  const [isConfirmCodeEmail, setIsConfirmCodeEmail] = useState(false);
  const [step, setStep] = useState<"request" | "validate">("request");
  const [code, setCode] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const generateUniqueCode = async () => {
    setIsGeneratingCode(true);

    try {
      await api.post("/user/code/send", {
        userId: userId,
        generateNew: true,
      });

      toast.success("Código gerado!", {
        description: "Verifique seu email",
      });

      await refetch();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;

      if (error.response?.status === 429) {
        const minutes = error.response.data?.data?.remainingMinutes || 5;
        toast.error("Aguarde", {
          description: `Tente novamente em ${minutes} minutos`,
        });
      } else {
        const message = error.response?.data?.message || "Erro ao gerar código";
        toast.error("Ops!", { description: message });
      }
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Email inválido", {
        description: "Por favor, insira um email válido",
      });
      return;
    }

    try {
      setIsGeneratingCodeEmail(true);

      // MANTENDO SUA ROTA ATUAL
      const res = await api.post("/user/email/change", {
        newEmail: newEmail,
      });

      if (res.status === 200) {
        toast.success("Código enviado!", {
          description: "Verifique seu email atual para o código de verificação",
        });

        // CORREÇÃO IMPORTANTE: Muda para etapa de validação
        setStep("validate");
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error("Erro ao solicitar alteração", {
        description:
          error.response?.data?.message ||
          "Verifique se o email já não está em uso",
      });
    } finally {
      setIsGeneratingCodeEmail(false);
    }
  };

  const handleValidateCode = async () => {
    if (!code || code.length !== 6) {
      return toast.error("Código inválido", {
        description: "Digite o código de 6 dígitos",
      });
    }

    if (!newEmail) {
      return toast.error("Email não informado");
    }

    try {
      setIsConfirmCodeEmail(true);

      // MANTENDO SUA ROTA ATUAL
      const res = await api.post("/user/email/validate", {
        newEmail: newEmail,
        code: code,
      });

      if (res.status === 200) {
        toast.success("Email alterado com sucesso!", {
          description: "Seu email foi atualizado com sucesso",
        });

        // Limpa tudo e fecha o modal
        setNewEmail("");
        setCode("");
        setStep("request");
        setIsEmailDialogOpen(false);

        // Atualiza os dados do usuário
        await refetch();
      } else {
        toast.error("Erro ao validar código", {
          description: res.data?.message || "Código inválido",
        });
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error("Erro ao validar código", {
        description:
          error.response?.data?.message || "Verifique se o código está correto",
      });
    } finally {
      setIsConfirmCodeEmail(false);
    }
  };

  const handleContactSupport = () => {
    window.open("mailto:support@exemplo.com?subject=Suporte", "_blank");
  };

  const handleOpenEmailDialog = () => {
    // Reseta o estado quando abre o modal
    setStep("request");
    setNewEmail("");
    setCode("");
    setIsEmailDialogOpen(true);
  };

  const ListOptions: ListOption[] = [
    {
      id: 1,
      label: "Alterar email",
      icon: Mail,
      description: "Altere seu email de contato",
      action: handleOpenEmailDialog, // CORRIGIDO
    },
    {
      id: 2,
      label: "Novo código único",
      icon: Shield,
      description: "Gere um novo código de segurança",
      action: generateUniqueCode,
      requiresConfirmation: true,
    },
    {
      id: 3,
      label: "Suporte",
      icon: MessageCircle,
      description: "Entre em contato com nossa equipe",
      action: handleContactSupport,
    },
  ];

  return {
    user,
    isLoading,
    error,
    userId,
    isRefreshing,
    isEmailDialogOpen,
    isGeneratingCode,
    newEmail,
    isGeneratingCodeEmail,
    isConfirmCodeEmail,
    step,
    code,
    ListOptions,
    handleRefresh,
    handleEmailChange,
    handleValidateCode,
    setCode,
    setNewEmail,
    setIsEmailDialogOpen,
  };
}
