import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const locales = ["pt", "en"];
const defaultLocale = "pt";

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  const firstSegment = segments[1];
  return locales.includes(firstSegment) ? firstSegment : null;
}

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  if (acceptLanguage.includes("en")) return "en";

  return defaultLocale;
}

// Rotas públicas
const isPublicRoute = createRouteMatcher([
  "/",
  "/(pt|en)",
  "/(pt|en)/sign-in(.*)",
  "/(pt|en)/sign-up(.*)",
  "/(pt|en)/forgot-password(.*)",
  "/(pt|en)/reset-password(.*)",
  "/api/webhooks(.*)",
]);

// Rotas de autenticação
const isAuthRoute = createRouteMatcher([
  "/(pt|en)/sign-in(.*)",
  "/(pt|en)/sign-up(.*)",
  "/(pt|en)/forgot-password(.*)",
  "/(pt|en)/reset-password(.*)",
]);

const isRootRoute = createRouteMatcher(["/", "/api(.*)", "/_next(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  const localeCookie = req.cookies.get("locale")?.value;
  const urlLocale = getLocaleFromPath(pathname);

  if (pathname === "/") {
    const preferredLocale = localeCookie || getPreferredLocale(req);
    const url = new URL(`/${preferredLocale}/home`, req.url);
    return NextResponse.redirect(url);
  }

  if (!urlLocale && !isRootRoute(req)) {
    const targetLocale = localeCookie || defaultLocale;
    const url = new URL(`/${targetLocale}${pathname}`, req.url);
    return NextResponse.redirect(url);
  }

  // Atualizar cookie de locale se necessário
  if (urlLocale && urlLocale !== localeCookie) {
    const response = NextResponse.next();
    response.cookies.set("locale", urlLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  if (isAuthRoute(req) && userId) {
    const locale = urlLocale || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
  }

  // Proteger rotas privadas
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Pular arquivos internos do Next.js e arquivos estáticos
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Sempre incluir rotas API
    "/(api|trpc)(.*)",
  ],
};
