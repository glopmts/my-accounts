"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home as HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-950 to-zinc-900">
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-6 w-6 text-zinc-300" />
            <h1 className="text-xl font-semibold text-zinc-50">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-zinc-50">
              Bem-vindo, {user.firstName || "Usuário"}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-zinc-400">
                Você está logado usando autenticação sem senha. Seu login foi
                verificado através do código enviado para seu email.
              </p>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">
                  Informações da conta:
                </h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-24">Email:</span>
                    <span className="text-zinc-300">
                      {user.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24">ID:</span>
                    <span className="text-zinc-300 font-mono text-xs">
                      {user.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24">Membro desde:</span>
                    <span className="text-zinc-300">
                      {new Date(user.createdAt!).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
