import { ExportedData } from "@lasso/dataprep";
import { config } from "../config";
import { useHttpGet } from "./useHttpGet";

export const useProjectData = () => {
  return useHttpGet<{}, {}, ExportedData>({
    path: `${config.data_path}/projects.json`,
    pathParams: {},
    queryParams: {},
  });
};
