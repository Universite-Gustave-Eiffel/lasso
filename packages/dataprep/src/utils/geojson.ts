import bbox from "@turf/bbox";
import { FeatureCollection, GeoJSON } from "geojson";
import { toPairs } from "lodash";
import shortHash from "shorthash2";

import { BBOX, LayerVariable, SOUNDSCAPE_VARIABLES } from "../types";
import { readJson } from "./files";

export async function readGeoJsonFile(file: string): Promise<GeoJSON> {
  const geojson = (await readJson(file)) as FeatureCollection;
  try {
    return geojson as GeoJSON;
  } catch (e) {
    throw new Error(`GeoJSON ${file} is not valid: ${e}`);
  }
}

const isEmpty = (value: null | undefined | unknown): boolean => [null, undefined].some((empty) => empty === value);
const DEFAULT_FEATURE_ID_PROPERTY_NAME = "PK";
export function checkGeoJson(
  geojson: GeoJSON,
  promoteId?: string,
  variables?: Partial<Record<SOUNDSCAPE_VARIABLES, LayerVariable>>,
): GeoJSON {
  const validGeoJson = { ...geojson };
  if (validGeoJson.type === "FeatureCollection" && variables !== undefined) {
    let idPropertyName = DEFAULT_FEATURE_ID_PROPERTY_NAME;
    if (promoteId) idPropertyName = typeof promoteId === "string" ? promoteId : DEFAULT_FEATURE_ID_PROPERTY_NAME;
    const nbFeaturesByVariables: { [key: string]: number } = {};
    validGeoJson.features = validGeoJson.features.map((f) => {
      const feature = { ...f };
      if (f.properties) {
        // check or generate id in properties
        if (isEmpty(f.properties[idPropertyName]) && feature.properties) {
          if (idPropertyName === DEFAULT_FEATURE_ID_PROPERTY_NAME)
            feature.properties[idPropertyName] = shortHash(JSON.stringify(f.geometry));
          else
            throw new Error(
              `The identifier ${idPropertyName} is missing in one feature property set ${JSON.stringify(
                feature.properties,
                null,
                2,
              )}`,
            );
        }
        // TODO: check timestamp if timeseries
        // check variables
        toPairs(variables).forEach(([variableName, v]) => {
          const featureName = typeof v === "string" ? v : v.propertyName;
          if (f.properties && f.properties[featureName] !== undefined)
            nbFeaturesByVariables[variableName] = (nbFeaturesByVariables[variableName] || 0) + 1;
        });
      }
      return feature;
    });

    //check variables presence in features
    toPairs(variables).map(([variableName, v]) => {
      const featureName = typeof v === "string" ? v : v.propertyName;
      if (!nbFeaturesByVariables[variableName])
        throw new Error(`The ${featureName} GeoJson property does not exist. Required for ${variableName} variable.`);
      else if (nbFeaturesByVariables[variableName] <= 5)
        console.warn(
          `The ${featureName} GeoJson is only set in ${nbFeaturesByVariables[variableName]} features. Needed for ${variableName} variable.`,
        );
    });
  }
  return validGeoJson;
}

/**
 * Compute the outer BBOX that contains all the geojson
 */
export function outerBbox(geoJsons: Array<GeoJSON>): BBOX {
  return metaBbox(
    geoJsons
      .map((geo) => bbox(geo))
      .map(
        (bbox) =>
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ] as BBOX,
      ),
  );
}

export function metaBbox(bboxs: Array<BBOX>): BBOX {
  return bboxs.reduce(
    (
      acc = [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ],
      curr,
    ) => {
      // min X
      if (curr[0][0] < acc[0][0]) acc[0][0] = curr[0][0];
      if (curr[0][1] < acc[0][1]) acc[0][1] = curr[0][1];
      if (curr[1][0] > acc[1][0]) acc[1][0] = curr[1][0];
      if (curr[1][1] > acc[1][1]) acc[1][1] = curr[1][1];
      return acc;
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ] as BBOX,
  );
}
