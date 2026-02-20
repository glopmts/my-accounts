"use client";

import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { AlertTriangle, Key, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthCustom } from "../lib/useAuth";
import ConfirmCode from "./modals/confirm-code";
import ConfirmPassword from "./modals/confirm-password";

export function SessionAlert() {
  const {
    showAlert,
    setShowAlert,
    hasValidSession,
    isLoading,
    validateWithCode,
    validateWithPassword,
  } = useSession();
  const { userId } = useAuthCustom();
  const [isVisible, setIsVisible] = useState(false);
  const [validationMethod, setValidationMethod] = useState<
    "code" | "password" | null
  >(null);
  const [isValidating, setIsValidating] = useState(false);
  const originalBodyOverflow = useRef<string | null>(null);
  const originalBodyPadding = useRef<string | null>(null);

  const shouldShow = showAlert && !hasValidSession && !isLoading;

  // Efeito para controle do body scroll
  useEffect(() => {
    if (shouldShow) {
      // Salva os estilos originais
      originalBodyOverflow.current = document.body.style.overflow;
      originalBodyPadding.current = document.body.style.paddingRight;

      // Aplica o overflow hidden
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";

      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => {
        clearTimeout(timer);
        // FORÇA a remoção do overflow no cleanup
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    } else {
      // Quando shouldShow é false, remove o overflow imediatamente
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  // Cleanup no unmount
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

  const handleClose = () => {
    if (!isValidating) {
      setShowAlert(false);
      setValidationMethod(null);
    }
  };

  const handleCodeSuccess = async (code: string) => {
    setIsValidating(true);
    try {
      const success = await validateWithCode(code);
      if (success) {
        setTimeout(() => {
          setShowAlert(false);
          setValidationMethod(null);
          setIsValidating(false);
        }, 100);
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      toast.error("Ocorreu um erro durante a validação. Tente novamente.");
      setIsValidating(false);
    }
  };

  const handlePasswordSuccess = async (password: string) => {
    setIsValidating(true);
    try {
      const success = await validateWithPassword(password);
      if (success) {
        setTimeout(() => {
          setShowAlert(false);
          setValidationMethod(null);
          setIsValidating(false);
        }, 100);
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      toast.error("Ocorreu um erro durante a validação. Tente novamente.");
      setIsValidating(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay com backdrop-blur */}
      <div
        className={`absolute inset-0 bg-zinc-400/20 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Container do alerta */}
      <div
        className={`relative w-full max-w-lg transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shadow-xl max-h-[90vh] overflow-y-auto text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 relative w-full rounded-lg border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isValidating}
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
                    informações e dura 1 hora.
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
                          disabled={isValidating}
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
                          disabled={isValidating}
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
                          disabled={isValidating}
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
                          disabled={isValidating}
                          className="text-sm"
                        >
                          ← Voltar para opções
                        </Button>
                      </div>

                      {validationMethod === "code" ? (
                        <ConfirmCode
                          userId={userId}
                          onSuccess={handleCodeSuccess}
                          isLoading={isValidating}
                        />
                      ) : (
                        <ConfirmPassword
                          userId={userId}
                          onSuccess={handlePasswordSuccess}
                          isLoading={isValidating}
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
