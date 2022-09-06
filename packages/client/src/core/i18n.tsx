import { FC, PropsWithChildren, useEffect } from "react";
import { tx } from "@transifex/native";
import { useTranslations, useTX } from "@transifex/react";

import { config } from "../config";
import { Loader } from "../components/Loader";

/**
 * I18N context provider.
 */
export const I18N: FC<PropsWithChildren> = ({ children }) => {
  tx.init({ token: config.transifexToken });
  const transifex = useTX();
  const { ready } = useTranslations();

  useEffect(() => {
    if (ready) transifex.setCurrentLocale(config.defaultLocale);
  }, [ready, transifex]);

  return (
    <>
      <>{ready !== true ? <Loader /> : children}</>
    </>
  );
};
