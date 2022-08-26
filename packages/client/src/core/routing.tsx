import { FC } from "react";
import { Route, Routes } from "react-router-dom";

import { HomePage } from "../views/HomePage";
import { ErrorPage } from "../views/ErrorPage";
import { NotFoundPage } from "../views/NotFoundPage";
import { ProjectPage } from "../views/ProjectPage";

export const Routing: FC = () => {
  return (
    <Routes>
      {/* Content pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:id" element={<ProjectPage />} />

      {/* Error pages: */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
