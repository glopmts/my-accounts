"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface VerificationInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: "text" | "numeric" | "alphanumeric";
}

export function VerificationInput({
  length = 6,
  value,
  onChange,
  autoFocus,
  className,
  disabled = false,
  type = "alphanumeric",
}: VerificationInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    // Garante que todos os inputs tenham os valores corretos
    for (let i = 0; i < length; i++) {
      const input = inputsRef.current[i];
      if (input) {
        input.value = value[i] || "";
      }
    }
  }, [value, length]);

  // Função para validar caracteres baseado no tipo
  const isValidChar = (char: string): boolean => {
    if (char === "") return true; // Permite apagar

    switch (type) {
      case "numeric":
        return /^\d$/.test(char);
      case "text":
        return /^[a-zA-Z]$/.test(char);
      case "alphanumeric":
        return /^[a-zA-Z0-9]$/.test(char);
      default:
        return /^[a-zA-Z0-9]$/.test(char);
    }
  };

  const handleChange = (index: number, char: string) => {
    if (!isValidChar(char)) return;

    const newValue = value.split("");
    newValue[index] = char;
    const newValueStr = newValue.join("").slice(0, length);

    onChange(newValueStr);

    // Focus next input
    if (char && index < length - 1) {
      setTimeout(() => {
        inputsRef.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const currentValue = value[index] || "";

    if (e.key === "Backspace") {
      e.preventDefault();

      if (currentValue) {
        // Se tem valor, remove o valor atual
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        // Se está vazio, volta para o anterior e remove o valor dele
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        setTimeout(() => {
          inputsRef.current[index - 1]?.focus();
        }, 0);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        inputsRef.current[index - 1]?.focus();
      }, 0);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      setTimeout(() => {
        inputsRef.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === "Delete") {
      e.preventDefault();
      const newValue = value.split("");
      newValue[index] = "";
      onChange(newValue.join(""));
    } else if (e.key === "Tab") {
      // Permitir navegação normal com Tab
      return;
    } else if (e.key === " " || e.key === "Spacebar") {
      // Bloquear espaço
      e.preventDefault();
    } else if (isValidChar(e.key)) {
      // Se for um caractere válido, já é tratado pelo onChange
      return;
    } else if (e.key.length === 1) {
      // Previne entrada de caracteres inválidos
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    let pastedData = e.clipboardData.getData("text");

    // Filtra caracteres baseado no tipo
    switch (type) {
      case "numeric":
        pastedData = pastedData.replace(/\D/g, "");
        break;
      case "text":
        pastedData = pastedData.replace(/[^a-zA-Z]/g, "");
        break;
      case "alphanumeric":
        pastedData = pastedData.replace(/[^a-zA-Z0-9]/g, "");
        break;
    }

    const validData = pastedData.slice(0, length).toUpperCase(); // Converte para maiúsculo

    if (validData) {
      onChange(validData);
      // Foca no último input com valor
      const focusIndex = Math.min(validData.length, length) - 1;
      setTimeout(() => {
        inputsRef.current[focusIndex]?.focus();
      }, 0);
    }
  };

  const handleFocus = (index: number) => {
    // Seleciona todo o texto quando foca
    setTimeout(() => {
      inputsRef.current[index]?.select();
    }, 0);
  };

  // Configuração baseada no tipo
  const getInputConfig = () => {
    switch (type) {
      case "numeric":
        return {
          inputMode: "numeric" as const,
          pattern: "[0-9]*",
          placeholder: "0",
        };
      case "text":
        return {
          inputMode: "text" as const,
          pattern: "[A-Za-z]*",
          placeholder: "A",
        };
      case "alphanumeric":
        return {
          inputMode: "text" as const,
          pattern: "[A-Za-z0-9]*",
          placeholder: "A",
        };
      default:
        return {
          inputMode: "text" as const,
          pattern: "[A-Za-z0-9]*",
          placeholder: "A",
        };
    }
  };

  const inputConfig = getInputConfig();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode={inputConfig.inputMode}
          pattern={inputConfig.pattern}
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          placeholder={inputConfig.placeholder}
          className={cn(
            "h-14 w-12 text-center text-2xl font-semibold",
            "bg-zinc-900 border-zinc-800 text-zinc-50",
            "focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "selection:bg-zinc-700",
            "uppercase",
          )}
          style={{
            textTransform: "uppercase" as const,
          }}
        />
      ))}
    </div>
  );
}
