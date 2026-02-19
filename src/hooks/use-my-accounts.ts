"use client";

import { ApiResponse, myAccountsService } from "@/services/my-accounts.service";
import {
  SchemaAccountCreater,
  SchemaAccountUpdater,
} from "@/utils/validations/schema-my-accounts";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MyAccounts } from "../types/interfaces";

type PropsMyAccounts = {
  refetch?: () => void;
  userId?: string | null;
};

export const useMyAccounts = ({ refetch, userId }: PropsMyAccounts = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = useCallback(async (data: SchemaAccountCreater) => {
    setLoading(true);
    setError(null);

    try {
      const response = await myAccountsService.createAccount(data);

      if (!response.success) {
        setError(response.message || "Erro ao criar conta");
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      } as ApiResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveOrder = useCallback(
    async (updatedAccounts: MyAccounts[]) => {
      try {
        const accountsToUpdate = updatedAccounts.map((account, index) => ({
          id: account.id,
          position: index,
        }));

        const response = await fetch("/api/accounts/order", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accounts: accountsToUpdate,
            userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update order");
        }

        if (data?.success) {
          console.log("Ordem salva com sucesso");
          setTimeout(() => refetch && refetch(), 300);
        }

        return data;
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
        throw error;
      }
    },
    [userId, refetch],
  );

  const updateAccount = useCallback(async (data: SchemaAccountUpdater) => {
    setLoading(true);
    setError(null);

    try {
      const response = await myAccountsService.updateAccount(
        data,
        userId || "",
      );

      if (!response.success) {
        setError(response.message || "Erro ao atualizar conta");
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      } as ApiResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(
    async (accountId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await myAccountsService.deleteAccount(accountId);

        if (!response.success) {
          setError(response.message || "Erro ao deletar conta");
          toast.error(response.message || "Erro ao deletar conta");
        }
        refetch?.();
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro inesperado";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        } as ApiResponse;
      } finally {
        setLoading(false);
      }
    },
    [refetch],
  );

  const getUserAccounts = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await myAccountsService.getUserAccounts(userId);

      if (!response.success) {
        setError(response.message || "Erro ao buscar contas");
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      } as ApiResponse<MyAccounts[]>;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccountById = useCallback(async (accountId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await myAccountsService.getAccountById(accountId);

      if (!response.success) {
        setError(response.message || "Erro ao buscar conta");
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      } as ApiResponse<MyAccounts>;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    getUserAccounts,
    getAccountById,
    handleSaveOrder,
    clearError: () => setError(null),
  };
};
