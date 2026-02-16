"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { SessionAlert } from "./SessionAlert";

interface LayoutProtectProps {
  children: ReactNode;
}

export default function LayoutProtect({ children }: LayoutProtectProps) {
  const {
    hasValidSession,
    showAlert,
    setShowAlert,
    isLoading: sessionLoading,
  } = useSession();
  const { isLoading: languageLoading } = useLanguage();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const shouldShowOnPath = useCallback(() => {
    const pathSegments = pathname.split("/");
    const basePath =
      pathSegments.length > 1 ? `/${pathSegments.slice(2).join("/")}` : "/";

    const protectedPaths = [
      "/dashboard",
      "/admin",
      "/profile",
      "/settings",
      "/archived",
    ];
    const homePaths = ["/", "/home"];

    if (homePaths.includes(basePath) || basePath === "") {
      return !hasValidSession && !sessionLoading;
    }

    if (protectedPaths.some((path) => basePath.startsWith(path))) {
      return !hasValidSession && !sessionLoading;
    }

    return false;
  }, [pathname, hasValidSession, sessionLoading]);

  useEffect(() => {
    if (
      pathname !== prevPathnameRef.current &&
      !sessionLoading &&
      !languageLoading
    ) {
      const shouldShow = shouldShowOnPath();
      setShowAlert(shouldShow);
      prevPathnameRef.current = pathname;
    }
  }, [
    pathname,
    sessionLoading,
    languageLoading,
    setShowAlert,
    shouldShowOnPath,
  ]);

  if (sessionLoading || languageLoading) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-200 dark:bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {showAlert && <SessionAlert />}
      {children}
    </div>
  );
}
