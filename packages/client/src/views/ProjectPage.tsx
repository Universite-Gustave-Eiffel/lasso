import { FC } from "react";

import { ProjectCard } from "../components/project/ProjectCard";
import { useAppContext } from "../hooks/useAppContext";
import { Layout } from "./layout/index";

export const ProjectPage: FC = () => {
  const [{ projects }] = useAppContext();
  return (
    <Layout heading={"Welcome"}>
      <div className="col-12 ">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 pb-4 justify-content-center">
          {projects.map((project) => (
            <div className="col" key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
