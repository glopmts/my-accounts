"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/axios";

type PropsModalConfirm = {
  userId: string;
  triggerElement?: React.ReactNode;
  onSuccess?: () => void;
};

const ConfirmCode = ({
  userId,
  triggerElement,
  onSuccess,
}: PropsModalConfirm) => {
  const [code, setCode] = useState("");
  const [isPending, setPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  // Atualiza o contador de tempo
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        clearInterval(timer);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const checkSession = async () => {
    try {
      const response = await api.get("/user/confirm-code");

      if (response.data.success) {
        const expiresAt = new Date(response.data.data.expiresAt);
        const now = new Date();
        const diffInSeconds = Math.floor(
          (expiresAt.getTime() - now.getTime()) / 1000,
        );

        if (diffInSeconds > 0) {
          setTimeLeft(diffInSeconds);
          toast.success("Sessão ativa");

          if (isOpen) {
            setIsOpen(false);
            if (onSuccess) onSuccess();
          }
        } else {
          setTimeLeft(null);
          await api.delete("/user/confirm-code");
        }
      }
    } catch (error) {
      setTimeLeft(null);
    }
  };

  const handleConfirm = async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    if (!code || code.length !== 7) {
      toast.error(
        "Código inválido. Deve ter 7 caracteres (1 letra + 6 números)",
      );
      return;
    }

    setPending(true);

    try {
      const res = await api.post("/user/confirm-code", {
        code: code.toUpperCase(),
      });

      if (res.data.success) {
        toast.success("Código validado com sucesso!");
        setCode("");
        setIsOpen(false);

        setTimeLeft(40 * 60);

        if (onSuccess) onSuccess();

        router.refresh();
      } else {
        toast.error(res.data.message || "Erro ao validar código");
      }
    } catch (error) {
      toast.error(error + "Erro ao validar código");
      console.error("Error confirming code:", error);
    } finally {
      setPending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.delete("/user/confirm-code");
      setTimeLeft(null);
      toast.success("Sessão encerrada");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao encerrar sessão");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (timeLeft && timeLeft > 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement || <Button>Validar Código</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validar Código de Acesso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Digite o código de 7 dígitos (ex: A123456)
            </Label>
            <Input
              id="code"
              placeholder="A123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={7}
              className="text-center text-lg font-mono tracking-widest uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Digite a letra maiúscula seguida de 6 números
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || code.length !== 7}
              className="flex-1"
            >
              {isPending ? "Validando..." : "Validar Código"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCode;
