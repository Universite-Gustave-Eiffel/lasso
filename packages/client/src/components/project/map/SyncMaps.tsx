import { FC, useEffect, useState, useCallback } from "react";
import { useMap, MapRef } from "react-map-gl";
import { useSearchParams } from "react-router-dom";
import { debounce, toNumber } from "lodash";

import { updateQueryParam } from "../../../utils/url";

//TODO: simplify getting inspiration from https://github.com/visgl/react-map-gl/blob/7.0-release/examples/side-by-side/src/app.tsx

export type SyncMapsModes = "single" | "side-by-side";
type SyncMapsProps = {
  mode: SyncMapsModes;
};

export const SyncMaps: FC<SyncMapsProps> = ({ mode }) => {
  const [searchParams, setSearchParam] = useSearchParams();
  const debounceSetSearchParam = debounce(setSearchParam, 100);
  const [whoIsMoving, setWhoIsMoving] = useState<string | null>(null);
  const { left, right } = useMap();

  const syncPosition = useCallback(
    (source: MapRef | undefined, target: MapRef | undefined) => {
      if (source && target) {
        target.fitBounds(source.getBounds(), { animate: false, padding: 0 });
        target.setPitch(source.getPitch(), { animate: false, padding: 0 });
        target.setBearing(source.getBearing(), { animate: false, padding: 0 });
        target.setCenter(source.getCenter(), { animate: false, padding: 0 });
        target.setZoom(source.getZoom(), { animate: false, padding: 0 });
        target.setPadding(source.getPadding(), { animate: false, padding: 0 });
      }

      // Sync with URL
      updateQueryParam(
        debounceSetSearchParam,
        searchParams,
        "view",
        `${source?.getCenter().lat}|${source?.getCenter().lng}|${source?.getZoom()}`,
        true,
      );
    },
    [debounceSetSearchParam, searchParams],
  );

  /**
   * When url change, check the map's view state
   */
  useEffect(() => {
    const viewString = searchParams.get("view");
    if (right && viewString) {
      const data = viewString.split("|").map((v) => toNumber(v));
      if (data.length === 3) {
        const mapCenter = right.getCenter();
        const mapZoom = right.getZoom();
        if (mapCenter.lat !== data[0] || mapCenter.lng !== data[1] || mapZoom !== data[2]) {
          right.jumpTo({ center: { lat: data[0], lng: data[1] }, zoom: data[2] });
          if (left) left.jumpTo({ center: { lat: data[0], lng: data[1] }, zoom: data[2] });
        }
      }
    }
  }, [searchParams, right, left]);

  /**
   * When mode change
   * => invalidate  maps size
   * => remove 2nd map in state
   */
  useEffect(() => {
    if (mode === "single") {
      if (right && right) right.resize();
      //if (left) left.resize();
    } else {
      if (right && right) right.resize();
      if (left && left) left.resize();
    }
  }, [mode, right, left]);

  /**
   * When maps are loaded fitBounds
   */
  useEffect(() => {
    if (left && right) {
      left.fitBounds(right.getBounds(), { duration: 1000 });
    }
  }, [left, right]);

  /**
   * Listen to movestart/moveend events to know who is moving.
   */
  useEffect(() => {
    const fnLocalStart = () => setWhoIsMoving((prev) => (prev === null ? "local" : prev));
    const fnSyncStart = () => setWhoIsMoving((prev) => (prev === null ? "sync" : prev));
    const fnLocalEnd = () => setWhoIsMoving((prev) => (prev === "local" ? null : prev));
    const fnSyncEnd = () => setWhoIsMoving((prev) => (prev === "sync" ? null : prev));

    if (left) {
      left.on("movestart", fnLocalStart);
      left.on("moveend", fnLocalEnd);
    }
    if (right) {
      right.on("movestart", fnSyncStart);
      right.on("moveend", fnSyncEnd);
    }
    return () => {
      if (left) {
        left.off("movestart", fnLocalStart);
        left.off("moveend", fnLocalEnd);
      }
      if (right) {
        right.off("movestart", fnSyncStart);
        right.off("moveend", fnSyncEnd);
      }
    };
  }, [left, right]);

  /**
   * Listen on the provided map move event
   * in order to synchronise the viewbox, except when the local map is moving
   */
  useEffect(() => {
    const syncLocal = () => {
      if (whoIsMoving === "sync") syncPosition(right, left);
    };
    const syncMap = () => {
      if (whoIsMoving === "local") syncPosition(left, right);
    };

    if (right) right.on("move", syncLocal);
    if (left) left.on("move", syncMap);
    return () => {
      if (right) right.off("move", syncLocal);
      if (left) left.off("move", syncMap);
    };
  }, [right, left, whoIsMoving, syncPosition]);

  return null;
};
