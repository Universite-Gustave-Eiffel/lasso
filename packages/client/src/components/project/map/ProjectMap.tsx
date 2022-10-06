import { FC, PropsWithChildren } from "react";
import Map, { NavigationControl, LngLatBoundsLike, FullscreenControl } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { Project } from "@lasso/dataprep";
import { config } from "../../../config";

export interface ProjectMapProps {
  id: string;
  project: Project;
  projectMapId: string | null;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}
export const ProjectMap: FC<PropsWithChildren<ProjectMapProps>> = ({
  id: mapId,
  project,
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
