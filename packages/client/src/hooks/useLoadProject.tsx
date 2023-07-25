import { useMemo, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FeatureCollection, Feature } from "geojson";
import { flatten, fromPairs, keyBy, mapValues, omit, toPairs } from "lodash";
import { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import { Style } from "mapbox-gl";
import { expression } from "@mapbox/mapbox-gl-style-spec";

import { Project } from "@lasso/dataprep";
import { defaultLegendSpecs, LegendSpecType, LegendSymbolSpec } from "../utils/legend";
import { getMapProjectVariable, getProjectVariables } from "../utils/project";
import { useAppContext } from "./useAppContext";

export type LoadedProject = Project & { legendSpecs: LegendSpecType; featureIndex: { [key: string]: Feature } };

export const useLoadProject = (id?: string): { project: LoadedProject | null; loading: boolean } => {
  const [context, setAppContext] = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Get a loaded project from an id.
   * if the project has not been already loaded, we compute it
   * and save it in the context
   */
  const loadProject = useCallback(
    async (projectId: string) => {
      if (!context.data.loadedProject[projectId]) {
        setLoading(true);
        try {
          const projectToLoad = context.data.projects.find((e) => e.id === projectId);
          if (projectToLoad) {
            // generate legend
            const variableLayers = keyBy(flatten(projectToLoad.maps.map((m) => m.layers)), (l) => l.id);
            const legendSpecs: LegendSpecType = mapValues(defaultLegendSpecs, (legend, variableName) => {
              // find corresponding layer
              const layer = variableLayers[variableName];
              // identify paint Variable depending on layer type
              if (layer && layer.paint && legend) {
                let colorExpression:
                  | DataDrivenPropertyValueSpecification<string>
                  | ExpressionSpecification
                  | undefined = undefined;
                switch (layer.type) {
                  case "circle":
                    colorExpression = layer.paint["circle-color"];
                    break;
                  case "fill":
                    colorExpression = layer.paint["fill-color"];
                    break;
                  case "fill-extrusion":
                    colorExpression = layer.paint["fill-extrusion-color"];
                    break;
                  case "heatmap":
                    colorExpression = layer.paint["heatmap-color"];
                    break;
                  case "symbol":
                    colorExpression = layer.paint["icon-color"];
                    break;
                }

                if (colorExpression) {
                  const exp = expression.createExpression(colorExpression);
                  if (exp.result === "success") {
                    const legendSymbol: LegendSymbolSpec = { ...legend, colorStyleExpression: exp.value };
                    return legendSymbol;
                  }
                }
              }
              return legend;
            });

            const loadedProject: LoadedProject = {
              ...projectToLoad,
              // load missing sources
              sources: fromPairs(
                await Promise.all(
                  toPairs(projectToLoad.sources).map(async ([sourceId, source]) => {
                    if ("data" in source && typeof source.data === "string") {
                      // fetch source.data
                      const r = await axios.get<FeatureCollection>(source.data, { responseType: "json" });
                      if (r.status === 200) {
                        return [sourceId, { ...source, data: r.data }];
                      }
                      throw new Error(`Loading sources data ${sourceId} raised a ${r.status} HTTP code`);
                    }
                    return [sourceId, source];
                  }),
                ),
              ),
              // load basemap
              maps: await Promise.all(
                projectToLoad.maps.map(async (m) => {
                  if (m.basemapStyle && typeof m.basemapStyle === "string") {
                    const r = await axios.get<Style>(m.basemapStyle, { responseType: "json" });
                    if (r.status === 200) {
                      return { ...m, basemapStyle: r.data };
                    }
                    throw new Error(`Loading sources data ${m.basemapStyle} raised a ${r.status} HTTP code`);
                  }
                  return m;
                }),
              ),
              // create legendSpec
              legendSpecs: legendSpecs,
              // index by id for features
              featureIndex: {},
            };

            loadedProject.featureIndex = Object.keys(loadedProject.sources)
              .map((sourceName) => loadedProject.sources[sourceName])
              .flatMap((source) => {
                if (source.type === "geojson" && source.data && (source.data as any).type === "FeatureCollection") {
                  return (source.data as FeatureCollection).features;
                }
                return [] as Array<Feature>;
              })
              .reduce((acc, curr: Feature) => ({ ...acc, [`${curr.id}`]: curr }), {});

            // save it in the context
            setAppContext((prev) => ({
              ...prev,
              data: {
                ...prev.data,
                loadedProject: {
                  ...omit(prev.data.loadedProject, loadedProject.id),
                  [loadedProject.id]: loadedProject,
                },
              },
            }));

            return loadedProject;
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      return context.data.loadedProject[projectId];
    },
    [context.data, setAppContext, setLoading],
  );

  /**
   * When project id change
   *  => load it
   */
  useEffect(() => {
    loadProject(id || "")
      .then((project) => {
        if (!project) throw Error("Project not found");
        setAppContext((prev) => {
          const maps = ["right", "left"]
            .map((mapId, index) => {
              const map = project.maps[index];
              return {
                id: mapId,
                content: {
                  map: map,
                  lassoVariable: getMapProjectVariable(project, map),
                },
              };
            })
            .reduce((acc, curr) => ({ ...acc, [curr.id]: curr.content }), {});

          return {
            ...prev,
            current: {
              data: project,
              bbox: project.bbox,
              lassoVariables: getProjectVariables(project),
              maps,
            },
          };
        });
      })
      .catch(() => {
        setAppContext((prev) => ({
          ...prev,
          current: undefined,
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setAppContext, loadProject]);

  const project = useMemo(
    () => (id && context.data.loadedProject && context.data.loadedProject[id] ? context.data.loadedProject[id] : null),
    [id, context.data.loadedProject],
  );

  return { project, loading };
};
