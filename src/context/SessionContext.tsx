"use client";

import { api } from "@/lib/axios";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SessionData {
  id: string;
  name: string;
  email: string;
  expiresAt: Date;
}

interface SessionContextType {
  hasValidSession: boolean;
  sessionData: SessionData | null;
  timeLeft: number | null;
  isLoading: boolean;
  validateSession: () => Promise<void>;
  clearSession: () => Promise<void>;
  showAlert: boolean;
  setShowAlert: (show: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [hasValidSession, setHasValidSession] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const isInitialized = useRef(false);
  const isCheckingSession = useRef(false);

  // Limpa a sessão
  const clearSession = useCallback(async () => {
    try {
      await api.delete("/auth/session-token");
    } catch (error) {
      if (error instanceof Error) {
        if (error.cause !== 401) {
          console.error("Error clearing session:", error);
        }
      }
    } finally {
      setHasValidSession(false);
      setSessionData(null);
      setTimeLeft(null);
      if (!isLoading) {
        setShowAlert(true);
      }
    }
  }, [isLoading]);

  const validateSession = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isCheckingSession.current) return;

    isCheckingSession.current = true;

    try {
      setIsLoading(true);
      const response = await api.get("/auth/session-token");

      if (response.data.success) {
        const expiresAt = new Date(response.data.data.expiresAt);
        const now = new Date();
        const diffInSeconds = Math.floor(
          (expiresAt.getTime() - now.getTime()) / 1000,
        );

        if (diffInSeconds > 0) {
          setHasValidSession(true);
          setSessionData({
            id: response.data.data.user.id,
            name: response.data.data.user.name,
            email: response.data.data.user.email,
            expiresAt: expiresAt,
          });
          setTimeLeft(diffInSeconds);
          setShowAlert(false);
        } else {
          await clearSession();
        }
      } else {
        await clearSession();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.cause !== 401) {
          console.error("Error validating session:", error);
        }
      }
      await clearSession();
    } finally {
      setIsLoading(false);
      isCheckingSession.current = false;
    }
  }, [clearSession]);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      validateSession();
    }

    const interval = setInterval(() => {
      if (hasValidSession) {
        validateSession();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [hasValidSession, validateSession]);

  // Atualiza contador em tempo real
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) {
          const newTime = prev - 1;

          if (newTime <= 0) {
            clearSession();
            return 0;
          }

          return newTime;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearSession, timeLeft]);

  return (
    <SessionContext.Provider
      value={{
        hasValidSession,
        sessionData,
        timeLeft,
        isLoading,
        validateSession,
        clearSession,
        showAlert,
        setShowAlert,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
