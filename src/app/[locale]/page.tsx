"use client";

import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { setLocaleCookie } from "../../actions/locale";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoaded) return;

    const initializeLocale = async () => {
      const hasLocaleCookie = document.cookie.includes("locale=");

      if (!hasLocaleCookie) {
        const acceptLanguage = navigator.language;
        const detectedLocale = acceptLanguage.includes("en") ? "en" : "pt";
        await setLocaleCookie(detectedLocale);
      }
    };

    initializeLocale().then(() => {
      router.replace(isSignedIn ? `/${locale}/home` : `/${locale}/sign-in`);
    });
  }, [isLoaded, isSignedIn, router, locale]);

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return null;
}
