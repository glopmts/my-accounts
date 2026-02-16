import { SessionAlert } from "@/components/SessionAlert";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import LayoutProtect from "@/context/layout-protect";
import { SessionProvider } from "@/context/SessionContext";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import ".././globals.css";

export const metadata: Metadata = {
  title: "Minhas Contas - Gerenciamento de contas, anotações e mais...",
  description:
    "A comprehensive platform for managing accounts, notes, environments, and more.",
  icons: {
    icon: "/icon.ico-1.png",
    shortcut: "/icon.ico-1.png",
  },
  openGraph: {
    title: "Minhas Contas",
    description: "Manage your accounts, notes, and environments effortlessly.",
    url: "https://yourwebsite.com",
    siteName: "Minhas Contas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Minhas Contas Open Graph Image",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Manager",
    description:
      "A comprehensive platform for managing accounts, notes, environments, and more.",
    images: ["/og-image.png"],
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <link rel="shortcut icon" href="/icon.ico-1.png" type="image/x-icon" />
      <body className={`antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <LayoutProtect>
              <SessionProvider>
                <SessionWrapper>
                  <SessionAlert />
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <main className="w-full h-full min-h-screen">
                      {children}
                    </main>
                    <Toaster />
                  </ThemeProvider>
                </SessionWrapper>
              </SessionProvider>
            </LayoutProtect>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
