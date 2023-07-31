import { Style } from "mapbox-gl";

import { config } from "../config";
import { useHttpGet } from "./useHttpGet";

export const useMapStyle = (projectId: string, projectMapId: string | null) => {
  return useHttpGet<{}, {}, Style>({
    path: `${config.data_path}/${projectId}/map.${projectMapId}.style.json`,
    pathParams: {},
    queryParams: {},
  });
};
