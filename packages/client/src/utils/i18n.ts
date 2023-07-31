import { isString, head } from "lodash";
import { config } from "../config";

export function getI18NText(locale: string, text?: string | { [l: string]: string }): string {
  if (text) {
    if (isString(text)) return text;
    if (text[locale]) return text[locale];
    if (text[config.defaultLocale]) return text[config.defaultLocale];

    const first = head(Object.keys(text));
    if (first) return text[first];
  }
  return "";
}
