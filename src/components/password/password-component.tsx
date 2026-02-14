"use client";

import { PasswordService } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  PasswordRequirement,
  ValidationStatus,
} from "@/utils/password-utils";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type PropsModalPassword = {
  isGeneratingPassword: boolean;
  isPasswordExinsting?: string | null;
  password: string;
  newPassword: string;
  confirmNewPassword: string;
  setPassword: (password: string) => void;
  setNewPassword: (password: string) => void;
  setConfirmNewPassword: (password: string) => void;
  length?: number;
  onPasswordValidation?: (isValid: boolean) => void;
};

const PasswordComponent = ({
  password,
  isGeneratingPassword,
  newPassword,
  isPasswordExinsting,
  confirmNewPassword,
  setNewPassword,
  setPassword,
  setConfirmNewPassword,
  onPasswordValidation,
}: PropsModalPassword) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dbPasswordValid, setDbPasswordValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const passwordsMatch = newPassword === confirmNewPassword;
  const isPasswordValid = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const allRequirementsMet =
    isPasswordValid &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar;

  useEffect(() => {
    const verifyWithDatabase = async () => {
      if (!password || !isPasswordExinsting) {
        setDbPasswordValid(null);
        return;
      }

      setIsVerifying(true);
      try {
        const isValid = await PasswordService.verifyPassword(
          password,
          isPasswordExinsting,
        );
        setDbPasswordValid(isValid);
      } catch (error) {
        console.error("Erro ao verificar senha:", error);
        setDbPasswordValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    const debounceTimer = setTimeout(verifyWithDatabase, 500);
    return () => clearTimeout(debounceTimer);
  }, [password, isPasswordExinsting]);

  useEffect(() => {
    if (onPasswordValidation) {
      const isValid =
        dbPasswordValid === true && allRequirementsMet && passwordsMatch;
      onPasswordValidation(isValid);
    }
  }, [
    dbPasswordValid,
    allRequirementsMet,
    passwordsMatch,
    onPasswordValidation,
  ]);

  return (
    <div className="space-y-4">
      {/* Campo de senha atual */}
      <div className="space-y-2">
        <Label htmlFor="current-password" className="dark:text-zinc-300">
          Senha atual
        </Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "dark:border-zinc-700 dark:bg-zinc-800 pr-10",
              dbPasswordValid === false && "border-red-500 dark:border-red-500",
              dbPasswordValid === true &&
                "border-green-500 dark:border-green-500",
            )}
            disabled={isGeneratingPassword || isVerifying}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {isVerifying && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            </div>
          )}
          {!isVerifying && dbPasswordValid === true && (
            <Check className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {!isVerifying && dbPasswordValid === false && (
            <X className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        {dbPasswordValid === false && (
          <p className="text-xs text-red-500 mt-1">Senha atual incorreta</p>
        )}
      </div>

      {/* Campo de nova senha */}
      <div className="space-y-2">
        <Label htmlFor="new-password" className="dark:text-zinc-300">
          Nova senha
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="dark:border-zinc-700 dark:bg-zinc-800 pr-10"
            disabled={isGeneratingPassword}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Campo de confirmação de nova senha */}
        {newPassword && (
          <>
            <div className="relative mt-2">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={cn(
                  "dark:border-zinc-700 dark:bg-zinc-800 pr-10",
                  confirmNewPassword &&
                    !passwordsMatch &&
                    "border-red-500 dark:border-red-500",
                  confirmNewPassword &&
                    passwordsMatch &&
                    "border-green-500 dark:border-green-500",
                )}
                disabled={isGeneratingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmNewPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">As senhas não coincidem</p>
            )}
          </>
        )}

        {/* Requisitos de senha */}
        {newPassword && (
          <div className="mt-4 space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Requisitos da senha:
            </p>
            <PasswordRequirement
              met={newPassword.length >= 8}
              text="Mínimo de 8 caracteres"
            />
            <PasswordRequirement
              met={hasUpperCase}
              text="Pelo menos uma letra maiúscula"
            />
            <PasswordRequirement
              met={hasLowerCase}
              text="Pelo menos uma letra minúscula"
            />
            <PasswordRequirement met={hasNumbers} text="Pelo menos um número" />
            <PasswordRequirement
              met={hasSpecialChar}
              text="Pelo menos um caractere especial"
            />
          </div>
        )}
      </div>

      {/* Força da senha */}
      {newPassword && allRequirementsMet && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  getPasswordStrengthColor(newPassword),
                )}
                style={{ width: `${getPasswordStrength(newPassword)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {getPasswordStrengthText(newPassword)}
            </span>
          </div>
        </div>
      )}

      {/* Resumo da validação */}
      <div className="mt-4 text-xs space-y-1">
        <ValidationStatus
          valid={dbPasswordValid === true}
          text="Senha atual correta"
        />
        <ValidationStatus
          valid={allRequirementsMet}
          text="Nova senha atende aos requisitos"
        />
        <ValidationStatus
          valid={passwordsMatch && confirmNewPassword.length > 0}
          text="Confirmação de senha corresponde"
        />
      </div>
    </div>
  );
};

export default PasswordComponent;
