import { FC } from "react";
import cx from "classnames";

import { Project } from "@lasso/dataprep";
import { ProjectMenu } from "../../components/project/ProjectMenu";

export const Heading: FC<{
  heading?: string | JSX.Element;
  project?: Project;
  currentProjectPage?: string; //"maps" | "project" | "sponsors" | "bibliography"
}> = ({ heading, project, currentProjectPage }) => {
  if (!heading && !project) return null;
  return (
    <div className={cx("heading d-flex flex-wrap align-items-center justify-content-center flex-grow-1")}>
      {project && (
        <>
          <ProjectMenu project={project} currentProjectPage={currentProjectPage} />
        </>
      )}
      {heading && <h1 className="mb-0">{heading}</h1>}
    </div>
  );
};
