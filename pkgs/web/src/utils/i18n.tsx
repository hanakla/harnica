import { type ReactNode, createElement, Fragment, useMemo } from "react";

type Resource = { [name: string]: string | Resource };

type LocaleResource = {
  [lang: string]: Resource;
};

type ToTranslateKeys<T extends LocaleResource> = {
  [K in keyof T]: T[K] extends Resource ? TranslateKeys<T[K]> : never;
}[keyof T] extends infer U
  ? U extends TranslateKeys<T[keyof T]>
    ? U
    : never
  : never;

type TranslateKeys<T extends Resource, Path extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Path}${K}`
    : T[K] extends Resource
      ? TranslateKeys<T[K], `${Path}${K}.`>
      : never;
}[keyof T & string];

function get(obj: object, key: string) {
  try {
    let target: any = obj;
    for (const k of key.split("."))
      target = Object.hasOwn(target, k) ? target[k] : void 0;
    return target;
  } catch {}

  return null;
}

type TransFn<T extends LocaleResource> = {
  (key: ToTranslateKeys<T>, placeholder?: Record<string, string>): string;
  (key: ToTranslateKeys<T>, placeholder?: Record<string, ReactNode>): ReactNode;
  locale: keyof T;
};

export function createUseI18n<T extends LocaleResource>(
  resources: T,
  { defaultLocale }: { defaultLocale: keyof T },
) {
  return (locale: keyof T) => {
    if (!resources[locale]) locale = defaultLocale;
    if (!resources[locale])
      throw new Error(`Locale ${String(locale)} not in resource`);
    return useI18n(resources, locale);
  };
}

function useI18n<T extends LocaleResource>(resources: T, locale: keyof T) {
  if (!resources[locale])
    throw new Error(`Locale ${String(locale)} not in resource`);

  return useMemo<TransFn<T>>(() => {
    const t = ((key, placeholders = {}) => {
      const str: string = get(resources[locale], key) || key;
      const parts = str.split(/({{.+?}})/g);
      let encountReactNode = false;
      const result = parts.flatMap((part, index) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          let replace = placeholders[part.slice(2, -2).trim()] ?? part;
          encountReactNode ||= typeof replace !== "string";
          return replace;
        }
        return part;
      });

      return encountReactNode
        ? createElement(Fragment, null, ...result)
        : result.join("");
    }) as TransFn<T>;

    t.locale = locale;

    return t;
  }, [resources, locale]);
}

// Usage:
// import { useRouter } from "next/router";
//
// const ja = {
//   hello: "こんにちは {{name}} さん",
//   lp: {
//     title1: "すてきなLP",
//     desc1: "すてきなLPであなたもすてきな人に",
//   }
// }
//
// const en = {
//   hello: "Hello {{name}}",
//   lp: {
//     title1: "Nice LP",
//     desc1: "You can be a nice person with a nice LP",
//   }
// }
//
// const localeStrings = { ja, en };
// const use18nInternal = createUseI18n(localeStrings, { defaultLocale: "ja" });
//
// export const useI18n = () => {
//   const router = useRouter();
//   return use18nInternal(router.locale as keyof typeof localeStrings)
// }
//
// const t = useI18n();
// t('hello', { name: 'John' })
// t('lp.title1')
// t('lp.desc1')
