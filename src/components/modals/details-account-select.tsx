"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Shield,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { TYPE_METADATA } from "../../types/constantes";
import { MyAccounts } from "../../types/interfaces";
import { Button } from "../ui/button";

type PropsDataAccount = {
  account: MyAccounts;
  isOpen: boolean;
  onClose: () => void;
  handleDelete?: (id: string) => void;
};

const DetailsAccountModel = ({
  account,
  isOpen,
  onClose,
  handleDelete,
}: PropsDataAccount) => {
  if (!account) return null;

  const meta = TYPE_METADATA[account.type];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copiado para a área de transferência!`);
    } catch (err) {
      toast.error("Falha ao copiar");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger className="hidden">Open</DialogTrigger>
      <DialogContent className="md:max-w-lg lg:max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="shrink-0 p-0">
          <div className="relative h-32 bg-zinc-900 overflow-hidden">
            <div
              className={`absolute inset-0 opacity-10 ${meta.color.replace("text", "bg")}`}
            />

            <div className="absolute -bottom-8 left-8">
              <div
                className={`w-20 h-20 rounded-2xl dark:bg-zinc-950 border-4 dark:border-zinc-950 shadow-2xl flex items-center justify-center ${meta.color}`}
              >
                {account.icon ? (
                  <Image
                    src={account.icon}
                    alt=""
                    fill
                    sizes="100vw"
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : (
                  // Cast to React.ReactElement<any> to resolve 'size' property error when props type is unknown
                  React.cloneElement(
                    meta.icon as React.ReactElement<{ size?: number }>,
                    {
                      size: 40,
                    },
                  )
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4 p-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight text-white mb-1">
                {account.title || "Untitled"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}
                >
                  {meta.label}
                </span>
                {account.url && (
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ExternalLink size={12} /> {new URL(account.url).hostname}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Created
                </span>
              </div>
              <div className="text-sm font-medium text-zinc-300">
                {new Date(account.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Clock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Updated
                </span>
              </div>
              <div className="text-sm font-medium text-zinc-300">
                {new Date(account.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Shield size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Security
                </span>
              </div>
              <div className="text-sm font-medium text-green-500 flex items-center gap-1">
                Encrypted
              </div>
            </div>
          </div>
          {/* URL */}
          {account.url && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium dark:text-gray-400">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyToClipboard(account.url!, "URL")}
                    title="Copiar URL"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="p-2 rounded-md">
                <p className="text-sm break-all font-mono">{account.url}</p>
              </div>
            </div>
          )}

          {/* Tipo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium dark:text-gray-400">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Tipo</span>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {account.type}
            </div>
          </div>

          {/* Notas */}
          {account.notes && (
            <div className="space-y-2 dark:bg-zinc-900 p-1 border rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium dark:text-gray-400">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Notas</span>
              </div>
              <div className="p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto">
                  {account.notes}
                </p>
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:bg-zinc-900 px-2.5 py-3.5 rounded-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Criado</span>
              </div>
              <div className="text-sm font-medium">
                {formatDate(account.createdAt)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Atualizado</span>
              </div>
              <div className="text-sm font-medium">
                {formatDate(account.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Excluir */}
        {handleDelete && (
          <div className="shrink-0 pt-4 border-t mt-4 p-4">
            <Button
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir esta conta?")) {
                  handleDelete(account.id);
                  onClose();
                }
              }}
              variant="destructive"
              className="w-auto flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Conta
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsAccountModel;
