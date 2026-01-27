import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { ArchivedProps } from "../../types/interfaces";

export const useArchivedQuery = (userId?: string) => {
  return useQuery({
    queryKey: ["archiveds", userId],
    queryFn: async (): Promise<ArchivedProps[]> => {
      if (!userId) throw new Error("Account ID is required");

      const response = await api.get<{
        message: string;
        success: boolean;
        data: ArchivedProps[];
      }>(`/archived`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch archived");
      }

      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
