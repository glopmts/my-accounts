import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const locales = ["pt", "en"];

const isPublicRoute = createRouteMatcher([
  "/",
  "/(pt|en)",
  "/(pt|en)/sign-in(.*)",
  "/(pt|en)/sign-up(.*)",
  "/(pt|en)/forgot-password(.*)",
  "/(pt|en)/reset-password(.*)",
  "/api/webhooks(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/(pt|en)/sign-in(.*)",
  "/(pt|en)/sign-up(.*)",
  "/(pt|en)/forgot-password(.*)",
  "/(pt|en)/reset-password(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/pt/home", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
