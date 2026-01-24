import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";
import LayoutProtect from "../context/layout-protect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <link rel="shortcut icon" href="/icon.ico-1.png" type="image/x-icon" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutProtect>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="w-full h-full min-h-screen">{children}</main>
            <Toaster />
          </ThemeProvider>
        </LayoutProtect>
      </body>
    </html>
  );
}
