import * as React from "react";

import { translations } from "./translations";

type Locale = keyof typeof translations;
type TranslationTree = (typeof translations)[Locale];
type TranslationValue = number | string;

type NestedTranslationKey<T> = {
  [Key in keyof T & string]: T[Key] extends string
    ? Key
    : `${Key}.${NestedTranslationKey<T[Key]>}`;
}[keyof T & string];

export type TranslationKey = NestedTranslationKey<TranslationTree>;

const defaultLocale: Locale = "fi";

function getTranslationValue(locale: Locale, key: TranslationKey): string {
  const value = key
    .split(".")
    .reduce<unknown>((current, segment) => (current as Record<string, unknown>)?.[segment], translations[locale]);

  if (typeof value !== "string") {
    return key;
  }

  return value;
}

function interpolate(template: string, values?: Record<string, TranslationValue>) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

export function translate(key: TranslationKey, values?: Record<string, TranslationValue>) {
  return interpolate(getTranslationValue(defaultLocale, key), values);
}

const LocalizationContext = React.createContext({
  locale: defaultLocale,
  t: translate,
});

export function LocalizationProvider({ children }: React.PropsWithChildren) {
  const value = React.useMemo(
    () => ({
      locale: defaultLocale,
      t: translate,
    }),
    [],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useTranslation() {
  return React.useContext(LocalizationContext);
}
