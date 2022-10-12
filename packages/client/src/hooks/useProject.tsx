import { useEffect } from "react";

import { Project } from "@lasso/dataprep";
import { useAppContext } from "./useAppContext";
import axios from "axios";
import { FeatureCollection } from "geojson";
import { fromPairs, toPairs } from "lodash";

export const useProject = (id: string): Project | null => {
  const [context, setContext] = useAppContext();

  useEffect(
    () => {
      /**
       * Load all sources data from a project and store it in app context
       * @param project
       * @returns void
       */
      async function loadSources() {
        const project = context.data.projects.find((e) => e.id === id);
        if (project) {
          const loadedProject = {
            ...project,
            sources: fromPairs(
              await Promise.all(
                toPairs(project.sources).map(async ([sourceId, source]) => {
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
          setContext({
            ...context,
            data: { ...context.data, projects: [...context.data.projects.filter((e) => e.id !== id), loadedProject] },
          });
        }
      }

      loadSources();
    },
    // context must not be a dep since we update it in the effect
    // eslint-disable-next-line
    [id, setContext],
  );

  return context.data.projects.find((e) => e.id === id) || null;
};
