import { FC, CSSProperties } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Project } from "@lasso/dataprep";
import { useLocale, useT } from "@transifex/react";
import { values } from "lodash";

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
  const locale = useLocale();
  const t = useT();
  const htmlProps = { id, className: cx("card h-100", className), style };
  return (
    <div {...htmlProps}>
      {project.image && (
        <div className="card-image">
          <Link to={`/project/${project.id}`} title={project.name}>
            <img className="card-img-top" src={project.image} alt={project.name} />
          </Link>
        </div>
      )}
      <div className="card-body">
        <h4 className="card-title">{project.name}</h4>

        {project.description !== undefined && (
          <p className="card-text">{project.description[locale] || values(project.description)[0]}</p>
        )}
        <div className="w-100 text-end">
          <Link className="btn btn-primary" to={`/project/${project.id}`} title={project.name}>
            {t("htom.project.open")} {project.name}
          </Link>
        </div>
      </div>
    </div>
  );
};
