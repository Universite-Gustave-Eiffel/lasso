import { readJson } from "./files";

export async function readGeoJsonFile(file: string): Promise<unknown> {
  const geojson = await readJson(file);
  const isValid = checkGeoJson(geojson);
  if (!isValid) throw new Error(`GeoJSON ${file} is not valid`);
  return geojson;
}

export function checkGeoJson(geojson: unknown): boolean {
  // TODO
  return geojson ? true : false;
}
