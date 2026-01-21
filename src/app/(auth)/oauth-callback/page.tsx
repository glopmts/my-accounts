"use client";

import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OAuthCallbackPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !signUp) return;

    async function handleCallback() {
      try {
        // Obtém o resultado da autenticação OAuth
        const result = await signUp?.create({
          // Provide the necessary fields for sign-up completion
          redirectUrl: "/complete",
        });

        if (result?.status === "complete") {
          // Se o cadastro foi completo, ativa a sessão
          if (result.createdSessionId) {
            if (setActive) {
              await setActive({ session: result.createdSessionId });
            }
            router.push("/complete");
          }
        } else {
          // Se faltam informações, redireciona para completar cadastro
          console.log("Faltam informações:", result?.missingFields);
          router.push("/complete");
        }
      } catch (err) {
        console.error("Erro no callback OAuth:", err);
        router.push("/sign-up");
      }
    }

    handleCallback();
  }, [isLoaded, signUp, setActive, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-zinc-950 to-zinc-900">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-400 mx-auto" />
        <h2 className="text-xl font-semibold text-zinc-100">
          Processando login...
        </h2>
        <p className="text-zinc-400">Aguarde enquanto redirecionamos você.</p>
      </div>
    </div>
  );
}
