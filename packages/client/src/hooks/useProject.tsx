import { useEffect, useState } from "react";

import { Project } from "@lasso/dataprep";
import { useAppContext } from "./useAppContext";
import axios from "axios";
import { FeatureCollection } from "geojson";
import { fromPairs, toPairs } from "lodash";

export const useProject = (id: string): Project | null => {
  const [context] = useAppContext();
  const [project, setProject] = useState<Project | undefined>(context.data.projects.find((e) => e.id === id));

  useEffect(() => {
    /**
     * Load all sources data from a project and store it in app context
     * @param project
     * @returns void
     */
    async function loadSources() {
      const projectToLoad = context.data.projects.find((e) => e.id === id);
      if (projectToLoad) {
        const loadedProject = {
          ...projectToLoad,
          sources: fromPairs(
            await Promise.all(
              toPairs(projectToLoad.sources).map(async ([sourceId, source]) => {
                if ("data" in source && typeof source.data === "string") {
                  // fetch source.data
                  const r = await axios.get<FeatureCollection>(source.data, { responseType: "json" });
                  if (r.status === 200) return [sourceId, { ...source, data: r.data }];
                  throw new Error(`Loading sources data ${sourceId} raised a ${r.status} HTTP code`);
                }
                return [sourceId, source];
              }),
            ),
          ),
        };

        // putting back in context
        setProject(loadedProject);
      }
    }

    loadSources();
  }, [id, context.data.projects, setProject]);
  //Suggestion add a useeffect Which add the change project back in the context if we were to use the context direclty in project map components.

  return project || null;
};
