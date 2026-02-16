import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale = cookieStore.get("locale")?.value;

  if (!locale) {
    const acceptLanguage = headersList.get("accept-language");
    locale = acceptLanguage?.includes("en") ? "en" : "pt";
  }

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
