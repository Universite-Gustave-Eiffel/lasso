import { readFile } from "./files";

// TODO: add options to rename path files
export async function readMarkdownFile(file: string): Promise<string> {
  const md = await readFile(file);
  const isValid = checkMarkdown(md);
  if (!isValid) throw new Error(`Markdown ${file} is not valid`);
  return md;
}

export function checkMarkdown(md: string): boolean {
  // TODO
  return md ? true : false;
}
