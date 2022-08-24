import * as Papa from "papaparse";
import { promises as fsp } from "fs";
import * as fs from "fs";
import * as path from "path";

import { config } from "../config";

export async function createFolder(pathFolderOrFile: string): Promise<void> {
  const folderPath = path.dirname(pathFolderOrFile);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

/**
 * Create the export folder.
 */
export async function createExportFolder(): Promise<void> {
  await createFolder(config.exportPath);
}

/**
 * Delete the export folder.
 */
export async function cleanExportFolder(): Promise<void> {
  await fsp.rm(config.exportPath, { recursive: true });
}

/**
 * Create a file into the export folder.
 */
export async function writeFile(content: string, file: string): Promise<void> {
  await createFolder(`${config.exportPath}/${file}`);
  await fsp.writeFile(`${config.exportPath}/${file}`, content, "utf-8");
}

/**
 * Create a csv file into the export folder.
 */
export async function writeCsv(
  items: Array<unknown>,
  file: string
): Promise<void> {
  const csv = Papa.unparse(items, { header: true });
  writeFile(csv, file);
}
