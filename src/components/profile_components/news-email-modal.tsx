"use client";

import { VerificationInput } from "../auth/verification-input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

type PropsModalEmail = {
  isEmailDialogOpen: boolean;
  isGeneratingCodeEmail: boolean;
  isConfirmCodeEmail: boolean;
  setIsEmailDialogOpen: (boolean: boolean) => void;
  newEmail: string;
  code: string;
  setCode: (code: string) => void;
  handleEmailChange: () => void;
  handleValidateCode: () => void; // NOME CORRIGIDO
  setNewEmail: (email: string) => void;
  step?: "validate" | "request"; // NOME ALTERADO (de type para step)
  length?: number;
};

const NewsEmailModal = ({
  isEmailDialogOpen,
  isGeneratingCodeEmail,
  isConfirmCodeEmail,
  newEmail,
  code,
  step = "request", // VALOR PADRÃO
  length = 6,
  setCode,
  setIsEmailDialogOpen,
  setNewEmail,
  handleEmailChange,
  handleValidateCode, // NOME CORRIGIDO
}: PropsModalEmail) => {
  return (
    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
      <DialogContent className="dark:border-zinc-800 dark:bg-zinc-900 ">
        <DialogHeader>
          <DialogTitle className="">
            {step === "request" ? "Alterar email" : "Validar código"}
          </DialogTitle>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-zinc-300">
                Novo email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@novoemail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="dark:border-zinc-700 dark:bg-zinc-800  focus:border-zinc-600"
                disabled={isGeneratingCodeEmail}
              />
            </div>

            <div className="dark:bg-zinc-800/50 border dark:border-zinc-700 rounded-lg p-3">
              <p className="text-sm dark:text-zinc-400">
                Um código de verificação será enviado para seu email atual para
                confirmar a alteração.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">Novo email informado</Label>
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                <p className="text-sm">{newEmail}</p>
              </div>
              <p className="text-xs text-zinc-400">
                Este será seu novo email após a confirmação
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-zinc-300">
                Código de verificação
              </Label>
              <VerificationInput
                value={code}
                onChange={setCode}
                length={length}
                disabled={isConfirmCodeEmail}
              />
              <p className="text-xs text-zinc-400">
                Digite o código de 6 dígitos enviado para seu email atual
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEmailDialogOpen(false);
            }}
            disabled={isGeneratingCodeEmail || isConfirmCodeEmail}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              step === "request" ? handleEmailChange() : handleValidateCode();
            }}
            disabled={
              (step === "request" && (!newEmail || isGeneratingCodeEmail)) ||
              (step === "validate" &&
                (!code || code.length !== 6 || isConfirmCodeEmail))
            }
          >
            {step === "request" ? (
              <span className="flex items-center gap-2.5">
                {isGeneratingCodeEmail && <Spinner />}
                Enviar código
              </span>
            ) : (
              <span className="flex items-center gap-2.5">
                {isConfirmCodeEmail && <Spinner />}
                Confirmar alteração
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsEmailModal;
