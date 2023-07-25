import { head, isString, toPairs } from "lodash";
import { Geometry, Feature } from "geojson";

import { Project, IProjectMap, LayerVariable, SOUNDSCAPE_VARIABLES_TYPES, TimeSpecification } from "@lasso/dataprep";
import { LoadedProject } from "../hooks/useLoadProject";

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

export function getMapProjectVariable(project: LoadedProject, map: IProjectMap): ProjectLayerVariable | null {
  const projectVariables = getProjectVariables(project, map);

  // Find the first layer id that match an available variable
  for (const layer of map.layers) {
    const variable = projectVariables[layer.id];
    if (variable) return variable;
  }

  return null;
}

export function getMapProjectTimeSpec(project: LoadedProject, map: IProjectMap): TimeSpecification | undefined {
  const mapSources = map?.layers
    .map((l) => (l.type !== "background" ? l.source : null))
    .filter((l): l is string => l !== null);

  const sourceWithSpec = head(
    toPairs(project.sources)
      .filter((source) => mapSources.includes(source[0]) && source[1].timeSeries)
      .map((s) => s[1].timeSeries),
  );
  return sourceWithSpec;
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

export function projectBboxToGeometry(project: Project): Geometry {
  const bbox = project.bbox;
  return {
    type: "Polygon",
    coordinates: [[bbox[1], [bbox[0][0], bbox[1][1]], bbox[0], [bbox[1][0], bbox[0][1]], bbox[1]]],
  };
}
