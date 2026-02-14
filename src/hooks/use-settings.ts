import { AxiosError } from "axios";
import { KeyRoundIcon, Mail, MessageCircle, Shield } from "lucide-react";
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

  // Email State
  const [newEmail, setNewEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isGeneratingCodeEmail, setIsGeneratingCodeEmail] = useState(false);
  const [isConfirmCodeEmail, setIsConfirmCodeEmail] = useState(false);

  // Code State
  const [step, setStep] = useState<"request" | "validate">("request");
  const [code, setCode] = useState("");

  // Password State
  const [password, setPassword] = useState("");
  const [newsPassword, setNewsPassword] = useState("");
  const [confirmNewsPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isGeneratingPassword, setisGeneratingPassword] = useState(false);

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

      const res = await api.post("/user/email/change", {
        newEmail: newEmail,
      });

      if (res.status === 200) {
        toast.success("Código enviado!", {
          description: "Verifique seu email atual para o código de verificação",
        });

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

      const res = await api.post("/user/email/validate", {
        newEmail: newEmail,
        code: code,
      });

      if (res.status === 200) {
        toast.success("Email alterado com sucesso!", {
          description: "Seu email foi atualizado com sucesso",
        });

        setNewEmail("");
        setCode("");
        setStep("request");
        setIsEmailDialogOpen(false);

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

  const handlePasswordChange = async () => {
    if (!newsPassword) {
      toast.info("Necessario a senha para alteração!");
      return;
    }
    try {
      setisGeneratingPassword(true);

      const res = await api.post("/auth/password", {
        password: newsPassword,
        confirmPassword: confirmNewsPassword,
      });

      if (res.status === 201) {
        toast.success("Senha alterado com sucesso!", {
          description: "Sua senha foi atualizado com sucesso",
        });

        setPassword("");
        setNewsPassword("");
        setConfirmPassword("");
        setisGeneratingPassword(false);

        await refetch();
      } else {
        toast.error("Erro ao validar senha", {
          description: res.data?.message || "Senha inválido",
        });
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error("Erro ao alterar senha", {
        description: error.response?.data?.message || "Error ao alterar senha",
      });
    } finally {
      setisGeneratingPassword(false);
    }
  };

  const handleContactSupport = () => {
    window.open("mailto:support@exemplo.com?subject=Suporte", "_blank");
  };

  const handleOpenEmailDialog = () => {
    setStep("request");
    setNewEmail("");
    setCode("");
    setIsEmailDialogOpen(true);
  };

  const handleOpenPasswordDialog = () => {
    setPassword("");
    setNewsPassword("");
    setConfirmPassword("");
    setIsPasswordDialogOpen(true);
  };

  const ListOptions: ListOption[] = [
    {
      id: 1,
      label: "Alterar email",
      icon: Mail,
      description: "Altere seu email de contato",
      action: handleOpenEmailDialog,
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
    {
      id: 4,
      label: "Alterar senha",
      icon: KeyRoundIcon,
      description: "Altere sua senha de acesso!",
      action: handleOpenPasswordDialog,
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

    password,
    newsPassword,
    isPasswordDialogOpen,
    confirmNewsPassword,
    isGeneratingPassword,
    setIsPasswordDialogOpen,
    setPassword,
    setNewsPassword,
    setConfirmPassword,
    handlePasswordChange,

    handleRefresh,
    handleEmailChange,
    handleValidateCode,
    setCode,
    setNewEmail,
    setIsEmailDialogOpen,
  };
}
