import { FC, useEffect, useState } from "react";
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
import { FeatureDataPanel } from "./FeatureDataPanel";
import { useNotifications } from "@lasso/client/src/core/notifications";
import { useMapStyle } from "@lasso/client/src/hooks/useMapStyle";
import { last, mapValues } from "lodash";

export interface ProjectMapProps {
  id: string;
  project: Project;
  projectMapId: string | null;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}
export const ProjectMap: FC<ProjectMapProps> = ({ id: mapId, project, projectMapId, bounds, center }) => {
  const { notify } = useNotifications();
  const { [mapId]: map } = useMap();
  const { loading: loadingMapStyle, error: errorMapStyle, data: mapStyle } = useMapStyle(project.id, projectMapId);

  const [selectedFeature, setSelectedFeature] = useState<MapboxGeoJSONFeature | null>(null);
  //const [layersData, setLayersData] = useState<Dictionary<FeatureCollection>>({});

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
                const selectedFeature = e.features[0];
                setSelectedFeature({
                  ...selectedFeature,
                  // nesrted geojson properties are not parsed... https://github.com/maplibre/maplibre-gl-js/issues/1325
                  properties: mapValues(selectedFeature.properties, (value) => {
                    if (typeof value === "string" && value[0] === "{" && last(value) === "}") {
                      try {
                        return JSON.parse(value);
                      } catch (e) {
                        return value;
                      }
                    }
                    return value;
                  }),
                });
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
            <NavigationControl showCompass={false} />
            <FullscreenControl />
            <AttributionControl position="top-left" compact />
            <FeatureDataPanel feature={selectedFeature} project={project} />
          </Map>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};
