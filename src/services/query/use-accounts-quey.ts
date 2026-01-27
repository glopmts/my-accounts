import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { MyAccounts } from "@/types/interfaces";

export const useMyAccountsQuery = (userId?: string) => {
  return useQuery({
    queryKey: ["my-accounts", userId],
    queryFn: async (): Promise<MyAccounts[]> => {
      if (!userId) throw new Error("User ID is required");

      const response = await api.get<{
        message: string;
        success: boolean;
        data: MyAccounts[];
      }>(`/accounts?userId=${userId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch accounts");
      }

      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
