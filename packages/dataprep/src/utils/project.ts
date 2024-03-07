import * as path from "path";
import { groupBy, toPairs, isString, fromPairs, values, isNumber } from "lodash";
import shortHash from "shorthash2";
import { Feature, GeoJSON, GeoJsonProperties, Geometry } from "geojson";

import { config } from "../config";
import {
  ImportProject,
  InternalProject,
  LassoSource,
  Project,
  LassoSourceAsset,
  LassoSourceAssetSpecification,
} from "../types";
import * as schema from "../json-schema.json";
import * as fsu from "./files";
import { outerBbox, readGeoJsonFile } from "./geojson";
import { readMarkdownFile } from "./markdown";
import { getRandomHexColor } from "./color";
import { SoundData, getSoundFile } from "./sound";

/**
 * Given a folder, do the job to import internally the project.
 */
export async function importProjectFromPath(projectFolderPath: string, sounds: SoundData): Promise<InternalProject> {
  // Read the index.json file and validate it
  const project = await fsu.readJson<ImportProject>(`${projectFolderPath}/index.json`, schema);

  // List md files for static pages
  const markdownFiles = await fsu.listFolder(projectFolderPath, { extension: ".md" });
  const filenameRegex = /([^.]*)(\.([a-zA-Z]{2}))?/;
  const pages = (
    await Promise.all(
      markdownFiles.map(async (f) => {
        const filename = fsu.getFilenameFromPath(f);
        const content = await readMarkdownFile(f);

        const groups = filename.match(filenameRegex);
        if (groups) {
          const name = groups?.length > 3 ? groups[1] : filename;
          const locale = groups?.length > 3 && groups[3] ? groups[3] : "default";
          return { name, content, locale };
        }
        return { name: filename, content, locale: "default" };
      }),
    )
  ).reduce((acc, curr) => {
    return {
      ...acc,
      [curr.name]: {
        ...(acc[curr.name] || {}),
        [curr.locale]: curr.content,
      },
    };
  }, {} as { [key: string]: { [key: string]: string } });

  // change relative local map style path to absolute path
  const maps = await Promise.all(
    project.maps.map(async (m) => {
      if (m.basemapStyle)
        if (typeof m.basemapStyle === "string") {
          try {
            // testing if the style is an URL
            new URL(m.basemapStyle);
            // it's an URL dont do nothing
            return m;
          } catch (e) {
            return {
              ...m,
              basemapStyle: path.resolve(projectFolderPath, m.basemapStyle),
            };
          }
        }
      return m;
    }),
  );

  return {
    ...project,
    maps,
    image: project.image ? path.resolve(projectFolderPath, project.image) : undefined,
    sources: fromPairs(
      await Promise.all(
        toPairs(project.sources).map(async ([id, source]): Promise<[id: string, source: LassoSource]> => {
          return [id, await transformLassoSource(source, projectFolderPath, sounds)];
        }),
      ),
    ),
    pages,
  };
}

export async function exportProject(project: InternalProject, sourceFolder: string): Promise<Project> {
  // Create the  folder
  // ~~~~~~~~~~~~~~~~~~
  const projectFolder = path.resolve(config.exportPath, project.id);
  await fsu.createFolder(projectFolder);
  const projectUrl = path.join(process.env.PUBLIC_URL || "", "/", path.basename(config.exportPath), project.id);

  // Copy asset folder if needed
  if (await fsu.checkExists(path.resolve(sourceFolder, "assets"))) {
    await fsu.copy(path.resolve(sourceFolder, "assets"), path.resolve(projectFolder, "assets"));
  }

  // Project's image
  let image: string | undefined = undefined;
  if (project.image) {
    const filename = path.basename(project.image);
    // copy the image
    await fsu.copy(project.image, path.resolve(projectFolder, filename));
    image = path.join(projectUrl, filename);
  }

  // Create markdown files
  // ~~~~~~~~~~~~~~~~~~~~~
  const pages: Project["pages"] = {};

  await Promise.all(
    ["project", "dataset", "sponsors", "bibliography"].map(async (name: string) => {
      const page = project.pages[name];

      if (page) {
        if (isString(page)) {
          await fsu.writeFile(path.resolve(projectFolder, `${name}.md`), page);
          pages[name] = { default: `${name}.md` };
        } else {
          pages[name] = (
            await Promise.all(
              Object.keys(page).map(async (locale) => {
                await fsu.writeFile(path.resolve(projectFolder, `${name}.${locale}.md`), page[locale]);
                return { locale, url: `${name}.${locale}.md` };
              }),
            )
          ).reduce((acc, current) => ({ ...acc, [current.locale]: current.url }), {} as { [key: string]: string });
        }
      }
    }),
  );

  // Create geojson files if needed
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const sources = fromPairs(
    await Promise.all(
      toPairs(project.sources).map(async ([key, source]) => {
        if (source.type !== "geojson") {
          return [key, source];
        } else {
          const filename = `${key}.geo.json`;
          await fsu.writeFile(path.resolve(projectFolder, filename), source.data);
          return [
            key,
            {
              ...source,
              data: path.join(projectUrl, filename),
            },
          ];
        }
      }),
    ),
  );

  // Create map styles if needed
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const maps = await Promise.all(
    project.maps.map(async (m) => {
      if (m.basemapStyle)
        if (typeof m.basemapStyle === "string") {
          try {
            // testing if the style is an URL
            new URL(m.basemapStyle);
            // it's an URL dont do nothing
            return m;
          } catch (e) {
            const styleFilename = path.basename(m.basemapStyle);

            await fsu.copy(m.basemapStyle, path.resolve(projectFolder, styleFilename));

            return {
              ...m,
              basemapStyle: path.join(projectUrl, styleFilename),
            };
          }
        }
      // don't change anything otherwise
      return m;
    }),
  );

  // Calculate BBOX from GeoJson
  const bbox =
    project.bbox ||
    outerBbox(
      values(project.sources)
        .map((s) => (s.type === "geojson" && typeof s.data !== "string" ? (s.data as GeoJSON) : null))
        .filter((s): s is GeoJSON => !!s),
    );

  return {
    ...project,
    bbox,
    color: project.color || getRandomHexColor(),
    image,
    sources,
    maps,
    pages,
  };
}

