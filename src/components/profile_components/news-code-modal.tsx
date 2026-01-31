"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/axios";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type PropsModalCode = {
  isOpen: boolean;
  triggerElement?: string;
  userId: string;
  refetch: () => void;
  setIsOpen: (boolean: boolean) => void;
};

const NewsCodeModal = ({
  triggerElement,
  isOpen,
  userId,
  setIsOpen,
  refetch,
}: PropsModalCode) => {
  const [code, setCode] = useState("");
  const [isPending, setPending] = useState(false);

  const handleUpdateCode = async () => {
    if (!userId) {
      return null;
    }
    setPending(true);
    try {
      const res = await api.post("/user/code/update", {
        code: code,
      });

      if (res.status === 200) {
        toast.success("Código único atualizado com sucesso!", {
          description: `Código atualizado!`,
          duration: 5000,
        });
      }
      refetch();
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar código", {
        description: "Tente novamente em alguns instantes" + error,
      });
    } finally {
      setPending(false);
      setIsOpen(false);
    }
  };

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
              onClick={handleUpdateCode}
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

export default NewsCodeModal;
