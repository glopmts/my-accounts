"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthCustom } from "../lib/useAuth";
import ConfirmCode from "./modals/confirm-code";

export function SessionAlert() {
  const { showAlert, setShowAlert, hasValidSession, isLoading } = useSession();
  const { userId } = useAuthCustom();
  const [isVisible, setIsVisible] = useState(false);

  const shouldShow = showAlert && !hasValidSession && !isLoading;

  useEffect(() => {
    if (shouldShow) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  // Se não deve mostrar, retorna null
  if (!isVisible && !shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-zinc-400/20 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={() => {
          if (isVisible) {
            setShowAlert(false);
          }
        }}
      />

      <div
        className={`relative w-full max-w-lg transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <Alert variant="destructive" className="relative shadow-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlert(false)}
            className="absolute right-3 top-3 h-7 w-7 p-0 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="pr-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <AlertTitle className="text-base">
                  Validação de Segurança Necessária
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p className="text-sm">
                    Para continuar com acesso completo ao sistema, valide seu
                    código de segurança. Esta validação protege suas informações
                    e dura 40 minutos.
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      ⚠️ <strong>Funcionalidades restritas:</strong> Sem
                      validação, você terá acesso limitado às ferramentas do
                      sistema.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <ConfirmCode
                      userId={userId}
                      triggerElement={
                        <Button size="sm" className="flex-1">
                          Validar Código Agora
                        </Button>
                      }
                      onSuccess={() => setShowAlert(false)}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAlert(false)}
                      className="flex-1"
                    >
                      Continuar sem Validar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground pt-2">
                    Você pode validar seu código a qualquer momento através do
                    seu perfil.
                  </p>
                </AlertDescription>
              </div>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
}
