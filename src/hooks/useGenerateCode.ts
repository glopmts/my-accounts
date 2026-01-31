import { useCallback, useState } from "react";
import { CodeService } from "../services/code.service";

interface UseGenerateCodeProps {
  onSuccess?: (code: string) => void;
  onError?: (error: string) => void;
}

export function useGenerateCode({
  onSuccess,
  onError,
}: UseGenerateCodeProps = {}) {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const generateCode = useCallback(
    async (currentCode?: string) => {
      setLoading(true);
      setError("");

      try {
        const newCode = await CodeService.generateUniqueCode(currentCode);

        setCode(newCode);

        if (onSuccess) {
          onSuccess(newCode);
        }

        return newCode;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao gerar código";
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        // Fallback local
        const fallbackCode = CodeService.generateCode();
        setCode(fallbackCode);
        return fallbackCode;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError],
  );

  const validateCode = useCallback((codeToValidate: string): boolean => {
    return CodeService.isValidCodeFormat(codeToValidate);
  }, []);

  const reset = useCallback(() => {
    setCode("");
    setError("");
  }, []);

  return {
    code,
    loading,
    error,
    generateCode,
    validateCode,
    reset,
    isValid: CodeService.isValidCodeFormat(code),
  };
}
