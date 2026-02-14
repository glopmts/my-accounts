import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { Check } from "../types/constantes";

// Componente auxiliar para requisitos de senha
export const PasswordRequirement = ({
  met,
  text,
}: {
  met: boolean;
  text: string;
}) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <X className="h-3.5 w-3.5 text-zinc-400" />
    )}
    <span
      className={cn(
        "text-xs",
        met
          ? "text-green-600 dark:text-green-400"
          : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {text}
    </span>
  </div>
);

// Componente para status de validação
export const ValidationStatus = ({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) => (
  <div className="flex items-center gap-2">
    {valid ? (
      <Check className="h-3 w-3 text-green-500" />
    ) : (
      <div className="h-3 w-3 rounded-full border border-zinc-300 dark:border-zinc-600" />
    )}
    <span
      className={cn(
        "text-xs",
        valid
          ? "text-green-600 dark:text-green-400"
          : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {text}
    </span>
  </div>
);

// Funções auxiliares para força da senha
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
  return Math.min(strength, 100);
};

export const getPasswordStrengthColor = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength < 40) return "bg-red-500";
  if (strength < 70) return "bg-yellow-500";
  return "bg-green-500";
};

export const getPasswordStrengthText = (password: string): string => {
  const strength = getPasswordStrength(password);
  if (strength < 40) return "Fraca";
  if (strength < 70) return "Média";
  return "Forte";
};
