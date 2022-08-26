import { FC } from "react";
import { BrowserRouter } from "react-router-dom";

import { AppContextProvider } from "../core/context";
import { Routing } from "../core/routing";

const Root: FC = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AppContextProvider>
        <Routing />
      </AppContextProvider>
    </BrowserRouter>
  );
};

export default Root;
