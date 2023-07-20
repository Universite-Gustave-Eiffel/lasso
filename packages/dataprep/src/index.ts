import { sortBy } from "lodash";
import * as path from "path";

import { config } from "./config";
import * as fsu from "./utils/files";
import { metaBbox } from "./utils/geojson";
import { importProjectFromPath, exportProject } from "./utils/project";
import { ExportedData } from "./types";

export {
  ExportedData,
  Project,
  BBOX,
  IProjectMap,
  TimeSpecification,
  SOUNDSCAPE_VARIABLES_TYPES,
  LassoSourceVariables,
  LayerVariable,
} from "./types";

async function run(): Promise<void> {
  // Export/copy about markdown files
  const mdFiles = await fsu.listFolder(config.importPath, { extension: ".md" });
  await Promise.all(
    mdFiles.map(async (file) => {
      console.log(file);
      const filename = path.basename(file);
      await fsu.copy(file, path.resolve(config.exportPath, filename));
    }),
  );

  // List project folders in the import folder
  const folders = await fsu.listFolder(config.importPath, {
    onlyFolder: true,
  });

  // For all projects sorted by their name, we parse them
  const projects = await Promise.all(sortBy(folders).map((p) => importProjectFromPath(p)));

  // Export each project
  const projectsExport = await Promise.all(projects.map((p) => exportProject(p)));

  const exportObj: ExportedData = {
    bbox: metaBbox(projectsExport.map((p) => p.bbox)),
    projects: projectsExport,
  };

  // Export the project list
  await fsu.writeFile(`${config.exportPath}/projects.json`, exportObj);
}

console.log("Starting dataprep");
run()
  .then(() => console.log("Success", config.exportPath))
  .catch((e) => console.log("Error", e));
