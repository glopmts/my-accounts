"use client";

import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoaded) return;

    router.replace(isSignedIn ? `/${locale}/home` : `/${locale}/sign-in`);
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
