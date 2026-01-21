import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../types/user-interfaces";

export default function useUserQuery(userId?: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User> => {
      if (!userId) throw new Error("User ID is required");

      const response = await api.get<{
        message: string;
        success: boolean;
        data: User;
      }>(`/user/${userId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch user");
      }

      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });
}

export function useUserByClerkQuery(clerkUserId?: string) {
  return useQuery({
    queryKey: ["user", "clerk", clerkUserId],
    queryFn: async (): Promise<User> => {
      if (!clerkUserId) throw new Error("Clerk User ID is required");

      const response = await api.get<{
        message: string;
        success: boolean;
        data: User;
      }>(`/user/clerk/${clerkUserId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch user");
      }

      return response.data.data;
    },
    enabled: !!clerkUserId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
