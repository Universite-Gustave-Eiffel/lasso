interface IProjectLayer<G> {
  id: string;
  name: string;
  geojson: G;
}
interface IProject<G> {
  id: string;
  name: string;
  description?: string;
  image?: string;
  layers: Array<IProjectLayer<G>>;
}

type IProjectFull<G> = IProject<G> & {
  pages: {
    project: string;
    sponsors?: string;
    bibliography?: string;
  };
};

export type ImportProject = IProject<string>;
export type InternalProject = IProjectFull<unknown>;
export type Project = IProjectFull<string>;
