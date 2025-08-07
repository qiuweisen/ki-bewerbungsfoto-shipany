import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  if (["zh-CN"].includes(locale)) {
    locale = "zh";
  }

  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = (await import(`./messages/${locale.toLowerCase()}.json`))
      .default;
    return {
      locale: locale,
      messages: messages,
    };
  } catch (e) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`./messages/${routing.defaultLocale}.json`)).default,
    };
  }
});
