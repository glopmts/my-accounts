import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import {
  Calendar,
  Edit,
  ExternalLink,
  Key,
  Trash2,
  TYPE_METADATA,
} from "../types/constantes";
import { MyAccounts } from "../types/interfaces";
import ArchivedButton from "./buttons_actions/archived-button";

interface AccountCardProps {
  account: MyAccounts;
  onEdit: (acc: MyAccounts) => void;
  onDelete: (id: string) => void;
  refetch: () => void;
  isArchived?: boolean;
  userId: string;
  onView: (acc: MyAccounts) => void;
  viewMode: "grid" | "list";
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onView,
  refetch,
  viewMode,
  userId,
}) => {
  const [selectedPasswordIndex, setSelectedPasswordIndex] = useState<number>(0);
  const meta = TYPE_METADATA[account.type];

  const isGrid = viewMode === "grid";

  const selectedPassword = account.passwords?.[selectedPasswordIndex];

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} sem atrás`;
    return `${Math.floor(days / 30)} meses atrás`;
  };

  const hasPasswords = account.passwords && account.passwords.length > 0;

  // Renderização para modo LISTA
  if (!isGrid) {
    return (
      <div
        onClick={() => onView(account)}
        className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all duration-200 overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-zinc-900/30"
      >
        {/* Container principal com grid layout para lista */}
        <div className="grid grid-cols-12 gap-3 p-3 items-center">
          {/* Coluna 1: Ícone e Título (3 colunas) */}
          <div className="col-span-12 sm:col-span-4 flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 relative shrink-0 dark:bg-zinc-800 bg-linear-to-br ${meta.color} rounded-lg shadow-inner flex items-center justify-center overflow-hidden`}
            >
              {account.icon ? (
                <Image
                  src={account.icon}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-white">{meta.icon}</div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {account.title || "Sem título"}
              </h3>
              {account.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                  {account.description}
                </p>
              )}
            </div>
          </div>

          {/* Coluna 2: Tipo e URL (2 colunas) */}
          <div className="col-span-12 sm:col-span-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 ${meta.color} bg-opacity-10 border-0`}
            >
              {meta.label}
            </Badge>

            {account.url && (
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title={account.url}
              >
                <Globe size={14} />
              </a>
            )}
          </div>

          {/* Coluna 3: Informações de senha (3 colunas) */}
          <div className="col-span-12 sm:col-span-3">
            {hasPasswords ? (
              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de senhas (se houver múltiplas) */}
                {account.passwords.length > 1 ? (
                  <select
                    value={selectedPasswordIndex}
                    onChange={(e) =>
                      setSelectedPasswordIndex(Number(e.target.value))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-zinc-100 dark:bg-zinc-800 border-0 rounded-md px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-blue-500"
                  >
                    {account.passwords.map((pwd, idx) => (
                      <option key={pwd.id} value={idx}>
                        {pwd.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0"
                  >
                    <Key className="w-3 h-3 mr-1" />
                    {account.passwords[0].label}
                  </Badge>
                )}

                {/* Última atualização */}
                {account.updatedAt && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-500">
                          <Calendar size={12} className="mr-1" />
                          <span>{getRelativeTime(account.updatedAt)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Atualizado em:{" "}
                          {new Date(account.updatedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
                >
                  Sem senhas
                </Badge>
              </div>
            )}
          </div>

          {/* Coluna 4: Ações (4 colunas) */}
          <div className="col-span-12 sm:col-span-4 flex items-center justify-end gap-1">
            {/* Contador de senhas (para quick view) */}
            {hasPasswords && (
              <Badge className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mr-2">
                {account.passwords.length}{" "}
                {account.passwords.length === 1 ? "senha" : "senhas"}
              </Badge>
            )}

            <ArchivedButton
              myaccountId={account.id}
              refetch={refetch}
              userId={userId}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(account);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Edit size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar conta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(account.id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excluir conta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  // Renderização para modo GRADE
  if (!hasPasswords) {
    return (
      <div
        onClick={() => onView(account)}
        className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all duration-200 overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-zinc-900/30 p-5 flex flex-col h-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 dark:bg-zinc-800 relative bg-linear-to-br ${meta.color} rounded-lg shadow-inner flex items-center justify-center overflow-hidden`}
            >
              {account.icon ? (
                <Image
                  src={account.icon}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-white">{meta.icon}</div>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-bold ${meta.color} bg-opacity-10 border-0`}
          >
            {meta.label}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg mb-1 truncate">
          {account.title || "Sem título"}
        </h3>

        {/* URL (se houver) */}
        {account.url && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mb-3">
            {account.url}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {account.url && (
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ArchivedButton
              myaccountId={account.id}
              refetch={refetch}
              userId={userId}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Edit size={14} />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(account.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderização para modo GRADE com senhas
  return (
    <div
      onClick={() => onView(account)}
      className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all duration-200 overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-zinc-900/30 p-5 flex flex-col h-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 dark:bg-zinc-800  relative bg-linear-to-br ${meta.color} rounded-lg shadow-inner flex items-center justify-center overflow-hidden`}
          >
            {account.icon ? (
              <Image src={account.icon} alt="" fill className="object-cover" />
            ) : (
              <div className="dark:text-white">{meta.icon}</div>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-bold ${meta.color} bg-opacity-10 border-0`}
        >
          {meta.label}
        </Badge>
      </div>

      {/* Título e descrição */}
      <div className="flex flex-col mb-4 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg mb-1 truncate">
          {account.title || "Sem título"}
        </h3>
        {account.url && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mb-2">
            {account.url}
          </p>
        )}
        {account.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-10">
            {account.description}
          </p>
        )}
      </div>

      {/* Password Selector */}
      {account.passwords.length > 1 && (
        <div className="mb-3">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            {account.passwords.map((password, index) => (
              <button
                key={password.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPasswordIndex(index);
                }}
                className={`px-2 py-1 text-xs rounded-md transition-all whitespace-nowrap ${
                  selectedPasswordIndex === index
                    ? "bg-zinc-900 dark:bg-zinc-700 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {password.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Password atual (se houver seleção) */}
      {selectedPassword && (
        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {account.passwords.length > 1 ? "Senha selecionada" : "Senha"}
            </span>
          </div>
          <p className="text-sm font-mono mt-1 text-zinc-900 dark:text-zinc-100">
            ••••••••
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {account.url && (
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ArchivedButton
            myaccountId={account.id}
            refetch={refetch}
            userId={userId}
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(account);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Edit size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar conta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(account.id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir conta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Badge de quantidade de senhas */}
      <div className="absolute top-3 right-3">
        <Badge className="text-xs bg-blue-500 hover:bg-blue-600 text-white border-0">
          <Key className="w-3 h-3 mr-1" />
          {account.passwords.length}
        </Badge>
      </div>
    </div>
  );
};
