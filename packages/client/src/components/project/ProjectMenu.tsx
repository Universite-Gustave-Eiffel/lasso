import { FC, CSSProperties } from "react";
import cx from "classnames";
import { Link } from "react-router-dom";
import { useLocale, useT } from "@transifex/react";

import { Project } from "@lasso/dataprep";
import { getI18NText } from "../../utils/i18n";

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
  currentProjectPage?: string; //"maps" | "project" | "dataset" | "sponsors" | "bibliography"
}

export const ProjectMenu: FC<ProjectMenuProps> = ({ id, className, style, project, currentProjectPage }) => {
  const htmlProps = { id, className: cx("flex-row nav", className), style };
  const t = useT();
  const locale = useLocale();

  return (
    <ul {...htmlProps}>
      <li className="nav-item">
        <Link
          to={`/project/${project.id}`}
          className={cx("nav-link", currentProjectPage === "maps" && "active")}
          title={getI18NText(locale, project.name)}
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
