import { FC, CSSProperties } from "react";
import cx from "classnames";
import { Link } from "react-router-dom";
import { useT } from "@transifex/react";

import { Project } from "@lasso/dataprep";

export interface ProjectMenuProps {
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

export const ProjectMenu: FC<ProjectMenuProps> = ({ id, className, style, project }) => {
  const htmlProps = { id, className: cx("nav flex-row", className), style };
  const t = useT();

  return (
    <ul {...htmlProps}>
      {Object.keys(project.pages).map((pageKey) => (
        <li key={pageKey} className="nav-item">
          <Link to={`/project/${project.id}/${pageKey}`} className="nav-link">
            {t(`page.${pageKey}`)}
          </Link>
        </li>
      ))}
    </ul>
  );
};
