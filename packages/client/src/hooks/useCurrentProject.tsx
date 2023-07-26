import { Feature } from "geojson";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import center from "@turf/center";

import { IProjectMap } from "@lasso/dataprep";
import { getMapProjectTimeSpec, getMapProjectVariable } from "../utils/project";
import { updateQueryParam } from "../utils/url";
import { useAppContext } from "./useAppContext";

export const useCurrentProject = () => {
  const [context, setContext] = useAppContext();
  if (!context.current) throw new Error("Can't use `useCurrentProject` without a project in the context");

  const [searchParam, setSearchParam] = useSearchParams();

  /**
   * Function to change the project's map of a map
   */
  const setProjectMap = useCallback(
    (mapId: "left" | "right", map: IProjectMap) => {
      setContext((prev) => ({
        ...prev,
        current: prev.current
          ? {
              ...prev.current,
              maps: {
                ...prev.current.maps,
                [mapId]: {
                  ...prev.current.maps[mapId],
                  map,
                  lassoVariable: getMapProjectVariable(prev.current.data, map),
                  timeSpecification: getMapProjectTimeSpec(prev.current.data, map),
                  selected: undefined,
                },
              },
            }
          : undefined,
      }));

      updateQueryParam(setSearchParam, searchParam, `${mapId[0]}-layer`, map.id);
    },
    [setContext, setSearchParam, searchParam],
  );

  /**
   * Function to update the map view state.
   */
  const setProjectMapTime = useCallback(
    (mapId: string, timeKey?: string) => {
      setContext((prev) => ({
        ...prev,
        current: prev.current
          ? {
              ...prev.current,
              maps: {
                ...prev.current.maps,
                [mapId]: {
                  ...prev.current.maps[mapId],
                  timeKey,
                },
              },
            }
          : undefined,
      }));

      // sync url params
      updateQueryParam(setSearchParam, searchParam, `${mapId[0]}-time`, timeKey);
    },
    [setContext, setSearchParam, searchParam],
  );

  /**
   * Function to set the selected element on the map.
   */
  const setProjectMapSelection = useCallback(
    (
      mapId: string,
      selected?: {
        feature: Feature;
        source: string;
        clickedAt: { lng: number; lat: number };
      },
    ) => {
      setContext((prev) => ({
        ...prev,
        current: prev.current
          ? {
              ...prev.current,
              maps: {
                ...prev.current.maps,
                [mapId]: {
                  ...prev.current.maps[mapId],
                  selected,
                },
              },
            }
          : undefined,
      }));

      // Sync URL params
      updateQueryParam(
        setSearchParam,
        searchParam,
        `${mapId[0]}-select`,
        selected ? `${selected?.feature.id}|${selected?.source}` : undefined,
      );
    },
    [setContext, setSearchParam, searchParam],
  );

  /**
   * When search params or current project changed
   * => we sync them, url first !
   *
   * /!\ map's view param is managed by the Sync composant to avoid to
   * save the view state in the context (react-map-gl has lower perf with managed state)
   */
  useEffect(() => {
    if (context.current) {
      (["right", "left"] as Array<"right" | "left">).forEach((mapId) => {
        // layer param
        const layerParam = searchParam.get(`${mapId[0]}-layer`);
        if (layerParam !== context.current?.maps[mapId].map.id) {
          const map = context.current?.data.maps.find((m) => m.id === layerParam);
          if (map) setProjectMap(mapId, map);
          else {
            // for the case of the default layer
            if (!layerParam && context.current?.maps[mapId].map.id) {
              updateQueryParam(
                setSearchParam,
                searchParam,
                `${mapId[0]}-layer`,
                context.current?.maps[mapId].map.id,
                true,
              );
            }
          }
        }

        // time parameter
        const timeParam = searchParam.get(`${mapId[0]}-time`) ?? undefined;
        if (timeParam !== context.current?.maps[mapId].timeKey) {
          setProjectMapTime(mapId, timeParam);
        }

        // select parameter
        const selectParam = searchParam.get(`${mapId[0]}-select`) ?? undefined;
        if (
          (selectParam || context.current?.maps[mapId].selected) &&
          selectParam !==
            `${context.current?.maps[mapId].selected?.feature?.id}|${context.current?.maps[mapId].selected?.source}`
        ) {
          const selectedData = (selectParam || "").split("|");
          if (selectedData.length === 2 && context.current?.data.featureIndex[selectedData[0]]) {
            const feature = context.current?.data.featureIndex[selectedData[0]];
            const coord = center(feature as any).geometry.coordinates;
            setProjectMapSelection(mapId, {
              feature,
              source: selectedData[1],
              clickedAt: { lng: coord[0], lat: coord[1] },
            });
          } else {
            setProjectMapSelection(mapId, undefined);
          }
        }
      });
    }
  }, [setContext, searchParam, setSearchParam, context, setProjectMap, setProjectMapSelection, setProjectMapTime]);

  return {
    project: context.current,
    setProjectMap,
    setProjectMapTime,
    setProjectMapSelection,
  };
};
