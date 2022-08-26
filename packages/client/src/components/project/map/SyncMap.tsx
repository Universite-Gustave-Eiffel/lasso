import { FC, useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Map } from "leaflet";

interface SyncMapProps {
  map: Map;
  bidirectional?: boolean;
}
export const SyncMap: FC<SyncMapProps> = ({ map, bidirectional = true }) => {
  const [localMap, setLocalMap] = useState<Map | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  const syncPosition = useCallback((source: Map | null, target: Map | null) => {
    if (source && target && !target.getBounds().equals(source.getBounds())) {
      target.fitBounds(source.getBounds(), { animate: false });
    }
  }, []);

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
    const fn = () => syncPosition(map, localMap);
    if (!isMoving) map.on("move", fn);
    return () => {
      if (!isMoving) map.off("move", fn);
    };
  }, [map, localMap, syncPosition, isMoving]);

  /**
   * When the local map viewbox change and bidirectional mode is enabled
   *  => sync the position of the provided map
   */
  useEffect(() => {
    const fn = () => syncPosition(localMap, map);
    if (localMap && bidirectional) localMap.on("move", fn);
    return () => {
      if (localMap && bidirectional) localMap.off("move", fn);
    };
  }, [map, localMap, syncPosition, bidirectional]);

  const displayMap = useMemo(
    () => (
      <MapContainer inertia={false} center={[0, 0]} zoom={13} ref={setLocalMap} zoomControl={bidirectional}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    ),
    [bidirectional],
  );

  return <>{displayMap}</>;
};
