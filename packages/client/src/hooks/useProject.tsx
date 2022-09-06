import { useState, useEffect } from "react";

import { Project } from "@lasso/dataprep";
import { useAppContext } from "./useAppContext";

export const useProject = (id: string): Project | null => {
  const [{ data }] = useAppContext();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const result = data.projects.find((e) => e.id === id);
    setProject(result || null);
  }, [id, data.projects]);

  return project;
};
