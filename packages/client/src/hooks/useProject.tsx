import { useEffect } from "react";

import { Project } from "@lasso/dataprep";
import { useAppContext } from "./useAppContext";
import axios from "axios";
import { FeatureCollection } from "geojson";
import { flatten, fromPairs, keyBy, mapValues, omit, toPairs } from "lodash";
import { defaultLegendSpecs, LegendSpecType, LegendSymbolSpec } from "../utils/legend";
import { DataDrivenPropertyValueSpecification, ExpressionSpecification } from "maplibre-gl";
import { Style } from "mapbox-gl";
import { expression } from "@mapbox/mapbox-gl-style-spec";

export type LoadedProject = Project & { legendSpecs: LegendSpecType };

export const useCurrentProject = (id?: string): LoadedProject | null => {
  const [context, setAppContext] = useAppContext();

  //update current id
  useEffect(() => {
    if (id) setAppContext((prev) => ({ ...prev, currentProjectId: id }));
  }, [id, setAppContext]);

  useEffect(() => {
    /**
     * Load all sources data and generate legendSpec from a project and store it in app context
     * @param project
     * @returns void
     */
    async function loadProject() {
      const projectToLoad = context.data.projects.find((e) => e.id === context.currentProjectId);
      if (projectToLoad) {
        // generate legend
        const variableLayers = keyBy(flatten(projectToLoad.maps.map((m) => m.layers)), (l) => l.id);
        const legendSpecs: LegendSpecType = mapValues(defaultLegendSpecs, (legend, variableName) => {
          // find corresponding layer
          const layer = variableLayers[variableName];
          // identify paint Variable depending on layer type
          if (layer && layer.paint && legend) {
            let colorExpression: DataDrivenPropertyValueSpecification<string> | ExpressionSpecification | undefined =
              undefined;
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
        };

        setAppContext((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            loadedProject: { ...omit(prev.data.loadedProject, loadedProject.id), [loadedProject.id]: loadedProject },
          },
        }));
      }
    }
    // load data only if necessary
    if (
      context.currentProjectId &&
      // we load only once in app lifetime, context cache the data
      !context.data.loadedProject[context.currentProjectId]
    )
      loadProject();
  }, [context.currentProjectId, context.data.projects, context.data.loadedProject, setAppContext]);

  return context.data.loadedProject && context.currentProjectId
    ? context.data.loadedProject[context.currentProjectId]
    : null;
};
