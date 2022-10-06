import { FC, useEffect, useState } from "react";

import { useMap, MapRef } from "react-map-gl";

function syncPosition(source: MapRef | undefined, target: MapRef | undefined) {
  if (source && target) {
    target.fitBounds(source.getBounds(), { animate: false, padding: 0 });
  }
}
export type SyncMapsModes = "single" | "side-by-side";
type SyncMapsProps = {
  mode: SyncMapsModes;
};

export const SyncMaps: FC<SyncMapsProps> = ({ mode }) => {
  //const [leftMap, setLocalMap] = useState<Map | null>(null);
  const [whoIsMoving, setWhoIsMoving] = useState<string | null>(null);
  const { leftMap, rightMap } = useMap();

  /**
   * When mode change
   * => invalidate  maps size
   * => remove 2nd map in state
   */
  useEffect(() => {
    if (mode === "single") {
      if (rightMap && rightMap) rightMap.resize();
      //if (leftMap) leftMap.resize();
    } else {
      if (rightMap && rightMap) rightMap.resize();
      if (leftMap && leftMap) leftMap.resize();
    }
  }, [mode, rightMap, leftMap]);

  /**
   * When maps are loaded fitBounds
   */
  useEffect(() => {
    if (leftMap && rightMap) {
      leftMap.fitBounds(rightMap.getBounds(), { duration: 1000 });
      console.log(leftMap.getBounds(), rightMap.getBounds());
    }
  }, [leftMap, rightMap]);

  /**
   * Listen to movestart/moveend events to know who is moving.
   */
  useEffect(() => {
    const fnLocalStart = () => setWhoIsMoving((prev) => (prev === null ? "local" : prev));
    const fnSyncStart = () => setWhoIsMoving((prev) => (prev === null ? "sync" : prev));
    const fnLocalEnd = () => setWhoIsMoving((prev) => (prev === "local" ? null : prev));
    const fnSyncEnd = () => setWhoIsMoving((prev) => (prev === "sync" ? null : prev));

    if (leftMap) {
      leftMap.on("movestart", fnLocalStart);
      leftMap.on("moveend", fnLocalEnd);
    }
    if (rightMap) {
      rightMap.on("movestart", fnSyncStart);
      rightMap.on("moveend", fnSyncEnd);
    }
    return () => {
      if (leftMap) {
        leftMap.off("movestart", fnLocalStart);
        leftMap.off("moveend", fnLocalEnd);
      }
      if (rightMap) {
        rightMap.off("movestart", fnSyncStart);
        rightMap.off("moveend", fnSyncEnd);
      }
    };
  }, [leftMap, rightMap]);

  /**
   * Listen on the provided map move event
   * in order to synchronise the viewbox, except when the local map is moving
   */
  useEffect(() => {
    const syncLocal = () => {
      if (whoIsMoving === "sync") syncPosition(rightMap, leftMap);
    };
    const syncMap = () => {
      if (whoIsMoving === "local") syncPosition(leftMap, rightMap);
    };

    if (rightMap) rightMap.on("move", syncLocal);
    if (leftMap) leftMap.on("move", syncMap);
    return () => {
      if (rightMap) rightMap.off("move", syncLocal);
      if (leftMap) leftMap.off("move", syncMap);
    };
  }, [rightMap, leftMap, whoIsMoving]);

  return <></>;
};
