import Ajv, { Schema } from "ajv";
import { promises as fsp } from "fs";
import * as fs from "fs";
import * as path from "path";

/**
 * Create a folder at the specified location.
 * If the folder already exist, do nothing.
 */
export async function checkExists(fileOrFolderPath: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.exists(path.resolve(fileOrFolderPath), (exist) => resolve(exist));
  });
}

/**
 * Create a folder at the specified location.
 * If the folder already exist, do nothing.
 */
export async function createFolder(folder: string): Promise<void> {
  const folderPath = path.resolve(folder);
  if (!(await checkExists(folderPath))) await fs.mkdirSync(folderPath, { recursive: true });
}

/**
 * Clean folder at the specified location.
 * Throws an exception if the given folder doesn't exists.
 */
export async function cleanFolder(folder: string): Promise<void> {
  const folderPath = path.dirname(path.resolve(folder));
  if (!(await checkExists(folderPath))) throw new Error(`Folder ${folderPath} is missing, can't clean it`);
  await fsp.rm(folderPath, { recursive: true });
}

/**
 * Create a file into the export folder.
 */
export async function writeFile(file: string, content: unknown): Promise<void> {
  const filePath = path.resolve(file);
  let data = `${content}`;
  if (typeof content === "object") data = JSON.stringify(content);

  await createFolder(path.dirname(filePath));
  await fsp.writeFile(filePath, data, "utf-8");
}

/**
 * List files (with the specified extension if specified) of a folder .
 * Throws an error if the given folder doesn't exists.
 */
export async function listFolder(
  folder: string,
  opts?: { extension?: string; onlyFolder?: boolean },
): Promise<Array<string>> {
  const folderPath = path.dirname(path.resolve(folder));
  if (!(await checkExists(folderPath))) throw new Error(`Folder ${folderPath} is missing, can't list it`);
  const files = await fsp.readdir(folder, { withFileTypes: true });

  return files
    .filter((f) => {
      if (opts && opts.extension) return path.extname(f.name) === opts.extension;
      if (opts && opts.onlyFolder) return f.isDirectory();
      return true;
    })
    .map((f) => path.resolve(folder, f.name));
}

/**
 * read a file and returns its content as a string.
 */
export async function readFile(file: string): Promise<string> {
  const content = await fsp.readFile(file, { encoding: "utf8" });
  return content;
}

/**
 * Read file a parse it as JSON.
 * If schema is specified, the function will validate the json against it.
 */
export async function readJson<T>(file: string, schema?: Schema): Promise<T> {
  const data = await readFile(file);
  const json = JSON.parse(data);
  if (schema) {
    const ajv = new Ajv();
    const validateJson = await ajv.compile(schema);
    if (!validateJson(json)) {
      if (validateJson.errors)
        throw new Error(
          `Validation fails with errors:
          ${validateJson.errors.map((e) => `${e.message}`).join("\n")}`,
        );
      throw new Error("Validation fails");
    }
  }
  return (json as unknown) as T;
}

export async function copy(source: string, target: string): Promise<void> {
  await fsp.copyFile(source, target);
}

export function getFilenameFromPath(filePath: string): string {
  const name1 = path.basename(filePath);
  const ext1 = path.extname(filePath);
  return path.basename(name1, ext1);
}
