import {
  Check,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FileCode,
  Key,
  StickyNote,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { MyAccounts } from "../types/interfaces";

interface SecretItemProps {
  myaccounts: MyAccounts;
  onDelete: (id: string) => void;
  onEdit?: (myaccounts: MyAccounts) => void;
}

const AccountItem: React.FC<SecretItemProps> = ({
  myaccounts,
  onDelete,
  onEdit,
}) => {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myaccounts.password[0]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (myaccounts.type) {
      case "RESET_PASSWORD":
        return <Key className="w-6 h-6 text-indigo-400" />;
      case "ENVS":
        return <FileCode className="w-6 h-6 text-green-400" />;
      case "OUTHER":
        return <StickyNote className="w-6 h-6 text-yellow-400" />;
      default:
        return <Key className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 truncate max-w-[150px]">
              {myaccounts.title}
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {myaccounts.type}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit && onEdit(myaccounts)}
            className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(myaccounts.id)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-400 line-clamp-2 mb-4 min-h-[40px]">
        {myaccounts.description || "No description provided."}
      </p>

      {myaccounts.password.length > 1 && (
        <div className="relative mt-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group/value">
          <div className="flex items-center justify-between p-3">
            <code className="text-sm font-mono text-zinc-300 truncate mr-10">
              {showValue ? myaccounts.password[0] : "••••••••••••••••"}
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowValue(!showValue)}
                className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                {showValue ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className={`p-1.5 transition-colors ${copied ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-100"}`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs dark:text-zinc-400 font-medium">
          Publicado em: {new Date(myaccounts.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default AccountItem;
