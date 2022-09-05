import { FC, PropsWithChildren, useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer } from "react-leaflet";
import { Map } from "leaflet";

interface SyncMapProps {
  setMap?: (map: Map) => void;
  syncWithMap: Map;
  bidirectional?: boolean;
}
export const SyncMap: FC<PropsWithChildren<SyncMapProps>> = ({
  syncWithMap,
  bidirectional = true,
  setMap,
  children,
}) => {
  const [localMap, setLocalMap] = useState<Map | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  const syncPosition = useCallback((source: Map | null, target: Map | null) => {
    if (source && target && !target.getBounds().equals(source.getBounds())) {
      target.fitBounds(source.getBounds(), { animate: false });
    }
  }, []);

  useEffect(() => {
    if (localMap && setMap) setMap(localMap);
  });

  useEffect(() => {
    const enableIsMoving = () => setIsMoving(true);
    const disableIsMoving = () => setIsMoving(false);
    if (localMap) {
      localMap.on("movestart", enableIsMoving);
      localMap.on("moveend", disableIsMoving);
      if (!bidirectional) {
        localMap.boxZoom.disable();
        localMap.doubleClickZoom.disable();
        localMap.dragging.disable();
        localMap.keyboard.disable();
        localMap.scrollWheelZoom.disable();
        localMap.touchZoom.disable();
      }
    }
    return () => {
      if (localMap) {
        localMap.off("movestart", enableIsMoving);
        localMap.off("moveend", disableIsMoving);
        localMap.boxZoom.enable();
        localMap.doubleClickZoom.enable();
        localMap.dragging.enable();
        localMap.keyboard.enable();
        localMap.scrollWheelZoom.enable();
        localMap.touchZoom.enable();
      }
    };
  }, [localMap, bidirectional]);

  /**
   * Listen on the provided map move event
   * in order to synchronise the viewbox, except when the local map is moving
   */
  useEffect(() => {
    const fn = () => syncPosition(syncWithMap, localMap);
    if (!isMoving) syncWithMap.on("move", fn);
    return () => {
      if (!isMoving) syncWithMap.off("move", fn);
    };
  }, [syncWithMap, localMap, syncPosition, isMoving]);

  /**
   * When the local map viewbox change and bidirectional mode is enabled
   *  => sync the position of the provided map
   */
  useEffect(() => {
    const fn = () => syncPosition(localMap, syncWithMap);
    if (localMap && bidirectional) localMap.on("move", fn);
    return () => {
      if (localMap && bidirectional) localMap.off("move", fn);
    };
  }, [syncWithMap, localMap, syncPosition, bidirectional]);

  const displayMap = useMemo(
    () => (
      <MapContainer inertia={false} ref={setLocalMap} zoomControl={bidirectional}>
        {children}
      </MapContainer>
    ),
    [bidirectional, children],
  );

  return <>{displayMap}</>;
};
