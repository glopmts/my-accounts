import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import React from "react";
import { SecretTypeSelector } from "./interfaces";

export const TYPE_METADATA: Record<
  SecretTypeSelector,
  { label: string; icon: React.ReactNode; color: string }
> = {
  [SecretTypeSelector.ACCOUNTS]: {
    label: "Accounts",
    icon: <User size={18} />,
    color: "text-blue-400",
  },
  [SecretTypeSelector.API_KEY]: {
    label: "API Keys",
    icon: <Code size={18} />,
    color: "text-purple-400",
  },
  [SecretTypeSelector.ENVS]: {
    label: "Env Vars",
    icon: <ShieldCheck size={18} />,
    color: "text-green-400",
  },
  [SecretTypeSelector.SECRETS]: {
    label: "Secrets",
    icon: <Key size={18} />,
    color: "text-amber-400",
  },
  [SecretTypeSelector.VERIFY_EMAIL]: {
    label: "Verification",
    icon: <Mail size={18} />,
    color: "text-indigo-400",
  },
  [SecretTypeSelector.RESET_PASSWORD]: {
    label: "Resets",
    icon: <RefreshCw size={18} />,
    color: "text-red-400",
  },
  [SecretTypeSelector.OUTHER]: {
    label: "Other",
    icon: <MoreHorizontal size={18} />,
    color: "text-zinc-400",
  },
};

export type ViewMode = "list" | "grid";

export {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
};
