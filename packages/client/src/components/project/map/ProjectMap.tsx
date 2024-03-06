import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Map, {
  NavigationControl,
  LngLatBoundsLike,
  FullscreenControl,
  AttributionControl,
  useMap,
  Source,
  Layer,
  MapLayerMouseEvent,
  AnyLayer,
} from "react-map-gl/maplibre";
import { mapValues, omit, omitBy, toPairs } from "lodash";
import { FeatureCollection } from "geojson";
import { useLocale, useT } from "@transifex/react";
import { useSearchParams } from "react-router-dom";

import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { getI18NText } from "../../../utils/i18n";
import { ResetControl } from "./ResetControl";
import { ProjectMapBoundingBox } from "./ProjectMapBoundingBox";
import { TimeSelectorControl } from "./TimeSelectorControl";
import { SoundControl } from "./SoundControl";
import { Selected } from "./Selected";

export interface ProjectMapProps {
  mapId: "right" | "left";
  bounds?: LngLatBoundsLike;
  center?: [number, number];
}

export const ProjectMap: FC<ProjectMapProps> = ({ mapId }) => {
  const locale = useLocale();
  const t = useT();
  const { [mapId]: map } = useMap();
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [searchParam] = useSearchParams();

  // project
  const { project, setProjectMapSelection } = useCurrentProject();
  const projectMap = useMemo(() => project.maps[mapId], [project.maps, mapId]);

  /**
   * When map is mounted
   * => zoom on the project bbox or on the query params
   */
  useEffect(() => {
    if (map) {
      const viewString = searchParam.get("view");
      if (!viewString) {
        map.fitBounds(project.bbox);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapId, mapLoaded]);

  // interactive layer (on which we can click)
  const interactiveLayerIds = useMemo(() => {
    return projectMap.map.layers
      .filter((l) => "metadata" in l && (l.metadata as { interactive?: boolean }).interactive)
      .map((l) => l.id);
  }, [projectMap.map.layers]);

  // adapt source data based on currentTime state
  const timedSourcesData = useMemo(() => {
    let sourcesData: Record<string, FeatureCollection | null> = {};
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
                      (projectMap.timeKey
                        ? f.properties[projectMap.timeKey]
                          ? f.properties[projectMap.timeKey][variable]
                          : null
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
    return sourcesData;
  }, [projectMap.timeKey, project.data.sources]);

  /**
   * When the selected item changed
   * => set its state on the map
   */
  useEffect(() => {
    if (
      mapLoaded &&
      projectMap.selected &&
      map?.getFeatureState({ id: projectMap.selected?.feature?.id, source: projectMap.selected.source })
    ) {
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
  }, [projectMap.selected, map, mapLoaded]);

  // render sources
  const sources = useMemo(() => {
    return toPairs(project.data.sources).map(([sourceId, source]) => {
      console.log(sourceId, timedSourcesData);
      return (
        <Source
          key={`${locale}-${sourceId}`}
          id={sourceId}
          type={source.type}
          {...({
            // removing Lasso specific properties
            ...omit(source, ["variables", "timeSeries", "type", "attribution", "images", "sounds"]),
            attribution: source.attribution ? getI18NText(locale, source.attribution) : "",
            // data used are in priority the time-aware ones or the original ones
            ...(source.type === "geojson" ? { data: timedSourcesData[sourceId] || source.data } : {}),
          } as any)}
        />
      );
    });
  }, [project.data.sources, timedSourcesData, locale]);

  /*
   * render layout
   */
  const layers = useMemo(() => {
    return project.maps[mapId].map.layers.map((l) => <Layer key={`${locale}-${l.id}`} {...(l as AnyLayer)} />);
  }, [project.maps, mapId, locale]);

  const getFeatureOnMouseEvent = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features?.length) {
        const selectedFeature = e.features[0];
        if (
          selectedFeature.layer.source &&
          typeof selectedFeature.layer.source === "string" &&
          selectedFeature.properties &&
          selectedFeature.properties.id
        ) {
          // get the feature in the index by its id
          const f = project.data.featureIndex[`${selectedFeature.properties.id}`];
          if (f)
            return {
              source: selectedFeature.layer.source,
              feature: f,
            };
        }
      }
      return null;
    },
    [project.data.featureIndex],
  );

  return (
    <Map
      id={mapId}
      mapStyle={projectMap.map.basemapStyle as any}
      interactiveLayerIds={interactiveLayerIds}
      onLoad={() => {
        setMapLoaded(true);
      }}
      onClick={(e) => {
        const data = getFeatureOnMouseEvent(e);
        console.log(data);
        if (data) {
          setProjectMapSelection(mapId, {
            clickedAt: e.lngLat,
            ...data,
          });
        } else {
          setProjectMapSelection(mapId, undefined);
        }
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
      {sources}
      {/* Include all the map's project layers */}
      {layers}
      {/* Add map controllers */}
      <NavigationControl visualizePitch={true} showZoom={true} showCompass={true} />
      <FullscreenControl />
      <ResetControl point={projectMap.selected ? projectMap.selected.clickedAt : undefined} />
      <TimeSelectorControl mapId={mapId} />
      <SoundControl mapId={mapId} />

      {/* Add map attribution */}
      <AttributionControl
        position="top-left"
        compact
        customAttribution={
          project.data.pages.dataset
            ? `<a href="#/project/${project.data.id}/dataset/" title="${t("Dataset")}">
                      <span style="font-size:.8em;">&#9432;</span>
                      ${t("Dataset")}
                    </a>`
            : undefined
        }
      />
      {/* Selected feature : display a marker and the data panel */}
      <Selected mapId={mapId} />
    </Map>
  );
};
