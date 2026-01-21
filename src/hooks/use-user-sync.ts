"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { syncUserWithDatabase } from "../actions/auth";
import { User } from "../types/user-interfaces";

interface UseUserSyncOptions {
  autoSync?: boolean;
  redirectOnComplete?: string;
}

export function useUserSync(options: UseUserSyncOptions = {}) {
  const { autoSync = true, redirectOnComplete } = options;
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [userData, setUserData] = useState<User>();

  const syncUser = useCallback(async () => {
    if (!clerkUser || isSyncing) return;

    setIsSyncing(true);

    try {
      const result = await syncUserWithDatabase({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        image: clerkUser.imageUrl,
      });

      if (result.success) {
        setUserData(result.user);
        setSyncComplete(true);

        switch (result.action) {
          case "created":
            toast.success("Perfil criado com sucesso!");
            break;
          case "updated":
            toast.success("Perfil atualizado!");
            break;
          case "exists":
            // Usuário já existe, sem notificação
            break;
        }

        if (redirectOnComplete) {
          // Usar router aqui se necessário
          window.location.href = redirectOnComplete;
        }

        return { success: true, user: result.user };
      } else {
        toast.error(result.error || "Erro ao sincronizar usuário");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Erro ao sincronizar com o banco de dados");
      return { success: false, error: "Erro desconhecido" };
    } finally {
      setIsSyncing(false);
    }
  }, [clerkUser, isSyncing, redirectOnComplete]);

  // Sincronização automática quando Clerk carrega
  useEffect(() => {
    if (autoSync && isClerkLoaded && clerkUser && !syncComplete && !isSyncing) {
      syncUser();
    }
  }, [isClerkLoaded, clerkUser, autoSync, syncComplete, isSyncing, syncUser]);

  return {
    isSyncing,
    syncComplete,
    userData,
    syncUser,
    clerkUser,
    isClerkLoaded,
  };
}
