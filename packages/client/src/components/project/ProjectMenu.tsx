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
  /**
   * current project page id
   */
  currentProjectPage?: string; //"maps" | "project" | "sponsors" | "bibliography"
}

export const ProjectMenu: FC<ProjectMenuProps> = ({ id, className, style, project, currentProjectPage }) => {
  const htmlProps = { id, className: cx("flex-row nav", className), style };
  const t = useT();

  return (
    <ul {...htmlProps}>
      <li className="nav-item">
        <Link
          to={`/project/${project.id}`}
          className={cx("nav-link", currentProjectPage === "maps" && "active")}
          title={project.name}
        >
          {t(``)}
        </Link>
      </li>
      {Object.keys(project.pages).map((pageKey) => (
        <li key={pageKey} className="nav-item">
          <Link
            to={`/project/${project.id}/${pageKey}`}
            className={cx("nav-link", currentProjectPage === pageKey && "active")}
          >
            {t(`page.${pageKey}`)}
          </Link>
        </li>
      ))}
    </ul>
  );
};
