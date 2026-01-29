"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SecretType } from "../app/generated/prisma/enums";
import { useAuthCustom } from "../lib/useAuth";
import { MyAccounts, PasswordFormData } from "../types/interfaces";
import {
  schemaAccountCreater,
  schemaAccountUpdater,
} from "../utils/validations/schema-my-accounts";
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
    passwords: [] as PasswordFormData[],
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

    const accountId = editingAccount?.id || "new";

    if (hasInitialized.current === accountId) {
      return;
    }

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
          passwords:
            editingAccount.passwords?.map((p) => ({
              id: p.id,
              label: p.label || "Password",
              value: "", // Não preencher por segurança
              type: (p.type as any) || "password",
              hint: p.hint || "",
              notes: p.notes || "",
            })) || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          type: SecretType.RESET_PASSWORD,
          url: "",
          notes: "",
          icon: "",
          passwords: [
            {
              label: "Main Password",
              value: "",
              type: "password",
              hint: "",
              notes: "",
            },
          ],
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

      let result;

      if (editingAccount) {
        // Atualizar conta existente
        const updateData = {
          id: editingAccount.id,
          userId,
          type: formData.type,
          title: formData.title,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          passwords: formData.passwords.map((pwd) => {
            const passwordData: any = {
              label: pwd.label,
              type: pwd.type,
              hint: pwd.hint || undefined,
              notes: pwd.notes || undefined,
            };

            // Se é uma senha existente (tem id)
            if (pwd.id) {
              passwordData.id = pwd.id;
              passwordData._action = pwd.value ? "update" : "keep";
              if (pwd.value) {
                passwordData.value = pwd.value;
              }
            } else {
              // Nova senha
              if (pwd.value) {
                passwordData.value = pwd.value;
              }
            }

            return passwordData;
          }),
        };

        // Validar com schema de update
        const validatedData = schemaAccountUpdater.parse(updateData);
        result = await updateAccount(validatedData);
      } else {
        // Criar nova conta
        const createData = {
          userId,
          type: formData.type,
          title: formData.title,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          passwords: formData.passwords
            .filter((p) => p.value.trim() !== "")
            .map((p) => ({
              label: p.label,
              value: p.value,
              type: p.type,
              hint: p.hint || undefined,
              notes: p.notes || undefined,
            })),
        };

        // Validar com schema de criação
        const validatedData = schemaAccountCreater.parse(createData);
        result = await createAccount(validatedData);
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
            const fieldName = err.path.join(".");
            fieldErrors[fieldName] = err.message;
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

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (
    index: number,
    field: keyof PasswordFormData,
    value: string,
  ) => {
    setFormData((prev) => {
      const newPasswords = [...prev.passwords];
      newPasswords[index] = {
        ...newPasswords[index],
        [field]: value,
      };
      return {
        ...prev,
        passwords: newPasswords,
      };
    });

    // Limpar erro específico
    const errorKey = `passwords[${index}].${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addPasswordField = () => {
    setFormData((prev) => ({
      ...prev,
      passwords: [
        ...prev.passwords,
        {
          label: `Password ${prev.passwords.length + 1}`,
          value: "",
          type: "password" as const,
          hint: "",
          notes: "",
        },
      ],
    }));
  };

  const removePasswordField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      passwords: prev.passwords.filter((_, i) => i !== index),
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
