"use client";

import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { AlertTriangle, Key, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useValideCode } from "../hooks/session-alert/use-code-valide";
import { useAuthCustom } from "../lib/useAuth";
import ConfirmCode from "./modals/confirm-code";
import ConfirmPassword from "./modals/confirm-password";

export function SessionAlert() {
  const {
    showAlert,
    setShowAlert,
    validateSession,
    hasValidSession,
    isLoading,
  } = useSession();
  const { userId } = useAuthCustom();
  const [isVisible, setIsVisible] = useState(false);
  const [validationMethod, setValidationMethod] = useState<
    "code" | "password" | null
  >(null);
  const originalBodyOverflow = useRef<string | null>(null);
  const originalBodyPadding = useRef<string | null>(null);

  const { hasActiveSession } = useValideCode({
    userId,
  });

  const shouldShow = showAlert && !hasValidSession && !isLoading;

  useEffect(() => {
    if (!hasValidSession && !isLoading) {
      setShowAlert(true);
    }
  }, [hasValidSession, isLoading, setShowAlert]);

  // Ouvir evento de sessão expirada
  useEffect(() => {
    const handleSessionExpired = () => {
      setShowAlert(true);
      setValidationMethod(null);

      // Forçar revalidação da sessão no contexto
      validateSession();
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [setShowAlert, validateSession]);

  // Verificar periodicamente se a sessão expirou
  useEffect(() => {
    const checkSession = () => {
      if (!hasValidSession && !isLoading) {
        setShowAlert(true);
      }
    };

    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, [hasValidSession, isLoading, setShowAlert]);

  useEffect(() => {
    if (shouldShow) {
      originalBodyOverflow.current = document.body.style.overflow;
      originalBodyPadding.current = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    } else {
      if (originalBodyOverflow.current !== null) {
        document.body.style.overflow = originalBodyOverflow.current;
      }
      if (originalBodyPadding.current !== null) {
        document.body.style.paddingRight = originalBodyPadding.current;
      }

      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  useEffect(() => {
    return () => {
      if (originalBodyOverflow.current !== null) {
        document.body.style.overflow = originalBodyOverflow.current;
      }
      if (originalBodyPadding.current !== null) {
        document.body.style.paddingRight = originalBodyPadding.current;
      }
    };
  }, []);
  if (hasActiveSession) return null;

  const handleClose = () => {
    setShowAlert(false);
    setValidationMethod(null);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Overlay com backdrop-blur */}
      <div
        className={`absolute inset-0 bg-zinc-400/20 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Container do alerta */}
      <div
        className={`relative w-full max-w-lg transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        // Prevenir que cliques dentro do alerta fechem o overlay
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" shadow-xl max-h-[90vh] overflow-y-auto text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 relative w-full rounded-lg border px-4 py-3 ">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-3 top-3 h-7 w-7 p-0 rounded-full z-10"
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="w-full">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-2 w-full pr-2">
                <AlertTitle className="text-base">
                  Validação de Segurança Necessária
                </AlertTitle>
                <AlertDescription className="space-y-3 w-full">
                  <p className="text-sm">
                    Para continuar com acesso completo ao sistema, valide seu
                    código de segurança ou senha. Esta validação protege suas
                    informações e dura 40 minutos.
                  </p>

                  <div className="bg-amber-50/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs">
                      ⚠️ <strong>Funcionalidades restritas:</strong> Sem
                      validação, você terá acesso limitado às ferramentas do
                      sistema.
                    </p>
                  </div>

                  {!validationMethod ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center justify-center gap-2 py-6 h-auto"
                          onClick={() => setValidationMethod("code")}
                        >
                          <Key className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-semibold">
                              Validar com Código
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Código de 6 dígitos
                            </div>
                          </div>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center justify-center gap-2 py-6 h-auto"
                          onClick={() => setValidationMethod("password")}
                        >
                          <Lock className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-semibold">
                              Validar com Senha
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sua senha de acesso
                            </div>
                          </div>
                        </Button>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClose}
                          className="w-full text-muted-foreground"
                        >
                          Continuar sem Validar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-2">
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setValidationMethod(null)}
                          className="text-sm"
                        >
                          ← Voltar para opções
                        </Button>
                      </div>

                      {validationMethod === "code" ? (
                        <ConfirmCode
                          userId={userId}
                          triggerElement={
                            <div className="w-full">
                              <Button size="sm" className="w-full">
                                Inserir Código de Validação
                              </Button>
                            </div>
                          }
                          onSuccess={() => {
                            setShowAlert(false);
                            setValidationMethod(null);
                          }}
                        />
                      ) : (
                        <ConfirmPassword
                          userId={userId}
                          triggerElement={
                            <div className="w-full">
                              <Button size="sm" className="w-full">
                                Inserir Senha
                              </Button>
                            </div>
                          }
                          onSuccess={() => {
                            setShowAlert(false);
                            setValidationMethod(null);
                          }}
                        />
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground pt-2">
                    Você pode validar seu código ou senha a qualquer momento
                    através do seu perfil.
                  </p>
                </AlertDescription>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
