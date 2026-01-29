"use client";

import { useSession } from "@/context/SessionContext";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { SessionAlert } from "./SessionAlert";

interface SessionWrapperProps {
  children: ReactNode;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  const { hasValidSession, showAlert, setShowAlert, isLoading } = useSession();
  const pathname = usePathname();

  // Define quais rotas devem mostrar o alerta
  const shouldShowOnPath = () => {
    const protectedPaths = ["/dashboard", "/admin", "/profile", "/settings"];
    const homePaths = ["/", "/home"];

    // Sempre mostra na home
    if (homePaths.includes(pathname)) return true;

    // Mostra em rotas protegidas se não tiver sessão
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return !hasValidSession && !isLoading;
    }

    return false;
  };

  useEffect(() => {
    if (!isLoading) {
      const shouldShow = shouldShowOnPath();
      setShowAlert(shouldShow);
    }
  }, [pathname, hasValidSession, isLoading, setShowAlert]);

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {showAlert && <SessionAlert />}

      {children}
    </>
  );
}
