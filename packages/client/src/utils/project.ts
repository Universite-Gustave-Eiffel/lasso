import { isString, toPairs } from "lodash";
import { Feature } from "geojson";

import { IProjectMap, LayerVariable, SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";
import { LoadedProject } from "../hooks/useProject";

export type ProjectLayerVariable = LayerVariable & {
  variable: SOUNDSCAPE_VARIABLES_TYPES;
  featureExample?: Feature;
};

/**
 *
 * @param project Given a project return a map of variables
 * @returns
 */
export function getProjectVariables(
  project: LoadedProject,
  map?: IProjectMap,
): { [key: string]: ProjectLayerVariable } {
  const sources = map?.layers
    .map((l) => (l.type !== "background" ? l.source : null))
    .filter((l): l is string => l !== null);
  return toPairs(project.sources)
    .filter((source) => (sources ? sources.includes(source[0]) : true))
    .flatMap((source) => {
      return toPairs(source[1].variables || {}).map((e) => [
        ...e,
        source[1].type === "geojson" ? (source[1].data as any).features[0] : undefined,
      ]);
    })
    .reduce((acc, curr) => {
      if (isString(curr[1])) {
        return {
          ...acc,
          [curr[0]]: {
            variable: curr[0] as SOUNDSCAPE_VARIABLES_TYPES,
            propertyName: curr[1],
            minimumValue: 0,
            maximumValue: 10,
            featureExample: curr[2],
          },
        };
      } else {
        return {
          ...acc,
          [curr[0]]: {
            variable: curr[0] as SOUNDSCAPE_VARIABLES_TYPES,
            featureExample: curr[2] as Feature,
            ...curr[1],
          },
        };
      }
    }, {} as { [key: string]: ProjectLayerVariable });
}

export function getMapProjectMappedVariable(project: LoadedProject, map: IProjectMap): ProjectLayerVariable | null {
  const projectVariables = getProjectVariables(project, map);

  // Find the first layer id that match an available variable
  for (const layer of map.layers) {
    const variable = projectVariables[layer.id];
    if (variable) return variable;
  }

  return null;
}

export function getVariableColor(project: LoadedProject, variable: ProjectLayerVariable, value: number): string {
  if (variable && variable.featureExample) {
    const legendMapVariable = project.legendSpecs[variable?.variable];
    if (legendMapVariable && legendMapVariable.colorStyleExpression) {
      return legendMapVariable.colorStyleExpression.evaluate(
        { zoom: 14 },
        { ...variable.featureExample, properties: { [variable?.variable || ""]: value } },
      );
    }
  }
  return "#FFF";
}
