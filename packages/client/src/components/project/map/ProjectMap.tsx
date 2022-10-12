import { FC, useEffect, useState } from "react";
import Map, {
  NavigationControl,
  LngLatBoundsLike,
  FullscreenControl,
  AttributionControl,
  useMap,
  Source,
  Layer,
} from "react-map-gl";
import maplibregl, { GeoJSONSourceSpecification } from "maplibre-gl";
import { Dictionary, mapValues, omit, omitBy, toPairs } from "lodash";
import { AnyLayer } from "mapbox-gl";
import { FeatureCollection, Feature } from "geojson";

import { IProjectMap, Project } from "@lasso/dataprep";
import { Loader } from "../../Loader";
import { FeatureDataPanel } from "./FeatureDataPanel";

export interface ProjectMapProps {
  id: string;
  project: Project;
  projectMapId: string | null;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}
export const ProjectMap: FC<ProjectMapProps> = ({ id: mapId, project, projectMapId, bounds, center }) => {
  // map lifecycle
  const { [mapId]: map } = useMap();
  const [projectMap, setProjectMap] = useState<IProjectMap | undefined>();
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Feature selection
  // feature id is used as maplibre have issues with feature provided in click event (nested properties as string and missing feature ID)
  const [selectedFeatureId, setSelectedFeatureId] = useState<{
    sourceId: string;
    featureId: string;
    layerId: string;
  } | null>(null);
  // the feature id is used to pick the right feature
  const [selectedFeature, setSelectedFeature] = useState<Feature | undefined>();

  // time marker to adapt map to different time moment
  const [currentTimeKey, setCurrentTimeKey] = useState<string | null>(null);
  // depending on current time the according variables are used in the timedSourcesData version
  const [timedSourcesData, setTimedSourcesData] = useState<Dictionary<FeatureCollection>>({});

  // find the chosen projetMap from id
  useEffect(() => {
    if (project && projectMapId) {
      setProjectMap(project.maps.find((m) => m.id === projectMapId));
    }
  }, [project, projectMapId]);

  // reload interactive layers when project Map changes AND only when map is fully loaded
  useEffect(() => {
    if (projectMap && mapLoaded)
      setInteractiveLayerIds(
        projectMap.layers
          .filter((l) => "metadata" in l && (l.metadata as { interactive: boolean }).interactive)
          .map((l) => l.id),
      );
  }, [projectMap, mapLoaded]);

  // adapt source data based on currentTime state
  useEffect(() => {
    if (projectMap && currentTimeKey) {
      const sourcesData = omitBy(
        mapValues(project.sources, (source) => {
          if (
            source.timeSeries && // only time based source
            source.variables && // only filter source wich have variables
            source.type === "geojson" && // only concernes geojson sources
            typeof source.data !== "string" // should be always true because unsured by dataprep
          ) {
            return {
              type: "FeatureCollection",
              features: (source.data as FeatureCollection).features.map((f) => {
                return {
                  ...f,
                  properties: {
                    ...f.properties,
                    ...mapValues(
                      source.variables,
                      (_, variable) =>
                        // for each decalred variable we pick the value index at the time selected key
                        variable &&
                        f.properties &&
                        f.properties[currentTimeKey] &&
                        f.properties[currentTimeKey][variable],
                    ),
                  },
                };
              }),
            } as FeatureCollection;
          } else return null;
        }),
        (sd) => sd === null, // unfiltered data source are not stored since we already have them in projectMap
      ) as Dictionary<FeatureCollection>;
      setTimedSourcesData(sourcesData);
    }
  }, [currentTimeKey, projectMap, project, setTimedSourcesData, setSelectedFeature]);

  // pick and refresh the selected feature
  useEffect(() => {
    // when changing selection or time, refresh selectedFeature
    if (selectedFeatureId) {
      setSelectedFeature(
        // use timedSource in priority of original data
        (
          timedSourcesData[selectedFeatureId.sourceId] ||
          ((project.sources[selectedFeatureId.sourceId] as GeoJSONSourceSpecification).data as FeatureCollection)
        ).features.find((f) => f.properties?.id === selectedFeatureId.featureId),
      );
    } else setSelectedFeature(undefined);
  }, [selectedFeatureId, timedSourcesData, project]);

  // refresh selec

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
                if (selectedFeatureId && selectedFeatureId.featureId !== e.features[0].properties?.id)
                  map?.setFeatureState(
                    { id: selectedFeatureId.featureId, source: selectedFeatureId.sourceId },
                    { selected: false },
                  );
                const selectedFeature = e.features[0];
                // FYI we encountered two issues in the event feature:
                // 1. nested properties are not parsed
                // 2. the feature id is undefined even though our data source have features ids
                if (
                  selectedFeature.layer.source &&
                  typeof selectedFeature.layer.source === "string" &&
                  selectedFeature.properties
                ) {
                  map?.setFeatureState(
                    { id: selectedFeature.properties.id, source: selectedFeature.layer.source },
                    { selected: true },
                  );
                  setSelectedFeatureId({
                    sourceId: selectedFeature.layer.source,
                    featureId: selectedFeature.properties.id,
                    layerId: selectedFeature.layer.id,
                  });
                }
              } else {
                if (selectedFeatureId)
                  map?.setFeatureState(
                    { id: selectedFeatureId.featureId, source: selectedFeatureId.sourceId },
                    { selected: false },
                  );
                setSelectedFeatureId(null);
              }
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
            {toPairs(project.sources).map(([sourceId, source]) => {
              return (
                <Source
                  key={sourceId}
                  id={sourceId}
                  {...{
                    // removing Lasso specific properties
                    ...omit(source, ["variables", "timeSeries"]),
                    // data used are in priority the time-aware ones or the original ones
                    data: source.type === "geojson" ? timedSourcesData[sourceId] || source.data : undefined,
                  }}
                />
              );
            })}
            {projectMap.layers.map((l) => (
              <Layer key={l.id} {...(l as AnyLayer)} />
            ))}

            <NavigationControl showCompass={false} />
            <FullscreenControl />
            <AttributionControl position="top-left" compact />
            {selectedFeatureId && (
              <FeatureDataPanel
                feature={selectedFeature}
                timeSpecification={project.sources[selectedFeatureId.sourceId].timeSeries}
                layerId={selectedFeatureId.layerId}
                currentTimeKey={currentTimeKey}
                setCurrentTimeKey={setCurrentTimeKey}
              />
            )}
          </Map>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};
