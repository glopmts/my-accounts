import {
  SchemaAccountCreater,
  SchemaAccountUpdater,
} from "@/utils/validations/schema-my-accounts";
import { toast } from "sonner";
import { api } from "../lib/axios";
import { MyAccounts } from "../types/interfaces";

export interface ApiResponse<T = never> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class MyAccountsService {
  // Criar conta
  async createAccount(
    data: SchemaAccountCreater,
  ): Promise<ApiResponse<MyAccounts>> {
    try {
      const response = await api.post("/accounts", {
        accountData: data,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Erro ao criar conta",
          error: error.message,
        };
      }

      // Retorno padrão para erros desconhecidos
      return {
        success: false,
        message: "Erro desconhecido ao criar conta",
        error: "Unknown error",
      };
    }
  }

  // Atualizar conta
  async updateAccount(
    data: SchemaAccountUpdater,
    userId: string | null,
  ): Promise<ApiResponse<MyAccounts>> {
    try {
      const response = await api.put("/accounts/update", {
        accountData: data,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating account:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Erro ao atualizar conta",
          error: error.message,
        };
      }

      return {
        success: false,
        message: "Erro desconhecido ao atualizar conta",
        error: "Unknown error",
      };
    }
  }

  // Deletar conta
  async deleteAccount(accountId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(
        `/accounts/delete?accountId=${accountId}`,
      );

      if (response.status === 200) {
        toast.success("Conta deletado com sucesso!");
      }
      return response.data;
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Erro ao deletar conta",
          error: error.message,
        };
      }
      return {
        success: false,
        message: "Erro desconhecido ao deletar conta",
        error: "Unknown error",
      };
    }
  }

  // Buscar todas as contas do usuário
  async getUserAccounts(userId: string): Promise<ApiResponse<MyAccounts[]>> {
    try {
      const response = await api.get(`/accounts?userId=${userId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching user accounts:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Erro ao buscar contas do usuário",
          error: error.message,
        };
      }

      return {
        success: false,
        message: "Erro desconhecido ao buscar contas",
        error: "Unknown error",
      };
    }
  }

  // Buscar conta específica
  async getAccountById(accountId: string): Promise<ApiResponse<MyAccounts>> {
    try {
      const response = await api.get(`/accounts/${accountId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching account by ID:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Erro ao buscar conta",
          error: error.message,
        };
      }

      return {
        success: false,
        message: "Erro desconhecido ao buscar conta",
        error: "Unknown error",
      };
    }
  }
}

export const myAccountsService = new MyAccountsService();
