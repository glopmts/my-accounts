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
import { usePasswordValide } from "@/hooks/session-alert/use-password-valide";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PropsModalConfirm = {
  userId: string;
  triggerElement?: React.ReactNode;
  onSuccess?: () => void;
};

const ConfirmPassword = ({
  userId,
  triggerElement,
  onSuccess,
}: PropsModalConfirm) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    isPending,
    isOpen,
    setIsOpen,
    password,
    setPassword,

    handleConfirm,
  } = usePasswordValide({
    userId,
    onSuccess,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement || <Button>Validar com Senha</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validar com Senha</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Digite sua senha de acesso</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite a senha que você usa para acessar o sistema
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setPassword("");
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || password.length < 6}
              className="flex-1"
            >
              {isPending ? "Validando..." : "Validar Senha"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPassword;
