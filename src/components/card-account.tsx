import React, { useState } from "react";
import {
  Check,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  TYPE_METADATA,
} from "../types/constantes";
import { MyAccounts } from "../types/interfaces";

interface AccountCardProps {
  account: MyAccounts;
  onEdit: (acc: MyAccounts) => void;
  onDelete: (id: string) => void;
  onView: (acc: MyAccounts) => void;
  viewMode: "grid" | "list";
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onView,
  viewMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const meta = TYPE_METADATA[account.type];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.password[0] || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGrid = viewMode === "grid";

  return (
    <div
      onClick={() => onView(account)}
      className={`group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${isGrid ? "p-5 flex flex-col h-full" : "p-4 flex items-center gap-4"}`}
    >
      {/* Icon & Meta */}
      <div
        className={`${isGrid ? "mb-4" : ""} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${meta.color} shadow-inner`}
          >
            {account.icon ? (
              <img
                src={account.icon}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ) : (
              meta.icon
            )}
          </div>
          {!isGrid && (
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold text-zinc-100 truncate">
                {account.title || "Untitled"}
              </h3>
              <p className="text-xs text-zinc-500 truncate">{account.url}</p>
            </div>
          )}
        </div>
        <div
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-zinc-800 ${meta.color} ${!isGrid ? "hidden sm:block" : ""}`}
        >
          {meta.label}
        </div>
      </div>

      {isGrid && (
        <div className="flex flex-col mb-4 min-w-0">
          <h3 className="font-semibold text-zinc-100 text-lg mb-1 truncate">
            {account.title || "Untitled"}
          </h3>
          <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
            {account.description || "No description provided."}
          </p>
        </div>
      )}

      {/* Password Field */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-zinc-950/50 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between group/pass ${isGrid ? "mt-auto" : "ml-auto min-w-[180px]"}`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
            Password
          </span>
          <div className="font-mono text-sm tracking-widest text-zinc-300">
            {showPassword ? account.password[0] || "••••••••" : "••••••••"}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/pass:opacity-100 transition-opacity">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${isGrid ? "mt-4 pt-4 border-t border-zinc-800" : ""} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          {account.url && (
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 hover:bg-red-900/30 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
