import { GeoJSON } from "geojson";

export type BBOX = [[number, number], [number, number]];

interface IProjectMap {
  /**
   * Unique identifier of the map across the project.
   * Will be used in the URL.
   */
  id: string;
  /**
   * Name of the map
   */
  name: string;
  /**
   * List of ordered layers IDS for the map
   */
  layersId: Array<string>;
  /**
   * Attribution for the map
   */
  attribution: string;
}

interface IProject<G> {
  /**
   * Unique identifier of the project acroos all projects.
   */
  id: string;
  /**
   * Name of the project.
   */
  name: string;
  /**
   * A short description of the project in text only.
   * Will be used for the project's card.
   */
  description?: string;
  /**
   * Image of the project that will be used to create the project card.
   * It's a relative path to the image.
   */
  image?: string;
  /**
   * Color of the project.
   * Will be used on the home map to draw the rectangle.
   * If not specified, a random color will be generated.
   */
  color?: string;
  /**
   * BBOX of the project  (minX, minY, maxX, maxY)
   * If not specified, we will compute the outer BBOX from GeoJSON layers
   */
  bbox?: BBOX;
  /**
   * List of layer that can be used on maps
   * A layer can be a tiles URL or a path to a geojson
   */
  layers: Array<{ id: string; layer: G }>;

  /**
   * Maps list of the project.
   */
  maps: Array<IProjectMap>;
}

type IProjectFull<G> = IProject<G> & {
  pages: { [key: string]: string };
};

export type ImportProject = IProject<string>;
export type InternalProject = IProjectFull<string | GeoJSON>;
export type Project = IProjectFull<string> & { bbox: BBOX; color: string };

export interface ExportedData {
  bbox: BBOX;
  projects: Array<Project>;
}
