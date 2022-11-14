import { FC } from "react";
import cx from "classnames";

import { Project } from "@lasso/dataprep";
import { useLocale, useT } from "@transifex/react";
import { values } from "lodash";
import { Link } from "react-router-dom";

interface AccordionProperties {
  projects: Array<Project>;
  selected: Project | null;
  setSelected: (p: Project | null) => void;
}
export const ProjectsAccordion: FC<AccordionProperties> = ({ projects, selected, setSelected }) => {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="accordion accordion-flush">
      {projects.map((project) => (
        <div key={project.id} className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={cx("accordion-button", selected && selected.id === project.id && "collapsed")}
              type="button"
              onClick={() => setSelected(selected && selected.id === project.id ? null : project)}
            >
              {project.name}
            </button>
          </h2>
          <div className={cx("accordion-collapse collapse", selected && selected.id === project.id && "show")}>
            <div className="accordion-body">
              <p>{project.description && (project.description[locale] || values(project.description)[0])}</p>
              <div className="w-100 text-end">
                <Link className="btn btn-primary" to={`/project/${project.id}`} title={project.name}>
                  {t("home.project.open")} {project.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
