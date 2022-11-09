import { ExportedData } from "@lasso/dataprep";
import { config } from "../config";
import { useHttpGet } from "./useHttpGet";

export const useProjectsData = () => {
  return useHttpGet<{}, {}, ExportedData>({
    path: `${config.data_path}/projects.json`,
    pathParams: {},
    queryParams: {},
  });
};
