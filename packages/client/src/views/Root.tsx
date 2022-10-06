import { FC } from "react";
import { BrowserRouter } from "react-router-dom";

import { AppContextProvider } from "../core/context";
import { Routing } from "../core/routing";
import { I18N } from "../core/i18n";

const Root: FC = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <I18N>
        <AppContextProvider>
          <Routing />
        </AppContextProvider>
      </I18N>
    </BrowserRouter>
  );
};

export default Root;
