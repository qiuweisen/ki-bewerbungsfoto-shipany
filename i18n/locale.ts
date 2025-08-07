import { Pathnames } from "next-intl/routing";

export const locales = ["de"];

export const localeNames: any = {
  de: "Deutsch"
};

export const defaultLocale = "de";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

export const pathnames = {
  de: {
    "privacy-policy": "/datenschutz",
    "terms-of-service": "/nutzungsbedingungen",
  },
  en: {
    "privacy-policy": "/privacy-policy",
    "terms-of-service": "/terms-of-service",
  },
} satisfies Pathnames<typeof locales>;