/**
 * Transform a lasso source to source that can be exported.
 * - if file is specified, takes its value
 * - do the time aggregation
 * - add lasso variables to the geojson properties
 */
async function transformLassoSource(
  source: LassoSource,
  projectFolderPath: string,
  sounds: SoundData,
): Promise<LassoSource> {
  if (source.type !== "geojson") return source;

  const geojson =
    typeof source.data === "string"
      ? await readGeoJsonFile(`${projectFolderPath}/${source.data}`)
      : (source.data as GeoJSON);

  const validGeoJson = { ...geojson };

  // if geojson is a feature collection with lasso variables
  if (validGeoJson.type === "FeatureCollection" && source.variables !== undefined) {
    // compute the image index of the source
    const imagesIndex = await getSourceAssetIndex(source, projectFolderPath);

    // inner function to compute feature properties
    const filterTransformProperties = (
      properties: Record<string, unknown>,
      withAssets?: boolean,
    ): Record<string, unknown> => {
      const newProperties: Record<string, unknown> = {};

      // add image
      if (withAssets && source.images && properties[source.images.field]) {
        const images = imagesIndex[`${properties[source.images.field]}`];
        newProperties.images = images;
      }

      // map lasso variables
      toPairs(source.variables).forEach(([variableName, v]) => {
        const featureName = typeof v === "string" ? v : v.propertyName;
        if (properties && properties[featureName] !== undefined) newProperties[variableName] = properties[featureName];
      });

      // add sounds
      if (
        source.variables?.acoustic_birds &&
        isNumber(newProperties["acoustic_birds"]) &&
        source.variables?.acoustic_trafic &&
        isNumber(newProperties["acoustic_trafic"]) &&
        source.variables?.acoustic_voices &&
        isNumber(newProperties["acoustic_voices"])
      ) {
        const varNormalized = {
          acoustic_birds:
            newProperties["acoustic_birds"] /
            (isString(source.variables.acoustic_birds) ? 10 : source.variables.acoustic_birds.maximumValue),
          acoustic_trafic:
            newProperties["acoustic_trafic"] /
            (isString(source.variables.acoustic_trafic) ? 10 : source.variables.acoustic_trafic.maximumValue),
          acoustic_voices:
            newProperties["acoustic_voices"] /
            (isString(source.variables.acoustic_voices) ? 10 : source.variables.acoustic_voices.maximumValue),
        };
        newProperties.sound = getSoundFile(sounds, varNormalized);
      }
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

        const aggregatedFeature: Feature<Geometry, GeoJsonProperties> = {
          id: key,
          type: features[0].type,
          geometry: features[0].geometry,
          properties: { id: key },
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
                  const month = featureDate.getMonth() + 1; // January is à in JS
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
                  const hourlabel = toPairs(source.timeSeries.hoursLabels).find(([, hl]) => {
                    const start = hl.hours[0];
                    const end = hl.hours[1];
                    if (start < end) return start <= hours && hours <= end;
                    // crosses midnight
                    else return start <= hours || hours <= end;
                  });
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
              propertiesInTime[timeKey] = filterTransformProperties(
                f.properties,
                timeKey === "static" || timeKey === "default",
              );
            }
            // no properties => ignore it
          });
          // END FOREACH FEATURES
          aggregatedFeature.properties = {
            // use static as default values
            id: key,
            ...filterTransformProperties(propertiesInTime["static"] || features[0].properties, true),
            ...propertiesInTime,
          };
        } else {
          aggregatedFeature.properties = { id: key, ...filterTransformProperties(features[0].properties || {}, true) };
        }

        return aggregatedFeature;
      },
    );

    // check variables presence in features
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
  return { ...source, data: validGeoJson };
}

async function getSourceAssetIndex(
  source: LassoSource,
  projectFolderPath: string,
): Promise<{ [key: string]: LassoSourceAsset[] }> {
  if (source.images) {
    const csvContent = await fsu.readCsv<LassoSourceAsset & { id: string } & { [key: string]: string }>(
      `${projectFolderPath}/${(source.images as LassoSourceAssetSpecification).csv}`,
    );

    return csvContent.reduce((acc, curr) => {
      const id = curr.id;
      const file = {
        path: curr.path,
        description:
          curr.description ||
          Object.keys(curr)
            .filter((k) => k.startsWith("description_"))
            .reduce((acc, value) => {
              if (curr[value]) {
                const locale = value.replace("description_", "");
                acc[locale] = curr[value];
              }
              return acc;
            }, {} as { [key: string]: string }),
      };
      return {
        ...acc,
        [id]: acc[id] ? [...acc[id], file] : [file],
      };
    }, {} as { [key: string]: LassoSourceAsset[] });
  }

  return {};
}
