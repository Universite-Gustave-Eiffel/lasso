import { FC, useState } from "react";

import { Project } from "@lasso/dataprep";
import { useAppContext } from "../../hooks/useAppContext";
import { ProjectsMap } from "./map";
import { ProjectsAccordion } from "./accordion";

export const Projects: FC = () => {
  const [{ data }] = useAppContext();
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <div className="row">
      <div className="col-8">
        <ProjectsMap bbox={data.bbox} projects={data.projects} selected={selected} setSelected={setSelected} />
      </div>
      <div className="col-4">
        <ProjectsAccordion projects={data.projects} selected={selected} setSelected={setSelected} />
      </div>
    </div>
  );
};
