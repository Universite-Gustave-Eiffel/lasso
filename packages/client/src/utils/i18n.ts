import { isString, head, toPairs } from "lodash";
import { config } from "../config";
import { TimeSpecification } from "@lasso/dataprep";

export function getI18NText(locale: string, text?: string | { [l: string]: string }): string {
  if (text) {
    if (isString(text)) return text;
    if (text[locale]) return text[locale];
    if (text[`${locale}`.substring(0, 2)]) return text[`${locale}`.substring(0, 2)];
    if (text[config.defaultLocale]) return text[config.defaultLocale];

    const first = head(Object.keys(text));
    if (first) return text[first];
  }
  return "";
}

export function getI18NTimekey(locale: string, timeSpec: TimeSpecification, timekey: string): string {
  const i18n: { [key: string]: string | { [locale: string]: string } } = {};
  toPairs(timeSpec.daysLabels).forEach(([key, data]) => {
    i18n[key] = data.label;
  });
  toPairs(timeSpec.hoursLabels).forEach(([key, data]) => {
    i18n[key] = data.label;
  });
  toPairs(timeSpec.monthsLabels).forEach(([key, data]) => {
    i18n[key] = data.label;
  });

  return timekey
    .split("|")
    .map((key) => {
      const result = i18n[key];
      if (result) {
        if (isString(result)) return result;
        if (result[`${locale}`.substring(0, 2)]) return result[`${locale}`.substring(0, 2)];
      }
      return key;
    })
    .join(", ");
}
