import { FC } from "react";
import { useParams } from "react-router-dom";

import { useCurrentProject } from "../hooks/useProject";
import { ProjectMaps } from "../components/project/ProjectMaps";
import { NotFoundPage } from "./NotFoundPage";
import { Layout } from "./layout";

export const ProjectMapPage: FC = () => {
  const { id } = useParams<"id">();
  const { project, loading } = useCurrentProject(id);
  return (
    <>
      <Layout
        loading={loading}
        project={project ?? undefined}
        heading={project?.name}
        fullPage={true}
        currentProjectPage={"maps"}
      >
        <ProjectMaps />
      </Layout>
      {!loading && !project && <NotFoundPage />}
    </>
  );
};
