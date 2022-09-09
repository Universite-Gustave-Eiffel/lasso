import * as path from "path";
import { GeoJSON } from "geojson";

import { config } from "../config";
import { ImportProject, InternalProject, Project } from "../types";
import * as schema from "../json-schema.json";
import * as fsu from "./files";
import { readGeoJsonFile, outerBbox } from "./geojson";
import { readMarkdownFile } from "./markdown";
import { getRandomHexColor } from "./color";

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

  return {
    ...project,
    image: project.image ? path.resolve(projectFolderPath, project.image) : undefined,
    layers: await Promise.all(
      project.layers.map(async (l) => ({
        ...l,
        // retrieve geojson content
        layer:
          l.layer.includes("{x}") && l.layer.includes("{y}")
            ? l.layer
            : await readGeoJsonFile(`${projectFolderPath}/${l.layer}`),
      })),
    ),
    pages,
  };
}

export async function exportProject(project: InternalProject): Promise<Project> {
  // Create the  folder
  // ~~~~~~~~~~~~~~~~~~
  const projectFolder = path.resolve(config.exportPath, project.id);
  await fsu.createFolder(projectFolder);
  const projectUrl = `${projectFolder.replace(path.resolve(config.exportPath), ".")}/`;

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
    image = `${projectUrl}${filename}`;
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
  const layers = await Promise.all(
    project.layers.map(async (l) => {
      if (`${l.layer}`.includes("{x}") && `${l.layer}`.includes("{y}")) {
        return {
          ...l,
          layer: `${l.layer}`,
        };
      } else {
        const filename = `${l.id}.geo.json`;
        await fsu.writeFile(path.resolve(projectFolder, filename), l.layer);
        return {
          ...l,
          layer: `${projectUrl}${filename}`,
        };
      }
    }),
  );

  return {
    ...project,
    bbox:
      project.bbox ||
      outerBbox(project.layers.filter((l) => !`${l.layer}`.includes("{x}")).map((l) => l.layer as GeoJSON)),
    color: project.color || getRandomHexColor(),
    image,
    layers,
    pages,
  };
}
