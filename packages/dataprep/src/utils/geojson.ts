import bbox from "@turf/bbox";
import { GeoJSON } from "geojson";

import { BBOX } from "../types";
import { readJson } from "./files";

export async function readGeoJsonFile(file: string): Promise<GeoJSON> {
  const geojson = await readJson(file);
  const isValid = checkGeoJson(geojson);
  if (!isValid) throw new Error(`GeoJSON ${file} is not valid`);
  return geojson as GeoJSON;
}

export function checkGeoJson(geojson: unknown): boolean {
  // TODO
  return geojson ? true : false;
}

/**
 * Compute the outer BBOX that contains all the geojson
 */
export function outerBbox(geoJsons: Array<GeoJSON>): BBOX {
  return metaBbox(
    geoJsons
      .map((geo) => bbox(geo))
      .map(
        (bbox) =>
          [
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]],
          ] as BBOX,
      ),
  );
}

export function metaBbox(bboxs: Array<BBOX>): BBOX {
  return bboxs.reduce(
    (
      acc = [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ],
      curr,
    ) => {
      // min X
      if (curr[0][0] < acc[0][0]) acc[0][0] = curr[0][0];
      if (curr[0][1] < acc[0][0]) acc[0][1] = curr[0][1];
      if (curr[1][0] > acc[1][0]) acc[1][0] = curr[1][0];
      if (curr[1][1] > acc[1][1]) acc[1][1] = curr[1][1];
      return acc;
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ] as BBOX,
  );
}
