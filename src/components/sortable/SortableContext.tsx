"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { MyAccounts } from "../../types/interfaces";

interface AccountUpdatePayload {
  id: string;
  position: number;
  orderInCategory: number;
  category: string;
}

interface SortableContextType {
  isSorting: boolean;
  setIsSorting: (value: boolean) => void;
  categories: string[];
  updateAccountOrder: (accounts: MyAccounts[]) => Promise<void>;
  saveOrderImmediately: (accounts: MyAccounts[]) => Promise<void>;
}

// Cria o contexto com valor padrão undefined
const SortableContext = createContext<SortableContextType | undefined>(
  undefined,
);

// Hook personalizado para usar o contexto
export const useSortable = (): SortableContextType => {
  const context = useContext(SortableContext);
  if (!context) {
    throw new Error("useSortable must be used within a SortableProvider");
  }
  return context;
};

// Provider do contexto
export const SortableProvider: React.FC<{
  children: ReactNode;
  userId: string;
}> = ({ children, userId }) => {
  const [isSorting, setIsSorting] = useState(false);
  const [categories] = useState<string[]>([
    "top",
    "middle",
    "bottom",
    "center",
    "default",
  ]);

  // Função para preparar os dados antes de enviar
  const prepareAccountsForUpdate = (
    accounts: MyAccounts[],
  ): AccountUpdatePayload[] => {
    return accounts.map((account, index) => ({
      id: account.id,
      position: index, // Posição global na lista
      orderInCategory: account.orderInCategory || index,
      category: account.category || "default",
    }));
  };

  const updateAccountOrder = useCallback(
    async (accounts: MyAccounts[]) => {
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const accountsToUpdate = prepareAccountsForUpdate(accounts);

        const response = await fetch("/api/my-accounts/order", {
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

        return data;
      } catch (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    },
    [userId],
  );

  const saveOrderImmediately = useCallback(
    async (accounts: MyAccounts[]) => {
      return await updateAccountOrder(accounts);
    },
    [updateAccountOrder],
  );

  return (
    <SortableContext.Provider
      value={{
        isSorting,
        setIsSorting,
        categories,
        updateAccountOrder,
        saveOrderImmediately,
      }}
    >
      {children}
    </SortableContext.Provider>
  );
};
