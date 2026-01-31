"use client";

import { useSession } from "@/context/SessionContext";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { SessionAlert } from "./SessionAlert";

interface SessionWrapperProps {
  children: ReactNode;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  const { hasValidSession, showAlert, setShowAlert, isLoading } = useSession();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const shouldShowOnPath = useCallback(() => {
    const protectedPaths = [
      "/dashboard",
      "/admin",
      "/profile",
      "/settings",
      "/archived",
    ];
    const homePaths = ["/", "/home"];

    if (homePaths.includes(pathname)) {
      return !hasValidSession && !isLoading;
    }

    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return !hasValidSession && !isLoading;
    }

    return false;
  }, [pathname, hasValidSession, isLoading]);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current && !isLoading) {
      const shouldShow = shouldShowOnPath();
      setShowAlert(shouldShow);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, isLoading, setShowAlert, shouldShowOnPath]);

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="w-full h-full">
      {showAlert && <SessionAlert />}
      {children}
    </div>
  );
}
