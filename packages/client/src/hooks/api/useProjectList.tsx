import { Project } from "@lasso/dataprep";
import { config } from "../../config";
import { useHttpGet } from "./useHttpGet";

export const useProjectList = () => {
  return useHttpGet<{}, {}, Array<Project>>({
    path: `${config.data_path}/projects.json`,
    pathParams: {},
    queryParams: {},
  });
};
