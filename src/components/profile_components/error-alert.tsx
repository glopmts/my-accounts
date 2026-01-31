"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Spinner } from "../ui/spinner";

const ErrorAlert = ({
  handleRefresh,
  isRefreshing,
}: {
  handleRefresh: () => void;
  isRefreshing: boolean;
}) => {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-b dark:from-zinc-900 dark:to-black p-4">
      <Card className="w-full max-w-md dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold ">
                Erro ao carregar perfil
              </h3>
              <p className="text-sm dark:text-zinc-400">
                Não foi possível carregar as informações do perfil
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Tentando...
                  </>
                ) : (
                  "Tentar novamente"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorAlert;
