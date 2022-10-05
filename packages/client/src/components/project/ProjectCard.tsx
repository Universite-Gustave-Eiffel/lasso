import { FC, CSSProperties } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Project } from "@lasso/dataprep";

export interface ProjectCardProps {
  /**
   * HTML id
   */
  id?: string;
  /**
   * HTML class
   */
  className?: string;
  /**
   * HTML CSS style
   */
  style?: CSSProperties;
  /**
   * The project to display
   */
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ id, className, style, project }) => {
  const htmlProps = { id, className: cx("card", className), style };
  return (
    <div {...htmlProps}>
      {project.image && (
        <div className="card-image">
          <img className="card-img-top" src={project.image} alt={project.name} />
        </div>
      )}
      <div className="card-body">
        <Link className="stretched-link" to={`/project/${project.id}`} title={project.name}>
          <h5 className="card-title">{project.name}</h5>
        </Link>
        {project.description && <p className="card-text">{project.description}</p>}
      </div>
    </div>
  );
};
