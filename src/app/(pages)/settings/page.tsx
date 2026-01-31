"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/avatar-custom";
import ErrorAlert from "@/components/profile_components/error-alert";
import NewsEmailModal from "@/components/profile_components/news-email-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { Mail, RefreshCw, User } from "lucide-react";

const Settings = () => {
  const {
    user,
    isLoading,
    error,

    isRefreshing,
    isEmailDialogOpen,
    isGeneratingCode,
    newEmail,
    isGeneratingCodeEmail,
    isConfirmCodeEmail,
    step,
    code,

    ListOptions,

    handleRefresh,
    handleEmailChange,
    handleValidateCode,
    setCode,
    setNewEmail,
    setIsEmailDialogOpen,
  } = useSettings();

  if (isLoading) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-b dark:from-zinc-900 dark:to-black">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 dark:text-zinc-300" />
          <p className="text-sm dark:text-zinc-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert handleRefresh={handleRefresh} isRefreshing={isRefreshing} />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b dark:from-zinc-900 dark:to-black ">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center  items-baseline justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Configurações
            </h1>
            <p className="dark:text-zinc-400 mt-1">
              Gerencie suas preferências e informações da conta
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className={cn("md:w-32 md:h-32 w-20 h-20 shadow-xl")}>
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name || "Avatar do usuário"}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-bold dark:bg-zinc-800 dark:text-zinc-300">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-semibold ">
                  {user.name || "Usuário"}
                </h2>
                <p className="dark:text-zinc-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email || "email@exemplo.com"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="px-3 py-1 dark:bg-zinc-800 rounded-full text-sm dark:text-zinc-300">
                    Usuário
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                    Ativo
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ListOptions.map((option) => (
            <Card
              key={option.id}
              className={cn(
                "dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                "dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/20",
                "cursor-pointer group",
              )}
              onClick={() => {
                if (option.requiresConfirmation) {
                  const confirmed = confirm(
                    `Deseja realmente ${option.label.toLowerCase()}?`,
                  );
                  if (confirmed) {
                    option.action();
                  }
                } else {
                  option.action();
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-colors",
                      option.destructive
                        ? "bg-destructive/10 border border-destructive/20"
                        : "dark:bg-zinc-800 border dark:border-zinc-700",
                    )}
                  >
                    <option.icon
                      className={cn(
                        "h-6 w-6",
                        option.destructive
                          ? "text-destructive"
                          : "dark:text-zinc-300",
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold ">{option.label}</h3>
                      {option.id === 2 && isGeneratingCode && (
                        <Spinner className="h-4 w-4 dark:text-zinc-400" />
                      )}
                    </div>
                    <p className="text-sm dark:text-zinc-400 mt-2">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog para alterar email */}
      {isEmailDialogOpen && (
        <NewsEmailModal
          step={step}
          code={code}
          handleEmailChange={handleEmailChange}
          isEmailDialogOpen={isEmailDialogOpen}
          newEmail={newEmail}
          setIsEmailDialogOpen={setIsEmailDialogOpen}
          setNewEmail={setNewEmail}
          isConfirmCodeEmail={isConfirmCodeEmail}
          isGeneratingCodeEmail={isGeneratingCodeEmail}
          handleValidateCode={handleValidateCode}
          setCode={setCode}
        />
      )}

      {/* Modal code */}

      {/* {isModalCode && (
        <NewsCodeModal
          userId={userId}
          isOpen={isModalCode}
          refetch={refetch}
          setIsOpen={setIsModalCode}
          i18nIsDynamicList={true}
        />
      )} */}
    </div>
  );
};

export default Settings;
