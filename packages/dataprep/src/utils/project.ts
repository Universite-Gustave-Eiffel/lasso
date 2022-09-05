import { head } from "lodash";
import * as path from "path";
import bbox from "@turf/bbox";

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
  // Read the index.json file and validate it
  const project = await fsu.readJson<ImportProject>(`${projectFolderPath}/index.json`, {
    ...schema,
    ["$ref"]: "#/definitions/ImportProject",
  });

  // List md files for static pages
  const pages = await fsu.listFolder(projectFolderPath, {
    extension: ".md",
  });
  const projectPagePath = head(pages.filter((p) => p.endsWith("/project.md")));
  if (!projectPagePath) throw new Error(`Project page is missing for ${project.name}`);
  const sponsorsPagePath = head(pages.filter((p) => p.endsWith("/sponsors.md")));
  const bibliographyPagePath = head(pages.filter((p) => p.endsWith("/bibliography.md")));

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
    // retieve page markdown content
    pages: {
      project: await readMarkdownFile(projectPagePath),
      sponsors: sponsorsPagePath ? await readMarkdownFile(sponsorsPagePath) : undefined,
      bibliography: bibliographyPagePath ? await readMarkdownFile(bibliographyPagePath) : undefined,
    },
  };
}

/**
 * Compute the default BBOX of a project by taking all geojson and compute the bound box
 */
export function getProjectBBOX(project: InternalProject): Project["bbox"] {
  return project.layers
    .filter((l) => !`${l.layer}`.includes("{x}"))
    .map((l) => l.layer)
    .map((geo) => bbox(geo))
    .reduce(
      (
        acc = [
          [Infinity, Infinity],
          [-Infinity, -Infinity],
        ],
        curr,
      ) => {
        // min X
        if (curr[0] < acc[0][1]) acc[0][1] = curr[0];
        if (curr[1] < acc[0][0]) acc[0][0] = curr[1];
        if (curr[2] > acc[1][1]) acc[1][1] = curr[2];
        if (curr[3] > acc[1][0]) acc[1][0] = curr[3];
        return acc;
      },
      [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ] as Project["bbox"],
    );
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
    bbox: project.bbox || getProjectBBOX(project),
    image,
    layers,
    pages,
  };
}
