import { sortBy } from "lodash";

import { config } from "./config";
import * as fsu from "./utils/files";
import { importProjectFromPath, exportProject } from "./utils/project";

export { Project } from "./types";

async function run(): Promise<void> {
  // List project folders in the import folder
  const folders = await fsu.listFolder(config.importPath, {
    onlyFolder: true,
  });

  // For all projects sorted by their name, we parse them
  const projects = await Promise.all(sortBy(folders).map((p) => importProjectFromPath(p)));

  // Export each project
  const projectsExport = await Promise.all(projects.map((p) => exportProject(p)));

  // Export the project list
  await fsu.writeFile(`${config.exportPath}/projects.json`, projectsExport);
}

console.log("Starting dataprep");
run()
  .then(() => console.log("Success", config.exportPath))
  .catch((e) => console.log("Error", e));
