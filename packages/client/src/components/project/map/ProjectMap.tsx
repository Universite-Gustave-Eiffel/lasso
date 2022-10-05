import { FC, PropsWithChildren, Ref } from "react";
import Map, { NavigationControl, LngLatBoundsLike, FullscreenControl, MapRef } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { Project } from "@lasso/dataprep";
// import { useNotifications } from "../../../core/notifications";
// import { useMapStyle } from "@lasso/client/src/hooks/useMapStyle";
// import { Loader } from "../../Loader";
import { config } from "../../../config";

export interface ProjectMapProps {
  id: string;
  project: Project;
  refMap: Ref<MapRef>;
  projectMapId: string | null;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}
export const ProjectMap: FC<PropsWithChildren<ProjectMapProps>> = ({
  id: mapId,
  project,
  refMap,
  projectMapId,
  bounds,
  center,
  children,
}) => {
  return (
    <>
      {projectMapId && (
        <Map
          id={mapId}
          ref={refMap}
          initialViewState={{ bounds, latitude: center && center[0], longitude: center && center[1] }}
          mapLib={maplibregl}
          mapStyle={`${config.data_path}/${project.id}/map.${projectMapId}.style.json`}
        >
          {children}
          <NavigationControl showCompass={false} />
          <FullscreenControl />
        </Map>
      )}
    </>
  );
};
