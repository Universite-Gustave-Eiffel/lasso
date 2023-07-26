import * as path from "path";
import { GeoJSON } from "geojson";
import { isString } from "lodash";

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
  const projectUrl = path.join(process.env.PUBLIC_URL || "", "/", path.basename(config.exportPath), project.id);

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
