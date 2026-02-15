import { SecretType } from "../app/generated/prisma/enums";

export enum SecretTypeSelector {
  RESET_PASSWORD = "RESET_PASSWORD",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  API_KEY = "API_KEY",
  ENVS = "ENVS",
  SECRETS = "SECRETS",
  ACCOUNTS = "ACCOUNTS",
  OUTHER = "OUTHER",
}

export enum TypePassword {
  asswor = "password",
  pin = "pin",
  toke = "token",
  security_answer = "security_answer",
}

export interface MyAccounts {
  id: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  url: string | null;
  type: SecretType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  position: number;
  orderInCategory: number;
  category: string | null;
  passwords: PasswordFormData[];
}

export interface PasswordFormData {
  id: string;
  label: string;
  value: string;
  type: TypePassword;
  hint?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordFormDataInput {
  id?: string;
  label: string;
  value: string;
  type: TypePassword;
  hint?: string;
  notes?: string;
}

export interface PasswordAccounts {
  id: string;
  username: string | null;
  email: string | null;
  password: string;
  notes: string | null;
  myaccountsId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface SecurityAudit {
  score: number;
  strength: "Weak" | "Moderate" | "Strong" | "Critical";
  feedback: string;
  suggestions: string[];
}

export interface PasswordProps {
  id: string;
  type: string | null;
  label: string;
  value: string;
  hint: string | null;
  notes: string | null;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ArchivedProps {
  id: string;
  userId: string;
  myaccountId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  myaccount: MyAccounts[];
}

export interface PasswordCreateInputProps {
  label: string;
  value: string;
  type?: string | null;
  hint?: string | null;
  notes?: string | null;
  accountId: string;
}

export interface PasswordInputFromAPI {
  label: string;
  value: string;
  type?: string | null;
  hint?: string | null;
  notes?: string | null;
}

export interface PasswordWithAccount extends PasswordCreateInputProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  account?: {
    id: string;
    title: string;
  };
}

export interface PasswordUpdateInput {
  id?: string;
  label: string;
  value?: string;
  type?: string | null;
  hint?: string | null;
  notes?: string | null;
  _action?: "keep" | "update" | "delete";
}

export interface AccountUpdateData {
  id: string;
  type?: SecretType;
  title?: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  notes?: string | null;
  passwords?: PasswordUpdateInput[];
}

export interface AccountUpdateInput {
  type?: SecretType;
  title?: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  notes?: string | null;
  passwords?: {
    create?: PasswordCreateInputProps[];
    update?: Array<{
      where: { id: string };
      data: Partial<PasswordCreateInputProps>;
    }>;
    delete?: { id: string }[];
  };
}

export interface AccountUpdateResponse {
  id: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  url: string | null;
  notes: string | null;
  updatedAt: Date;
  passwordCount: number;
  passwords: Array<{
    id: string;
    label: string;
    type: string;
    hasHint: boolean;
    hasNotes: boolean;
    updatedAt: Date;
  }>;
}

/// Creater

export interface PasswordCreateInput {
  label: string;
  value: string;
  type?: string;
  hint?: string | null;
  notes?: string | null;
}

export interface AccountCreateInput {
  userId: string;
  type: SecretType;
  title: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  notes?: string | null;
  passwords?: {
    create: PasswordCreateInput[];
  };
}

export interface PasswordFormData {
  id: string;
  label: string;
  value: string;
  type: TypePassword;
  hint?: string;
  notes?: string;
}
