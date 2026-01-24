"use client";

import VerificationForm from "@/components/auth/verification-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/auth/use-login";
import {
  emailOnlySchema,
  type EmailOnlyFormData,
} from "@/utils/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GoogleButton from "../../../components/auth/oauth-buttons";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailSent, setEmailSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const redirectUrl = searchParams.get("redirect_url") || "/home";

  const {
    handleEmailSignIn,
    handleVerify,
    loading,
    error,
    resetError,
    isLoaded,
  } = useLogin();

  const form = useForm<EmailOnlyFormData>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: "",
    },
  });

  // Efeito para o contador de reenvio
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  async function onSubmit(data: EmailOnlyFormData) {
    if (!isLoaded) {
      toast.error("Sistema de autenticação não está carregado");
      return;
    }

    resetError();
    setPendingEmail(data.email);

    const result = await handleEmailSignIn(data.email);

    if (result.success) {
      if (result.needsVerification) {
        setEmailSent(true);
        toast.success("Código de login enviado para seu email!");
      } else {
        // Se não precisa de verificação, redireciona diretamente
        toast.success("Login realizado com sucesso!");
        router.push(redirectUrl);
        router.refresh();
      }
    } else {
      if (result.error) {
        if (
          result.error.includes("not found") ||
          result.error.includes("não encontrado")
        ) {
          toast.error("Email não encontrado. Verifique ou crie uma conta.");
        } else {
          toast.error(result.error);
        }
      }
    }
  }

  // Função para reenviar código
  async function handleResendCode() {
    if (resendCountdown > 0 || !pendingEmail) return;

    setIsResending(true);
    resetError();

    try {
      const result = await handleEmailSignIn(pendingEmail);

      if (result.success) {
        if (result.needsVerification) {
          toast.success("Novo código enviado para seu email!");
          setResendCountdown(30); // 30 segundos para reenvio
        }
      } else {
        toast.error(result.error || "Erro ao reenviar código");
      }
    } catch (err) {
      toast.error("Erro ao reenviar código. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  }

  // Função para verificar o código de login
  async function handleVerifyCode(data: { code: string }) {
    const result = await handleVerify(data.code);

    if (result.success) {
      toast.success("Login realizado com sucesso!");
      router.push(redirectUrl);
      router.refresh();
    } else {
      if (result.error) {
        if (result.error.includes("incorrect")) {
          toast.error("Código incorreto. Tente novamente.");
        } else if (result.error.includes("expired")) {
          toast.error("Código expirado. Solicite um novo código.");
        } else {
          toast.error(result.error);
        }
      }
    }
  }

  // Função para voltar ao formulário de email
  function handleBack() {
    setEmailSent(false);
    setPendingEmail("");
    resetError();
  }

  // Adicione validação de email para mostrar erro específico
  useEffect(() => {
    if (error) {
      const errorMessage = error.toLowerCase();
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("não encontrado")
      ) {
        toast.error("Email não encontrado. Verifique ou crie uma conta.");
      }
    }
  }, [error]);

  if (emailSent) {
    return (
      <VerificationForm
        email={pendingEmail}
        type="sign-in"
        isLoaded={isLoaded}
        isLoading={loading}
        isResending={isResending}
        resendCountdown={resendCountdown}
        handleResendCode={handleResendCode}
        onSubmit={handleVerifyCode}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br dark:from-zinc-950 dark:to-zinc-900 p-4">
      <Card className="w-full max-w-md dark:border-zinc-800 dark:bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full dark:bg-zinc-800 p-3">
              <Mail className="h-8 w-8 text-zinc-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-50">
            Entrar com email
          </CardTitle>
          <CardDescription className="text-center dark:text-zinc-400">
            Digite seu email para receber um código de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        autoComplete="email"
                        className="w-full"
                        {...field}
                        disabled={loading || !isLoaded}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {error &&
                !error.includes("not found") &&
                !error.includes("não encontrado") && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

              <Button
                type="submit"
                className="w-full rounded-3xl"
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  "Enviar código de acesso"
                )}
              </Button>
            </form>
          </Form>

          <GoogleButton type="signIn" />

          {/* Clerk's CAPTCHA widget */}
          <div id="clerk-captcha" />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="dark:bg-zinc-950/50 px-2 dark:text-zinc-500">
                  Ou continue com
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center dark:text-zinc-500">
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="/terms"
              className="dark:text-zinc-400 hover:text-zinc-300 underline underline-offset-4"
            >
              Termos
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="dark:text-zinc-400 hover:text-zinc-300 underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
          </div>
          <div className="text-sm text-center dark:text-zinc-500">
            Não tem uma conta?{" "}
            <Link
              href="/sign-up"
              className="dark:text-zinc-400 hover:text-zinc-300 underline underline-offset-4"
            >
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
