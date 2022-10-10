import { FC, PropsWithChildren, useEffect, useState } from "react";
import Map, {
  NavigationControl,
  LngLatBoundsLike,
  FullscreenControl,
  MapboxGeoJSONFeature,
  AttributionControl,
  useMap,
} from "react-map-gl";
import maplibregl from "maplibre-gl";

import { Project } from "@lasso/dataprep";
import { Loader } from "../../Loader";
import { MapPointData } from "./MapPointData";
import { useNotifications } from "@lasso/client/src/core/notifications";
import { useMapStyle } from "@lasso/client/src/hooks/useMapStyle";

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
  const { notify } = useNotifications();
  const { [mapId]: map } = useMap();
  const { loading: loadingMapStyle, error: errorMapStyle, data: mapStyle } = useMapStyle(project.id, projectMapId);

  const [selectedFeature, setSelectedFeature] = useState<MapboxGeoJSONFeature | null>(null);

  useEffect(() => {
    if (!loadingMapStyle && errorMapStyle) {
      notify({ message: `Could not load the map style ${errorMapStyle}`, type: "error" });
    }
  }, [loadingMapStyle, errorMapStyle, notify]);

  return (
    <>
      {!loadingMapStyle && mapStyle ? (
        <>
          <Map
            id={mapId}
            initialViewState={{ bounds, latitude: center && center[0], longitude: center && center[1] }}
            mapLib={maplibregl}
            mapStyle={mapStyle !== null ? mapStyle : undefined}
            interactiveLayerIds={
              mapStyle ? mapStyle.layers.filter((l) => "metadata" in l && l.metadata.interactive).map((l) => l.id) : []
            }
            onClick={(e) => {
              if (e.features?.length) {
                setSelectedFeature(e.features[0]);
              } else setSelectedFeature(null);
            }}
            onMouseEnter={(e) => {
              if (map)
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = e.features ? "pointer" : "";
            }}
            onMouseLeave={() => {
              if (map)
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = "";
            }}
            attributionControl={false}
          >
            {children}
            <NavigationControl showCompass={false} />
            <FullscreenControl />
            <AttributionControl position="top-left" />
            <MapPointData pointData={selectedFeature} />
          </Map>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};
