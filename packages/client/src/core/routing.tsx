import { FC, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppContextProvider } from "./context";
import { HomePage } from "../views/HomePage";
import { ErrorPage } from "../views/ErrorPage";
import { NotFoundPage } from "../views/NotFoundPage";

export const Routing: FC = () => {
  const portalTarget = useRef<HTMLDivElement>(null);
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AppContextProvider init={{ portalTarget: portalTarget.current }}>
        <Routes>
          {/* Content pages */}
          <Route path="/" element={<HomePage />} />

          {/* Error pages: */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <div id="portal-target" ref={portalTarget} />
      </AppContextProvider>
    </BrowserRouter>
  );
};
