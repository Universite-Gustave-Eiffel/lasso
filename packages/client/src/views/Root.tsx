import { FC } from "react";
import { HashRouter } from "react-router-dom";

import { AppContextProvider } from "../core/context";
import { Routing } from "../core/routing";
import { I18N } from "../core/i18n";

const Root: FC = () => {
  return (
    <HashRouter>
      <I18N>
        <AppContextProvider>
          <Routing />
        </AppContextProvider>
      </I18N>
    </HashRouter>
  );
};

export default Root;
