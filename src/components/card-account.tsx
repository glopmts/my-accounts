import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import React, { useState } from "react";
import {
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

  const selectedPassword = account.passwords[selectedPasswordIndex];

  if (!account.passwords || account.passwords.length === 0) {
    return (
      <div
        onClick={() => onView(account)}
        className={`group relative dark:bg-zinc-900/50 border dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${isGrid ? "p-5 flex flex-col h-full" : "p-4 flex flex-col md:flex-row md:items-center gap-4"}`}
      >
        {/* Conteúdo básico sem senhas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 relative bg-zinc-200 shadow h-10 rounded-lg dark:bg-zinc-800 flex items-center justify-center ${meta.color} shadow-inner`}
            >
              {account.icon ? (
                <Image
                  src={account.icon}
                  alt=""
                  fill
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                meta.icon
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold dark:text-zinc-100 truncate">
                {account.title || "Untitled"}
              </h3>
              {account.url && (
                <p className="text-xs dark:text-zinc-500 truncate">
                  {account.url}
                </p>
              )}
            </div>
          </div>
          <div
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-zinc-800 ${meta.color}`}
          >
            {meta.label}
          </div>
        </div>

        <div className="mt-4 text-center py-8 border-2 border-dashed border-zinc-800 rounded-lg">
          <Key className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500">Nenhuma senha cadastrada</p>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {account.url && (
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg dark:text-zinc-400 transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ArchivedButton
              myaccountId={account.id}
              refetch={refetch}
              userId={userId}
            />
            <Button onClick={() => onEdit(account)} variant="ghost" size="icon">
              <Edit size={16} />
            </Button>
            <Button
              onClick={() => onDelete(account.id)}
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Com senhas
  return (
    <div
      onClick={() => onView(account)}
      className={`group relative dark:bg-zinc-900/50 border dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${isGrid ? "p-5 flex flex-col h-full" : "p-4 flex flex-col md:flex-row md:items-center gap-4"}`}
    >
      {/* Header */}
      <div
        className={`${isGrid ? "mb-4" : ""} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 relative bg-zinc-200 shadow h-10 rounded-lg dark:bg-zinc-800 flex items-center justify-center ${meta.color} shadow-inner`}
          >
            {account.icon ? (
              <Image
                src={account.icon}
                alt=""
                fill
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              meta.icon
            )}
          </div>
          {!isGrid && (
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold dark:text-zinc-100 truncate">
                {account.title || "Untitled"}
              </h3>
              {account.url && (
                <p className="text-xs dark:text-zinc-500 truncate">
                  {account.url}
                </p>
              )}
            </div>
          )}
        </div>
        <div
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-zinc-800 ${meta.color} ${!isGrid ? "hidden sm:block" : ""}`}
        >
          {meta.label}
        </div>
      </div>

      {/* Content */}
      {isGrid && (
        <div className="flex flex-col mb-4 min-w-0">
          <h3 className="font-semibold dark:text-zinc-100 text-lg mb-1 truncate">
            {account.title || "Untitled"}
          </h3>
          {account.description && (
            <p className="text-sm dark:text-zinc-400 line-clamp-2 min-h-[40px]">
              {account.description}
            </p>
          )}
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              <Key className="w-3 h-3 mr-1" />
              {account.passwords.length}{" "}
              {account.passwords.length === 1 ? "senha" : "senhas"}
            </Badge>
          </div>
        </div>
      )}

      {/* Password Selector */}
      {account.passwords.length > 1 && (
        <div className="mb-3">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {account.passwords.map((password, index) => (
              <button
                key={password.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPasswordIndex(index);
                }}
                className={`px-2 py-1 text-xs rounded-md transition-all whitespace-nowrap ${selectedPasswordIndex === index ? "bg-zinc-800 text-zinc-100" : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"}`}
              >
                {password.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className={`${isGrid ? "mt-4 pt-4 border-t dark:border-zinc-800" : "mt-3 md:mt-0"} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          {account.url && (
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg dark:text-zinc-400 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
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
                >
                  <Edit size={16} />
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
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir conta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Password Count Badge for List View */}
      {!isGrid && (
        <div className="absolute -top-2 -right-2">
          <Badge className="text-xs bg-zinc-800 hover:bg-zinc-700">
            <Key className="w-3 h-3 mr-1" />
            {account.passwords.length}
          </Badge>
        </div>
      )}
    </div>
  );
};
