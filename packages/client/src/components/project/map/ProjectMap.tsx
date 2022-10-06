import { FC, PropsWithChildren, useRef, useState } from "react";
import Map, { NavigationControl, LngLatBoundsLike, FullscreenControl, MapRef } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { Project } from "@lasso/dataprep";
import { config } from "../../../config";
import { Loader } from "../../Loader";
import { Style } from "mapbox-gl";

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
  const map = useRef<MapRef>(null);
  const [style, setStyle] = useState<Style | null>(null);

  return (
    <>
      {projectMapId && map ? (
        <Map
          id={mapId}
          ref={map}
          initialViewState={{ bounds, latitude: center && center[0], longitude: center && center[1] }}
          mapLib={maplibregl}
          mapStyle={`${config.data_path}/${project.id}/map.${projectMapId}.style.json`}
          interactiveLayerIds={
            style ? style.layers.filter((l) => "metadata" in l && l.metadata.interactive).map((l) => l.id) : []
          }
          onClick={(e) => {
            if (e.features?.length) console.log(e);
          }}
          onStyleData={(e) => {
            if (map.current && e.type === "styledata") {
              // TODO: event is supposed to provide style data but types looks incorrect?
              // using mapref instead
              setStyle(map.current.getStyle());
            }
          }}
        >
          {children}
          <NavigationControl showCompass={false} />
          <FullscreenControl />
        </Map>
      ) : (
        <Loader />
      )}
    </>
  );
};
