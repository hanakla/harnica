import { useRouter } from "next/router";
import { createUseI18n } from "@/utils/i18n";
import { commonEn } from "./en";
import { commonJa } from "./ja";

export const localeStrings = {
  ja: commonJa,
  en: commonEn,
};

const use18nInternal = createUseI18n(localeStrings, { defaultLocale: "ja" });

export const useI18n = () => {
  const router = useRouter();
  return use18nInternal(router.locale as keyof typeof localeStrings);
};
