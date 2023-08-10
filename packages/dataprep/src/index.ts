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
  LassoSourceImage,
} from "./types";

async function run(): Promise<void> {
  // make sure destination exists
  await fsu.createFolder(config.exportPath);
  
  // Export/copy about markdown files
  const mdFiles = await fsu.listFolder(config.importPath, { extension: ".md" });
  await Promise.all(
    mdFiles.map(async (file) => {
      const filename = path.basename(file);
      await fsu.copy(file, path.resolve(config.exportPath, filename));
    }),
  );

  // List project folders in the import folder
  const folders = await fsu.listFolder(config.importPath, {
    onlyFolder: true,
  });

  const projectsExport = await Promise.all(
    sortBy(folders).map(async (folder) => {
      // parse the project
      const project = await importProjectFromPath(folder);
      // export it
      return await exportProject(project, folder);
    }),
  );

  const exportObj: ExportedData = {
    bbox: metaBbox(projectsExport.map((p) => p.bbox)),
    projects: projectsExport,
  };

  // Export the project list
  await fsu.writeFile(`${config.exportPath}/projects.json`, exportObj);
}

console.log("Starting dataprep");
run()
  .then(() => {
    console.log(`Success !`);
    console.log(`Files have been generated in ${config.exportPath}`);
  })
  .catch((e) => console.log("Error", e));
