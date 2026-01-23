"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { VerificationInput } from "./verification-input";

const verificationSchema = z.object({
  code: z
    .string()
    .length(6, "Código deve ter exatamente 6 dígitos")
    .regex(/^\d+$/, "Apenas números são permitidos"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface VerificationFormProps {
  email: string;
  type: "sign-up" | "sign-in";
  isLoaded: boolean;
  isLoading: boolean;
  isResending: boolean;
  resendCountdown: number;
  handleResendCode: () => Promise<void>;
  onSubmit: (data: VerificationFormData) => Promise<void>;
  onBack: () => void;
}

export default function VerificationForm({
  email,
  type,
  isLoaded,
  isLoading,
  isResending,
  resendCountdown,
  handleResendCode,
  onSubmit,
  onBack,
}: VerificationFormProps) {
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Se não estiver carregado, mostra loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br dark:from-zinc-950 dark:to-zinc-900">
        <Card className="w-full max-w-md dark:border-zinc-800 dark:bg-zinc-950/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <span className="ml-3 text-zinc-300">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br dark:from-zinc-950 dark:to-zinc-900 p-4">
      <Card className="w-full max-w-md dark:border-zinc-800 dark:bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full dark:bg-zinc-800 p-3">
              <ShieldCheck className="h-8 w-8 text-zinc-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-50">
            {type === "sign-up" ? "Verifique seu email" : "Confirme seu login"}
          </CardTitle>
          <CardDescription className="text-center dark:text-zinc-400">
            {type === "sign-up"
              ? `Enviamos um código de 6 dígitos para`
              : `Digite o código enviado para`}{" "}
            <span className="text-zinc-300 font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      Código de verificação
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <VerificationInput
                            length={6}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isLoading}
                            autoFocus
                          />
                        </div>
                        <p className="text-xs dark:text-zinc-500 text-center">
                          Digite o código de 6 dígitos enviado para seu email
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading || isResending}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={
                    isLoading || isResending || form.watch("code").length !== 6
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : type === "sign-up" ? (
                    "Criar conta"
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center dark:text-zinc-500">
            Não recebeu o código?{" "}
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={isResending || resendCountdown > 0}
              className="dark:text-zinc-400 hover:text-zinc-300 p-0 h-auto font-normal"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin inline" />
                  Enviando...
                </>
              ) : resendCountdown > 0 ? (
                `Reenviar em ${resendCountdown}s`
              ) : (
                "Reenviar código"
              )}
            </Button>
          </div>
          <div className="text-xs text-center dark:text-zinc-600">
            • O código expira em 10 minutos
            <br />• Verifique sua pasta de spam
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
