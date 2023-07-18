import { Project, IProjectMap } from "@lasso/dataprep";

export function getMapProjectVariables(project: Project, map: IProjectMap): string[] {
  const result: string[] = [];
  const projectSourcesFromMap = map.layers.map((l: any) => l.source);

  for (const sourceId of projectSourcesFromMap) {
    const source = project.sources[sourceId];
    if (source && source.variables) {
      result.push(...Object.keys(source.variables));
    }
  }

  console.log("getMapProjectVariables", project, map, result);

  return result;
}
