import { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { tx } from "@transifex/native";
import { useTranslations, useTX, useLanguages, useLocale } from "@transifex/react";

import { config } from "../config";
import { Loader } from "../components/Loader";

/**
 * I18N context provider.
 */
export const I18N: FC<PropsWithChildren> = ({ children }) => {
  tx.init({ token: config.transifexToken });
  const transifex = useTX();
  const { ready } = useTranslations();
  const languages = useLanguages();
  const locale = useLocale();

  const getInitialLocal = useCallback(() => {
    const availableLocales: string[] = languages
      .filter((l: { code: string }) => l.code !== "en")
      .map((l: { code: string }) => l.code);

    // taking locale strored in localstorage
    const localeInLS = localStorage.getItem("locale");
    if (localeInLS && availableLocales.includes(localeInLS)) {
      return localeInLS;
    }

    // taking browser's local
    if (navigator.languages) {
      for (const locale of navigator.languages) {
        if (availableLocales.includes(locale)) {
          return locale;
        }
      }
    }

    // return default locale
    return config.defaultLocale;
  }, [languages]);

  /**
   * When transifex is ready
   * => set the locale
   */
  useEffect(() => {
    if (ready) {
      transifex.setCurrentLocale(getInitialLocal());
    }
  }, [ready, transifex, getInitialLocal]);

  /**
   * When locale changed
   * => store it in the local storage
   */
  useEffect(() => {
    if (locale) localStorage.setItem("locale", locale);
  }, [ready, locale]);

  return (
    <>
      <>{ready !== true ? <Loader /> : children}</>
    </>
  );
};
