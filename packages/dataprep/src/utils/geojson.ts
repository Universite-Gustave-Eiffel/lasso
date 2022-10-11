import bbox from "@turf/bbox";
import { Feature, FeatureCollection, GeoJSON, GeoJsonProperties, Geometry } from "geojson";
import { groupBy, toPairs } from "lodash";

import shortHash from "shorthash2";

import { BBOX, LassoSource } from "../types";
import { readJson } from "./files";

export async function readGeoJsonFile(file: string): Promise<GeoJSON> {
  const geojson = (await readJson(file)) as FeatureCollection;
  try {
    return geojson as GeoJSON;
  } catch (e) {
    throw new Error(`GeoJSON ${file} is not valid: ${e}`);
  }
}

//const isEmpty = (value: null | undefined | unknown): boolean => [null, undefined].some((empty) => empty === value);
//const DEFAULT_FEATURE_ID_PROPERTY_NAME = "PK";
export async function checkGeoJsonSource(source: LassoSource, projectFolderPath: string): Promise<GeoJSON> {
  if (source.type === "geojson") {
    const geojson =
      typeof source.data === "string"
        ? await readGeoJsonFile(`${projectFolderPath}/${source.data}`)
        : (source.data as GeoJSON);

    const validGeoJson = { ...geojson };
    if (validGeoJson.type === "FeatureCollection" && source.variables !== undefined) {
      // let idPropertyName = DEFAULT_FEATURE_ID_PROPERTY_NAME;

      // if (source.promoteId)
      //   idPropertyName = typeof source.promoteId === "string" ? source.promoteId : DEFAULT_FEATURE_ID_PROPERTY_NAME;

      const filterTransformProperties = (properties: Record<string, unknown>): Record<string, unknown> => {
        const newProperties: Record<string, unknown> = {};
        toPairs(source.variables).forEach(([variableName, v]) => {
          const featureName = typeof v === "string" ? v : v.propertyName;
          if (properties && properties[featureName] !== undefined)
            newProperties[variableName] = properties[featureName];
        });
        return newProperties;
      };
      const nbFeaturesByVariables: { [key: string]: number } = {};

      validGeoJson.features = toPairs(groupBy(validGeoJson.features, (f) => shortHash(JSON.stringify(f.geometry)))).map(
        ([key, features]) => {
          // check variables
          features.forEach((f) =>
            toPairs(source.variables).forEach(([variableName, v]) => {
              const featureName = typeof v === "string" ? v : v.propertyName;
              if (f.properties && f.properties[featureName] !== undefined)
                nbFeaturesByVariables[variableName] = (nbFeaturesByVariables[variableName] || 0) + 1;
            }),
          );
          // TODO: refacto the id check
          //  // check or generate id in properties
          //  if (aggregatedFeature.properties && isEmpty(aggregatedFeature.properties[idPropertyName])) {
          // if (idPropertyName === DEFAULT_FEATURE_ID_PROPERTY_NAME)
          //   aggregatedFeature.properties[idPropertyName] = shortHash(JSON.stringify(aggregatedFeature.geometry));
          // else
          //   throw new Error(
          //     `The identifier ${idPropertyName} is missing in one feature property set ${JSON.stringify(
          //       aggregatedFeature.properties,
          //       null,
          //       2,
          //     )}`,
          //   );
          // }

          const aggregatedFeature: Feature<Geometry, GeoJsonProperties> = {
            id: key,
            type: features[0].type,
            geometry: features[0].geometry,
            properties: {},
          };

          if (source.timeSeries !== undefined) {
            const propertiesInTime: Record<string, Record<string, unknown>> = {};
            const timestampPropertyName = source.timeSeries.timestampPropertyName;
            features.forEach((f) => {
              let timeKey = "default";
              if (f.properties) {
                if (f.properties[timestampPropertyName]) {
                  const featureDate = new Date(f.properties[timestampPropertyName]);
                  const labelsKeys = [];
                  if (source.timeSeries?.monthsLabels) {
                    const month = featureDate.getMonth();
                    const monthLabel = toPairs(source.timeSeries.monthsLabels).find(([, ml]) =>
                      ml.months.includes(month),
                    );
                    if (monthLabel) labelsKeys.push(monthLabel[0]);
                  }
                  if (source.timeSeries?.daysLabels) {
                    const day = featureDate.getDay() + 1; //0-inded day in JS, we use 1-indexed list in types
                    const dayLabel = toPairs(source.timeSeries.daysLabels).find(([, hl]) => hl.weekDays.includes(day));
                    if (dayLabel) labelsKeys.push(dayLabel[0]);
                  }
                  if (source.timeSeries?.hoursLabels) {
                    const hours = featureDate.getHours();
                    const hourlabel = toPairs(source.timeSeries.hoursLabels).find(
                      ([, hl]) => hl.hours[0] <= hours && hours <= hl.hours[1],
                    );
                    if (hourlabel) labelsKeys.push(hourlabel[0]);
                  }
                  if (labelsKeys.length > 0) {
                    // tag with the proper timeSeries keys
                    //TODO: share timekey generation method with client
                    timeKey = labelsKeys.join("|");
                  }
                } else {
                  // case of a static features for which there is no time key
                  // Use it as default value
                  timeKey = "static";
                }

                //finally index features values with appropriate time key
                propertiesInTime[timeKey] = filterTransformProperties(f.properties);
              }
              // no properties => ignore it
            });
            // END FOREACH FEATURES
            aggregatedFeature.properties = {
              // use static as default values
              ...filterTransformProperties(propertiesInTime["static"] || features[0].properties),
              ...propertiesInTime,
            };
          } else {
            if (features.length > 1) {
              console.warn("Duplicated feature with the same geometry");
            }
            aggregatedFeature.properties = filterTransformProperties(features[0].properties || {});
          }

          return aggregatedFeature;
        },
      );

      //check variables presence in features
      toPairs(source.variables).map(([variableName, v]) => {
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
  } else throw new Error("Not a geojson source");
}

/**
 * Compute the outer BBOX that contains all the geojson
 */
export function outerBbox(geoJsons: Array<GeoJSON>): BBOX {
  return metaBbox(
    geoJsons
      .map((geo) => {
        return bbox(geo);
      })
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
