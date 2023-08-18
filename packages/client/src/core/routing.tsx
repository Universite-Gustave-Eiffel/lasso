import { FC } from "react";
import { Route, Routes } from "react-router-dom";

import { HomePage } from "../views/HomePage";
import { ErrorPage } from "../views/ErrorPage";
import { NotFoundPage } from "../views/NotFoundPage";
import { ProjectMapPage } from "../views/ProjectMapPage";
import { ProjectContentPage } from "../views/ProjectContentPage";
import { AboutPage } from "../views/AboutPage";

export const Routing: FC = () => {
  return (
    <Routes>
      {/* Content pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/project/:id" element={<ProjectMapPage />} />
      <Route path="/project/:id/:page" element={<ProjectContentPage />} />

      {/* Error pages: */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      <Route path="/" element={<HomePage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
