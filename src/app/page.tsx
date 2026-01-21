"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUserQuery from "../services/query/use-data-query";

export default function AppPage() {
  const { isSignedIn, user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const router = useRouter();

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
    refetch,
    isRefetching,
  } = useUserQuery(clerkUser?.id);

  useEffect(() => {
    if (isClerkLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isClerkLoaded, isSignedIn, router]);

  if (!isClerkLoaded || isUserLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-red-600">
            Erro ao carregar dados
          </h1>
          <p className="text-muted-foreground">
            {userError instanceof Error
              ? userError.message
              : "Ocorreu um erro ao buscar informações do usuário"}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isRefetching}
          className="mt-4"
        >
          {isRefetching ? (
            <>
              <Spinner className="size-4 mr-2" />
              Recarregando...
            </>
          ) : (
            "Tentar novamente"
          )}
        </Button>
      </div>
    );
  }

  if (!isSignedIn || !clerkUser) {
    return null; // O useEffect irá redirecionar
  }

  if (user) {
    router.push("/home");
    return null;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
