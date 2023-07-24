import { useCallback } from "react";
import { ViewState } from "react-map-gl";
import { Feature } from "geojson";

import { IProjectMap } from "@lasso/dataprep";
import { getMapProjectVariable } from "../utils/project";
import { useAppContext } from "./useAppContext";
import { isFunction } from "lodash";

export const useCurrentProject = () => {
  const [context, setContext] = useAppContext();

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
                  selected: undefined,
                },
              },
            }
          : undefined,
      }));
    },
    [setContext],
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
    },
    [setContext],
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
    },
    [setContext],
  );

  /**
   * Function to update the map view state.
   */
  const setViewState = useCallback(
    (state: Partial<ViewState> | ((prev: Partial<ViewState>) => Partial<ViewState>)) => {
      setContext((prev) => ({
        ...prev,
        current: prev.current
          ? {
              ...prev.current,
              viewState: isFunction(state) ? state(prev.current.viewState) : state,
            }
          : undefined,
      }));
    },
    [setContext],
  );

  if (!context.current) throw new Error("Can't use `useCurrentProject` without a project in the context");

  return {
    project: context.current,
    setProjectMap,
    setProjectMapTime,
    setViewState,
    setProjectMapSelection,
  };
};
