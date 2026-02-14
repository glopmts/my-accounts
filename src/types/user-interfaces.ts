export interface User {
  id: string;
  name?: string | null;
  email: string;
  code?: string | null;
  password?: string | null;
  image?: string | null;
  role: "USER" | "ADMIN";
  clerkId: string | null;
  emailVerified?: boolean | null;
  updatedAt: Date | string;
  createdAt: Date | string;
  codeGeneratedAt: Date | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthUser extends User {
  clerkId: string;
}
