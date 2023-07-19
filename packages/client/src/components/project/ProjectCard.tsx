import { useLocale, useT } from "@transifex/react";
import { FC, CSSProperties } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Project } from "@lasso/dataprep";
import { getI18NText } from "../../utils/i18n";

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
          <Link to={`/project/${project.id}`} title={getI18NText(locale, project.name)}>
            <img className="card-img-top" src={project.image} alt={getI18NText(locale, project.name)} />
          </Link>
        </div>
      )}
      <div className="card-body">
        <h4 className="card-title">{getI18NText(locale, project.name)}</h4>

        {project.description !== undefined && <p className="card-text">{getI18NText(locale, project.description)}</p>}
        <div className="w-100 text-end">
          <Link className="btn btn-primary" to={`/project/${project.id}`} title={getI18NText(locale, project.name)}>
            {t("Go to ")} {getI18NText(locale, project.name)}
          </Link>
        </div>
      </div>
    </div>
  );
};
