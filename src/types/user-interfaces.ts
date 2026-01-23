export interface User {
  id: string;
  name?: string | null;
  email: string;
  code?: string | null;
  image?: string | null;
  role: "USER" | "ADMIN";
  clerkId: string | null;
  emailVerified?: boolean | null;
  createdAt: Date | string;
  updatedAt: Date | string;
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
