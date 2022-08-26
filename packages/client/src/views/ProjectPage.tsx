import { FC } from "react";
import { useParams } from "react-router-dom";

import { useProject } from "../hooks/useProject";
import { ProjectMaps } from "../components/project/ProjectMaps";
import { NotFoundPage } from "./NotFoundPage";
import { Layout } from "./layout";

export const ProjectPage: FC = () => {
  const { id } = useParams<"id">();
  const project = useProject(id || "");

  return (
    <>
      {project ? (
        <Layout heading={project.name}>
          <div className="col-12 ">
            <ProjectMaps project={project} mode="side-by-side" />
          </div>
        </Layout>
      ) : (
        <NotFoundPage />
      )}
    </>
  );
};
