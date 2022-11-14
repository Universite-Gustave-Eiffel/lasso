import { FC } from "react";
import { useParams } from "react-router-dom";

import { useCurrentProject } from "../hooks/useProject";
import { ProjectMaps } from "../components/project/ProjectMaps";
import { NotFoundPage } from "./NotFoundPage";
import { Layout } from "./layout";

export const ProjectMapPage: FC = () => {
  const { id } = useParams<"id">();

  const project = useCurrentProject(id);
  return (
    <>
      {project ? (
        <Layout project={project} heading={project.name} fullPage={true} currentProjectPage={"maps"}>
          <ProjectMaps />
        </Layout>
      ) : (
        <NotFoundPage />
      )}
    </>
  );
};
