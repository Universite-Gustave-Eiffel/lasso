import { FC, useEffect, useState } from "react";
import Map, {
  NavigationControl,
  LngLatBoundsLike,
  FullscreenControl,
  MapboxGeoJSONFeature,
  AttributionControl,
  useMap,
  Source,
  Layer,
} from "react-map-gl";
import maplibregl from "maplibre-gl";

import { IProjectMap, Project } from "@lasso/dataprep";
import { Loader } from "../../Loader";
import { FeatureDataPanel } from "./FeatureDataPanel";
import { last, mapValues, omit, toPairs } from "lodash";
import { AnyLayer, AnySourceData } from "mapbox-gl";

export interface ProjectMapProps {
  id: string;
  project: Project;
  projectMapId: string | null;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}
export const ProjectMap: FC<ProjectMapProps> = ({ id: mapId, project, projectMapId, bounds, center }) => {
  const { [mapId]: map } = useMap();

  const [selectedFeature, setSelectedFeature] = useState<MapboxGeoJSONFeature | null>(null);
  const [projectMap, setProjectMap] = useState<IProjectMap | undefined>();
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>([]);
  const [currentTimeKey] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // find the chosen projetMap from id
  useEffect(() => {
    if (project && projectMapId) {
      setProjectMap(project.maps.find((m) => m.id === projectMapId));
    }
  }, [project, projectMapId]);
  useEffect(() => {
    if (projectMap && mapLoaded)
      setInteractiveLayerIds(
        projectMap.layers
          .filter((l) => "metadata" in l && (l.metadata as { interactive: boolean }).interactive)
          .map((l) => l.id),
      );
  }, [projectMap, mapLoaded]);

  // filter source data base on currentTime state
  useEffect(() => {
    console.log("todo", currentTimeKey);
  }, [currentTimeKey, projectMap]);

  return (
    <>
      {projectMap ? (
        <>
          <Map
            id={mapId}
            initialViewState={{ bounds, latitude: center && center[0], longitude: center && center[1] }}
            mapLib={maplibregl}
            mapStyle={projectMap?.basemapStyle}
            interactiveLayerIds={interactiveLayerIds}
            onClick={(e) => {
              if (e.features?.length) {
                const selectedFeature = e.features[0];
                setSelectedFeature({
                  ...selectedFeature,
                  // nested geojson properties are not parsed... https://github.com/maplibre/maplibre-gl-js/issues/1325
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
            onLoad={() => {
              // setting interactiveLayerIds after children are loaded
              // see https://github.com/visgl/react-map-gl/issues/1618
              setMapLoaded(true);
            }}
            attributionControl={false}
          >
            {toPairs(project.sources).map(([sourceId, source]) => (
              <Source key={sourceId} id={sourceId} {...(omit(source, ["variables", "timeSeries"]) as AnySourceData)} />
            ))}
            {projectMap.layers.map((l) => (
              <Layer key={l.id} {...(l as AnyLayer)} />
            ))}

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
