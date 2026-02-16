"use client";

import { setCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface LanguageContextType {
  locale: string;
  changeLanguage: (newLocale: string) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: string;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    setIsLoading(true);

    // Salva o cookie
    setCookie("locale", newLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 ano
    });

    // Atualiza o estado local
    setLocale(newLocale);

    // Muda a URL mantendo o caminho atual
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    router.replace(newPath);

    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
