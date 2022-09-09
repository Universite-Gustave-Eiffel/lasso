import { FC } from "react";
import cx from "classnames";

import { Project } from "@lasso/dataprep";

interface AccordionProperties {
  projects: Array<Project>;
  selected: Project | null;
  setSelected: (p: Project | null) => void;
}
export const ProjectsAccordion: FC<AccordionProperties> = ({ projects, selected, setSelected }) => {
  return (
    <div className="accordion accordion-flush">
      {projects.map((project) => (
        <div key={project.id} className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              onClick={() => setSelected(selected && selected.id === project.id ? null : project)}
            >
              {project.name}
            </button>
          </h2>
          <div className={cx("accordion-collapse collapse", selected && selected.id === project.id && "show")}>
            <div className="accordion-body">{project.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
