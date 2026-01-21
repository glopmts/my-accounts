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
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema de validação simplificado
const completeProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .transform((val) => val.trim()),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const { userId, getToken } = useAuth();

  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  // Verifica se o usuário já existe no banco de dados
  useEffect(() => {
    const checkUserExists = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/auth/check?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            router.push("/home");
          } else {
            setIsCreating(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        setIsCreating(false);
      }
    };

    checkUserExists();
  }, [userId, router, getToken]);

  const handleCompleteProfile = async (data: CompleteProfileFormData) => {
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          userId,
          name: data.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar perfil");
      }

      toast.success("Perfil criado com sucesso!");

      // Redireciona para o dashboard após um breve delay
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar perfil",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se ainda está verificando se o usuário existe
  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-zinc-800 p-3">
                <Loader2 className="h-8 w-8 text-zinc-300 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-zinc-50">
              Configurando sua conta
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Aguarde enquanto verificamos suas informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-zinc-300">Autenticação completa</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                <span className="text-zinc-400">Verificando perfil...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-zinc-800 p-3">
              <User className="h-8 w-8 text-zinc-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-50">
            Complete seu perfil
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Estamos quase lá! Preencha seu nome para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCompleteProfile)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Seu nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Como gostaria de ser chamado?"
                        className="bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-zinc-700 h-12 text-base"
                        {...field}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50 h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando perfil...
                    </>
                  ) : (
                    "Completar cadastro"
                  )}
                </Button>

                <div className="text-xs text-center text-zinc-500">
                  Ao completar seu cadastro, você concorda com nossos{" "}
                  <a
                    href="/terms"
                    className="text-zinc-400 hover:text-zinc-300 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a
                    href="/privacy"
                    className="text-zinc-400 hover:text-zinc-300 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidade
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <p className="text-sm text-zinc-500 text-center">
            Esta etapa é necessária para novos usuários e cadastros via OAuth
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
