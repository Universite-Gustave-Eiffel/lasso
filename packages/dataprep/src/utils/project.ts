import { head } from "lodash";
import * as path from "path";

import { config } from "../config";
import { ImportProject, InternalProject, Project } from "../types";
import * as schema from "../json-schema.json";
import * as fsu from "./files";
import { readGeoJsonFile } from "./geojson";
import { readMarkdownFile } from "./markdown";

/**
 * Given a folder, do the job to import internally the project.
 */
export async function importProjectFromPath(projectFolderPath: string): Promise<InternalProject> {
  // read the index.json file and validate it
  const project = await fsu.readJson<ImportProject>(`${projectFolderPath}/index.json`, {
    ...schema,
    ["$ref"]: "#/definitions/ImportProject",
  });

  // list md files for static pages
  const pages = await fsu.listFolder(projectFolderPath, {
    extension: ".md",
  });
  const projectPagePath = head(pages.filter((p) => p.endsWith("/project.md")));
  if (!projectPagePath) throw new Error(`Project page is missing for ${project.name}`);
  const sponsorsPagePath = head(pages.filter((p) => p.endsWith("/project.md")));
  const bibliographyPagePath = head(pages.filter((p) => p.endsWith("/project.md")));

  return {
    ...project,
    image: project.image ? path.resolve(projectFolderPath, project.image) : undefined,
    // retrieve geojson content
    layers: await Promise.all(
      project.layers.map(async (layer) => ({
        ...layer,
        geojson: await readGeoJsonFile(`${projectFolderPath}/${layer.geojson}`),
      })),
    ),
    // retieve page markdown content
    pages: {
      project: await readMarkdownFile(projectPagePath),
      sponsors: sponsorsPagePath ? await readMarkdownFile(sponsorsPagePath) : undefined,
      bibliography: bibliographyPagePath ? await readMarkdownFile(bibliographyPagePath) : undefined,
    },
  };
}

export async function exportProject(project: InternalProject): Promise<Project> {
  // Create the  folder
  // ~~~~~~~~~~~~~~~~~~
  const projectFolder = path.resolve(config.exportPath, project.id);
  await fsu.createFolder(projectFolder);
  const projectUrl = `${projectFolder.replace(path.resolve(config.exportPath), ".")}/`;

  let image: string | undefined = undefined;
  if (project.image) {
    const filename = path.basename(project.image);
    // copy the image
    await fsu.copy(project.image, path.resolve(projectFolder, filename));
    image = `${projectUrl}${filename}`;
  }

  // Create markdown files
  // ~~~~~~~~~~~~~~~~~~~~~
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

  // Create geojson files
  // ~~~~~~~~~~~~~~~~~~~~
  const layers = await Promise.all(
    project.layers.map(async (l) => {
      const filename = `${l.id}.geo.json`;
      await fsu.writeFile(path.resolve(projectFolder, filename), l.geojson);
      return {
        ...l,
        geojson: `${projectUrl}${filename}`,
      };
    }),
  );

  return {
    ...project,
    image,
    layers,
    pages,
  };
}
