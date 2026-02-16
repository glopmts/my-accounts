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
import { useValideCode } from "../../hooks/session-alert/use-code-valide";

type PropsModalConfirm = {
  userId: string;
  isLoading: boolean;
  triggerElement?: React.ReactNode;
  onSuccess: (code: string) => Promise<void>;
};

const ConfirmCode = ({
  userId,
  triggerElement,
  onSuccess,
}: PropsModalConfirm) => {
  const {
    setIsOpen,
    setCode,
    handleConfirm,

    isOpen,
    isPending,
    code,
    hasActiveSession,
  } = useValideCode({
    userId,
    onSuccess,
  });

  if (hasActiveSession) {
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
              Digite o código de 6 dígitos (ex: A13456)
            </Label>
            <Input
              id="code"
              placeholder="A123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Digite a letra maiúscula seguida de 5 números
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
              disabled={isPending || code.length !== 6}
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
