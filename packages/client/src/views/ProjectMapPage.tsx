import { FC } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "@transifex/react";

import { useCurrentProject } from "../hooks/useProject";
import { getI18NText } from "../utils/i18n";
import { ProjectMaps } from "../components/project/ProjectMaps";
import { NotFoundPage } from "./NotFoundPage";
import { Layout } from "./layout";

export const ProjectMapPage: FC = () => {
  const { id } = useParams<"id">();
  const { project, loading } = useCurrentProject(id);
  const locale = useLocale;
  return (
    <>
      <Layout
        loading={loading}
        project={project ?? undefined}
        heading={project ? getI18NText(locale, project.name) : undefined}
        fullPage={true}
        currentProjectPage={"maps"}
      >
        <ProjectMaps />
      </Layout>
      {!loading && !project && <NotFoundPage />}
    </>
  );
};
