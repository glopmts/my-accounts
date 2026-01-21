import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Eye,
  EyeOff,
  FileCode,
  Key,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Secret, SecurityAudit } from "../types/interfaces";

interface SecretItemProps {
  secret: Secret;
  onDelete: (id: string) => void;
  onEdit: (secret: Secret) => void;
}

const SecretItem: React.FC<SecretItemProps> = ({
  secret,
  onDelete,
  onEdit,
}) => {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SecurityAudit | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runAudit = async () => {
    if (isAuditing) return;
    setIsAuditing(true);

    setIsAuditing(false);
    setShowAudit(true);
  };

  const getIcon = () => {
    switch (secret.type) {
      case "password":
        return <Key className="w-5 h-5 text-indigo-400" />;
      case "env":
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case "note":
        return <StickyNote className="w-5 h-5 text-amber-400" />;
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
              {secret.title}
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {secret.type}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(secret)}
            className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(secret.id)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-400 line-clamp-2 mb-4 min-h-[40px]">
        {secret.description || "No description provided."}
      </p>

      <div className="relative mt-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group/value">
        <div className="flex items-center justify-between p-3">
          <code className="text-sm font-mono text-zinc-300 truncate mr-10">
            {showValue ? secret.value : "••••••••••••••••"}
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

      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {auditResult ? (
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                auditResult.strength === "Strong"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : auditResult.strength === "Moderate"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {auditResult.strength} Audit
              {showAudit ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          ) : (
            <button
              onClick={runAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${isAuditing ? "animate-pulse" : ""}`}
              />
              {isAuditing ? "Auditing..." : "AI Audit"}
            </button>
          )}
        </div>
        <span className="text-[10px] text-zinc-600 font-medium">
          {new Date(secret.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* AI Audit Feedback Panel */}
      {showAudit && auditResult && (
        <div className="mt-4 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300">
              Security Insights
            </span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    auditResult.score > 70
                      ? "bg-emerald-500"
                      : auditResult.score > 40
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${auditResult.score}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {auditResult.score}%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
            {auditResult.feedback}
          </p>
          <div className="space-y-1.5">
            {auditResult.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[10px] text-zinc-500"
              >
                <div className="mt-1 w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretItem;
