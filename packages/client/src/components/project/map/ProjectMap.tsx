import { FC, useEffect, useMemo } from "react";
import Map, {
  NavigationControl,
  LngLatBoundsLike,
  FullscreenControl,
  AttributionControl,
  Marker,
  useMap,
  Source,
  Layer,
} from "react-map-gl";
import maplibregl from "maplibre-gl";
import { mapValues, omit, omitBy, toPairs } from "lodash";
import { AnyLayer } from "mapbox-gl";
import { FeatureCollection } from "geojson";
import { useLocale, useT } from "@transifex/react";
import { TbClockX } from "react-icons/tb";

import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { getI18NText } from "../../../utils/i18n";
import { FeatureDataPanel } from "./FeatureDataPanel";
import { MapControl } from "../../MapControl";
import { ResetControl } from "./ResetControl";
import { ProjectMapBoundingBox } from "./ProjectMapBoundingBox";

export interface ProjectMapProps {
  mapId: string;
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}

export const ProjectMap: FC<ProjectMapProps> = ({ mapId }) => {
  const locale = useLocale();
  const t = useT();
  const { [mapId]: map } = useMap();

  // project
  const { project, setViewState, setProjectMapTime, setProjectMapSelection } = useCurrentProject();
  const projectMap = useMemo(() => project.maps[mapId], [project, mapId]);

  /**
   * When project bbox changed
   * => zoom on it
   */
  useEffect(() => {
    if (map && mapId === "right") {
      map.fitBounds(project.bbox);
    }
  }, [mapId, map, project.bbox]);

  // interactive layer (on which we can click)
  const interactiveLayerIds = useMemo(
    () =>
      projectMap.map.layers
        .filter((l) => "metadata" in l && (l.metadata as { interactive?: boolean }).interactive)
        .map((l) => l.id),
    [projectMap],
  );

  // adapt source data based on currentTime state
  const timedSourcesData = useMemo(() => {
    let sourcesData: Record<string, FeatureCollection | null> = {};
    if (projectMap && project) {
      sourcesData = omitBy(
        mapValues(project.data.sources, (source) => {
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
                        (projectMap.timeKey && f.properties[projectMap.timeKey]
                          ? f.properties[projectMap.timeKey][variable]
                          : f.properties[variable]),
                    ),
                  },
                };
              }),
            } as FeatureCollection;
          } else return null;
        }),
        (sd) => sd === null, // unfiltered data source are not stored since we already have them in projectMap
      );
    }
    return sourcesData;
  }, [projectMap, project]);

  // // pick and refresh the selected feature
  // useEffect(() => {
  //   // when changing selection or time, refresh selectedFeature
  //   if (selectedMapFeature && project) {
  //     // use timedSource in priority of original data
  //     const sf = (
  //       timedSourcesData[selectedMapFeature.source] ||
  //       ((project.sources[selectedMapFeature.source] as GeoJSONSourceSpecification).data as FeatureCollection)
  //     ).features.find((f) => f.properties?.id === selectedMapFeature.featureId);
  //     setSelectedFeature(sf);
  //   } else {
  //     setSelectedFeature(undefined);
  //   }
  // }, [selectedMapFeature, timedSourcesData, project]);

  /**
   * When the selected item changed
   * => set its state on the map
   */
  useEffect(() => {
    if (projectMap.selected) {
      map?.setFeatureState(
        { id: projectMap.selected?.feature.id, source: projectMap.selected.source },
        { selected: true },
      );
    }
    return () => {
      if (projectMap.selected) {
        map?.setFeatureState(
          { id: projectMap.selected?.feature.id, source: projectMap.selected.source },
          { selected: false },
        );
      }
    };
  }, [projectMap.selected, map]);

  return (
    <Map
      id={mapId}
      {...project.viewState}
      mapLib={maplibregl}
      mapStyle={projectMap.map.basemapStyle}
      interactiveLayerIds={interactiveLayerIds}
      onMove={(e) => setViewState(e.viewState)}
      onClick={(e) => {
        if (e.features?.length) {
          const selectedFeature = e.features[0];
          if (
            selectedFeature.layer.source &&
            typeof selectedFeature.layer.source === "string" &&
            selectedFeature.properties
          ) {
            // get the feature in the index by its id
            const f = project.data.featureIndex[`${selectedFeature.id}`];
            if (f)
              setProjectMapSelection(mapId, {
                clickedAt: e.lngLat,
                source: selectedFeature.layer.source,
                feature: f,
              });
            return;
          }
        }
        setProjectMapSelection(mapId, undefined);
      }}
      onMouseEnter={(e) => {
        // Change the cursor style as a UI indicator.
        if (map) map.getCanvas().style.cursor = e.features ? "pointer" : "";
      }}
      onMouseLeave={() => {
        // Change the cursor style as a UI indicator.
        if (map) map.getCanvas().style.cursor = "";
      }}
      attributionControl={false}
    >
      {/* Display the bouning box of the project */}
      <ProjectMapBoundingBox project={project.data} type="border" />

      {/* Include all the project sources */}
      {toPairs(project.data.sources).map(([sourceId, source]) => {
        return (
          <Source
            key={`${locale}-${sourceId}`}
            id={sourceId}
            type={source.type}
            {...({
              // removing Lasso specific properties
              ...omit(source, ["variables", "timeSeries", "type", "attribution"]),
              attribution: source.attribution ? getI18NText(locale, source.attribution) : "",
              // data used are in priority the time-aware ones or the original ones
              ...(source.type === "geojson" ? { data: timedSourcesData[sourceId] || source.data } : {}),
            } as any)}
          />
        );
      })}

      {/* Include all the map's project layers */}
      {project.maps[mapId].map.layers.map((l) => (
        <Layer key={`${locale}-${l.id}`} {...(l as AnyLayer)} />
      ))}

      {/* Add map controllers */}
      <NavigationControl visualizePitch={true} showZoom={true} showCompass={true} />
      <FullscreenControl />
      <ResetControl point={projectMap.selected ? projectMap.selected.clickedAt : undefined} />
      {projectMap.timeKey && (
        <MapControl id="time-reset">
          <button
            title={`${t("Remove time selection")} : ${projectMap.timeKey}`}
            onClick={() => setProjectMapTime(mapId, undefined)}
          >
            <TbClockX className="text-danger" size="1.8em" />
          </button>
        </MapControl>
      )}

      {/* Add map attribution */}
      <AttributionControl
        position="top-left"
        compact
        customAttribution={
          project.data.pages.dataset
            ? `<a href="#/project/${project.data.id}/dataset/" title="${t("page.dataset")}">
                      <span style="font-size:.8em;">&#9432;</span>
                      ${t("page.dataset")}
                    </a>`
            : undefined
        }
      />

      {/* Selected feature : display a marker and the data panel */}
      {projectMap.selected !== undefined && (
        <>
          <FeatureDataPanel
            mapId={mapId}
            feature={projectMap.selected.feature}
            timeSpecification={project.data.sources[projectMap.selected.source].timeSeries}
            onClose={() => {
              setProjectMapSelection(mapId, undefined);
            }}
          />
          <Marker longitude={projectMap.selected.clickedAt.lng} latitude={projectMap.selected.clickedAt.lat} />
        </>
      )}
    </Map>
  );
};
