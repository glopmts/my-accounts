"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SecretType } from "../app/generated/prisma/enums";
import { useAuthCustom } from "../lib/useAuth";
import { MyAccounts } from "../types/interfaces";
import { schemaAccountCreater } from "../utils/validations/schema-my-accounts";
import { useMyAccounts } from "./use-my-accounts";
import { useModal } from "./useModalCustom";

interface ErrorType {
  errors: { path: string[]; message: string }[];
}

type UseFormAccountProps = {
  editingAccount?: MyAccounts | null;
  onSuccess?: () => void;
  isOpenProp?: boolean;
  onCloseProp?: () => void;
  refetch?: () => void;
};

export function useFormAccount({
  editingAccount,
  onSuccess,
  isOpenProp,
  onCloseProp,
  refetch,
}: UseFormAccountProps) {
  const { userId } = useAuthCustom();
  const { createAccount, updateAccount, loading, error } = useMyAccounts();
  const {
    isOpen: modalIsOpen,
    open: modalOpen,
    close: modalClose,
  } = useModal();

  const hasInitialized = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: SecretType.RESET_PASSWORD as SecretType,
    url: "",
    notes: "",
    icon: "",
    password: [] as string[],
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const isOpen = isOpenProp !== undefined ? isOpenProp : modalIsOpen;
  const open = () => {
    if (isOpenProp === undefined) {
      modalOpen();
    }
  };

  const close = () => {
    if (onCloseProp) {
      onCloseProp();
    } else if (isOpenProp === undefined) {
      modalClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = null;
      return;
    }

    // Evitar re-inicialização desnecessária
    const accountId = editingAccount?.id || "new";

    // Se já inicializamos para esta conta específica, não re-inicialize
    if (hasInitialized.current === accountId) {
      return;
    }

    // Marcar como inicializado para esta conta
    hasInitialized.current = accountId;

    requestAnimationFrame(() => {
      if (editingAccount) {
        setFormData({
          title: editingAccount.title || "",
          description: editingAccount.description || "",
          type: editingAccount.type || SecretType.RESET_PASSWORD,
          url: editingAccount.url || "",
          notes: editingAccount.notes || "",
          icon: editingAccount.icon || "",
          password: editingAccount.password || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          type: SecretType.RESET_PASSWORD,
          url: "",
          notes: "",
          icon: "",
          password: [],
        });
      }
      setValidationErrors({});
    });
  }, [isOpen, editingAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      if (!userId) {
        alert("Usuário não autenticado");
        return;
      }

      // Validar dados
      const validatedData = schemaAccountCreater.parse({
        ...formData,
        userId,
      });

      let result;

      if (editingAccount) {
        // Atualizar conta existente
        result = await updateAccount({
          id: editingAccount.id,
          ...validatedData,
        });
        refetch?.();
      } else {
        result = await createAccount(validatedData);
        refetch?.();
      }

      if (result.success) {
        toast.success(
          `Account ${editingAccount ? "updated" : "created"} successfully!`,
        );
        onSuccess?.();
        close();
        refetch?.();
      } else {
        toast.error(result.message || "Ocorreu um erro");
      }
    } catch (validationError) {
      if (validationError instanceof Error && "errors" in validationError) {
        const zodErrors = (validationError as ErrorType).errors;
        const fieldErrors: Record<string, string> = {};
        zodErrors.forEach((err: { path: string[]; message: string }) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(fieldErrors);
      } else {
        console.error("Validation error:", validationError);
        toast.error("Invalid input data. Please check your entries.");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo quando usuário começa a digitar
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (index: number, value: string) => {
    const newPasswords = [...formData.password];
    newPasswords[index] = value;
    setFormData((prev) => ({
      ...prev,
      password: newPasswords,
    }));
  };

  const addPasswordField = () => {
    setFormData((prev) => ({
      ...prev,
      password: [...prev.password, ""],
    }));
  };

  const removePasswordField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      password: prev.password.filter((_, i) => i !== index),
    }));
  };

  const getTypeLabel = (type: SecretType) => {
    switch (type) {
      case SecretType.RESET_PASSWORD:
        return "Password";
      case SecretType.VERIFY_EMAIL:
        return "Email Verification";
      case SecretType.API_KEY:
        return "API Key";
      case SecretType.ENVS:
        return "Environment Variables";
      case SecretType.SECRETS:
        return "Secret";
      case SecretType.ACCOUNTS:
        return "Account";
      case SecretType.OUTHER:
        return "Other";
      default:
        return type;
    }
  };

  return {
    isOpen,
    open,
    close,
    setFormData,
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    validationErrors,
    handlePasswordChange,
    addPasswordField,
    removePasswordField,
    getTypeLabel,
  };
}
