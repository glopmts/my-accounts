export type SecretType = "password" | "env" | "note";

export interface Secret {
  id: string;
  title: string;
  description: string;
  value: string;
  type: SecretType;
  createdAt: number;
  updatedAt: number;
  category?: string;
}

export interface SecurityAudit {
  score: number;
  strength: "Weak" | "Moderate" | "Strong" | "Critical";
  feedback: string;
  suggestions: string[];
}
