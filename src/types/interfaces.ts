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
  password: string[];
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

export interface ArchivedProps {
  id: string;
  userId: string;
  myaccountId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  myaccount: MyAccounts[];
}
