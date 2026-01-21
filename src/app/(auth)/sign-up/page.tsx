"use client";

import GoogleButton from "@/components/auth/oauth-buttons";
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
import { useRegister } from "@/hooks/auth/use-register";
import {
  emailOnlySchema,
  type EmailOnlyFormData,
} from "@/utils/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [showVerification, setShowVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    handleSignUp: registerSignUp,
    handleVerify,
    loading,
    error,
    resetError,
    isLoaded,
  } = useRegister();

  const form = useForm<EmailOnlyFormData>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSignUp = async (data: EmailOnlyFormData) => {
    if (!isLoaded) {
      toast.error("Serviço de autenticação não está disponível.");
      return;
    }

    resetError();

    // Gera um username baseado no email
    const username = data.email.split("@")[0];

    const result = await registerSignUp(data.email, username);

    if (result.success) {
      setVerificationEmail(data.email);
      setShowVerification(true);
      toast.success("Código de verificação enviado para seu email!");
    } else {
      console.error("Erro ao criar conta:", result.error);
      // O erro já é mostrado pelo toast no hook
    }
  };

  const handleResendCode = async () => {
    if (!verificationEmail || isResending || resendCountdown > 0) return;

    setIsResending(true);
    resetError();

    try {
      const username = verificationEmail.split("@")[0];
      const result = await registerSignUp(verificationEmail, username);

      if (result.success) {
        toast.success("Novo código enviado!");
        setResendCountdown(60);

        const interval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      // Se houver erro, o toast já é mostrado no hook
    } catch (err) {
      console.error("Erro ao reenviar código:", err);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationSubmit = async (data: { code: string }) => {
    if (!verificationEmail) {
      toast.error("Email não encontrado. Volte e tente novamente.");
      return;
    }

    const result = await handleVerify(data.code);

    if (result.success) {
      toast.success("Email verificado com sucesso!");
      router.push("/complete");
    }
  };

  const handleBack = () => {
    setShowVerification(false);
    resetError();
  };

  // Mostra o formulário de verificação se necessário
  if (showVerification && verificationEmail) {
    return (
      <VerificationForm
        email={verificationEmail}
        type="sign-up"
        isLoaded={isLoaded}
        isLoading={loading}
        isResending={isResending}
        resendCountdown={resendCountdown}
        handleResendCode={handleResendCode}
        onSubmit={handleVerificationSubmit}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-950 to-zinc-900 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-zinc-800 p-3">
              <UserPlus className="h-8 w-8 text-zinc-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-50">
            Criar conta
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Digite seu email para criar uma conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignUp)}
              className="space-y-6"
            >
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
                        className="bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-zinc-700 h-12 text-base"
                        {...field}
                        disabled={loading || !isLoaded}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {error && (
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
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>
          </Form>

          <GoogleButton type="signUp" />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950/50 px-2 text-zinc-500">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="link"
                className="w-full border-zinc-800 hover:bg-zinc-900"
                onClick={() => router.push("/sign-in")}
              >
                Fazer login
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center text-zinc-500">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link
              href="/terms"
              className="text-zinc-400 hover:text-zinc-300 underline underline-offset-4"
            >
              Termos
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="text-zinc-400 hover:text-zinc-300 underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
