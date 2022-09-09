import { FC } from "react";
import cx from "classnames";
import { Link } from "react-router-dom";

import { Project } from "@lasso/dataprep";
import { ProjectMenu } from "../../components/project/ProjectMenu";

export const Heading: FC<{
  heading?: string | JSX.Element;
  project?: Project;
}> = ({ heading, project }) => {
  if (!heading && !project) return null;
  return (
    <div className={cx("heading d-flex flex-wrap align-items-center justify-content-between flex-grow-1")}>
      {project && (
        <>
          <h1 className="mb-0">
            <Link to={`/project/${project.id}`} title={project.name}>
              {project.name}
            </Link>
          </h1>
          <ProjectMenu project={project} />
        </>
      )}
      {heading && <h1 className="mb-0">{heading}</h1>}
    </div>
  );
};
