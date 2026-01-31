"use client";

import { useGenerateCode } from "@/hooks/useGenerateCode";
import { useState } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface CodeGeneratorProps {
  onCodeGenerated: (code: string) => void;
  currentCode?: string;
  label?: string;
  disabled?: boolean;
}

export function CodeGenerator({
  onCodeGenerated,
  currentCode,
  label = "Gerar Código",
  disabled = false,
}: CodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const { code, loading, error, generateCode, isValid } = useGenerateCode({
    onSuccess: onCodeGenerated,
  });

  const handleGenerate = async () => {
    await generateCode(currentCode);
  };

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleGenerate} disabled={loading || disabled}>
          {loading ? (
            <>
              <Spinner />
              Gerando...
            </>
          ) : (
            label
          )}
        </Button>

        {code && (
          <div className="flex-1 flex items-center gap-2">
            <div
              className={`flex-1 px-3 py-2 border rounded-md font-mono text-lg ${isValid ? "border-green-500" : "border-yellow-500"}`}
            >
              {code}
            </div>
            <Button onClick={handleCopy} title="Copiar código">
              {copied ? "✓" : "📋"}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {code && !isValid && (
        <div className="text-yellow-600 text-sm p-2 bg-yellow-50 rounded">
          Código gerado não está no formato padrão (A12345)
        </div>
      )}
    </div>
  );
}
