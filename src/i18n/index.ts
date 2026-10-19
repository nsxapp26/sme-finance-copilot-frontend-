// Language switching (Thai / English).
// en is the source; th must have every key (TypeScript fails the build if one is missing).
// Only UI text is translated here; text sent by the backend (e.g. AI explanations) keeps its language.

import { useCallback } from "react";
import { Language, useAppStore } from "@/store/useAppStore";
import { en } from "./en";
import { th } from "./th";

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
type Vars = Record<string, string | number>;

const dictionaries: Record<Language, Dictionary> = { en, th };

export const languageOptions: { value: Language; label: string; short: string }[] = [
  { value: "th", label: "ไทย", short: "TH" },
  { value: "en", label: "English", short: "EN" },
];

// Replace {name} placeholders with the supplied values
function fill(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

export function translate(language: Language, key: TranslationKey, vars?: Vars): string {
  return fill(dictionaries[language][key] ?? en[key] ?? key, vars);
}

/** For use outside React components (e.g. helpers); reads the current language from the store */
export function tr(key: TranslationKey, vars?: Vars): string {
  return translate(useAppStore.getState().language, key, vars);
}

/** For components: re-renders when the language changes */
export function useT() {
  const language = useAppStore((s) => s.language);
  return useCallback((key: TranslationKey, vars?: Vars) => translate(language, key, vars), [language]);
}

/** Translate a dynamic key such as `nav.${id}` (returns the fallback if the key doesn't exist) */
export function hasKey(key: string): key is TranslationKey {
  return key in en;
}
