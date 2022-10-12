import * as path from "path";
import { GeoJSON } from "geojson";

import { config } from "../config";
import { ImportProject, InternalProject, LassoSource, Project } from "../types";
import * as schema from "../json-schema.json";
import * as fsu from "./files";
import { outerBbox, checkGeoJsonSource } from "./geojson";
import { readMarkdownFile } from "./markdown";
import { getRandomHexColor } from "./color";
import { fromPairs, toPairs, values } from "lodash";

/**
 * Given a folder, do the job to import internally the project.
 */
export async function importProjectFromPath(projectFolderPath: string): Promise<InternalProject> {
  // Read the index.json file and validate it
  const project = await fsu.readJson<ImportProject>(`${projectFolderPath}/index.json`, {
    ...schema,
    ["$ref"]: "#/definitions/ImportProject",
  });

  // List md files for static pages
  const markdownFiles = await fsu.listFolder(projectFolderPath, { extension: ".md" });
  if (!markdownFiles.find((p) => p.endsWith("/project.md")))
    throw new Error(`Project page is missing for ${project.name}`);
  const pages = (
    await Promise.all(
      markdownFiles.map(async (f) => ({
        name: fsu.getFilenameFromPath(f),
        content: await readMarkdownFile(f),
      })),
    )
  ).reduce((acc, curr) => ({ ...acc, [curr.name]: curr.content }), {} as { [key: string]: string });

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
          if (source.type === "geojson" && source.data) {
            const geojsonData = await checkGeoJsonSource(source, projectFolderPath);

            return [id, { ...source, data: geojsonData } as LassoSource];
          }
          return [id, source];
        }),
      ),
    ),

    pages,
  };
}

export async function exportProject(project: InternalProject): Promise<Project> {
  // Create the  folder
  // ~~~~~~~~~~~~~~~~~~
  const projectFolder = path.resolve(config.exportPath, project.id);
  await fsu.createFolder(projectFolder);
  const projectUrl = path.resolve("/", path.basename(config.exportPath), project.id);

  // Copy asset folder if needed
  if (await fsu.checkExists(path.resolve(config.importPath, "assets"))) {
    await fsu.copy(path.resolve(config.importPath, "assets"), path.resolve(projectFolder, "assets"));
  }

  // Project's image
  let image: string | undefined = undefined;
  if (project.image) {
    const filename = path.basename(project.image);
    // copy the image
    await fsu.copy(project.image, path.resolve(projectFolder, filename));
    image = path.resolve(projectUrl, filename);
  }

  // Create markdown files
  // ~~~~~~~~~~~~~~~~~~~~~
  // TODO: change urls to images
  const pages = { project: `${projectUrl}project.md` } as Project["pages"];
  await fsu.writeFile(path.resolve(projectFolder, "project.md"), project.pages.project);
  if (project.pages.sponsors) {
    await fsu.writeFile(path.resolve(projectFolder, "sponsors.md"), project.pages.sponsors);
    pages.sponsors = `${projectUrl}sponsors.md`;
  }
  if (project.pages.bibliography) {
    await fsu.writeFile(path.resolve(projectFolder, "bibliography.md"), project.pages.bibliography);
    pages.bibliography = `${projectUrl}bibliography.md`;
  }

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
              data: path.resolve(projectUrl, filename),
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
            if (!(await fsu.checkExists(path.resolve(projectFolder, styleFilename))))
              // copy the style file. It may already exist as same style can be shared in multiple maps
              await fsu.copy(m.basemapStyle, path.resolve(projectFolder, styleFilename));
            return {
              ...m,
              basemapStyle: path.resolve(projectUrl, styleFilename),
            };
          }
        }
      // don't change anything otherwise
      return m;
    }),
  );

  // Calculate BBOx from GeoJson
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
