"use client";

import { useEffect, useState } from "react";
import { PasswordService } from "../../lib/crypto";
import PasswordComponent from "../password/password-component";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Spinner } from "../ui/spinner";

type PropsModalPassword = {
  isPasswordDialogOpen: boolean;
  isGeneratingPassword: boolean;
  isPasswordExinsting?: string | null;
  setIsPasswordDialogOpen: (boolean: boolean) => void;
  password: string;
  newPassword: string;
  confirmNewPassword: string;
  setPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmNewPassword: (password: string) => void;
  handlePasswordChange: () => void;
};

const NewsPasswordModal = ({
  isPasswordDialogOpen,
  password,
  isGeneratingPassword,
  newPassword,
  isPasswordExinsting,
  confirmNewPassword,
  setIsPasswordDialogOpen,
  setNewPassword,
  setPassword,
  setConfirmNewPassword,
  handlePasswordChange,
}: PropsModalPassword) => {
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState<
    boolean | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyCurrentPassword = async () => {
      if (!password || !isPasswordExinsting) {
        setIsCurrentPasswordValid(null);
        return;
      }

      setIsVerifying(true);
      try {
        const isValid = await PasswordService.verifyPassword(
          password,
          isPasswordExinsting,
        );
        setIsCurrentPasswordValid(isValid);
      } catch (error) {
        console.error("Erro ao verificar senha:", error);
        setIsCurrentPasswordValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    const debounceTimer = setTimeout(verifyCurrentPassword, 500);
    return () => clearTimeout(debounceTimer);
  }, [password, isPasswordExinsting]);

  const passwordsMatch = newPassword === confirmNewPassword;
  const isNewPasswordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const isFormValid =
    (!isPasswordExinsting || isCurrentPasswordValid === true) &&
    isNewPasswordValid &&
    passwordsMatch;

  const handleClose = () => {
    setIsPasswordDialogOpen(false);
    setPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsCurrentPasswordValid(null);
  };

  return (
    <Dialog open={isPasswordDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <PasswordComponent
            isGeneratingPassword={isGeneratingPassword}
            isPasswordExinsting={isPasswordExinsting}
            password={password}
            newPassword={newPassword}
            confirmNewPassword={confirmNewPassword}
            setPassword={setPassword}
            setNewPassword={setNewPassword}
            setConfirmNewPassword={setConfirmNewPassword}
            onPasswordValidation={(valid) => {
              // Lógica adicional se necessário
            }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGeneratingPassword || isVerifying}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={!isFormValid || isGeneratingPassword || isVerifying}
          >
            <span className="flex items-center gap-2.5">
              {(isGeneratingPassword || isVerifying) && <Spinner />}
              Confirmar alteração
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsPasswordModal;
