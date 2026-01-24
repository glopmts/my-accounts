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
        }

        refetch?.();
        toast.success("Conta deletado com sucesso!");
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
    clearError: () => setError(null),
  };
};
