export interface ErrorResponse {
  message?: string;
  data?: {
    remainingMinutes?: number;
  };
}
