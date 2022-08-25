interface ProjectLayer<G> {
  id: string;
  name: string;
  geojson: G;
}
interface Project<G> {
  id: string;
  name: string;
  description?: string;
  image?: string;
  layers: Array<ProjectLayer<G>>;
}

type ProjectFull<G> = Project<G> & {
  pages: {
    project: string;
    sponsors?: string;
    bibliography?: string;
  };
};

export type ImportProject = Project<string>;
export type Project = ProjectFull<unknown>;
export type ExportProject = ProjectFull<string>;
