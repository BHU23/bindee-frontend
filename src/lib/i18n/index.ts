import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { th } from "./resources/th";

export const DEFAULT_NAMESPACE = "common";

/**
 * Thai only in Phase 1. Adding `en` later means adding `resources.en` and a language switch;
 * components only call `t()` and need no change.
 */
void i18n.use(initReactI18next).init({
  resources: { th },
  lng: "th",
  fallbackLng: "th",
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: { escapeValue: false },
});

export { i18n };
