"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/avatar-custom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Mail, Pen, PenOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { useProfile } from "../../../hooks/use-profile";

const Profile = () => {
  const {
    user,
    isLoading,
    userId,
    error,

    isEdite,
    isUpdate,
    isSendingVerification,

    form,

    refetch,
    setEdite,
    setForm,
    handleEdite,
    handleSendVerificationEmail,
    handleUpdate,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">
                  Erro ao carregar perfil
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Não foi possível carregar as informações do perfil
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdite}
              className={cn(
                "transition-all",
                isEdite && "bg-primary/10 text-primary border-primary/20",
              )}
            >
              {isEdite ? (
                <PenOff className="h-4 w-4" />
              ) : (
                <Pen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Profile Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || "User Avatar"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background",
                          user?.emailVerified
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white",
                        )}
                      >
                        {user?.emailVerified ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <ShieldAlert className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {user?.emailVerified ? (
                    <Badge variant="success" className="gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      Email Verificado
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-2">
                      <ShieldAlert className="h-3 w-3" />
                      Não Verificado
                    </Badge>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Nome
                    </label>
                    {isEdite ? (
                      <Input
                        value={form.name}
                        placeholder="Seu nome"
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="max-w-md"
                      />
                    ) : (
                      <p className="text-lg font-medium">
                        {user?.name || "Usuário"}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg">{user?.email}</p>
                    </div>

                    {!user?.emailVerified && (
                      <div className="mt-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                              Email não verificado
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                              Verifique seu email para acessar todos os recursos
                            </p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSendVerificationEmail}
                            disabled={isSendingVerification}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {isSendingVerification ? (
                              <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Verificar Email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEdite && (
                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEdite(false);
                      setForm({
                        name: user.name || "",
                        image: user.image || "",
                      });
                    }}
                    disabled={isUpdate}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdate || !form.name.trim()}
                    className="min-w-32"
                  >
                    {isUpdate ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Card (opcional) */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">Status da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    Membro desde
                  </p>
                  <p className="font-medium">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status de Verificação
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        user?.emailVerified ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    <p className="font-medium">
                      {user?.emailVerified ? "Verificado" : "Pendente"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
